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
import { Presentation, Filter, BarChart3, Printer, FileText, Download } from 'lucide-react'
import {
  StrategicPeriodMetric,
  StrategicAverages,
  StrategicSectionConfig,
  buildStrategicReportHtml,
  printStrategicReportHtml,
} from './strategic-report-print'
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
  const [showPreviewModal, setShowPreviewModal] = useState(false)

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

  const strategicSections: StrategicSectionConfig[] = useMemo(
    () => [
      { title: 'Entradas', key: 'entradas', fmt: formatCurrency, color: '#93c5fd' },
      { title: 'Despesas', key: 'despesas', fmt: formatCurrency, color: '#fca5a5' },
      { title: 'Lucro Líquido Real', key: 'lucroLiquido', fmt: formatCurrency, color: '#86efac' },
      {
        title: 'Mark-up Manip.',
        key: 'markup',
        fmt: (val: number) => `${val.toFixed(2)}x`,
        color: '#c4b5fd',
      },
      { title: 'Ticket Médio', key: 'ticket', fmt: formatCurrency, color: '#fcd34d' },
      {
        title: 'Custo Fixo / Fórm (Cápsulas)',
        key: 'custoFixoCapsulas',
        fmt: formatCurrency,
        color: '#ea580c',
      },
      {
        title: 'Custo Fixo / Fórm (Dermato)',
        key: 'custoFixoDermato',
        fmt: formatCurrency,
        color: '#f97316',
      },
      {
        title: 'Piso de Segurança das Cápsulas',
        key: 'pisoSegurancaCapsulas',
        fmt: formatCurrency,
        color: '#0284c7',
      },
      {
        title: 'Piso de Segurança da Dermato',
        key: 'pisoSegurancaDermato',
        fmt: formatCurrency,
        color: '#38bdf8',
      },
      { title: 'EBITDA', key: 'ebitda', fmt: formatCurrency, color: '#10b981' },
      { title: 'Valuation', key: 'valuation', fmt: formatCurrency, color: '#94a3b8' },
    ],
    [],
  )

  const periodsData = useMemo(() => {
    const periods = localYears
      .flatMap((y) => localMonths.map((m) => `${y}-${String(m).padStart(2, '0')}`))
      .sort()

    const COGS_SUBCATEGORIES = [
      'materia_prima',
      'embalagens',
      'medicamentos_drogaria',
      'insumos e ativos',
      'frascos, potes, rótulos e caixas',
      'produtos para revenda',
    ]

    return periods.map((p) => {
      let totalInc = 0
      let totalExp = 0
      let cfaTotal = 0
      let insumosTotal = 0

      transactions.forEach((t) => {
        if (t.date.startsWith(p) && t.status === 'REALIZADO') {
          if (t.type === 'INCOME') totalInc += Number(t.amount)
          if (t.type === 'EXPENSE') {
            const amount = Number(t.amount) || 0
            totalExp += amount
            if (
              t.categoryId === 'FIXA' ||
              String(t.category).toUpperCase() === 'FIXA' ||
              String(t.category).toUpperCase() === 'DESPESAS FIXAS' ||
              String(t.category).toUpperCase() === 'CUSTO FIXO'
            ) {
              cfaTotal += amount
            }
            const sub = (t.subcategoryId || (t as any).subcategory || '').toLowerCase().trim()
            if (COGS_SUBCATEGORIES.includes(sub)) {
              insumosTotal += amount
            }
          }
        }
      })

      const m = monthlyMetrics.find(
        (metric) => `${metric.year}-${String(metric.month).padStart(2, '0')}` === p,
      )

      const entradas = totalInc
      const despesas = totalExp
      const lucroLiquido = entradas - despesas

      const totalSystemSales = m?.total_system_sales || 0
      const rawMaterialCosts = m?.raw_material_costs || 0
      const ordersCount = m?.orders_count || 0

      const markup = rawMaterialCosts > 0 ? totalSystemSales / rawMaterialCosts : 0
      const ticket = ordersCount > 0 ? totalSystemSales / ordersCount : 0

      const ebitda = lucroLiquido
      const valuation = ebitda * 12 * 4

      const vendasCaps = m?.vendas_capsulas || 0
      const vendasDerm = m?.vendas_dermato || 0
      const vendasRevenda = m?.vendas_revenda || 0
      const totalRev = vendasCaps + vendasDerm + vendasRevenda
      const numCaps = m?.num_formulas_capsulas || 0
      const numDerm = m?.num_formulas_dermato || 0

      // Custo Fixo rateado por fórmula (método PharmacyMetrics)
      const pesoCapsulas = totalSystemSales > 0 ? vendasCaps / totalSystemSales : 0.5
      const pesoDermato = totalSystemSales > 0 ? vendasDerm / totalSystemSales : 0.5
      const cfaCapsulas = cfaTotal * pesoCapsulas
      const cfaDermato = cfaTotal * pesoDermato
      const custoFixoCapsulas = numCaps > 0 ? cfaCapsulas / numCaps : 0
      const custoFixoDermato = numDerm > 0 ? cfaDermato / numDerm : 0

      // Piso de Segurança por fórmula (método PricingAssistant / Blindagem Operacional)
      const netExpense = totalExp - insumosTotal
      const propCaps = totalRev > 0 ? vendasCaps / totalRev : 0.5
      const propDerm = totalRev > 0 ? vendasDerm / totalRev : 0.5
      const blindagemCaps = numCaps > 0 ? (netExpense * propCaps) / numCaps : 0
      const blindagemDerm = numDerm > 0 ? (netExpense * propDerm) / numDerm : 0

      return {
        period: `${monthNames[parseInt(p.split('-')[1]) - 1]}/${p.split('-')[0].slice(2)}`,
        rawPeriod: p,
        entradas,
        despesas,
        lucroLiquido,
        markup,
        ticket,
        valuation,
        custoFixoCapsulas,
        custoFixoDermato,
        pisoSegurancaCapsulas: blindagemCaps,
        pisoSegurancaDermato: blindagemDerm,
        ebitda,
        totalSystemSales,
        rawMaterialCosts,
        ordersCount,
        numCaps,
        numDerm,
        cfaCapsulas,
        cfaDermato,
        netExpense,
        propCaps,
        propDerm,
      }
    })
  }, [localYears, localMonths, transactions, monthlyMetrics])

  const averages = useMemo(() => {
    if (!periodsData.length) return null
    const dataMonthsCount = periodsData.length
    const sum = {
      entradas: 0,
      despesas: 0,
      lucroLiquido: 0,
      markup: 0,
      ticket: 0,
      valuation: 0,
      custoFixoCapsulas: 0,
      custoFixoDermato: 0,
      pisoSegurancaCapsulas: 0,
      pisoSegurancaDermato: 0,
      ebitda: 0,
      totalSystemSales: 0,
      rawMaterialCosts: 0,
      ordersCount: 0,
    }

    periodsData.forEach((p) => {
      sum.entradas += p.entradas
      sum.despesas += p.despesas
      sum.lucroLiquido += p.lucroLiquido
      sum.custoFixoCapsulas += p.custoFixoCapsulas
      sum.custoFixoDermato += p.custoFixoDermato
      sum.pisoSegurancaCapsulas += p.pisoSegurancaCapsulas
      sum.pisoSegurancaDermato += p.pisoSegurancaDermato
      sum.ebitda += p.ebitda
      sum.totalSystemSales += p.totalSystemSales
      sum.rawMaterialCosts += p.rawMaterialCosts
      sum.ordersCount += p.ordersCount
    })

    if (dataMonthsCount === 0)
      return {
        entradas: 0,
        despesas: 0,
        lucroLiquido: 0,
        markup: 0,
        ticket: 0,
        valuation: 0,
        custoFixoCapsulas: 0,
        custoFixoDermato: 0,
        pisoSegurancaCapsulas: 0,
        pisoSegurancaDermato: 0,
        ebitda: 0,
      }

    sum.entradas /= dataMonthsCount
    sum.despesas /= dataMonthsCount
    sum.lucroLiquido /= dataMonthsCount
    sum.markup = sum.rawMaterialCosts > 0 ? sum.totalSystemSales / sum.rawMaterialCosts : 0
    sum.ticket = sum.ordersCount > 0 ? sum.totalSystemSales / sum.ordersCount : 0
    sum.valuation = sum.lucroLiquido * 12 * 4
    sum.custoFixoCapsulas /= dataMonthsCount
    sum.custoFixoDermato /= dataMonthsCount
    sum.pisoSegurancaCapsulas /= dataMonthsCount
    sum.pisoSegurancaDermato /= dataMonthsCount
    sum.ebitda /= dataMonthsCount

    return sum
  }, [periodsData])

  const periodLabelText = useMemo(() => {
    if (!periodsData.length) return 'NENHUM PERÍODO SELECIONADO'
    const first = periodsData[0].rawPeriod // 'YYYY-MM'
    const last = periodsData[periodsData.length - 1].rawPeriod
    const [y1, m1] = first.split('-')
    const [y2, m2] = last.split('-')

    const dateStart = new Date(parseInt(y1), parseInt(m1) - 1, 1)
    const dateEnd = new Date(parseInt(y2), parseInt(m2), 0)

    const fmtD = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    return `${fmtD(dateStart)} A ${fmtD(dateEnd)}`
  }, [periodsData])

  const handleTriggerPrint = () => {
    if (!periodsData.length || !averages) return
    const html = buildStrategicReportHtml({
      periodLabel: periodLabelText,
      periodsData,
      averages,
      sections: strategicSections,
    })
    printStrategicReportHtml(html)
  }

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
                content={(props: any) => (
                  <ChartTooltipContent {...props} formatter={(v) => fmt(v as number)} />
                )}
                cursor={{ fill: '#f8fafc' }}
              />{' '}
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
      <Table className="border-separate border-spacing-0 w-full">
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-[150px] font-semibold text-slate-600 bg-slate-50 sticky left-0 z-20 border-b border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              Período
            </TableHead>
            {periodsData.map((p) => (
              <TableHead
                key={p.rawPeriod}
                className="text-right whitespace-nowrap min-w-[100px] border-b border-slate-200 bg-slate-50/50"
              >
                {p.period}
              </TableHead>
            ))}
            <TableHead className="text-right font-bold text-slate-800 bg-slate-100 whitespace-nowrap sticky right-0 z-30 border-b border-slate-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              Média
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-none hover:bg-transparent">
            <TableCell className="font-medium text-slate-700 bg-white sticky left-0 z-20 border-b border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              {title}
            </TableCell>
            {periodsData.map((p) => (
              <TableCell
                key={p.rawPeriod}
                className="text-right whitespace-nowrap min-w-[100px] border-b border-slate-100 bg-white"
              >
                {fmt(p[key] as number)}
              </TableCell>
            ))}
            <TableCell className="text-right font-bold bg-slate-50 whitespace-nowrap text-slate-800 sticky right-0 z-30 border-b border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              {averages ? fmt(averages[key]) : fmt(0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <Button
              onClick={() => setShowPreviewModal(true)}
              disabled={periodsData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-sm uppercase text-xs tracking-wide"
            >
              <FileText className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button
              onClick={() => {
                setOpen(false)
                navigate('/dashboard')
              }}
              variant="outline"
            >
              Sair
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 w-full p-4 md:p-6">
          <div className="max-w-7xl mx-auto pb-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <Filter className="w-4 h-4" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    Filtro de Período Local
                  </h3>
                </div>
                {periodsData.length > 0 && (
                  <Button
                    onClick={() => setShowPreviewModal(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2 font-bold text-xs uppercase text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar PDF do Período
                  </Button>
                )}
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
                {strategicSections.map((sec) =>
                  renderSection(sec.title, sec.key, sec.fmt, sec.color),
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Modal de Pré-visualização e Ação de Impressão / Salvar PDF */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="w-[95vw] sm:w-[90vw] max-w-5xl h-[90vh] p-0 flex flex-col rounded-xl overflow-hidden bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b bg-slate-50 shrink-0">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                  Visualização do Relatório Estratégico Consolidado
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase">
                  PERÍODO: {periodLabelText} • {periodsData.length} MESES SELECIONADOS
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 sm:flex-none uppercase text-xs font-bold"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleTriggerPrint}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-sm uppercase text-xs tracking-wide"
                >
                  <Printer className="w-4 h-4" />
                  Salvar PDF / Imprimir
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 sm:p-8 bg-white text-black">
              <div className="max-w-[850px] mx-auto space-y-6">
                <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                      SISTEMA EICKHOFF • GESTÃO ESTRATÉGICA
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      Relatório Estratégico Consolidado
                    </h1>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase rounded">
                      COMPARATIVO MENSAL
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 border-r border-slate-200 pr-4">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                      Período Consolidado
                    </h3>
                    <p className="text-base text-slate-900 font-extrabold">{periodLabelText}</p>
                    <p className="text-xs text-slate-600 mt-1 uppercase">
                      <strong>Meses Selecionados:</strong> {periodsData.length} meses
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                      Resumo Médio Estratégico
                    </h3>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-700 flex justify-between">
                        <span className="font-semibold uppercase">Média Entradas:</span>
                        <span className="text-green-700 font-bold">
                          {formatCurrency(averages?.entradas || 0)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-700 flex justify-between">
                        <span className="font-semibold uppercase">Média Despesas:</span>
                        <span className="text-red-700 font-bold">
                          {formatCurrency(averages?.despesas || 0)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-700 flex justify-between">
                        <span className="font-semibold uppercase">Média Lucro Real:</span>
                        <span className="text-blue-700 font-bold">
                          {formatCurrency(averages?.lucroLiquido || 0)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-700 flex justify-between">
                        <span className="font-semibold uppercase">Média EBITDA:</span>
                        <span className="text-emerald-700 font-bold">
                          {formatCurrency(averages?.ebitda || 0)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {strategicSections.map((sec) => (
                    <Card key={sec.title} className="shadow-sm border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: sec.color }}
                          />
                          <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                            {sec.title}
                          </h4>
                        </div>
                        <div className="text-xs font-semibold text-slate-500 uppercase">
                          Média:{' '}
                          <span className="text-slate-800 font-bold">
                            {averages ? sec.fmt(averages[sec.key]) : sec.fmt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-white border-b border-slate-100">
                        <ChartContainer
                          config={{ [sec.key]: { label: sec.title, color: sec.color } }}
                          className="h-[180px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={periodsData}
                              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                              />
                              <XAxis
                                dataKey="period"
                                stroke="#94a3b8"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                dy={6}
                              />
                              <YAxis
                                stroke="#94a3b8"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) =>
                                  sec.key === 'markup'
                                    ? `${v}x`
                                    : new Intl.NumberFormat('pt-BR', {
                                        notation: 'compact',
                                      }).format(v)
                                }
                              />
                              <Bar
                                dataKey={sec.key}
                                fill={`var(--color-${sec.key})`}
                                radius={[3, 3, 0, 0]}
                                maxBarSize={45}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                      <Table className="w-full text-xs">
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="font-bold text-slate-700">Período</TableHead>
                            {periodsData.map((p) => (
                              <TableHead
                                key={p.rawPeriod}
                                className="text-right whitespace-nowrap font-bold text-slate-700"
                              >
                                {p.period}
                              </TableHead>
                            ))}
                            <TableHead className="text-right font-black text-slate-900 bg-slate-100">
                              Média
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-semibold text-slate-700">
                              {sec.title}
                            </TableCell>
                            {periodsData.map((p) => (
                              <TableCell
                                key={p.rawPeriod}
                                className="text-right whitespace-nowrap font-medium"
                              >
                                {sec.fmt(p[sec.key] as number)}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold bg-slate-50 text-slate-900">
                              {averages ? sec.fmt(averages[sec.key]) : sec.fmt(0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
