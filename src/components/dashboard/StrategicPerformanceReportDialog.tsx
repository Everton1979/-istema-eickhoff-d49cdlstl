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
import { Card } from '@/components/ui/card'
import { useFinanceStore } from '@/stores/financeStore'
import { Presentation, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  const formatPercent = (val: number) => `${((val || 0) * 100).toFixed(2)}%`

  const sortedSelectedPeriods = useMemo(() => [...selectedPeriods].sort(), [selectedPeriods])

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
      const vendasRevenda = metrics ? Number(metrics.vendas_revenda) || 0 : 0
      const custoMpEmb = metrics
        ? (Number(metrics.custo_mp_emb_capsulas) || 0) + (Number(metrics.custo_mp_emb_dermato) || 0)
        : 0
      const formulasCount = metrics
        ? (Number(metrics.num_formulas_capsulas) || 0) + (Number(metrics.num_formulas_dermato) || 0)
        : 0
      const netProfit = totalRevenue - totalExpenses
      const ebitda = totalRevenue - totalVarCosts - fixedExpenses

      return {
        period: formatPeriod(p),
        rawPeriod: p,
        totalRevenue,
        totalExpenses,
        netProfit,
        vendasManipulacao,
        vendasRevenda,
        vendasTotais: vendasManipulacao + vendasRevenda,
        lucroPercent: totalRevenue > 0 ? netProfit / totalRevenue : 0,
        markup: custoMpEmb > 0 ? vendasManipulacao / custoMpEmb : 0,
        ticket: formulasCount > 0 ? vendasManipulacao / formulasCount : 0,
        ebitda,
        custoMpEmb,
        formulasCount,
      }
    })
  }, [sortedSelectedPeriods, transactions, monthlyMetrics])

  const totals = useMemo(() => {
    if (!periodsData.length) return null
    const c = periodsData.length
    const sum = periodsData.reduce(
      (acc, p) => ({
        totalRevenue: acc.totalRevenue + p.totalRevenue,
        totalExpenses: acc.totalExpenses + p.totalExpenses,
        netProfit: acc.netProfit + p.netProfit,
        vendasTotais: acc.vendasTotais + p.vendasTotais,
        vendasManipulacao: acc.vendasManipulacao + p.vendasManipulacao,
        vendasRevenda: acc.vendasRevenda + p.vendasRevenda,
        ebitda: acc.ebitda + p.ebitda,
        custoMpEmb: acc.custoMpEmb + p.custoMpEmb,
        formulasCount: acc.formulasCount + p.formulasCount,
      }),
      {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        vendasTotais: 0,
        vendasManipulacao: 0,
        vendasRevenda: 0,
        ebitda: 0,
        custoMpEmb: 0,
        formulasCount: 0,
      },
    )

    return {
      ...sum,
      avgRevenue: sum.totalRevenue / c,
      avgExpenses: sum.totalExpenses / c,
      avgProfit: sum.netProfit / c,
      totalProfitRatio: sum.totalRevenue > 0 ? sum.netProfit / sum.totalRevenue : 0,
      avgProfitRatio: sum.totalRevenue > 0 ? sum.netProfit / c / (sum.totalRevenue / c) : 0,
      avgMarkup: sum.custoMpEmb > 0 ? sum.vendasManipulacao / sum.custoMpEmb : 0,
      avgTicket: sum.formulasCount > 0 ? sum.vendasManipulacao / sum.formulasCount : 0,
      avgValuation: (sum.ebitda / c) * 12 * 4,
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
            Selecione múltiplos meses no filtro abaixo para visualizar uma análise refinada e
            consolidada através de gráficos de performance.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin flex-1">
            <span className="text-sm font-bold text-slate-600 whitespace-nowrap mr-2">
              Períodos:
            </span>
            {availablePeriods.length === 0 && (
              <span className="text-xs text-slate-400">Nenhum período fechado disponível.</span>
            )}
            {availablePeriods.map((p) => (
              <button
                key={p}
                onClick={() =>
                  setSelectedPeriods((prev) =>
                    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
                  )
                }
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
                  selectedPeriods.includes(p)
                    ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-inner'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                {formatPeriod(p)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0 pl-4 border-l border-slate-200">
            <button
              onClick={() => setSelectedPeriods([...availablePeriods])}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Selecionar Todos
            </button>
            <button
              onClick={() => setSelectedPeriods([])}
              className="text-xs text-slate-500 hover:underline"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-50/50 overflow-auto p-4 md:p-6 w-full">
          {selectedPeriods.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in duration-300">
              <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-500">Nenhum período selecionado</p>
              <p className="text-sm mt-1 max-w-sm text-center">
                Selecione um ou mais meses na barra superior para gerar os gráficos consolidados de
                performance.
              </p>
            </div>
          ) : (
            totals && (
              <div className="space-y-6 animate-fade-in duration-500 w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                  <Card className="p-4 flex flex-col gap-3 shadow-sm border-blue-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Vendas (Soma)
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Totais:</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(totals.totalVendasTotais)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Manipulação:</span>
                        <span className="font-bold text-purple-600">
                          {formatCurrency(totals.totalVendasManipulacao)}{' '}
                          <span className="text-[10px] font-normal opacity-70">
                            (
                            {formatPercent(
                              totals.totalVendasTotais > 0
                                ? totals.totalVendasManipulacao / totals.totalVendasTotais
                                : 0,
                            )}
                            )
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Revenda:</span>
                        <span className="font-bold text-amber-600">
                          {formatCurrency(totals.totalVendasRevenda)}{' '}
                          <span className="text-[10px] font-normal opacity-70">
                            (
                            {formatPercent(
                              totals.totalVendasTotais > 0
                                ? totals.totalVendasRevenda / totals.totalVendasTotais
                                : 0,
                            )}
                            )
                          </span>
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 flex flex-col gap-3 shadow-sm border-emerald-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Financeiro (Soma)
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Entradas:</span>
                        <span className="font-bold text-blue-700">
                          {formatCurrency(totals.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Despesas:</span>
                        <span className="font-bold text-rose-600">
                          {formatCurrency(totals.totalExpenses)}{' '}
                          <span className="text-[10px] font-normal opacity-70">
                            (
                            {formatPercent(
                              totals.totalRevenue > 0
                                ? totals.totalExpenses / totals.totalRevenue
                                : 0,
                            )}
                            )
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t">
                        <span className="text-slate-600">Média Despesas:</span>
                        <span className="font-bold text-rose-500">
                          {formatCurrency(totals.avgExpenses)}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 flex flex-col gap-3 shadow-sm border-blue-200 bg-blue-50/30">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Lucro Líquido Real
                    </h4>
                    <div className="space-y-2 text-sm h-full flex flex-col justify-center">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Soma:</span>
                        <div className="text-right">
                          <span
                            className={cn(
                              'font-bold text-base',
                              totals.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600',
                            )}
                          >
                            {formatCurrency(totals.totalProfit)}
                          </span>
                          <span className="text-xs ml-1 opacity-70">
                            ({formatPercent(totals.totalProfitRatio)})
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                        <span className="text-slate-600">Média/Mês:</span>
                        <div className="text-right">
                          <span
                            className={cn(
                              'font-bold',
                              totals.avgProfit >= 0 ? 'text-emerald-500' : 'text-rose-500',
                            )}
                          >
                            {formatCurrency(totals.avgProfit)}
                          </span>
                          <span className="text-xs ml-1 opacity-70">
                            ({formatPercent(totals.avgProfitRatio)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 flex flex-col gap-3 shadow-sm border-indigo-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Indicadores (Médias)
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Mark-up Manip.:</span>
                        <span className="font-bold text-indigo-600">
                          {totals.avgMarkup.toFixed(2)}x
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Ticket Médio:</span>
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(totals.avgTicket)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t">
                        <span className="text-slate-600">Valuation Médio:</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(totals.avgValuation)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                  <Card className="p-5 col-span-1 lg:col-span-2 shadow-sm border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wide text-sm flex items-center gap-2">
                      <div className="w-2 h-4 bg-blue-500 rounded-sm" /> Resultado Financeiro
                      (Entradas x Despesas x Lucro)
                    </h3>
                    <ChartContainer
                      config={{
                        entradas: { label: 'Entradas', color: '#2563eb' },
                        despesas: { label: 'Despesas', color: '#e11d48' },
                        lucro: { label: 'Lucro Líquido', color: '#10b981' },
                      }}
                      className="h-[320px] w-full"
                    >
                      <BarChart
                        data={periodsData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis
                          width={65}
                          tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                              <div className="bg-white border p-3 rounded-md shadow-md text-sm min-w-[220px]">
                                <p className="font-bold mb-2 pb-2 border-b text-slate-700">
                                  {data.period}
                                </p>
                                <div className="flex justify-between mb-1">
                                  <span className="text-blue-600 font-medium">Entradas:</span>
                                  <span className="font-bold text-blue-700">
                                    {formatCurrency(data.totalRevenue)}
                                  </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-rose-600 font-medium">Despesas:</span>
                                  <span className="font-bold text-rose-600">
                                    {formatCurrency(data.totalExpenses)}{' '}
                                    <span className="text-xs font-normal">
                                      (
                                      {formatPercent(
                                        data.totalRevenue > 0
                                          ? data.totalExpenses / data.totalRevenue
                                          : 0,
                                      )}
                                      )
                                    </span>
                                  </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t mt-2">
                                  <span
                                    className={cn(
                                      'font-medium',
                                      data.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600',
                                    )}
                                  >
                                    Lucro Real:
                                  </span>
                                  <span
                                    className={cn(
                                      'font-bold',
                                      data.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600',
                                    )}
                                  >
                                    {formatCurrency(data.netProfit)}{' '}
                                    <span className="text-xs font-normal">
                                      ({formatPercent(data.lucroPercent)})
                                    </span>
                                  </span>
                                </div>
                              </div>
                            )
                          }}
                        />
                        <Bar
                          dataKey="totalRevenue"
                          fill="var(--color-entradas)"
                          radius={[4, 4, 0, 0]}
                          name="Entradas"
                        />
                        <Bar
                          dataKey="totalExpenses"
                          fill="var(--color-despesas)"
                          radius={[4, 4, 0, 0]}
                          name="Despesas"
                        />
                        <Bar
                          dataKey="netProfit"
                          fill="var(--color-lucro)"
                          radius={[4, 4, 0, 0]}
                          name="Lucro Líquido"
                        />
                      </BarChart>
                    </ChartContainer>
                  </Card>

                  <Card className="p-5 shadow-sm border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wide text-sm flex items-center gap-2">
                      <div className="w-2 h-4 bg-purple-500 rounded-sm" /> Composição de Vendas
                    </h3>
                    <ChartContainer
                      config={{
                        manipulacao: { label: 'Manipulação', color: '#8b5cf6' },
                        revenda: { label: 'Revenda', color: '#f59e0b' },
                      }}
                      className="h-[280px] w-full"
                    >
                      <BarChart
                        data={periodsData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis
                          width={65}
                          tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                              <div className="bg-white border p-3 rounded-md shadow-md text-sm min-w-[220px]">
                                <p className="font-bold mb-2 pb-2 border-b text-slate-700">
                                  {data.period}
                                </p>
                                <div className="flex justify-between mb-1">
                                  <span className="text-purple-600 font-medium">Manipulação:</span>
                                  <span className="font-bold text-purple-600">
                                    {formatCurrency(data.vendasManipulacao)}{' '}
                                    <span className="text-[10px] font-normal">
                                      (
                                      {formatPercent(
                                        data.vendasTotais > 0
                                          ? data.vendasManipulacao / data.vendasTotais
                                          : 0,
                                      )}
                                      )
                                    </span>
                                  </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-amber-600 font-medium">Revenda:</span>
                                  <span className="font-bold text-amber-600">
                                    {formatCurrency(data.vendasRevenda)}{' '}
                                    <span className="text-[10px] font-normal">
                                      (
                                      {formatPercent(
                                        data.vendasTotais > 0
                                          ? data.vendasRevenda / data.vendasTotais
                                          : 0,
                                      )}
                                      )
                                    </span>
                                  </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t mt-2">
                                  <span className="font-medium text-slate-600">Venda Total:</span>
                                  <span className="font-bold text-slate-800">
                                    {formatCurrency(data.vendasTotais)}
                                  </span>
                                </div>
                              </div>
                            )
                          }}
                        />
                        <Bar
                          dataKey="vendasManipulacao"
                          stackId="a"
                          fill="var(--color-manipulacao)"
                          radius={[0, 0, 4, 4]}
                          name="Manipulação"
                        />
                        <Bar
                          dataKey="vendasRevenda"
                          stackId="a"
                          fill="var(--color-revenda)"
                          radius={[4, 4, 0, 0]}
                          name="Revenda"
                        />
                      </BarChart>
                    </ChartContainer>
                  </Card>

                  <Card className="p-5 shadow-sm border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wide text-sm flex items-center gap-2">
                      <div className="w-2 h-4 bg-emerald-500 rounded-sm" /> Mark-up e Ticket Médio
                      (Manipulação)
                    </h3>
                    <ChartContainer
                      config={{
                        ticket: { label: 'Ticket Médio', color: '#10b981' },
                        markup: { label: 'Mark-up', color: '#6366f1' },
                      }}
                      className="h-[280px] w-full"
                    >
                      <BarChart
                        data={periodsData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis
                          yAxisId="left"
                          width={55}
                          tickFormatter={(val) => `R$ ${val}`}
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          width={40}
                          tickFormatter={(val) => `${val}x`}
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                              <div className="bg-white border p-3 rounded-md shadow-md text-sm min-w-[200px]">
                                <p className="font-bold mb-2 pb-2 border-b text-slate-700">
                                  {data.period}
                                </p>
                                <div className="flex justify-between mb-1">
                                  <span className="text-emerald-600 font-medium">
                                    Ticket Médio:
                                  </span>
                                  <span className="font-bold text-emerald-600">
                                    {formatCurrency(data.ticket)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-indigo-600 font-medium">Mark-up:</span>
                                  <span className="font-bold text-indigo-600">
                                    {data.markup.toFixed(2)}x
                                  </span>
                                </div>
                              </div>
                            )
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="ticket"
                          fill="var(--color-ticket)"
                          radius={[4, 4, 0, 0]}
                          name="Ticket Médio"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="markup"
                          fill="var(--color-markup)"
                          radius={[4, 4, 0, 0]}
                          name="Mark-up"
                        />
                      </BarChart>
                    </ChartContainer>
                  </Card>
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
