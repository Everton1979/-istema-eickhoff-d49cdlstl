import { useMemo } from 'react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useFinanceStore } from '@/stores/financeStore'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function TopCategoriesChart({
  type,
  title,
  color,
}: {
  type: 'INCOME' | 'EXPENSE'
  title: string
  color: string
}) {
  const { filteredTransactions, categories } = useFinanceStore()

  const data = useMemo(() => {
    const sums: Record<string, number> = {}
    filteredTransactions
      .filter((t) => t.type === type)
      .forEach((tx) => {
        sums[tx.categoryId] = (sums[tx.categoryId] || 0) + tx.amount
      })

    return Object.entries(sums)
      .map(([id, amount]) => ({
        name: categories.find((c) => c.id === id)?.name || 'Outros',
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .reverse() // For horizontal bar chart, reverse to show largest on top
  }, [filteredTransactions, type, categories])

  return (
    <div className="bg-white p-2 rounded-sm border shadow-sm flex flex-col h-full">
      <h3 className="text-xs font-bold text-center text-gray-600 mb-2">{title}</h3>
      <ChartContainer config={{}} className="h-full min-h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#4b5563' }}
              width={80}
            />
            <Tooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Bar
              dataKey="amount"
              fill={color}
              radius={[0, 2, 2, 0]}
              barSize={12}
              label={{
                position: 'right',
                fill: '#6b7280',
                fontSize: 9,
                formatter: (val: number) => `${Math.round(val / 1000)}k`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
