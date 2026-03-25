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
    const fatorMedio = totalRawMaterial > 0 ? totalSales / totalRawMaterial : 0
    const margemContribuicao = totalSales - (varExpOperacional + totalRawMaterial)

    const mkpDivisor =
      totalSales > 0
        ? (totalSales - (cfaTotal + varExpOperacional + totalRawMaterial)) / totalSales
        : 0
    const mkpMultiplier = mkpDivisor > 0 ? 1 / mkpDivisor : 0
    const custoFixoPorFormula = totalOrders > 0 ? cfaTotal / totalOrders : 0
    const precoMinimoPorFormula =
      totalOrders > 0 ? (cfaTotal + varExpOperacional + totalRawMaterial) / totalOrders : 0

    return {
      ticketMedio,
      fatorMedio,
      margemContribuicao,
      cfaTotal,
      mkpDivisor,
      mkpMultiplier,
      custoFixoPorFormula,
      precoMinimoPorFormula,
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
      title: 'Ticket Médio',
      tooltip: 'Valor médio por venda (Faturamento / Número de pedidos).',
      value: formatCurrency(metrics.ticketMedio),
      color: 'text-indigo-600',
    },
    {
      id: 'fator-medio',
      title: 'Fator Médio',
      tooltip: 'Relação entre faturamento e custo de matéria-prima.',
      value: formatDecimal(metrics.fatorMedio),
      color: 'text-indigo-600',
    },
    {
      id: 'margem-de-contribuicao',
      title: 'Margem Contribuição',
      tooltip:
        'Receita bruta menos custos variáveis e insumos (o que sobra para pagar custos fixos).',
      value: formatCurrency(metrics.margemContribuicao),
      color: metrics.margemContribuicao >= 0 ? 'text-emerald-600' : 'text-red-500',
    },
    {
      id: 'cfa-total',
      title: 'CFA Total (Fixas)',
      tooltip: 'Soma de todas as despesas fixas administrativas.',
      value: formatCurrency(metrics.cfaTotal),
      color: 'text-orange-600',
    },
    {
      id: 'custo-fixo-formula',
      title: 'Custo Fixo / Fórmula',
      tooltip: 'Quanto cada fórmula carrega do custo fixo.',
      value: formatCurrency(metrics.custoFixoPorFormula),
      color: 'text-orange-600',
    },
    {
      id: 'preco-min-formula',
      title: 'Preço Mín. / Fórmula',
      tooltip: 'Ponto de equilíbrio unitário (Custo Fixo + Var. Operacional + Insumos / Fórmulas).',
      value: formatCurrency(metrics.precoMinimoPorFormula),
      color: 'text-purple-600',
    },
    {
      id: 'markup-divisor',
      title: 'Mark-up Divisor',
      tooltip: 'Índice para descontar margens do valor total.',
      value: formatDecimal(metrics.mkpDivisor),
      color: 'text-purple-600',
    },
    {
      id: 'markup-mult',
      title: 'Mark-up Mult.',
      tooltip: 'Fator sobre o custo para encontrar o preço de venda.',
      value: formatDecimal(metrics.mkpMultiplier),
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="bg-slate-50 p-2 rounded-sm border border-slate-200 mt-2">
      <div className="flex items-center gap-2 mb-2 px-1">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Pharmacy Analytics (Fechamento)
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {items.map((item, i) => (
          <Card key={i} className="rounded-sm shadow-none border-slate-200 bg-white">
            <CardContent className="p-2 text-center flex flex-col justify-center h-full">
              <h4 className="text-[9px] font-semibold text-slate-500 uppercase leading-tight mb-1 flex items-center justify-center gap-1">
                {item.title}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/glossario#${item.id}`}>
                      <HelpCircle className="w-3 h-3 text-slate-400 hover:text-blue-600 cursor-pointer" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-center" side="bottom">
                    <p className="text-xs">{item.tooltip}</p>
                    <p className="text-[9px] text-blue-300 mt-1 border-t border-slate-700/50 pt-1">
                      Clique para ver no Glossário
                    </p>
                  </TooltipContent>
                </Tooltip>
              </h4>
              <p className={cn('text-sm md:text-base font-bold tracking-tight', item.color)}>
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
