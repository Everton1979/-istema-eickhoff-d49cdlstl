import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFinanceStore } from '@/stores/financeStore'
import { FileBarChart2, Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StrategicPerformanceReportDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([])
  const { transactions, monthlyMetrics } = useFinanceStore()

  const currentMonthStr = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const getPeriodStr = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length >= 2) return `${parts[0]}-${parts[1]}`
    return ''
  }

  const availablePeriods = useMemo(() => {
    const periods = new Set<string>()
    monthlyMetrics.forEach((m) => periods.add(`${m.year}-${String(m.month).padStart(2, '0')}`))
    transactions.forEach((t) => {
      const p = getPeriodStr(t.date)
      if (p) periods.add(p)
    })
    periods.delete(currentMonthStr)
    return Array.from(periods).sort((a, b) => b.localeCompare(a))
  }, [monthlyMetrics, transactions, currentMonthStr])

  const formatPeriod = (p: string) => {
    const [year, month] = p.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(
      date,
    )
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace('. de ', '/')
  }

  const formatCurrency = (val: number) => {
    if (val === null || val === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatPercent = (val: number) => {
    if (val === null || val === undefined) return '-'
    return `${(val * 100).toFixed(2)}%`
  }

  const formatNumber = (val: number) => {
    if (val === null || val === undefined) return '-'
    return val.toFixed(2)
  }

  const sortedSelectedPeriods = useMemo(() => {
    return [...selectedPeriods].sort()
  }, [selectedPeriods])

  const periodsData = useMemo(() => {
    return sortedSelectedPeriods.map((p) => {
      const txs = transactions.filter((t) => getPeriodStr(t.date) === p && t.status === 'REALIZADO')
      const metrics = monthlyMetrics.find(
        (m) => `${m.year}-${String(m.month).padStart(2, '0')}` === p,
      )

      const totalRevenue = txs
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const totalExpenses = txs
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const totalVarCosts = txs
        .filter((t) => t.type === 'EXPENSE' && t.categoryId === 'VARIAVEL')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const fixedExpenses = txs
        .filter((t) => t.type === 'EXPENSE' && t.categoryId === 'FIXA')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const ebitda = totalRevenue - totalVarCosts - fixedExpenses
      const netProfit = totalRevenue - totalExpenses
      const netProfitRatio = totalRevenue > 0 ? netProfit / totalRevenue : 0

      const vendasManipulacao = metrics
        ? (Number(metrics.vendas_capsulas) || 0) + (Number(metrics.vendas_dermato) || 0)
        : 0
      const vendasRevenda = metrics ? Number(metrics.vendas_revenda) || 0 : 0
      const vendasTotais = vendasManipulacao + vendasRevenda

      const custoMpEmb = metrics
        ? (Number(metrics.custo_mp_emb_capsulas) || 0) + (Number(metrics.custo_mp_emb_dermato) || 0)
        : 0
      const formulasCount = metrics
        ? (Number(metrics.num_formulas_capsulas) || 0) + (Number(metrics.num_formulas_dermato) || 0)
        : 0

      const markup = custoMpEmb > 0 ? vendasManipulacao / custoMpEmb : 0
      const ticket = formulasCount > 0 ? vendasManipulacao / formulasCount : 0
      const valuation = ebitda * 12 * 4

      return {
        period: p,
        totalRevenue,
        totalExpenses,
        netProfit,
        netProfitRatio,
        vendasManipulacao,
        vendasRevenda,
        vendasTotais,
        custoMpEmb,
        formulasCount,
        markup,
        ticket,
        ebitda,
        valuation,
      }
    })
  }, [sortedSelectedPeriods, transactions, monthlyMetrics])

  const totals = useMemo(() => {
    if (periodsData.length === 0) return null

    const count = periodsData.length
    let sumRevenue = 0
    let sumExpenses = 0
    let sumProfit = 0
    let sumVendasTotais = 0
    let sumVendasManipulacao = 0
    let sumVendasRevenda = 0
    let sumCustoMp = 0
    let sumFormulas = 0
    let sumEbitda = 0

    periodsData.forEach((p) => {
      sumRevenue += p.totalRevenue
      sumExpenses += p.totalExpenses
      sumProfit += p.netProfit
      sumVendasTotais += p.vendasTotais
      sumVendasManipulacao += p.vendasManipulacao
      sumVendasRevenda += p.vendasRevenda
      sumCustoMp += p.custoMpEmb
      sumFormulas += p.formulasCount
      sumEbitda += p.ebitda
    })

    const avgRevenue = sumRevenue / count
    const avgExpenses = sumExpenses / count
    const avgProfit = sumProfit / count

    const totalProfitRatio = sumRevenue > 0 ? sumProfit / sumRevenue : 0
    const avgProfitRatio = sumRevenue > 0 ? sumProfit / sumRevenue : 0

    return {
      totalRevenue: sumRevenue,
      avgRevenue,
      totalExpenses: sumExpenses,
      avgExpenses,
      totalProfit: sumProfit,
      avgProfit,
      totalProfitRatio,
      avgProfitRatio,
      totalVendasTotais: sumVendasTotais,
      avgVendasTotais: sumVendasTotais / count,
      totalVendasManipulacao: sumVendasManipulacao,
      avgVendasManipulacao: sumVendasManipulacao / count,
      totalVendasRevenda: sumVendasRevenda,
      avgVendasRevenda: sumVendasRevenda / count,
      totalMarkup: sumCustoMp > 0 ? sumVendasManipulacao / sumCustoMp : 0,
      avgMarkup: sumCustoMp > 0 ? sumVendasManipulacao / sumCustoMp : 0,
      totalTicket: sumFormulas > 0 ? sumVendasManipulacao / sumFormulas : 0,
      avgTicket: sumFormulas > 0 ? sumVendasManipulacao / sumFormulas : 0,
      avgValuation: (sumEbitda / count) * 12 * 4,
    }
  }, [periodsData])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-md gap-2 w-full">
          <Presentation className="w-4 h-4" />
          Relatório Estratégico Consolidado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-6xl w-full h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50/50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Presentation className="w-6 h-6 text-blue-600" />
            Relatório Estratégico Consolidado
          </DialogTitle>
          <DialogDescription>
            Selecione múltiplos meses para visualizar uma análise refinada e consolidada de alta
            performance do negócio.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[30vh] md:h-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">Períodos Fechados</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPeriods([...availablePeriods])}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setSelectedPeriods([])}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 flex flex-col gap-3">
                {availablePeriods.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nenhum período anterior disponível.
                  </p>
                ) : (
                  availablePeriods.map((p) => (
                    <div
                      key={p}
                      className={cn(
                        'flex items-center space-x-3 p-2 rounded-lg border transition-colors hover:bg-slate-50',
                        selectedPeriods.includes(p)
                          ? 'border-blue-200 bg-blue-50/50'
                          : 'border-transparent',
                      )}
                    >
                      <Checkbox
                        id={`period-${p}`}
                        checked={selectedPeriods.includes(p)}
                        onCheckedChange={(c) =>
                          c
                            ? setSelectedPeriods([...selectedPeriods, p])
                            : setSelectedPeriods(selectedPeriods.filter((x) => x !== p))
                        }
                      />
                      <label
                        htmlFor={`period-${p}`}
                        className="text-sm font-medium text-slate-700 cursor-pointer flex-1 select-none"
                      >
                        {formatPeriod(p)}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 bg-slate-50/50 overflow-auto p-4 md:p-6">
            {selectedPeriods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in duration-300">
                <FileBarChart2 className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-slate-500">Nenhum período selecionado</p>
                <p className="text-sm mt-1 max-w-sm text-center">
                  Marque um ou mais meses na lista lateral para gerar a tabela consolidada.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in duration-500 h-full flex flex-col">
                <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-bold text-slate-500 uppercase">Período Analisado</h3>
                  <p className="text-slate-800 font-medium">
                    {selectedPeriods.length}{' '}
                    {selectedPeriods.length === 1 ? 'mês selecionado' : 'meses selecionados'}
                  </p>
                </div>

                {totals && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="font-bold text-slate-800 min-w-[200px]">
                            Métrica
                          </TableHead>
                          {sortedSelectedPeriods.map((p) => (
                            <TableHead
                              key={p}
                              className="text-right font-bold text-slate-600 whitespace-nowrap min-w-[120px]"
                            >
                              {formatPeriod(p)}
                            </TableHead>
                          ))}
                          <TableHead className="text-right font-bold text-blue-900 bg-blue-50/80 whitespace-nowrap min-w-[130px]">
                            Somatório
                          </TableHead>
                          <TableHead className="text-right font-bold text-emerald-900 bg-emerald-50/80 whitespace-nowrap min-w-[130px]">
                            Média
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Vendas Totais Sistema
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatCurrency(p.vendasTotais)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-800">
                            {formatCurrency(totals.totalVendasTotais)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatCurrency(totals.avgVendasTotais)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Vendas Manipulação
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatCurrency(p.vendasManipulacao)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-800">
                            {formatCurrency(totals.totalVendasManipulacao)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatCurrency(totals.avgVendasManipulacao)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Vendas Revenda
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatCurrency(p.vendasRevenda)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-800">
                            {formatCurrency(totals.totalVendasRevenda)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatCurrency(totals.avgVendasRevenda)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Entradas Realizadas
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatCurrency(p.totalRevenue)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-800">
                            {formatCurrency(totals.totalRevenue)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatCurrency(totals.avgRevenue)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Despesas Realizadas
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatCurrency(p.totalExpenses)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-800">
                            {formatCurrency(totals.totalExpenses)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatCurrency(totals.avgExpenses)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Lucro Líquido Real
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right">
                              <div
                                className={cn(
                                  'flex flex-col items-end',
                                  p.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600',
                                )}
                              >
                                <span>{formatCurrency(p.netProfit)}</span>
                                <span className="text-xs opacity-80">
                                  ({formatPercent(p.netProfitRatio)})
                                </span>
                              </div>
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30">
                            <div
                              className={cn(
                                'flex flex-col items-end',
                                totals.totalProfit >= 0 ? 'text-blue-700' : 'text-rose-700',
                              )}
                            >
                              <span>{formatCurrency(totals.totalProfit)}</span>
                              <span className="text-xs opacity-80">
                                ({formatPercent(totals.totalProfitRatio)})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30">
                            <div
                              className={cn(
                                'flex flex-col items-end',
                                totals.avgProfit >= 0 ? 'text-emerald-700' : 'text-rose-700',
                              )}
                            >
                              <span>{formatCurrency(totals.avgProfit)}</span>
                              <span className="text-xs opacity-80">
                                ({formatPercent(totals.avgProfitRatio)})
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Mark-up Manipulação
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatNumber(p.markup)}x
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-800">
                            {formatNumber(totals.totalMarkup)}x
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatNumber(totals.avgMarkup)}x
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Ticket Médio Manipulação
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatCurrency(p.ticket)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-800">
                            {formatCurrency(totals.totalTicket)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatCurrency(totals.avgTicket)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-700">
                            Valuation Estimado
                          </TableCell>
                          {periodsData.map((p) => (
                            <TableCell key={p.period} className="text-right text-slate-600">
                              {formatCurrency(p.valuation)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-bold bg-blue-50/30 text-blue-300">
                            -
                          </TableCell>
                          <TableCell className="text-right font-bold bg-emerald-50/30 text-emerald-800">
                            {formatCurrency(totals.avgValuation)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
