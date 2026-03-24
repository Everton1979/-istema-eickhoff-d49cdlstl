import { useMemo } from 'react'
import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { useFinanceStore } from '@/stores/financeStore'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function CashFlowChart() {
  const { filteredTransactions, filters } = useFinanceStore()

  const data = useMemo(() => {
    const monthsData: Record<
      string,
      { name: string; sortKey: string; entradas: number; saidas: number }
    > = {}
    const monthLabels = [
      'JAN',
      'FEV',
      'MAR',
      'ABR',
      'MAI',
      'JUN',
      'JUL',
      'AGO',
      'SET',
      'OUT',
      'NOV',
      'DEZ',
    ]

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((tx) => {
      if (!targetStatuses.includes(tx.status)) return

      const date = new Date(tx.date)
      const m = date.getMonth()
      const y = date.getFullYear()
      const key = `${y}-${m}`

      if (!monthsData[key]) {
        monthsData[key] = { name: monthLabels[m], sortKey: key, entradas: 0, saidas: 0 }
      }
      if (tx.type === 'INCOME') monthsData[key].entradas += tx.amount
      else monthsData[key].saidas += tx.amount
    })

    return Object.values(monthsData)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map((d) => ({ ...d, saldo: d.entradas - d.saidas }))
      .slice(-12) // Last 12 periods
  }, [filteredTransactions, filters])

  return (
    <div className="bg-white p-2 rounded-sm border shadow-sm flex flex-col h-full">
      <ChartContainer config={{}} className="h-full min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickFormatter={(val) => `${val / 1000}k`}
            />
            <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
            <Bar
              dataKey="entradas"
              name="Entradas"
              fill="#10B981"
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="saidas"
              name="Saídas"
              fill="#EF4444"
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
