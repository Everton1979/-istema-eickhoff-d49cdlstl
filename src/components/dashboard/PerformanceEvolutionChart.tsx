import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
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

    let refYear = new Date().getFullYear()
    let refMonth = new Date().getMonth() + 1

    if (filters.years && filters.years.length > 0 && !isNaN(parseInt(filters.years[0], 10))) {
      refYear = parseInt(filters.years[0], 10)
    }
    if (filters.months && filters.months.length > 0 && !isNaN(parseInt(filters.months[0], 10))) {
      refMonth = parseInt(filters.months[0], 10)
    }

    for (let i = monthsCount - 1; i >= 0; i--) {
      let m = refMonth - i
      let y = refYear

      while (m <= 0) {
        m += 12
        y -= 1
      }

      let receitas = 0
      let despesas = 0

      transactions.forEach((t) => {
        if (!t || !t.date) return

        const status = (t.status || '').trim().toUpperCase()
        if (status === 'PENDENTE' || status === 'CANCELADO' || status === 'AGENDADO') return

        if (t.type !== 'INCOME' && t.type !== 'EXPENSE') return

        try {
          // Extrair ano e mês diretamente da string para evitar problemas de fuso horário
          const datePart = t.date.split('T')[0]
          if (!datePart || datePart.length < 10) return

          const parts = datePart.split('-')
          if (parts.length < 3) return

          const txYear = parseInt(parts[0], 10)
          const txMonth = parseInt(parts[1], 10)

          if (txMonth === m && txYear === y) {
            const amount = Number(t.amount) || 0
            if (t.type === 'INCOME') {
              receitas += amount
            } else if (t.type === 'EXPENSE') {
              despesas += amount
            }
          }
        } catch (e) {
          // Ignore invalid dates gracefully
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
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-end mb-4">
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
        className="w-full h-[350px] aspect-auto"
      >
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
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
            tickFormatter={(val) => (val >= 1000 ? `R$ ${(val / 1000).toFixed(0)}k` : `R$ ${val}`)}
            width={55}
          />
          <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#f3f4f6', opacity: 0.4 }} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />

          <Bar dataKey="Receitas" fill="var(--color-Receitas)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Despesas" fill="var(--color-Despesas)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Lucro" fill="var(--color-Lucro)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
