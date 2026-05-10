import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PharmacyMetrics() {
  const { filteredTransactions, filteredMonthlyMetrics, filters, monthlyMetrics, transactions } =
    useFinanceStore()

  const metrics = useMemo(() => {
    const totalSales = filteredMonthlyMetrics.reduce((sum, m) => sum + m.total_system_sales, 0)
    const totalOrders = filteredMonthlyMetrics.reduce((sum, m) => sum + m.orders_count, 0)
    const totalRawMaterial = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + m.raw_material_costs,
      0,
    )
    const totalColaboradoresCapsulas = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.colaboradores_capsulas || 0),
      0,
    )
    const totalColaboradoresDermato = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.colaboradores_dermato || 0),
      0,
    )
    const totalColaboradoresVendas = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.colaboradores_vendas || 0),
      0,
    )

    const numCapsulas = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.num_formulas_capsulas || 0),
      0,
    )
    const numDermato = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.num_formulas_dermato || 0),
      0,
    )
    const vendasCapsulas = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.vendas_capsulas || 0),
      0,
    )
    const vendasDermato = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.vendas_dermato || 0),
      0,
    )

    let cfaTotal = 0
    let varExpOperacional = 0
    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE' && targetStatuses.includes(t.status)) {
        if (t.categoryId === 'FIXA') cfaTotal += t.amount
        if (t.categoryId === 'VARIAVEL') {
          if (
            t.subcategoryId !== 'materia_prima' &&
            t.subcategoryId !== 'embalagens' &&
            t.subcategoryId !== 'medicamentos_drogaria'
          ) {
            varExpOperacional += t.amount
          }
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

    const custoTotal = cfaTotal + varExpOperacional + totalRawMaterial
    const mkpRealizado = totalRawMaterial > 0 ? totalSales / totalRawMaterial : 0

    const lucroLiquidoPct = totalSales > 0 ? ((totalSales - custoTotal) / totalSales) * 100 : 0

    const countMonths = filteredMonthlyMetrics.length || 1
    const avgColabCaps = totalColaboradoresCapsulas / countMonths
    const avgColabDerm = totalColaboradoresDermato / countMonths
    const avgColabVendas = totalColaboradoresVendas / countMonths
    const avgTotalColab = avgColabCaps + avgColabDerm + avgColabVendas

    const fatPorColabGeral = avgTotalColab > 0 ? totalSales / avgTotalColab : 0
    const fatPorColabVendas = avgColabVendas > 0 ? totalSales / avgColabVendas : 0

    const margem = totalSales - varExpOperacional - totalRawMaterial
    const ebitda = margem - cfaTotal

    const loPorColab = avgTotalColab > 0 ? ebitda / avgTotalColab : 0
    const ebitdaMedioMensal = countMonths > 0 ? ebitda / countMonths : 0
    const valuationEstimado = ebitdaMedioMensal * 12 * 4 // Múltiplo de 4x

    // Regra dos 70%
    const sortedFiltered = [...filteredMonthlyMetrics].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    const targetMetric =
      sortedFiltered.length > 0 ? sortedFiltered[sortedFiltered.length - 1] : null

    let regra70Status = 'neutral'
    let regra70Value = 'N/A'

    if (targetMetric) {
      const previousDate = new Date(targetMetric.year, targetMetric.month - 2, 1)
      const prevYear = previousDate.getFullYear()
      const prevMonth = previousDate.getMonth() + 1

      const previousMetric = monthlyMetrics.find(
        (m) => m.year === prevYear && m.month === prevMonth,
      )

      if (previousMetric) {
        const salesGrowth = targetMetric.total_system_sales - previousMetric.total_system_sales

        const getTxForMonth = (year: number, month: number) => {
          return transactions.filter((t) => {
            const d = new Date(t.date.includes('T') ? t.date : `${t.date}T12:00:00Z`)
            return d.getFullYear() === year && d.getMonth() + 1 === month
          })
        }

        const prevTx = getTxForMonth(previousMetric.year, previousMetric.month)
        const currTx = getTxForMonth(targetMetric.year, targetMetric.month)

        const sumCfa = (txs: any[]) =>
          txs
            .filter((t) => t.type === 'EXPENSE' && t.categoryId === 'FIXA')
            .reduce((sum, t) => sum + t.amount, 0)

        const cfaCurr = sumCfa(currTx)
        const cfaPrev = sumCfa(prevTx)

        const cfaGrowth = cfaCurr - cfaPrev

        if (salesGrowth > 0) {
          const pct = (cfaGrowth / salesGrowth) * 100
          regra70Value = `${pct.toFixed(1)}%`
          if (pct <= 70) regra70Status = 'good'
          else regra70Status = 'bad'
        } else {
          regra70Value = cfaGrowth <= 0 ? 'Bom (Queda)' : 'Atenção (CF Subiu)'
          regra70Status = cfaGrowth <= 0 ? 'good' : 'bad'
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
    }
  }, [filteredTransactions, filteredMonthlyMetrics, filters, monthlyMetrics, transactions])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDecimal = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      val,
    )

  const items = [
    {
      id: 'ticket-medio',
      title: 'Ticket Médio Geral',
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
      color:
        metrics.regra70Status === 'good'
          ? 'text-emerald-600'
          : metrics.regra70Status === 'bad'
            ? 'text-red-500'
            : 'text-slate-500',
    },
    {
      id: 'pm-ideal-capsulas',
      title: 'PM Ideal (Cápsulas)',
      tooltip: 'Preço Médio (Ticket Médio) exclusivo do setor de Cápsulas.',
      value: formatCurrency(metrics.pmIdealCaps),
      color: 'text-blue-600',
    },
    {
      id: 'pm-ideal-dermato',
      title: 'PM Ideal (Dermato)',
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
          Inteligência Analítica (KPIs 3.0)
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
              <p className={cn('text-lg font-bold tracking-tight', item.color)}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
