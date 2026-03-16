import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

export function KpiCards() {
  const { filteredTransactions, categories } = useFinanceStore()

  const metrics = useMemo(() => {
    let receitas = 0
    let despesas = 0
    let custosVariaveis = 0

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'REALIZADO') {
        if (tx.type === 'INCOME') {
          receitas += tx.amount
        } else {
          despesas += tx.amount
          const cat = categories.find((c) => c.id === tx.categoryId)
          if (cat?.isVariable) {
            custosVariaveis += tx.amount
          }
        }
      }
    })

    const margem = receitas - custosVariaveis
    const lucro = receitas - despesas
    // Simplified break-even calculation for mock purposes
    const pontoEquilibrio =
      despesas - custosVariaveis > 0 ? (despesas - custosVariaveis) / (margem / receitas || 1) : 0

    return { receitas, despesas, margem, lucro, pontoEquilibrio }
  }, [filteredTransactions, categories])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      val,
    )

  const kpis = [
    {
      title: 'RECEITAS OPERACIONAIS',
      value: metrics.receitas,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      title: 'DESPESAS E CUSTOS',
      value: -metrics.despesas,
      color: 'text-red-500',
      border: 'border-t-red-500',
    },
    {
      title: 'MARGEM DE CONTRIBUIÇÃO',
      value: metrics.margem,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      title: 'LUCRO LÍQUIDO',
      value: metrics.lucro,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      title: 'PONTO DE EQUILÍBRIO (YTD)',
      value: metrics.pontoEquilibrio,
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-2">
      {kpis.map((kpi, i) => (
        <Card key={i} className={cn('rounded-sm border-t-4 shadow-sm', kpi.border)}>
          <CardContent className="p-2 text-center">
            <h3 className="text-[10px] font-bold text-gray-600 uppercase mb-1">{kpi.title}</h3>
            <p className={cn('text-xl font-bold tracking-tight', kpi.color)}>
              {formatCurrency(kpi.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
