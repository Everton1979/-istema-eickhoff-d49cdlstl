import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Presentation, Filter, BarChart3 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { ScrollArea } from '@/components/ui/scroll-area'

export function StrategicPerformanceReportDialog() {
  const { transactions, monthlyMetrics, filters } = useFinanceStore()
  const [open, setOpen] = useState(false)
  const [localYears, setLocalYears] = useState<string[]>([])
  const [localMonths, setLocalMonths] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      const currentYear = new Date().getFullYear().toString()
      setLocalYears([currentYear])
      setLocalMonths(
        filters.months.length > 0
          ? filters.months
          : [(new Date().getMonth() + 1).toString().padStart(2, '0')],
      )
    }
  }, [open, filters.months])

  const navigate = useNavigate()

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const prevYear = currentYear - 1
    return [currentYear.toString(), prevYear.toString()].sort()
  }, [])

  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const periodsData = useMemo(() => {
    const periods = localYears
      .flatMap((y) => localMonths.map((m) => `${y}-${String(m).padStart(2, '0')}`))
      .sort()

    return periods.map((p) => {
      let totalInc = 0
      let totalExp = 0
      transactions.forEach((t) => {
        if (t.date.startsWith(p) && t.status === 'REALIZADO') {
          if (t.type === 'INCOME') totalInc += Number(t.amount)
          if (t.type === 'EXPENSE') totalExp += Number(t.amount)
        }
      })

      const m = monthlyMetrics.find(
        (metric) => `${metric.year}-${String(metric.month).padStart(2, '0')}` === p,
      )

      const entradas = totalInc
      const despesas = totalExp
      const lucroLiquido = entradas - despesas

      const rawMaterialCosts = m
        ? m.raw_material_costs > 0
          ? m.raw_material_costs
          : m.custo_mp_emb_capsulas + m.custo_mp_emb_dermato
        : 0

      const markup = rawMaterialCosts > 0 ? entradas / rawMaterialCosts : 0

      const ordCnt = m
        ? m.orders_count > 0
          ? m.orders_count
          : m.num_formulas_capsulas + m.num_formulas_dermato
        : 0

      const ticket = ordCnt > 0 ? entradas / ordCnt : 0

      const ebitda = lucroLiquido
      const valuation = ebitda * 12 * 4

      return {
        period: `${monthNames[parseInt(p.split('-')[1]) - 1]}/${p.split('-')[0].slice(2)}`,
        rawPeriod: p,
        entradas,
        despesas,
        lucroLiquido,
        markup,
        ticket,
        valuation,
      }
    })
  }, [localYears, localMonths, transactions, monthlyMetrics])

  const averages = useMemo(() => {
    if (!periodsData.length) return null
    const dataMonthsCount = periodsData.length
    const sum = { entradas: 0, despesas: 0, lucroLiquido: 0, markup: 0, ticket: 0, valuation: 0 }

    periodsData.forEach((p) => {
      sum.entradas += p.entradas
      sum.despesas += p.despesas
      sum.lucroLiquido += p.lucroLiquido
      sum.markup += p.markup
      sum.ticket += p.ticket
      sum.valuation += p.valuation
    })

    if (dataMonthsCount === 0)
      return { entradas: 0, despesas: 0, lucroLiquido: 0, markup: 0, ticket: 0, valuation: 0 }

    Object.keys(sum).forEach((k) => (sum[k as keyof typeof sum] /= dataMonthsCount))
    sum.valuation = sum.lucroLiquido * 12 * 4
    return sum
  }, [periodsData])

  const renderSection = (
    title: string,
    key: keyof typeof averages,
    fmt: (v: number) => string,
    color: string,
  ) => (
    <Card className="shadow-sm border-slate-200 overflow-hidden mb-8" key={title}>
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{title}</h3>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          Média: <span className="text-slate-800">{averages ? fmt(averages[key]) : fmt(0)}</span>
        </div>
      </div>
      <div className="p-4 bg-white border-b border-slate-100">
        <ChartContainer config={{ [key]: { label: title, color } }} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={periodsData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="period"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  key === 'markup'
                    ? `${v}x`
                    : new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)
                }
              />
              <RechartsTooltip
                content={<ChartTooltipContent formatter={(v) => fmt(v as number)} />}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[150px] font-semibold text-slate-600 bg-slate-50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Período
              </TableHead>
              {periodsData.map((p) => (
                <TableHead key={p.rawPeriod} className="text-right whitespace-nowrap min-w-[100px]">
                  {p.period}
                </TableHead>
              ))}
              <TableHead className="text-right font-bold text-slate-800 bg-slate-100 whitespace-nowrap">
                Média
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-slate-700 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {title}
              </TableCell>
              {periodsData.map((p) => (
                <TableCell key={p.rawPeriod} className="text-right whitespace-nowrap min-w-[100px]">
                  {fmt(p[key] as number)}
                </TableCell>
              ))}
              <TableCell className="text-right font-bold bg-slate-50 whitespace-nowrap text-slate-800">
                {averages ? fmt(averages[key]) : fmt(0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-md gap-2 w-full">
          <Presentation className="w-4 h-4" /> Relatório Estratégico Consolidado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0 shadow-sm z-10 flex flex-row items-start justify-between">
          <div className="flex flex-col gap-1 pr-4">
            <DialogTitle className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <Presentation className="w-6 h-6 text-blue-600" /> Relatório Estratégico Consolidado
            </DialogTitle>
            <DialogDescription>
              Visualize tendências e tabelas comparativas. Selecione os períodos no filtro local
              abaixo.
            </DialogDescription>
          </div>
          <Button
            onClick={() => {
              setOpen(false)
              navigate('/dashboard')
            }}
            variant="outline"
            className="shrink-0 mt-1"
          >
            Sair
          </Button>
        </DialogHeader>
        <ScrollArea className="flex-1 w-full p-4 md:p-6">
          <div className="max-w-7xl mx-auto pb-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-8">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Filter className="w-4 h-4" />
                <h3 className="font-semibold text-sm uppercase tracking-wide">
                  Filtro de Período Local
                </h3>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
                    Anos
                  </span>
                  <ToggleGroup
                    type="multiple"
                    value={localYears}
                    onValueChange={(v) => v.length && setLocalYears(v)}
                    className="justify-start flex-wrap"
                  >
                    {availableYears.map((y) => (
                      <ToggleGroupItem
                        key={y}
                        value={y}
                        className="data-[state=on]:bg-slate-800 data-[state=on]:text-white border border-slate-200"
                      >
                        {y}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <div className="flex-[3]">
                  <span className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
                    Meses
                  </span>
                  <ToggleGroup
                    type="multiple"
                    value={localMonths}
                    onValueChange={(v) => v.length && setLocalMonths(v)}
                    className="justify-start flex-wrap"
                  >
                    {monthNames.map((m, i) => (
                      <ToggleGroupItem
                        key={m}
                        value={String(i + 1).padStart(2, '0')}
                        className="data-[state=on]:bg-blue-600 data-[state=on]:text-white border border-slate-200"
                      >
                        {m}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
            </div>

            {periodsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium">Nenhum período selecionado</p>
                <p className="text-sm mt-1">Selecione pelo menos um ano e mês no filtro acima.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {renderSection('Entradas', 'entradas', formatCurrency, '#10b981')}
                {renderSection('Despesas', 'despesas', formatCurrency, '#ef4444')}
                {renderSection('Lucro Líquido Real', 'lucroLiquido', formatCurrency, '#3b82f6')}
                {renderSection(
                  'Mark-up Manip.',
                  'markup',
                  (val) => `${val.toFixed(2)}x`,
                  '#8b5cf6',
                )}
                {renderSection('Ticket Médio', 'ticket', formatCurrency, '#f59e0b')}
                {renderSection('Valuation', 'valuation', formatCurrency, '#0f172a')}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
