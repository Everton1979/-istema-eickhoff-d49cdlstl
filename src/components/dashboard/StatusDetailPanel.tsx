import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ListOrdered } from 'lucide-react'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function StatusDetailPanel() {
  const { transactions, filters } = useFinanceStore()

  const data = useMemo(() => {
    // Only show if at least one status is selected
    if (!filters?.statuses?.length) return []

    const monthlyData: Record<number, { entradas: number; saidas: number; saldo: number }> = {}
    const targetYear = filters?.years?.[0] || new Date().getFullYear().toString()

    ;(transactions || []).forEach((tx) => {
      let txYear = ''
      if (tx.date.includes('T')) {
        txYear = tx.date.split('-')[0]
      } else {
        txYear = new Date(tx.date).getFullYear().toString()
      }

      if (txYear !== targetYear) return
      if (!filters?.statuses?.includes(tx.status)) return

      const month = new Date(tx.date).getMonth()
      if (!monthlyData[month]) {
        monthlyData[month] = { entradas: 0, saidas: 0, saldo: 0 }
      }
      if (tx.type === 'INCOME') monthlyData[month].entradas += tx.amount
      if (tx.type === 'EXPENSE') monthlyData[month].saidas += tx.amount
      monthlyData[month].saldo = monthlyData[month].entradas - monthlyData[month].saidas
    })

    return Object.entries(monthlyData)
      .map(([m, vals]) => ({
        month: parseInt(m),
        ...vals,
      }))
      .sort((a, b) => a.month - b.month)
  }, [transactions, filters?.statuses, filters?.years])

  if (!filters?.statuses?.length) return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Card className="rounded-sm shadow-sm mt-2 border-t-4 border-t-blue-500 animate-fade-in-up print:hidden">
      <CardHeader className="py-3 px-4 bg-slate-50 border-b">
        <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-blue-500" />
          Detalhamento Mensal ({filters?.years?.[0] || new Date().getFullYear()})
          <span className="text-[10px] font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full normal-case ml-2">
            {filters?.statuses?.join(', ')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Nenhum dado encontrado para o ano e status selecionados.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[150px] font-semibold text-slate-600">Mês</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Entradas</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Saídas</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.month} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-700">{MONTHS[row.month]}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium">
                    {formatCurrency(row.entradas)}
                  </TableCell>
                  <TableCell className="text-right text-red-500 font-medium">
                    {formatCurrency(row.saidas)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-bold',
                      row.saldo >= 0 ? 'text-blue-600' : 'text-red-600',
                    )}
                  >
                    {formatCurrency(row.saldo)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
