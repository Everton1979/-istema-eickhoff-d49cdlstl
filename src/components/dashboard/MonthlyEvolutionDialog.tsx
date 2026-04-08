import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TrendingUp, LineChart as LineChartIcon } from 'lucide-react'
import { useFinanceStore } from '@/stores/financeStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MonthlyEvolutionDialog() {
  const [open, setOpen] = useState(false)
  const [metric, setMetric] = useState('faturamento')
  const { transactions, monthlyMetrics, filters } = useFinanceStore()

  const data = useMemo(() => {
    const result = []
    const refYear = parseInt(filters.years[0] || new Date().getFullYear().toString())
    let refMonth = new Date().getMonth()

    if (filters.months.length > 0) {
      refMonth = parseInt(filters.months[0]) - 1
    } else {
      if (refYear < new Date().getFullYear()) {
        refMonth = 11
      } else {
        refMonth = new Date().getMonth()
      }
    }

    const endDate = new Date(refYear, refMonth, 1)

    for (let i = 11; i >= 0; i--) {
      const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const mStr = m.toString().padStart(2, '0')
      const name = `${mStr}/${y.toString().slice(-2)}`

      let faturamento = 0
      let despesasVariaveis = 0
      let despesasFixas = 0
      let despesasTotais = 0

      transactions.forEach((t) => {
        const td = new Date(t.date)
        if (td.getMonth() + 1 === m && td.getFullYear() === y && t.status === 'REALIZADO') {
          if (t.type === 'INCOME') faturamento += t.amount
          if (t.type === 'EXPENSE') {
            despesasTotais += t.amount
            if (t.categoryId === 'VARIAVEL') despesasVariaveis += t.amount
            if (t.categoryId === 'FIXA') despesasFixas += t.amount
          }
        }
      })

      const metricForMonth = monthlyMetrics.find((mm) => mm.month === m && mm.year === y)

      const orders = metricForMonth?.orders_count || 0

      const lucroLiquido = faturamento - despesasTotais
      const margemLiquida = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0
      const markup = despesasVariaveis > 0 ? faturamento / despesasVariaveis : 0
      const ticketMedio = orders > 0 ? faturamento / orders : 0

      result.push({
        name,
        month: m,
        year: y,
        faturamento,
        margemLiquida,
        markup,
        ticketMedio,
        orders,
        lucroLiquido,
        despesasTotais,
      })
    }
    return result
  }, [transactions, monthlyMetrics, filters])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatPercent = (val: number) => `${val.toFixed(2)}%`
  const formatDecimal = (val: number) => val.toFixed(2)

  const getMetricConfig = () => {
    switch (metric) {
      case 'faturamento':
        return {
          key: 'faturamento',
          label: 'Faturamento Total (R$)',
          color: '#10b981',
          formatter: formatCurrency,
        }
      case 'lucroLiquido':
        return {
          key: 'lucroLiquido',
          label: 'Lucro Líquido (R$)',
          color: '#0ea5e9',
          formatter: formatCurrency,
        }
      case 'despesasTotais':
        return {
          key: 'despesasTotais',
          label: 'Despesas Totais (R$)',
          color: '#ef4444',
          formatter: formatCurrency,
        }
      case 'margemLiquida':
        return {
          key: 'margemLiquida',
          label: 'Margem Líquida (%)',
          color: '#3b82f6',
          formatter: formatPercent,
        }
      case 'markup':
        return { key: 'markup', label: 'Markup Médio', color: '#f59e0b', formatter: formatDecimal }
      case 'ticketMedio':
        return {
          key: 'ticketMedio',
          label: 'Ticket Médio (R$)',
          color: '#8b5cf6',
          formatter: formatCurrency,
        }
      default:
        return {
          key: 'faturamento',
          label: 'Faturamento',
          color: '#10b981',
          formatter: formatCurrency,
        }
    }
  }

  const config = getMetricConfig()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-11 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex gap-2 shadow-sm"
        >
          <TrendingUp className="w-4 h-4" /> Evolução Mensal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen m-0 p-0 flex flex-col rounded-none border-none duration-200">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b bg-white">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LineChartIcon className="w-6 h-6 text-emerald-600" /> Evolução de Indicadores
            Estratégicos (12 Meses)
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-6 bg-slate-50/50">
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
              <span className="text-sm text-slate-600 font-medium">
                Selecione o indicador para o gráfico:
              </span>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-[250px] bg-slate-50 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faturamento">Faturamento Total</SelectItem>
                  <SelectItem value="lucroLiquido">Lucro Líquido</SelectItem>
                  <SelectItem value="despesasTotais">Despesas Totais</SelectItem>
                  <SelectItem value="margemLiquida">Margem Líquida (%)</SelectItem>
                  <SelectItem value="markup">Markup Médio</SelectItem>
                  <SelectItem value="ticketMedio">Ticket Médio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-[400px] lg:h-[450px] w-full border rounded-lg p-6 bg-white shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => {
                      if (
                        metric === 'faturamento' ||
                        metric === 'lucroLiquido' ||
                        metric === 'despesasTotais'
                      ) {
                        return `${(val / 1000).toFixed(0)}k`
                      }
                      if (metric === 'margemLiquida') return `${val.toFixed(0)}%`
                      return val.toFixed(1)
                    }}
                    width={55}
                  />
                  <Tooltip
                    formatter={(value: number) => [config.formatter(value), config.label]}
                    labelStyle={{ color: '#0f172a', fontWeight: 600, paddingBottom: 4 }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={config.key}
                    stroke={config.color}
                    strokeWidth={4}
                    dot={{ r: 5, fill: config.color, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Mês</th>
                    <th className="px-4 py-4 font-semibold text-right">Faturamento</th>
                    <th className="px-4 py-4 font-semibold text-right">Lucro Líq.</th>
                    <th className="px-4 py-4 font-semibold text-right">Desp. Totais</th>
                    <th className="px-4 py-4 font-semibold text-right">Margem Líq.</th>
                    <th className="px-4 py-4 font-semibold text-right">Markup</th>
                    <th className="px-4 py-4 font-semibold text-right">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{row.name}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                        {formatCurrency(row.faturamento)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${row.lucroLiquido < 0 ? 'text-red-600' : 'text-sky-600'}`}
                      >
                        {formatCurrency(row.lucroLiquido)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-500 font-medium">
                        {formatCurrency(row.despesasTotais)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${row.margemLiquida < 0 ? 'text-red-600' : 'text-blue-600'}`}
                      >
                        {formatPercent(row.margemLiquida)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600 font-medium">
                        {formatDecimal(row.markup)}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600 font-medium">
                        {formatCurrency(row.ticketMedio)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
