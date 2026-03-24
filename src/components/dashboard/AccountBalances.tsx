import { useFinanceStore, PAYMENT_METHODS } from '@/stores/financeStore'
import { useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AccountBalances() {
  const { filteredTransactions, filters } = useFinanceStore()

  const { totalIncome, breakdowns } = useMemo(() => {
    let total = 0
    const pmTotals: Record<string, number> = {}

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'INCOME' && targetStatuses.includes(tx.status)) {
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
      <div className="grid grid-cols-2 bg-[#1e3a8a] text-white text-[10px] font-bold py-1.5 px-2">
        <div>Conta / Origem</div>
        <div className="text-right">Entradas (Período)</div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {/* Header Row for Sicredi */}
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-xs py-2 px-2 border-b bg-blue-50/50">
            <div className="font-bold text-gray-800">Sicredi (Consolidado)</div>
            <div className="flex items-center justify-end gap-1.5">
              <div className="font-mono px-1.5 py-0.5 rounded-sm text-right text-emerald-700 bg-emerald-100 font-bold">
                {formatCurrency(totalIncome)}
              </div>
            </div>
          </div>

          {/* Breakdowns */}
          {breakdowns.length > 0 ? (
            breakdowns.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] gap-2 items-center text-xs py-1.5 px-2 pl-6 border-b last:border-0 hover:bg-slate-50 transition-colors"
              >
                <div className="font-medium text-slate-600 truncate flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  {item.name}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="font-mono text-slate-700 text-right">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium min-w-[35px] text-right">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs text-slate-400">
              Nenhuma entrada no período
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
