import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PharmacyMetrics() {
  const { filteredTransactions, filteredMonthlyMetrics, filters } = useFinanceStore()

  const metrics = useMemo(() => {
    const totalSales = filteredMonthlyMetrics.reduce((sum, m) => sum + m.total_system_sales, 0)
    const totalOrders = filteredMonthlyMetrics.reduce((sum, m) => sum + m.orders_count, 0)
    const totalRawMaterial = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + m.raw_material_costs,
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

    // Alocação de Custos Fixos proporcionais à receita do setor
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

    return {
      ticketMedio,
      mkpRealizado,
      lucroLiquidoPct,
      custoFixoPorFormulaCaps,
      custoFixoPorFormulaDerm,
      pmIdealCaps,
      pmIdealDerm,
    }
  }, [filteredTransactions, filteredMonthlyMetrics, filters])

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
      tooltip: 'Multiplicador realizado no período (Faturamento / Custo MP).',
      value: formatDecimal(metrics.mkpRealizado),
      color: 'text-purple-600',
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
  ]

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <div className="w-2 h-4 bg-indigo-500 rounded-sm" />
          Inteligência por Segmento & Analytics
        </h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <Card
            key={i}
            className={cn(
              'rounded-md shadow-sm border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all',
              i === 0 ? 'col-span-2 lg:col-span-3 bg-indigo-50/50 border-indigo-100' : '',
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
