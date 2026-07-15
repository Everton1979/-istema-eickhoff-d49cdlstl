import { useFinanceStore, PAYMENT_METHODS } from '@/stores/financeStore'
import { useMemo } from 'react'

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
        return {
          id,
          name: pm ? pm.name : id === 'outros' ? 'Outros / Não informado' : id,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        }
      })
      .sort((a, b) => b.amount - a.amount)

    return { totalIncome: total, breakdowns: bdowns }
  }, [filteredTransactions, filters])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      val,
    )

  return (
    <div className="bg-white rounded-sm border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="bg-blue-500 text-black text-xs font-bold py-2 px-3 flex justify-between items-center shrink-0">
        <span>Receitas Realizadas (Entradas)</span>
        <span className="bg-blue-700/50 px-2 py-0.5 rounded text-[10px] tracking-wide">
          {formatCurrency(totalIncome)}
        </span>
      </div>
      <div className="p-2 flex-1 overflow-y-auto bg-slate-50/50">
        {breakdowns && breakdowns.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {breakdowns.map((item) => (
              <div
                key={item.id}
                className="bg-blue-100 border border-blue-300 rounded-sm p-2 flex flex-col justify-center items-center text-center hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <span
                  className="text-[10px] text-black/70 font-medium uppercase truncate w-full mb-1"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span className="text-xs font-bold text-black">{formatCurrency(item.amount)}</span>
                <span className="text-[9px] text-black font-semibold bg-blue-200 px-1.5 py-0.5 rounded-sm mt-1">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-xs text-slate-400 h-full min-h-[100px]">
            Nenhuma entrada no período
          </div>
        )}
      </div>
    </div>
  )
}
