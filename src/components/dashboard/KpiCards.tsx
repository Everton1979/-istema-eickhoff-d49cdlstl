import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

export function KpiCards() {
  const { filteredTransactions, filteredMonthlyMetrics, categories, filters } = useFinanceStore()

  const metrics = useMemo(() => {
    const totalRawMaterial = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + m.raw_material_costs,
      0,
    )

    let receitas = 0
    let despesasFluxo = 0
    let custosVariaveisOperacionais = 0
    let custosFixos = 0

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((tx) => {
      if (targetStatuses.includes(tx.status)) {
        if (tx.type === 'INCOME') {
          receitas += tx.amount
        } else {
          despesasFluxo += tx.amount
          const cat = categories.find((c) => c.id === tx.categoryId)
          if (cat?.isVariable) {
            if (
              tx.subcategoryId !== 'materia_prima' &&
              tx.subcategoryId !== 'embalagens' &&
              tx.subcategoryId !== 'medicamentos_drogaria'
            ) {
              custosVariaveisOperacionais += tx.amount
            }
          } else {
            custosFixos += tx.amount
          }
        }
      }
    })

    const margem = receitas - (custosVariaveisOperacionais + totalRawMaterial)
    const lucro = receitas - despesasFluxo
    const indiceMargem = receitas > 0 ? margem / receitas : 0
    const pontoEquilibrio = indiceMargem > 0 ? custosFixos / indiceMargem : 0

    return { receitas, despesas: despesasFluxo, margem, lucro, pontoEquilibrio }
  }, [filteredTransactions, filteredMonthlyMetrics, categories, filters])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      val,
    )

  const kpis = [
    {
      title: 'RECEITAS OPERACIONAIS',
      tooltip: 'Total de entradas financeiras no período.',
      value: metrics.receitas,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      title: 'DESPESAS E CUSTOS',
      tooltip: 'Soma de todas as saídas de caixa (fixas e variáveis).',
      value: -metrics.despesas,
      color: 'text-red-500',
      border: 'border-t-red-500',
    },
    {
      title: 'MARGEM DE CONTRIBUIÇÃO',
      tooltip: 'Receita bruta menos custos variáveis operacionais e insumos (Fechamento).',
      value: metrics.margem,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      title: 'LUCRO LÍQUIDO (CAIXA)',
      tooltip: 'Resultado final de caixa (Receitas - Despesas Totais).',
      value: metrics.lucro,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      title: 'PONTO DE EQUILÍBRIO (YTD)',
      tooltip: 'Faturamento necessário para cobrir todos os custos (Lucro zero).',
      value: metrics.pontoEquilibrio,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-2">
      {kpis.map((kpi, i) => (
        <Card key={i} className={cn('rounded-sm border-t-4 shadow-sm', kpi.border)}>
          <CardContent className="p-2 text-center flex flex-col justify-center h-full">
            <h3 className="text-[10px] font-bold text-gray-600 uppercase mb-1 flex items-center justify-center gap-1">
              {kpi.title}
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-center" side="bottom">
                  <p className="text-xs">{kpi.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <p className={cn('text-xl font-bold tracking-tight', kpi.color)}>
              {formatCurrency(kpi.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
