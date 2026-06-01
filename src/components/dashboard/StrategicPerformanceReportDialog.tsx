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
import { useFinanceStore } from '@/stores/financeStore'
import { FileBarChart2, Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'

function MetricCard({
  title,
  value,
  type,
  subValue,
}: {
  title: string
  value: number
  type: 'currency' | 'percent' | 'number'
  subValue?: number
}) {
  const formattedValue =
    type === 'currency'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
      : type === 'percent'
        ? `${(value * 100).toFixed(2)}%`
        : value.toFixed(2)

  const formattedSub =
    subValue !== undefined
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subValue)
      : null

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
      <p
        className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 line-clamp-1"
        title={title}
      >
        {title}
      </p>
      <p
        className={cn(
          'text-lg sm:text-xl font-black truncate',
          value < 0 && type !== 'number' ? 'text-rose-600' : 'text-slate-800',
        )}
        title={formattedValue}
      >
        {formattedValue}
      </p>
      {formattedSub && (
        <p className="text-xs text-slate-400 mt-1 truncate" title={formattedSub}>
          {formattedSub}
        </p>
      )}
    </div>
  )
}

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
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`
    }
    return ''
  }

  const availablePeriods = useMemo(() => {
    const periods = new Set<string>()
    monthlyMetrics.forEach((m) => {
      periods.add(`${m.year}-${String(m.month).padStart(2, '0')}`)
    })
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
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
      date,
    )
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(' de ', '/')
  }

  const selectAll = () => setSelectedPeriods([...availablePeriods])
  const clearAll = () => setSelectedPeriods([])

  const {
    totalRevenue,
    totalExpenses,
    contributionMargin,
    contributionMarginRatio,
    ebitda,
    breakEven,
    netProfit,
    netProfitRatio,
    fixedRatio,
    varRatio,
    markup,
    valuation,
    avgTicket,
    fixedExpenses,
    totalVarCosts,
    investments,
    partnerWithdrawals,
  } = useMemo(() => {
    const selectedTx = transactions.filter((t) => {
      const p = getPeriodStr(t.date)
      return selectedPeriods.includes(p) && t.status === 'REALIZADO'
    })

    const selectedMetrics = monthlyMetrics.filter((m) => {
      const p = `${m.year}-${String(m.month).padStart(2, '0')}`
      return selectedPeriods.includes(p)
    })

    const totalRevenue = selectedTx
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const totalVarCosts = selectedTx
      .filter((t) => t.type === 'EXPENSE' && t.categoryId === 'VARIAVEL')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const fixedExpenses = selectedTx
      .filter((t) => t.type === 'EXPENSE' && t.categoryId === 'FIXA')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const investments = selectedTx
      .filter((t) => t.type === 'INVESTIMENTO')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const partnerWithdrawals = selectedTx
      .filter((t) => t.type === 'PARTNER_WITHDRAWAL')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const totalExpenses = totalVarCosts + fixedExpenses

    const contributionMargin = totalRevenue - totalVarCosts
    const contributionMarginRatio = totalRevenue > 0 ? contributionMargin / totalRevenue : 0

    const ebitda = contributionMargin - fixedExpenses
    const avgMonthlyEbitda = selectedPeriods.length > 0 ? ebitda / selectedPeriods.length : 0

    const breakEven = contributionMarginRatio > 0 ? fixedExpenses / contributionMarginRatio : 0

    const netProfit = ebitda
    const netProfitRatio = totalRevenue > 0 ? netProfit / totalRevenue : 0

    const fixedRatio = totalRevenue > 0 ? fixedExpenses / totalRevenue : 0
    const varRatio = totalRevenue > 0 ? totalVarCosts / totalRevenue : 0

    const sumVendasCapsulasDermato = selectedMetrics.reduce(
      (acc, m) => acc + (Number(m.vendas_capsulas) || 0) + (Number(m.vendas_dermato) || 0),
      0,
    )
    const sumCustoMpCapsulasDermato = selectedMetrics.reduce(
      (acc, m) =>
        acc + (Number(m.custo_mp_emb_capsulas) || 0) + (Number(m.custo_mp_emb_dermato) || 0),
      0,
    )

    const markup =
      sumCustoMpCapsulasDermato > 0 ? sumVendasCapsulasDermato / sumCustoMpCapsulasDermato : 0

    const valuation = avgMonthlyEbitda * 12 * 4

    const formulasCount = selectedMetrics.reduce(
      (acc, m) =>
        acc + (Number(m.num_formulas_capsulas) || 0) + (Number(m.num_formulas_dermato) || 0),
      0,
    )
    const avgTicket = formulasCount > 0 ? sumVendasCapsulasDermato / formulasCount : 0

    return {
      totalRevenue,
      totalExpenses,
      contributionMargin,
      contributionMarginRatio,
      ebitda,
      breakEven,
      netProfit,
      netProfitRatio,
      fixedRatio,
      varRatio,
      markup,
      valuation,
      avgTicket,
      fixedExpenses,
      totalVarCosts,
      investments,
      partnerWithdrawals,
    }
  }, [selectedPeriods, transactions, monthlyMetrics])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-md gap-2 w-full">
          <Presentation className="w-4 h-4" />
          Relatório Estratégico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50/50">
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <DialogTitle className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Presentation className="w-6 h-6 text-blue-600" />
            Relatório de Performance Estratégica
          </DialogTitle>
          <DialogDescription>
            Selecione múltiplos meses (excluindo o mês atual) para visualizar as métricas
            consolidadas do período.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Sidebar - Month Selection */}
          <div className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[30vh] md:h-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">Períodos Disponíveis</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Todos
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={clearAll} className="text-xs text-slate-500 hover:underline">
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
                        onCheckedChange={(c) => {
                          if (c) setSelectedPeriods([...selectedPeriods, p])
                          else setSelectedPeriods(selectedPeriods.filter((x) => x !== p))
                        }}
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

          {/* Right Content - Dashboard */}
          <div className="flex-1 bg-slate-50/50 overflow-y-auto p-4 md:p-6">
            {selectedPeriods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in duration-300">
                <FileBarChart2 className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-slate-500">Nenhum período selecionado</p>
                <p className="text-sm mt-1 max-w-sm text-center">
                  Marque um ou mais meses na lista lateral para gerar o relatório consolidado.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in duration-500">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase">
                      Período Analisado
                    </h3>
                    <p className="text-slate-800 font-medium">
                      {selectedPeriods.length}{' '}
                      {selectedPeriods.length === 1 ? 'mês selecionado' : 'meses selecionados'}
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">
                      Valuation Estimado (4x)
                    </h3>
                    <p className="text-xl md:text-2xl font-black text-emerald-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(valuation)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard title="Entradas Realizadas" value={totalRevenue} type="currency" />
                  <MetricCard title="Despesas Realizadas" value={totalExpenses} type="currency" />
                  <MetricCard
                    title="Lucro Líquido Real"
                    value={netProfitRatio}
                    type="percent"
                    subValue={netProfit}
                  />
                  <MetricCard title="EBITDA" value={ebitda} type="currency" />

                  <MetricCard
                    title="Margem de Contribuição"
                    value={contributionMarginRatio}
                    type="percent"
                    subValue={contributionMargin}
                  />
                  <MetricCard title="Ponto de Equilíbrio" value={breakEven} type="currency" />
                  <MetricCard title="Mark-up Praticado" value={markup} type="number" />
                  <MetricCard title="Ticket Méd. Manipulação" value={avgTicket} type="currency" />

                  <MetricCard
                    title="Despesas Variáveis"
                    value={varRatio}
                    type="percent"
                    subValue={totalVarCosts}
                  />
                  <MetricCard
                    title="Despesas Fixas"
                    value={fixedRatio}
                    type="percent"
                    subValue={fixedExpenses}
                  />
                  <MetricCard title="Investimentos" value={investments} type="currency" />
                </div>

                {partnerWithdrawals > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-amber-800 uppercase">
                        Retirada de Sócios
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Não contabilizado no EBITDA/Lucro Operacional
                      </p>
                    </div>
                    <p className="text-lg font-black text-amber-700">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(partnerWithdrawals)}
                    </p>
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
