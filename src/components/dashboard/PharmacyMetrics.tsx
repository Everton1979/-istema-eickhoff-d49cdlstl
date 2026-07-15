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
    let varExpenses = 0
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
        } else if (
          t.categoryId === 'VARIAVEL' ||
          String(t.category).toUpperCase() === 'VARIAVEL' ||
          String(t.category).toUpperCase() === 'DESPESAS VARIÁVEIS' ||
          String(t.category).toUpperCase() === 'CUSTO VARIÁVEL' ||
          String(t.category).toUpperCase() === 'VARIAVEIS'
        ) {
          varExpenses += t.amount
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

    const totalReferenceValue = cfaTotal + varExpenses + kpiMetrics.lucro

    const lucroLiquidoPct =
      totalReferenceValue > 0 ? (kpiMetrics.lucro / totalReferenceValue) * 100 : 0

    const despesasFixasPct = totalReferenceValue > 0 ? (cfaTotal / totalReferenceValue) * 100 : 0

    const despesasVariaveisPct =
      totalReferenceValue > 0 ? (varExpenses / totalReferenceValue) * 100 : 0

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
      despesasFixasPct,
      despesasVariaveisPct,
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

  const colorToBg = (color: string): string => {
    const map: Record<string, string> = {
      'text-red-600': 'bg-red-500',
      'text-orange-500': 'bg-orange-500',
      'text-orange-600': 'bg-orange-500',
      'text-emerald-600': 'bg-emerald-500',
      'text-blue-600': 'bg-blue-500',
      'text-indigo-600': 'bg-indigo-500',
      'text-slate-500': 'bg-slate-500',
      'text-slate-600': 'bg-slate-600',
    }
    return map[color] || 'bg-slate-500'
  }

  const getPerformanceStatus = (value: number, type: string) => {
    if (type === 'fat-colab-geral') {
      if (value < 8000) return { text: 'Péssimo', color: 'text-red-600' }
      if (value < 12000) return { text: 'Ruim', color: 'text-orange-500' }
      if (value < 15000) return { text: 'Bom', color: 'text-emerald-600' }
      if (value < 18000) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    if (type === 'fat-colab-vendas') {
      if (value < 40000) return { text: 'Péssimo', color: 'text-red-600' }
      if (value < 50000) return { text: 'Ruim', color: 'text-orange-500' }
      if (value < 60000) return { text: 'Bom', color: 'text-emerald-600' }
      if (value < 70000) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    if (type === 'markup-realizado') {
      if (value < 4.4) return { text: 'Péssimo', color: 'text-red-600' }
      if (value < 5.0) return { text: 'Ruim', color: 'text-orange-500' }
      if (value < 5.7) return { text: 'Bom', color: 'text-emerald-600' }
      if (value < 6.7) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    if (type === 'lucro-liquido-pct') {
      if (value < 5) return { text: 'Péssimo', color: 'text-red-600' }
      if (value < 15) return { text: 'Ruim', color: 'text-orange-500' }
      if (value < 20) return { text: 'Bom', color: 'text-emerald-600' }
      if (value < 25) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    if (type === 'despesas-fixas-pct') {
      if (value > 45) return { text: 'Péssimo', color: 'text-red-600' }
      if (value > 40) return { text: 'Ruim', color: 'text-orange-500' }
      if (value > 35) return { text: 'Bom', color: 'text-emerald-600' }
      if (value > 30) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    if (type === 'despesas-variaveis-pct') {
      if (value > 50) return { text: 'Péssimo', color: 'text-red-600' }
      if (value > 45) return { text: 'Ruim', color: 'text-orange-500' }
      if (value > 40) return { text: 'Bom', color: 'text-emerald-600' }
      if (value > 35) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    if (type === 'lo-colaborador') {
      if (value < 500) return { text: 'Péssimo', color: 'text-red-600' }
      if (value < 1000) return { text: 'Ruim', color: 'text-orange-500' }
      if (value < 2000) return { text: 'Bom', color: 'text-emerald-600' }
      if (value < 3000) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    if (type === 'regra-70') {
      if (value > 90) return { text: 'Péssimo', color: 'text-red-600' }
      if (value >= 70) return { text: 'Ruim', color: 'text-orange-500' }
      if (value >= 60) return { text: 'Bom', color: 'text-emerald-600' }
      if (value >= 50) return { text: 'Excelente', color: 'text-blue-600' }
      return { text: 'Sensacional', color: 'text-indigo-600' }
    }
    return null
  }

  const lucroLiquidoPerf = getPerformanceStatus(metrics.lucroLiquidoPct, 'lucro-liquido-pct')
  const markupPerf = getPerformanceStatus(metrics.mkpRealizado, 'markup-realizado')
  const loColabPerf = getPerformanceStatus(metrics.loPorColab, 'lo-colaborador')
  const fatColabGeralPerf = getPerformanceStatus(metrics.fatPorColabGeral, 'fat-colab-geral')
  const fatColabVendasPerf = getPerformanceStatus(metrics.fatPorColabVendas, 'fat-colab-vendas')

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
      tooltip: 'Percentual de lucro líquido em relação ao valor de referência total. Meta: > 15%.',
      value: `${metrics.lucroLiquidoPct.toFixed(1)}%`,
      color: lucroLiquidoPerf?.color || 'text-slate-600',
      statusText: lucroLiquidoPerf?.text,
    },
    {
      id: 'despesas-fixas-pct',
      title: 'Despesas Fixas (%)',
      tooltip: 'Despesas Fixas em relação ao valor de referência total. Meta: < 35%.',
      value: `${metrics.despesasFixasPct.toFixed(1)}%`,
      color:
        getPerformanceStatus(metrics.despesasFixasPct, 'despesas-fixas-pct')?.color ||
        'text-slate-600',
      statusText: getPerformanceStatus(metrics.despesasFixasPct, 'despesas-fixas-pct')?.text,
    },
    {
      id: 'despesas-variaveis-pct',
      title: 'Despesas Variáveis (%)',
      tooltip: 'Despesas Variáveis em relação ao valor de referência total. Meta: < 40%.',
      value: `${metrics.despesasVariaveisPct.toFixed(1)}%`,
      color:
        getPerformanceStatus(metrics.despesasVariaveisPct, 'despesas-variaveis-pct')?.color ||
        'text-slate-600',
      statusText: getPerformanceStatus(metrics.despesasVariaveisPct, 'despesas-variaveis-pct')
        ?.text,
    },
    {
      id: 'markup-realizado',
      title: 'Mark-up Praticado',
      tooltip: 'Multiplicador realizado no período (Faturamento / Custo MP/Emb).',
      value: formatDecimal(metrics.mkpRealizado),
      color: markupPerf?.color || 'text-slate-600',
      statusText: markupPerf?.text,
    },
    {
      id: 'lo-colaborador',
      title: 'LO / Colaborador',
      tooltip: 'Lucro Operacional (EBITDA) gerado por cada membro da equipe.',
      value: formatCurrency(metrics.loPorColab),
      color: loColabPerf?.color || 'text-slate-600',
      statusText: loColabPerf?.text,
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
        if (metrics.regra70Value === 'Atenção') return 'Péssimo'

        const parsed = parseFloat(metrics.regra70Value.replace('%', '').replace(',', '.'))
        if (!isNaN(parsed)) {
          return getPerformanceStatus(parsed, 'regra-70')?.text || 'Atenção'
        }

        return metrics.regra70Text
      })(),
      color: (() => {
        if (metrics.regra70Value === 'N/A') return 'text-slate-500'
        if (metrics.regra70Value === 'Atenção') return 'text-red-600'

        const parsed = parseFloat(metrics.regra70Value.replace('%', '').replace(',', '.'))
        if (!isNaN(parsed)) {
          return getPerformanceStatus(parsed, 'regra-70')?.color || 'text-red-600'
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
      color: fatColabGeralPerf?.color || 'text-slate-600',
      statusText: fatColabGeralPerf?.text,
    },
    {
      id: 'fat-colab-vendas',
      title: 'Fat / Colab (Vendas)',
      tooltip: 'Faturamento total dividido pelo número médio de colaboradores de vendas.',
      value: formatCurrency(metrics.fatPorColabVendas),
      color: fatColabVendasPerf?.color || 'text-slate-600',
      statusText: fatColabVendasPerf?.text,
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
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <Card
            key={item.id}
            className={cn('rounded-md shadow-sm border-0 transition-all', colorToBg(item.color))}
          >
            <CardContent className="p-3 text-center flex flex-col justify-center h-full">
              <h4 className="text-[10px] font-bold text-white/70 uppercase leading-tight mb-2 flex items-center justify-center gap-1">
                {item.title}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/glossario#${item.id}`}>
                      <HelpCircle className="w-3.5 h-3.5 text-white/50 hover:text-white cursor-pointer" />
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
                      <p className="text-lg font-bold tracking-tight decoration-dashed underline-offset-4 decoration-white/50 group-hover:underline text-white">
                        {item.value}
                      </p>
                      {item.statusText && (
                        <p className="text-[11px] font-bold mt-1 text-white">{item.statusText}</p>
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
                  <p className="text-lg font-bold tracking-tight text-white">{item.value}</p>
                  {item.statusText && (
                    <p className="text-[11px] font-bold mt-1 text-white">{item.statusText}</p>
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
