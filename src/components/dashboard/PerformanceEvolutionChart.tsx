import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
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
  const { transactions, filters } = useFinanceStore()
  const [monthsCount, setMonthsCount] = useState<number>(6)

  const data = useMemo(() => {
    const result = []
    const refYearStr = filters.years?.[0]
    const refYear = refYearStr ? parseInt(refYearStr) : new Date().getFullYear()

    let refMonth = new Date().getMonth()
    if (filters.months && filters.months.length > 0) {
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

      let receitas = 0
      let despesas = 0

      transactions.forEach((t) => {
        let txDateStr = t.date
        if (txDateStr.includes('T')) {
          txDateStr = txDateStr.split('T')[0]
        } else {
          txDateStr = txDateStr.substring(0, 10)
        }

        const txYear = parseInt(txDateStr.substring(0, 4), 10)
        const txMonth = parseInt(txDateStr.substring(5, 7), 10)

        // Considerar apenas REALIZADO e excluir Cortesias/Retiradas explicitamente
        if (txMonth === m && txYear === y && t.status === 'REALIZADO') {
          if (t.type === 'INCOME') {
            receitas += t.amount
          } else if (t.type === 'EXPENSE') {
            despesas += t.amount
          }
        }
      })

      result.push({
        name: `${m.toString().padStart(2, '0')}/${y.toString().slice(-2)}`,
        Receitas: receitas,
        Despesas: despesas,
        Lucro: receitas - despesas,
      })
    }
    return result
  }, [transactions, monthsCount, filters])

  return (
    <div className="bg-white p-3 rounded-sm border shadow-sm flex flex-col h-full min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Evolução de Performance
        </h3>
        <Select value={monthsCount.toString()} onValueChange={(v) => setMonthsCount(parseInt(v))}>
          <SelectTrigger className="h-7 w-[130px] text-xs">
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
          Receitas: { label: 'Receitas (R$)', color: '#10b981' },
          Despesas: { label: 'Despesas/Custos (R$)', color: '#ef4444' },
          Lucro: { label: 'Lucro Líquido (R$)', color: '#3b82f6' },
        }}
        className="flex-1 w-full h-full min-h-[220px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barGap={0}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              width={55}
            />
            <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#f3f4f6', opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />

            <Bar dataKey="Receitas" fill="var(--color-Receitas)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Despesas" fill="var(--color-Despesas)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Lucro" fill="var(--color-Lucro)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
