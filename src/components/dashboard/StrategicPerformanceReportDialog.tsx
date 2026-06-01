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

function getMetricStatus(metric: string, value: number) {
  if (metric === 'lucro') {
    if (value >= 0.2)
      return {
        label: 'Sensacional',
        colorClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
      }
    if (value >= 0.15)
      return {
        label: 'Ótimo',
        colorClass: 'text-teal-700',
        bgClass: 'bg-teal-50',
        borderClass: 'border-teal-200',
      }
    if (value >= 0.1)
      return {
        label: 'Bom',
        colorClass: 'text-blue-700',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
      }
    if (value >= 0.05)
      return {
        label: 'Regular',
        colorClass: 'text-yellow-700',
        bgClass: 'bg-yellow-50',
        borderClass: 'border-yellow-300',
      }
    if (value >= 0)
      return {
        label: 'Ruim',
        colorClass: 'text-orange-700',
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
      }
    return {
      label: 'Péssimo',
      colorClass: 'text-rose-700',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
    }
  }
  if (metric === 'markup') {
    if (value >= 5)
      return {
        label: 'Sensacional',
        colorClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
      }
    if (value >= 4)
      return {
        label: 'Ótimo',
        colorClass: 'text-teal-700',
        bgClass: 'bg-teal-50',
        borderClass: 'border-teal-200',
      }
    if (value >= 3.5)
      return {
        label: 'Bom',
        colorClass: 'text-blue-700',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
      }
    if (value >= 3)
      return {
        label: 'Regular',
        colorClass: 'text-yellow-700',
        bgClass: 'bg-yellow-50',
        borderClass: 'border-yellow-300',
      }
    if (value >= 2.5)
      return {
        label: 'Ruim',
        colorClass: 'text-orange-700',
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
      }
    return {
      label: 'Péssimo',
      colorClass: 'text-rose-700',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
    }
  }
  if (metric === 'ticket') {
    if (value >= 250)
      return {
        label: 'Sensacional',
        colorClass: 'text-emerald-700',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
      }
    if (value >= 200)
      return {
        label: 'Ótimo',
        colorClass: 'text-teal-700',
        bgClass: 'bg-teal-50',
        borderClass: 'border-teal-200',
      }
    if (value >= 150)
      return {
        label: 'Bom',
        colorClass: 'text-blue-700',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
      }
    if (value >= 100)
      return {
        label: 'Regular',
        colorClass: 'text-yellow-700',
        bgClass: 'bg-yellow-50',
        borderClass: 'border-yellow-300',
      }
    if (value >= 75)
      return {
        label: 'Ruim',
        colorClass: 'text-orange-700',
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
      }
    return {
      label: 'Péssimo',
      colorClass: 'text-rose-700',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
    }
  }
  return { label: '', colorClass: '', bgClass: '', borderClass: '' }
}

function HighlightedMetricCard({
  title,
  value,
  type,
  indicatorType,
  customDisplay,
}: {
  title: string
  value: number
  type: 'currency' | 'percent' | 'number'
  indicatorType: 'valuation' | 'entradas' | 'despesas' | 'lucro' | 'markup' | 'ticket'
  customDisplay?: string
}) {
  const formattedValue = customDisplay
    ? customDisplay
    : type === 'currency'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
      : type === 'percent'
        ? `${(value * 100).toFixed(2)}%`
        : value.toFixed(2)

  let colorClass = 'text-slate-800'
  let bgClass = 'bg-white'
  let borderClass = 'border-slate-200'
  let badge = null

  if (indicatorType === 'valuation') {
    if (value > 0) {
      colorClass = 'text-emerald-700'
      bgClass = 'bg-emerald-50'
      borderClass = 'border-emerald-200'
    } else if (value < 0) {
      colorClass = 'text-rose-700'
      bgClass = 'bg-rose-50'
      borderClass = 'border-rose-200'
    }
  } else if (indicatorType === 'entradas') {
    colorClass = 'text-emerald-700'
    bgClass = 'bg-emerald-50'
    borderClass = 'border-emerald-200'
  } else if (indicatorType === 'despesas') {
    colorClass = 'text-rose-700'
    bgClass = 'bg-rose-50'
    borderClass = 'border-rose-200'
  } else {
    const status = getMetricStatus(indicatorType, value)
    colorClass = status.colorClass
    bgClass = status.bgClass
    borderClass = status.borderClass
    badge = (
      <span
        className={cn(
          'text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider',
          'bg-white/60 shadow-sm',
          status.colorClass,
          status.borderClass,
          'border',
        )}
      >
        {status.label}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'p-5 md:p-6 rounded-xl border shadow-sm flex flex-col justify-center transition-all hover:shadow-md relative',
        bgClass,
        borderClass,
      )}
    >
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-3 gap-2">
        <p className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
          {title}
        </p>
        {badge}
      </div>
      <p
        className={cn('text-2xl md:text-3xl font-black truncate', colorClass)}
        title={formattedValue}
      >
        {formattedValue}
      </p>
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
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
      date,
    )
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(' de ', '/')
  }

  const {
    totalRevenue,
    totalExpenses,
    netProfitRatio,
    netProfitDisplay,
    markup,
    avgTicket,
    valuation,
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

    const totalExpenses = selectedTx
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const totalVarCosts = selectedTx
      .filter((t) => t.type === 'EXPENSE' && t.categoryId === 'VARIAVEL')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const fixedExpenses = selectedTx
      .filter((t) => t.type === 'EXPENSE' && t.categoryId === 'FIXA')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const ebitda = totalRevenue - totalVarCosts - fixedExpenses
    const netProfitValue = totalRevenue - totalExpenses
    const netProfitRatio = totalRevenue > 0 ? netProfitValue / totalRevenue : 0

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

    const formulasCount = selectedMetrics.reduce(
      (acc, m) =>
        acc + (Number(m.num_formulas_capsulas) || 0) + (Number(m.num_formulas_dermato) || 0),
      0,
    )
    const avgTicket = formulasCount > 0 ? sumVendasCapsulasDermato / formulasCount : 0

    const avgMonthlyEbitda = selectedPeriods.length > 0 ? ebitda / selectedPeriods.length : 0
    const valuation = avgMonthlyEbitda * 12 * 4

    const netProfitDisplay = `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfitValue)} (${(netProfitRatio * 100).toFixed(2)}%)`

    return {
      totalRevenue,
      totalExpenses,
      netProfitRatio,
      netProfitDisplay,
      markup,
      avgTicket,
      valuation,
    }
  }, [selectedPeriods, transactions, monthlyMetrics])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-md gap-2 w-full">
          <Presentation className="w-4 h-4" />
          Relatório Estratégico Consolidado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50/50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Presentation className="w-6 h-6 text-blue-600" />
            Relatório Estratégico Consolidado
          </DialogTitle>
          <DialogDescription>
            Selecione múltiplos meses para visualizar uma análise refinada de alta performance do
            negócio.
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
              <div className="space-y-6 animate-fade-in duration-500 max-w-5xl mx-auto">
                <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-500 uppercase">Período Analisado</h3>
                  <p className="text-slate-800 font-medium">
                    {selectedPeriods.length}{' '}
                    {selectedPeriods.length === 1 ? 'mês selecionado' : 'meses selecionados'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <HighlightedMetricCard
                    title="Valuation Estimado"
                    value={valuation}
                    type="currency"
                    indicatorType="valuation"
                  />
                  <HighlightedMetricCard
                    title="Entradas Realizadas"
                    value={totalRevenue}
                    type="currency"
                    indicatorType="entradas"
                  />
                  <HighlightedMetricCard
                    title="Despesas Realizadas"
                    value={totalExpenses}
                    type="currency"
                    indicatorType="despesas"
                  />
                  <HighlightedMetricCard
                    title="Lucro Líquido Real"
                    value={netProfitRatio}
                    type="percent"
                    indicatorType="lucro"
                    customDisplay={netProfitDisplay}
                  />
                  <HighlightedMetricCard
                    title="Mark-up Praticado"
                    value={markup}
                    type="number"
                    indicatorType="markup"
                  />
                  <HighlightedMetricCard
                    title="Ticket Médio Manipulação"
                    value={avgTicket}
                    type="currency"
                    indicatorType="ticket"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
