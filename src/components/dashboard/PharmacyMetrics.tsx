import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PharmacyMetrics() {
  const { filteredTransactions, filteredMonthlyMetrics } = useFinanceStore()

  const metrics = useMemo(() => {
    const totalSales = filteredMonthlyMetrics.reduce((sum, m) => sum + m.total_system_sales, 0)
    const totalOrders = filteredMonthlyMetrics.reduce((sum, m) => sum + m.orders_count, 0)
    const totalRawMaterial = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + m.raw_material_costs,
      0,
    )

    let cfaTotal = 0
    let varExpenses = 0

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE') {
        if (t.categoryId === 'FIXA') cfaTotal += t.amount
        if (t.categoryId === 'VARIAVEL') varExpenses += t.amount
      }
    })

    const ticketMedio = totalOrders > 0 ? totalSales / totalOrders : 0
    const fatorMedio = totalRawMaterial > 0 ? totalSales / totalRawMaterial : 0
    const margemContribuicao = totalSales - (varExpenses + totalRawMaterial)

    const mkpDivisor =
      totalSales > 0 ? (totalSales - (cfaTotal + varExpenses + totalRawMaterial)) / totalSales : 0
    const mkpMultiplier = mkpDivisor > 0 ? 1 / mkpDivisor : 0

    return { ticketMedio, fatorMedio, margemContribuicao, cfaTotal, mkpDivisor, mkpMultiplier }
  }, [filteredTransactions, filteredMonthlyMetrics])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDecimal = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      val,
    )

  const items = [
    { title: 'Ticket Médio', value: formatCurrency(metrics.ticketMedio), color: 'text-indigo-600' },
    { title: 'Fator Médio', value: formatDecimal(metrics.fatorMedio), color: 'text-indigo-600' },
    {
      title: 'Margem Contribuição',
      value: formatCurrency(metrics.margemContribuicao),
      color: metrics.margemContribuicao >= 0 ? 'text-emerald-600' : 'text-red-500',
    },
    {
      title: 'CFA Total (Fixas)',
      value: formatCurrency(metrics.cfaTotal),
      color: 'text-orange-600',
    },
    {
      title: 'Mark-up Divisor',
      value: formatDecimal(metrics.mkpDivisor),
      color: 'text-purple-600',
    },
    {
      title: 'Mark-up Multiplicador',
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {items.map((item, i) => (
          <Card key={i} className="rounded-sm shadow-none border-slate-200 bg-white">
            <CardContent className="p-2 text-center flex flex-col justify-center h-full">
              <h4 className="text-[9px] font-semibold text-slate-500 uppercase leading-tight mb-1">
                {item.title}
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
