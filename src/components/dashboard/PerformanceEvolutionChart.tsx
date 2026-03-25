import { useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PerformanceEvolutionChart() {
  const { monthlyMetrics, transactions, filters } = useFinanceStore()
  const [monthsCount, setMonthsCount] = useState<number>(6)

  const data = useMemo(() => {
    const result = []
    const refYear = parseInt(filters.years[0] || new Date().getFullYear().toString())

    let refMonth = new Date().getMonth()
    if (filters.months.length > 0) {
      refMonth = parseInt(filters.months[0]) - 1
    } else {
      if (refYear < new Date().getFullYear()) {
        refMonth = 11 // December for past years
      } else {
        refMonth = new Date().getMonth()
      }
    }

    const endDate = new Date(refYear, refMonth, 1)

    // We want the last N months, ending in the selected month
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()

      const metric = monthlyMetrics.find((x) => x.year === y && x.month === m)

      let cfa = 0
      let varExpOperacional = 0

      transactions.forEach((t) => {
        const td = new Date(t.date)
        if (
          td.getMonth() + 1 === m &&
          td.getFullYear() === y &&
          t.type === 'EXPENSE' &&
          t.status === 'REALIZADO'
        ) {
          if (t.categoryId === 'FIXA') cfa += t.amount
          if (t.categoryId === 'VARIAVEL') {
            if (t.subcategoryId !== 'materia_prima' && t.subcategoryId !== 'embalagens') {
              varExpOperacional += t.amount
            }
          }
        }
      })

      const sales = metric?.total_system_sales || 0
      const raw = metric?.raw_material_costs || 0
      const margem = sales - (raw + varExpOperacional)

      const divisor = sales > 0 ? (sales - (cfa + varExpOperacional + raw)) / sales : 0
      const markup = divisor > 0 ? 1 / divisor : 1

      result.push({
        name: `${m.toString().padStart(2, '0')}/${y.toString().slice(-2)}`,
        Margem: margem,
        Markup: parseFloat(markup.toFixed(2)),
      })
    }
    return result
  }, [monthlyMetrics, transactions, monthsCount, filters])

  return (
    <div className="bg-white p-2 rounded-sm border shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Evolução de Performance
        </h3>
        <Select value={monthsCount.toString()} onValueChange={(v) => setMonthsCount(parseInt(v))}>
          <SelectTrigger className="h-6 w-[100px] text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ChartContainer
        config={{
          Margem: { label: 'Margem Contrib. (R$)', color: '#10b981' },
          Markup: { label: 'Markup (Multiplicador)', color: '#8b5cf6' },
        }}
        className="h-full min-h-[220px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#6b7280' }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#10b981' }}
              tickFormatter={(val) => `${val / 1000}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#8b5cf6' }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: '9px', marginTop: '10px' }} iconType="plainline" />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Margem"
              name="Margem Contrib."
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Markup"
              name="Markup Mult."
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#8b5cf6' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
