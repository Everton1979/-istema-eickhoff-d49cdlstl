import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useKpiMetrics } from '@/components/dashboard/KpiCards'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PharmacyMetrics() {
  const { filteredTransactions, filteredMonthlyMetrics, filters, monthlyMetrics, transactions } =
    useFinanceStore()
  const kpiMetrics = useKpiMetrics()

  const metrics = useMemo(() => {
    const safeFilteredMonthlyMetrics = filteredMonthlyMetrics || []
    const safeFilteredTransactions = filteredTransactions || []
    const safeTransactions = transactions || []

    const totalSales = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.total_system_sales || 0),
      0,
    )
    const totalOrders = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.orders_count || 0),
      0,
    )
    const totalRawMaterial = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.raw_material_costs || 0),
      0,
    )
    const totalColaboradoresCapsulas = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.colaboradores_capsulas || 0),
      0,
    )
    const totalColaboradoresDermato = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.colaboradores_dermato || 0),
      0,
    )
    const totalColaboradoresVendas = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.colaboradores_vendas || 0),
      0,
    )

    const numCapsulas = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.num_formulas_capsulas || 0),
      0,
    )
    const numDermato = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.num_formulas_dermato || 0),
      0,
    )
    const vendasCapsulas = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.vendas_capsulas || 0),
      0,
    )
    const vendasDermato = safeFilteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m?.vendas_dermato || 0),
      0,
    )

    let cfaTotal = 0
    const targetStatuses = filters?.statuses?.length > 0 ? filters.statuses : ['REALIZADO']

    safeFilteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE' && targetStatuses.includes(t.status)) {
        if (
          t.categoryId === 'FIXA' ||
          String(t.category).toUpperCase() === 'FIXA' ||
          String(t.category).toUpperCase() === 'DESPESAS FIXAS' ||
          String(t.category).toUpperCase() === 'CUSTO FIXO'
        ) {
          cfaTotal += t.amount
        }
      }
    })

    const ticketMedio = totalOrders > 0 ? totalSales / totalOrders : 0

    const pesoCapsulas = totalSales > 0 ? vendasCapsulas / totalSales : 0.5
    const pesoDermato = totalSales > 0 ? vendasDermato / totalSales : 0.5

    const cfaCapsulas = cfaTotal * pesoCapsulas
    const cfaDermato = cfaTotal * pesoDermato

    const custoFixoPorFormulaCaps = numCapsulas > 0 ? cfaCapsulas / numCapsulas : 0
    const custoFixoPorFormulaDerm = numDermato > 0 ? cfaDermato / numDermato : 0

    const pmIdealCaps = numCapsulas > 0 ? vendasCapsulas / numCapsulas : 0
    const pmIdealDerm = numDermato > 0 ? vendasDermato / numDermato : 0

    const mkpRealizado = totalRawMaterial > 0 ? totalSales / totalRawMaterial : 0

    const lucroLiquidoPct =
      kpiMetrics.receitas > 0 ? (kpiMetrics.lucro / kpiMetrics.receitas) * 100 : 0

    const countMonths = safeFilteredMonthlyMetrics.length || 1
    const avgColabCaps = totalColaboradoresCapsulas / countMonths
    const avgColabDerm = totalColaboradoresDermato / countMonths
    const avgColabVendas = totalColaboradoresVendas / countMonths
    const avgTotalColab = avgColabCaps + avgColabDerm + avgColabVendas

    const fatPorColabGeral = avgTotalColab > 0 ? totalSales / avgTotalColab : 0
    const fatPorColabVendas = avgColabVendas > 0 ? totalSales / avgColabVendas : 0

    const ebitda = kpiMetrics.ebitda

    const loPorColab = avgTotalColab > 0 ? ebitda / avgTotalColab : 0
    const ebitdaMedioMensal = countMonths > 0 ? ebitda / countMonths : 0
    const valuationEstimado = ebitdaMedioMensal * 12 * 4 // Múltiplo de 4x

    // Regra dos 70%
    const sortedFiltered = [...safeFilteredMonthlyMetrics].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    const targetMetric =
      sortedFiltered.length > 0 ? sortedFiltered[sortedFiltered.length - 1] : null

    let regra70Status = 'neutral'
    let regra70Value = 'N/A'
    let regra70Text = ''

    if (targetMetric) {
      const previousDate = new Date(targetMetric.year, targetMetric.month - 2, 1)
      const prevYear = previousDate.getFullYear()
      const prevMonth = previousDate.getMonth() + 1

      const safeMonthlyMetrics = monthlyMetrics || []
      const previousMetric = safeMonthlyMetrics.find(
        (m) => m.year === prevYear && m.month === prevMonth,
      )

      if (previousMetric) {
        const salesGrowth =
          (targetMetric.total_system_sales || 0) - (previousMetric.total_system_sales || 0)

        const getTxForMonth = (year: number, month: number) => {
          return safeTransactions.filter((t) => {
            const datePart = t.date.split('T')[0]
            if (!datePart || datePart.length < 10) return false
            const parts = datePart.split('-')
            if (parts.length < 3) return false
            const txYear = parseInt(parts[0], 10)
            const txMonth = parseInt(parts[1], 10)
            return txYear === year && txMonth === month
          })
        }

        const prevTx = getTxForMonth(previousMetric.year, previousMetric.month)
        const currTx = getTxForMonth(targetMetric.year, targetMetric.month)

        const sumCfa = (txs: any[]) =>
          txs
            .filter(
              (t) =>
                t.type === 'EXPENSE' &&
                (t.categoryId === 'FIXA' ||
                  String(t.category).toUpperCase() === 'FIXA' ||
                  String(t.category).toUpperCase() === 'DESPESAS FIXAS' ||
                  String(t.category).toUpperCase() === 'CUSTO FIXO') &&
                targetStatuses.includes(t.status),
            )
            .reduce((sum, t) => sum + Number(t.amount || 0), 0)

        const cfaCurr = sumCfa(currTx)
        const cfaPrev = sumCfa(prevTx)

        const cfaGrowth = Number(cfaCurr) - Number(cfaPrev)

        let rawPct = 0
        let isValidPct = false

        if (salesGrowth > 0) {
          rawPct = (cfaGrowth / salesGrowth) * 100
          isValidPct = true
        } else if (salesGrowth < 0) {
          rawPct = (cfaGrowth / salesGrowth) * 100
          isValidPct = true
        } else {
          if (cfaGrowth > 0) {
            regra70Value = 'Atenção'
            regra70Status = 'bad'
            regra70Text = 'CF Subiu'
          } else {
            rawPct = 0
            isValidPct = true
          }
        }

        if (isValidPct) {
          rawPct = Math.abs(rawPct)
          regra70Value = `${rawPct.toFixed(1).replace('.', ',')}%`

          const statusVal = parseFloat(rawPct.toFixed(1))
          const status = statusVal <= 70 ? 'bom' : 'atencao'

          if (status === 'bom') {
            regra70Status = 'good'
            regra70Text = 'Bom'
          } else {
            regra70Status = 'bad'
            regra70Text = 'Atenção'
          }
        }
      }
    }

    return {
      ticketMedio,
      mkpRealizado,
      lucroLiquidoPct,
      custoFixoPorFormulaCaps,
      custoFixoPorFormulaDerm,
      pmIdealCaps,
      pmIdealDerm,
      fatPorColabGeral,
      fatPorColabVendas,
      loPorColab,
      valuationEstimado,
      regra70Value,
      regra70Status,
      regra70Text,
    }
  }, [
    filteredTransactions,
    filteredMonthlyMetrics,
    filters,
    monthlyMetrics,
    transactions,
    kpiMetrics,
  ])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDecimal = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      val,
    )

  const items: Array<{
    id: string
    title: string
    tooltip: string
    value: string
    color: string
    statusText?: string
    dynamicTooltip?: string
  }> = [
    {
      id: 'ticket-medio',
      title: 'Ticket Médio Manipulação',
      tooltip: 'Valor médio por venda (Faturamento / Número de pedidos).',
      value: formatCurrency(metrics.ticketMedio),
      color: 'text-indigo-600',
    },
    {
      id: 'lucro-liquido-pct',
      title: 'Lucro Líquido Real (%)',
      tooltip: 'Percentual de lucro líquido realizado no período.',
      value: `${metrics.lucroLiquidoPct.toFixed(1)}%`,
      color:
        metrics.lucroLiquidoPct >= 15
          ? 'text-emerald-600'
          : metrics.lucroLiquidoPct > 0
            ? 'text-yellow-600'
            : 'text-red-500',
    },
    {
      id: 'markup-realizado',
      title: 'Mark-up Praticado',
      tooltip: 'Multiplicador realizado no período (Faturamento / Custo MP/Emb).',
      value: formatDecimal(metrics.mkpRealizado),
      color: 'text-purple-600',
    },
    {
      id: 'lo-colaborador',
      title: 'LO / Colaborador',
      tooltip: 'Lucro Operacional (EBITDA) gerado por cada membro da equipe.',
      value: formatCurrency(metrics.loPorColab),
      color: 'text-emerald-600',
    },
    {
      id: 'valuation',
      title: 'Valuation Estimado',
      tooltip: 'Estimativa de valor de mercado (EBITDA Anualizado x 4).',
      value: formatCurrency(metrics.valuationEstimado),
      color: 'text-blue-600',
    },
    {
      id: 'regra-70',
      title: 'Regra dos 70%',
      tooltip: 'Aumento do Custo Fixo / Aumento das Vendas. Ideal < 70%.',
      value: metrics.regra70Value,
      statusText: (() => {
        if (metrics.regra70Value === 'N/A') return ''
        if (metrics.regra70Value === 'Atenção') return 'CF Subiu'

        const parsed = parseFloat(metrics.regra70Value.replace('%', '').replace(',', '.'))
        if (!isNaN(parsed)) {
          return parsed <= 70 ? 'Bom' : 'Atenção'
        }

        return metrics.regra70Text
      })(),
      color: (() => {
        if (metrics.regra70Value === 'N/A') return 'text-slate-500'
        if (metrics.regra70Value === 'Atenção') return 'text-red-500 font-bold'

        const parsed = parseFloat(metrics.regra70Value.replace('%', '').replace(',', '.'))
        if (!isNaN(parsed)) {
          return parsed <= 70 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'
        }

        return 'text-slate-500'
      })(),
      dynamicTooltip: (() => {
        if (metrics.regra70Value === 'Atenção')
          return 'Custo Fixo subiu em um cenário desfavorável de vendas.'

        const parsed = parseFloat(metrics.regra70Value.replace('%', '').replace(',', '.'))
        if (!isNaN(parsed) && parsed > 70) {
          return 'Valor de magnitude superior a 70% (critério de alerta atingido).'
        }
        return undefined
      })(),
    },
    {
      id: 'pm-ideal-capsulas',
      title: 'Ticket-médio Cápsulas',
      tooltip: 'Preço Médio (Ticket Médio) exclusivo do setor de Cápsulas.',
      value: formatCurrency(metrics.pmIdealCaps),
      color: 'text-blue-600',
    },
    {
      id: 'pm-ideal-dermato',
      title: 'Ticket-médio Dermato',
      tooltip: 'Preço Médio (Ticket Médio) exclusivo do setor de Dermato.',
      value: formatCurrency(metrics.pmIdealDerm),
      color: 'text-blue-600',
    },
    {
      id: 'custo-fixo-capsulas',
      title: 'Custo Fixo / Fórm (Cáps)',
      tooltip: 'Custo Fixo rateado por fórmula de Cápsulas.',
      value: formatCurrency(metrics.custoFixoPorFormulaCaps),
      color: 'text-orange-600',
    },
    {
      id: 'custo-fixo-dermato',
      title: 'Custo Fixo / Fórm (Derm)',
      tooltip: 'Custo Fixo rateado por fórmula de Dermato.',
      value: formatCurrency(metrics.custoFixoPorFormulaDerm),
      color: 'text-orange-600',
    },
    {
      id: 'fat-colab-geral',
      title: 'Fat / Colab (Geral)',
      tooltip: 'Faturamento total dividido pelo número médio de colaboradores totais.',
      value: formatCurrency(metrics.fatPorColabGeral),
      color: 'text-emerald-600',
    },
    {
      id: 'fat-colab-vendas',
      title: 'Fat / Colab (Vendas)',
      tooltip: 'Faturamento total dividido pelo número médio de colaboradores de vendas.',
      value: formatCurrency(metrics.fatPorColabVendas),
      color: 'text-emerald-600',
    },
  ]

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <div className="w-2 h-4 bg-indigo-500 rounded-sm" />
          Inteligência Analítica
        </h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <Card
            key={item.id}
            className={cn(
              'rounded-md shadow-sm border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all',
              i < 3 ? 'bg-indigo-50/50 border-indigo-100' : '',
            )}
          >
            <CardContent className="p-3 text-center flex flex-col justify-center h-full">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase leading-tight mb-2 flex items-center justify-center gap-1">
                {item.title}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/glossario#${item.id}`}>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-center" side="top">
                    <p className="text-xs">{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </h4>
              {item.dynamicTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help group flex flex-col items-center">
                      <p
                        className={cn(
                          'text-lg font-bold tracking-tight decoration-dashed underline-offset-4 decoration-red-300 group-hover:underline',
                          item.color,
                        )}
                      >
                        {item.value}
                      </p>
                      {item.statusText && (
                        <p className={cn('text-[11px] font-bold mt-1', item.color)}>
                          {item.statusText}
                        </p>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-[220px] text-center bg-red-50 text-red-900 border-red-200"
                  >
                    <p className="text-xs font-medium">{item.dynamicTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <p className={cn('text-lg font-bold tracking-tight', item.color)}>{item.value}</p>
                  {item.statusText && (
                    <p className={cn('text-[11px] font-bold mt-1', item.color)}>
                      {item.statusText}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
