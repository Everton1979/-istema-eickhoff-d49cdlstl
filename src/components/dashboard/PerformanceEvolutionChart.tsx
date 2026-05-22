import { useMemo, useState } from 'react'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
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
  const { transactions, filters, monthlyMetrics } = useFinanceStore()
  const [monthsCount, setMonthsCount] = useState<number>(6)

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
      let cfaTotal = 0

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
              if (t.categoryId === 'FIXA') {
                cfaTotal += amount
              }
            }
          }
        } catch (e) {
          // Ignore
        }
      })

      const metric = monthlyMetrics.find((mm) => mm.month === m && mm.year === y)
      const orders = metric ? metric.orders_count : 0
      const rawMaterialCosts = metric ? metric.raw_material_costs : 0
      const systemSales = metric ? metric.total_system_sales : 0
      const salesTarget = metric ? metric.sales_target : 0

      const ticketMedio = orders > 0 ? receitas / orders : 0
      const markup = rawMaterialCosts > 0 ? systemSales / rawMaterialCosts : 0
      const taxaTecnica = orders > 0 ? cfaTotal / orders : 0

      result.push({
        name: `${m.toString().padStart(2, '0')}/${y.toString().slice(-2)}`,
        Receitas: receitas,
        Despesas: despesas,
        Lucro: receitas - despesas,
        Vendas_Sistema: systemSales,
        Meta_Vendas: salesTarget,
        Ticket_Medio: ticketMedio,
        Taxa_Tecnica: taxaTecnica,
        Markup: markup,
      })
    }
    return result
  }, [transactions, monthsCount, filters, monthlyMetrics])

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
          Vendas_Sistema: { label: 'Vendas Sistema (R$)', color: '#0ea5e9' },
          Despesas: { label: 'Despesas/Custos (R$)', color: '#ef4444' },
          Lucro: { label: 'Lucro Líquido (R$)', color: '#3b82f6' },
          Meta_Vendas: { label: 'Meta de Vendas (R$)', color: '#f59e0b' },
          Ticket_Medio: { label: 'Ticket Médio (R$)', color: '#f97316' },
          Taxa_Tecnica: { label: 'Taxa Técnica Média (R$)', color: '#8b5cf6' },
          Markup: { label: 'Mark-up', color: '#ec4899' },
        }}
        className="w-full h-[350px] aspect-auto"
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
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickFormatter={(val) => (val >= 1000 ? `R$ ${(val / 1000).toFixed(0)}k` : `R$ ${val}`)}
            width={55}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickFormatter={(val) => val.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
            width={45}
          />
          <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#f3f4f6', opacity: 0.4 }} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />

          <Bar
            yAxisId="left"
            dataKey="Receitas"
            fill="var(--color-Receitas)"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="Despesas"
            fill="var(--color-Despesas)"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="Vendas_Sistema"
            fill="var(--color-Vendas_Sistema)"
            radius={[2, 2, 0, 0]}
          />
          <Bar yAxisId="left" dataKey="Lucro" fill="var(--color-Lucro)" radius={[2, 2, 0, 0]} />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Meta_Vendas"
            stroke="var(--color-Meta_Vendas)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Ticket_Medio"
            stroke="var(--color-Ticket_Medio)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Taxa_Tecnica"
            stroke="var(--color-Taxa_Tecnica)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Markup"
            stroke="var(--color-Markup)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
