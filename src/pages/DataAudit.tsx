import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: string
}

export default function DataAudit() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', 'marcelaourique@yahoo.com.br')
          .maybeSingle()

        if (profileError) throw profileError
        if (!profile) {
          setError('Usuário marcelaourique@yahoo.com.br não encontrado.')
          return
        }

        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('id, date, description, amount, type')
          .eq('user_id', profile.id)
          .gte('date', '2026-04-01T00:00:00Z')
          .lte('date', '2026-06-30T23:59:59Z')
          .order('date', { ascending: true })

        if (txError) throw txError

        const filtered = (txData || []).filter((t) => {
          const d = new Date(t.date)
          const y = d.getFullYear()
          const m = d.getMonth() + 1
          const day = d.getDate()
          const isApril = y === 2026 && m === 4 && day >= 1 && day <= 12
          const isJune = y === 2026 && m === 6
          return isApril || isJune
        })

        setTransactions(filtered)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Erro ao buscar dados.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const aprilTxs = transactions.filter((t) => new Date(t.date).getMonth() === 3)
  const juneTxs = transactions.filter((t) => new Date(t.date).getMonth() === 5)

  const calcSummary = (txs: Transaction[]) => {
    const income = txs
      .filter((t) => t.type === 'RECEITA')
      .reduce((acc, t) => acc + Number(t.amount), 0)
    const expense = txs
      .filter((t) => t.type === 'DESPESA')
      .reduce((acc, t) => acc + Number(t.amount), 0)
    return { income, expense, net: income - expense }
  }

  const aprilSummary = calcSummary(aprilTxs)
  const juneSummary = calcSummary(juneTxs)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Auditoria de Dados</h1>
        <p className="text-muted-foreground mt-2">
          Análise de transações para marcelaourique@yahoo.com.br (01 a 12 de Abril, Junho 2026)
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground animate-pulse">Buscando registros...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resumo Abril 2026 (01 a 12)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Receitas</span>
                    <span className="text-emerald-600 font-medium">
                      {formatCurrency(aprilSummary.income)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Despesas</span>
                    <span className="text-rose-600 font-medium">
                      {formatCurrency(aprilSummary.expense)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <span className="font-semibold text-slate-700">Saldo Líquido</span>
                    <span
                      className={`font-bold ${aprilSummary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {formatCurrency(aprilSummary.net)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resumo Junho 2026</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Receitas</span>
                    <span className="text-emerald-600 font-medium">
                      {formatCurrency(juneSummary.income)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Despesas</span>
                    <span className="text-rose-600 font-medium">
                      {formatCurrency(juneSummary.expense)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <span className="font-semibold text-slate-700">Saldo Líquido</span>
                    <span
                      className={`font-bold ${juneSummary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {formatCurrency(juneSummary.net)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Transações Encontradas ({transactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  Nenhuma transação encontrada nestes períodos para a usuária.
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[120px]">Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]">Tipo</TableHead>
                        <TableHead className="text-right w-[150px]">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-slate-700">
                            {formatDate(t.date)}
                          </TableCell>
                          <TableCell className="text-slate-600">{t.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                t.type === 'RECEITA'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }
                            >
                              {t.type === 'RECEITA' ? 'Receita' : 'Despesa'}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${t.type === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}
                          >
                            {formatCurrency(t.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
