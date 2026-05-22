import { useMemo } from 'react'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useFinanceStore } from '@/stores/financeStore'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function PerformanceEvolutionChart() {
  const { transactions, filters } = useFinanceStore()
  const monthsCount = 6

  const data = useMemo(() => {
    const result = []

    let refYear = new Date().getFullYear()
    let refMonth = new Date().getMonth() + 1

    if (filters.years && filters.years.length > 0) {
      const parsedYears = filters.years.map((y) => parseInt(y, 10)).filter((y) => !isNaN(y))
      if (parsedYears.length > 0) {
        refYear = Math.max(...parsedYears)
      }
    }

    if (filters.months && filters.months.length > 0) {
      const parsedMonths = filters.months.map((m) => parseInt(m, 10)).filter((m) => !isNaN(m))
      if (parsedMonths.length > 0) {
        refMonth = Math.max(...parsedMonths)
      } else {
        refMonth = 12
      }
    } else {
      refMonth = 12
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
        if (status !== 'REALIZADO') return

        try {
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
          // Ignore
        }
      })

      result.push({
        name: `${m.toString().padStart(2, '0')}/${y.toString().slice(-2)}`,
        receitasRealizadas: receitas,
        despesasRealizadas: despesas,
        lucroLiquido: receitas - despesas,
      })
    }
    return result
  }, [transactions, monthsCount, filters])

  return (
    <div className="w-full flex flex-col">
      <ChartContainer
        config={{
          receitasRealizadas: { label: 'Receitas Realizadas', color: '#10b981' },
          despesasRealizadas: { label: 'Despesas Realizadas', color: '#ef4444' },
          lucroLiquido: { label: 'Lucro Líquido', color: '#3b82f6' },
        }}
        className="w-full h-[350px] aspect-auto mt-6"
      >
        <ComposedChart
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
            interval={0}
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

          <Bar
            dataKey="receitasRealizadas"
            fill="var(--color-receitasRealizadas)"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="despesasRealizadas"
            fill="var(--color-despesasRealizadas)"
            radius={[2, 2, 0, 0]}
          />
          <Bar dataKey="lucroLiquido" fill="var(--color-lucroLiquido)" radius={[2, 2, 0, 0]} />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
