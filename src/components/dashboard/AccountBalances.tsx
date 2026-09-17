import { useFinanceStore, PAYMENT_METHODS } from '@/stores/financeStore'
import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

// Tons positivos (verde/azul) para diferenciar das despesas operacionais
const INCOME_COLORS = [
  '#059669', // Emerald 600
  '#2563eb', // Blue 600
  '#0d9488', // Teal 600
  '#0284c7', // Sky 600
  '#10b981', // Emerald 500
  '#3b82f6', // Blue 500
  '#14b8a6', // Teal 500
  '#06b6d4', // Cyan 500
  '#15803d', // Green 700
  '#1d4ed8', // Blue 700
]

export function AccountBalances() {
  const { filteredTransactions, filters } = useFinanceStore()

  const { totalIncome, breakdowns } = useMemo(() => {
    let total = 0
    const pmTotals: Record<string, number> = {}

    const statuses =
      filters && Array.isArray((filters as any).statuses) ? (filters as any).statuses : []
    const targetStatuses = statuses.length > 0 ? statuses : null

    ;(filteredTransactions || []).forEach((tx) => {
      if (tx.type === 'INCOME' && (!targetStatuses || targetStatuses.includes(tx.status))) {
        total += tx.amount
        const pm = tx.paymentMethodId || 'outros'
        pmTotals[pm] = (pmTotals[pm] || 0) + tx.amount
      }
    })

    const bdowns = Object.entries(pmTotals)
      .map(([id, amount]) => {
        const pm = PAYMENT_METHODS.find((p) => p.id === id)
        const name = pm ? pm.name : id === 'outros' ? 'Outros / Não informado' : id
        return {
          id,
          name,
          value: amount,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        }
      })
      .sort((a, b) => b.amount - a.amount)

    return { totalIncome: total, breakdowns: bdowns }
  }, [filteredTransactions, filters])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-200 text-slate-900 text-xs font-bold py-2.5 px-3.5 flex justify-between items-center shrink-0">
        <span className="uppercase tracking-wide">RECEITAS REALIZADAS (ENTRADAS)</span>
        <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide shadow-sm">
          {formatCurrency(totalIncome)}
        </span>
      </div>
      <div className="p-4 flex-1 bg-white">
        {breakdowns && breakdowns.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* Gráfico de Colunas no mesmo padrão visual do ExpenseDistribution com tons verde/azul */}
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdowns} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                    tick={{ fontSize: 10 }}
                    width={45}
                  />
                  <Tooltip
                    formatter={(value: number, _name: string, item: any) => [
                      `${formatCurrency(value)} (${(item?.payload?.percentage ?? 0).toFixed(1)}%)`,
                      'VALOR',
                    ]}
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {breakdowns.map((entry, index) => (
                      <Cell
                        key={`income-cell-${entry.id || index}`}
                        fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Resumo com os mesmos valores e percentuais por forma de pagamento */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
              {breakdowns.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-center items-center text-center hover:border-emerald-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-1.5 w-full justify-center mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length],
                      }}
                    />
                    <span
                      className="text-[10px] text-slate-600 font-bold uppercase truncate"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1.5">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-xs text-slate-400 h-full min-h-[140px] uppercase font-semibold">
            NENHUMA ENTRADA NO PERÍODO
          </div>
        )}
      </div>
    </div>
  )
}
