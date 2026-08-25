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
    <div className="bg-white rounded-xl border border-slate-300 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-200 text-slate-900 text-xs font-bold py-2.5 px-3.5 flex justify-between items-center shrink-0">
        <span className="uppercase tracking-wide">Receitas Realizadas (Entradas)</span>
        <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide shadow-sm">
          {formatCurrency(totalIncome)}
        </span>
      </div>
      <div className="p-3 flex-1 overflow-y-auto bg-slate-50/50">
        {breakdowns && breakdowns.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {breakdowns.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-300 rounded-lg p-2.5 flex flex-col justify-center items-center text-center hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <span
                  className="text-[10px] text-slate-600 font-bold uppercase truncate w-full mb-1"
                  title={item.name}
                >
                  {item.name}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full mt-1.5">
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
