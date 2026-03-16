import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { useFinanceStore } from '@/stores/financeStore'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function ProfitabilityChart() {
  const { filteredTransactions, categories } = useFinanceStore()

  const data = useMemo(() => {
    const monthsData: Record<string, any> = {}
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

    filteredTransactions.forEach((tx) => {
      const date = new Date(tx.date)
      const m = date.getMonth()
      const key = `${date.getFullYear()}-${m}`

      if (!monthsData[key]) {
        monthsData[key] = { name: monthLabels[m], sortKey: key, receitas: 0, despesas: 0, cv: 0 }
      }
      if (tx.type === 'INCOME') monthsData[key].receitas += tx.amount
      else {
        monthsData[key].despesas += tx.amount
        if (categories.find((c) => c.id === tx.categoryId)?.isVariable) {
          monthsData[key].cv += tx.amount
        }
      }
    })

    return Object.values(monthsData)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map((d) => ({
        name: d.name,
        'Margem de contribuição': d.receitas - d.cv,
        'Lucro Operacional': d.receitas - d.despesas,
        'Lucro líquido': (d.receitas - d.despesas) * 0.85, // mock tax deduction
      }))
      .slice(-12)
  }, [filteredTransactions, categories])

  return (
    <div className="bg-white p-2 rounded-sm border shadow-sm flex flex-col h-full">
      <h3 className="text-xs font-bold text-center text-gray-600 mb-2">
        Indicadores de lucratividade
      </h3>
      <ChartContainer config={{}} className="h-full min-h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#6b7280' }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: '9px' }} iconType="plainline" />
            <Line
              type="monotone"
              dataKey="Margem de contribuição"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Lucro Operacional"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Lucro líquido"
              stroke="#1e3a8a"
              strokeWidth={2}
              dot={{ r: 2 }}
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
