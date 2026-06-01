import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { Presentation, Table as TableIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function StrategicPerformanceReportDialog() {
  const { transactions, monthlyMetrics, filters } = useFinanceStore()

  const sortedSelectedPeriods = useMemo(() => {
    const periods: string[] = []
    if (filters.years.length > 0 && filters.months.length > 0) {
      filters.years.forEach((y) => {
        filters.months.forEach((m) => {
          periods.push(`${y}-${String(m).padStart(2, '0')}`)
        })
      })
    }
    return periods.sort()
  }, [filters.years, filters.months])

  const formatPeriod = (p: string) => {
    const [year, month] = p.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(
      date,
    )
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace('. de ', '/')
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const getPeriodStr = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length >= 2) return `${parts[0]}-${parts[1]}`
    return ''
  }

  const periodsData = useMemo(() => {
    return sortedSelectedPeriods.map((p) => {
      let totalRevenue = 0,
        totalExpenses = 0,
        fixedExpenses = 0,
        totalVarCosts = 0
      transactions.forEach((t) => {
        if (getPeriodStr(t.date) === p && t.status === 'REALIZADO') {
          if (t.type === 'INCOME') totalRevenue += Number(t.amount)
          if (t.type === 'EXPENSE') {
            totalExpenses += Number(t.amount)
            if (t.categoryId === 'VARIAVEL') totalVarCosts += Number(t.amount)
            if (t.categoryId === 'FIXA') fixedExpenses += Number(t.amount)
          }
        }
      })
      const metrics = monthlyMetrics.find(
        (m) => `${m.year}-${String(m.month).padStart(2, '0')}` === p,
      )
      const vendasManipulacao = metrics
        ? (Number(metrics.vendas_capsulas) || 0) + (Number(metrics.vendas_dermato) || 0)
        : 0
      const formulasCount = metrics
        ? (Number(metrics.num_formulas_capsulas) || 0) + (Number(metrics.num_formulas_dermato) || 0)
        : 0
      const custoMpEmb = metrics
        ? (Number(metrics.custo_mp_emb_capsulas) || 0) + (Number(metrics.custo_mp_emb_dermato) || 0)
        : 0

      const netProfit = totalRevenue - totalExpenses
      const ebitda = totalRevenue - totalVarCosts - fixedExpenses
      const markup = custoMpEmb > 0 ? vendasManipulacao / custoMpEmb : 0
      const ticket = formulasCount > 0 ? vendasManipulacao / formulasCount : 0
      const valuation = ebitda * 12 * 4

      return {
        period: formatPeriod(p),
        rawPeriod: p,
        entradas: totalRevenue,
        despesas: totalExpenses,
        lucroLiquido: netProfit,
        markup,
        ticket,
        valuation,
      }
    })
  }, [sortedSelectedPeriods, transactions, monthlyMetrics])

  const averages = useMemo(() => {
    if (!periodsData.length) return null
    const c = periodsData.length
    const sum = periodsData.reduce(
      (acc, p) => ({
        entradas: acc.entradas + p.entradas,
        despesas: acc.despesas + p.despesas,
        lucroLiquido: acc.lucroLiquido + p.lucroLiquido,
        markup: acc.markup + p.markup,
        ticket: acc.ticket + p.ticket,
        valuation: acc.valuation + p.valuation,
      }),
      {
        entradas: 0,
        despesas: 0,
        lucroLiquido: 0,
        markup: 0,
        ticket: 0,
        valuation: 0,
      },
    )

    return {
      entradas: sum.entradas / c,
      despesas: sum.despesas / c,
      lucroLiquido: sum.lucroLiquido / c,
      markup: sum.markup / c,
      ticket: sum.ticket / c,
      valuation: sum.valuation / c,
    }
  }, [periodsData])

  const renderTable = (
    title: string,
    dataKey: keyof typeof averages,
    formatFn: (val: number) => string,
  ) => {
    return (
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[200px] font-semibold text-slate-600">Métrica</TableHead>
                {periodsData.map((p) => (
                  <TableHead
                    key={p.rawPeriod}
                    className="text-right font-semibold text-slate-600 whitespace-nowrap"
                  >
                    {p.period}
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold text-slate-800 bg-slate-100/50 whitespace-nowrap">
                  Média
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-slate-700">{title}</TableCell>
                {periodsData.map((p) => (
                  <TableCell key={p.rawPeriod} className="text-right whitespace-nowrap">
                    {formatFn(p[dataKey as keyof typeof p] as number)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold bg-slate-50/50 whitespace-nowrap text-slate-800">
                  {averages ? formatFn(averages[dataKey]) : formatFn(0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-md gap-2 w-full">
          <Presentation className="w-4 h-4" />
          Relatório Estratégico Consolidado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-[95vw] w-full h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50/50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Presentation className="w-6 h-6 text-blue-600" />
            Relatório Estratégico Consolidado
          </DialogTitle>
          <DialogDescription>
            Análise refinada baseada no período selecionado no filtro global do dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 md:p-6 w-full">
          {periodsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in duration-300">
              <TableIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-500">Nenhum período selecionado</p>
              <p className="text-sm mt-1 max-w-sm text-center">
                Selecione um ou mais meses no filtro do dashboard para visualizar as tabelas.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in duration-500 w-full mx-auto pb-8">
              {renderTable('Entradas', 'entradas', formatCurrency)}
              {renderTable('Despesas', 'despesas', formatCurrency)}
              {renderTable('Lucro Líquido Real', 'lucroLiquido', formatCurrency)}
              {renderTable('Mark-up Manip.', 'markup', (val) => `${val.toFixed(2)}x`)}
              {renderTable('Ticket Médio', 'ticket', formatCurrency)}
              {renderTable('Valuation', 'valuation', formatCurrency)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
