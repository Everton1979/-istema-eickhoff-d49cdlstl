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
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Printer, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: string
}

export default function DataAudit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2026, 3, 1))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2026, 5, 30))

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

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

      let query = supabase
        .from('transactions')
        .select('id, date, description, amount, type')
        .eq('user_id', profile.id)
        .order('date', { ascending: true })

      if (startDate) {
        query = query.gte('date', startDate.toISOString())
      }
      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        query = query.lte('date', endOfDay.toISOString())
      }

      const { data: txData, error: txError } = await query

      if (txError) throw txError

      setTransactions(txData || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao buscar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const calcSummary = (txs: Transaction[]) => {
    const income = txs
      .filter((t) => t.type?.toUpperCase() === 'RECEITA')
      .reduce((acc, t) => acc + Number(t.amount), 0)
    const expense = txs
      .filter((t) => t.type?.toUpperCase() !== 'RECEITA')
      .reduce((acc, t) => acc + Number(t.amount), 0)
    return { income, expense, net: income - expense }
  }

  const summary = calcSummary(transactions)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(d)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full print:p-0 print:space-y-4">
      <style>{`
        @media print {
          aside, header, nav, [data-sidebar="sidebar"] {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 print:text-2xl">
            Auditoria de Dados
          </h1>
          <p className="text-muted-foreground mt-2 print:text-sm">
            Análise de transações para marcelaourique@yahoo.com.br
          </p>
        </div>
        <div className="print:hidden">
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Salvar em PDF
          </Button>
        </div>
      </div>

      <Card className="print:hidden shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="space-y-2 w-full sm:w-auto">
              <label className="text-sm font-medium leading-none">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full sm:w-[200px] justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <label className="text-sm font-medium leading-none">Data Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full sm:w-[200px] justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={fetchData} className="w-full sm:w-auto" disabled={loading}>
              {loading ? 'Buscando...' : 'Filtrar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-200 bg-red-50 print:hidden">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
            <Card className="shadow-sm print:shadow-none print:border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground print:text-xs">
                  Total Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 print:text-lg">
                  {formatCurrency(summary.income)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm print:shadow-none print:border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground print:text-xs">
                  Total Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600 print:text-lg">
                  {formatCurrency(summary.expense)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm print:shadow-none print:border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground print:text-xs">
                  Saldo Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'text-2xl font-bold print:text-lg',
                    summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {formatCurrency(summary.net)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm print:shadow-none print:border-none print:p-0">
            <CardHeader className="print:px-0">
              <CardTitle>Transações Encontradas ({transactions.length})</CardTitle>
              {(startDate || endDate) && (
                <p className="text-sm text-muted-foreground hidden print:block">
                  Período: {startDate ? format(startDate, 'dd/MM/yyyy') : 'Início'} até{' '}
                  {endDate ? format(endDate, 'dd/MM/yyyy') : 'Fim'}
                </p>
              )}
            </CardHeader>
            <CardContent className="print:px-0">
              {loading && transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed print:hidden">
                  Buscando registros...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed print:border-none print:bg-transparent print:py-4">
                  Nenhum registro encontrado para este período.
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto print:overflow-visible print:border-none">
                  <Table className="print:w-full">
                    <TableHeader className="bg-slate-50 print:bg-transparent">
                      <TableRow>
                        <TableHead className="w-[120px]">Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]">Tipo</TableHead>
                        <TableHead className="text-right w-[150px]">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow
                          key={t.id}
                          className="hover:bg-slate-50 print:hover:bg-transparent"
                        >
                          <TableCell className="font-medium text-slate-700">
                            {formatDate(t.date)}
                          </TableCell>
                          <TableCell className="text-slate-600">{t.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                t.type?.toUpperCase() === 'RECEITA'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200',
                                'print:border-none print:px-0 print:bg-transparent',
                              )}
                            >
                              {t.type?.toUpperCase() === 'RECEITA' ? 'Receita' : 'Despesa'}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-medium',
                              t.type?.toUpperCase() === 'RECEITA'
                                ? 'text-emerald-600'
                                : 'text-rose-600',
                            )}
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
