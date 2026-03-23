import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AccountBalances() {
  const { accounts, filteredTransactions } = useFinanceStore()

  const balances = useMemo(() => {
    const accBalances = accounts.map((a) => ({ ...a, currentBalance: a.initialBalance }))

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'REALIZADO') {
        const acc = accBalances.find((a) => a.id === tx.accountId)
        if (acc) {
          acc.currentBalance += tx.type === 'INCOME' ? tx.amount : -tx.amount
        }
      }
    })

    return accBalances
  }, [accounts, filteredTransactions])

  const totalBalance = useMemo(() => {
    return balances.reduce((sum, acc) => sum + acc.currentBalance, 0)
  }, [balances])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      val,
    )

  return (
    <div className="bg-white rounded-sm border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-2 bg-[#1e3a8a] text-white text-[10px] font-bold py-1 px-2">
        <div>Conta</div>
        <div className="text-right">Saldo</div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {balances.map((acc, i) => {
            const pct = totalBalance !== 0 ? (acc.currentBalance / Math.abs(totalBalance)) * 100 : 0

            return (
              <div
                key={acc.id}
                className={cn(
                  'grid grid-cols-[1fr_auto] gap-2 items-center text-xs py-1.5 px-2 border-b last:border-0',
                  i % 2 === 0 ? 'bg-blue-50/30' : 'bg-white',
                )}
              >
                <div className="font-semibold text-gray-700 truncate">{acc.name}</div>
                <div className="flex items-center justify-end gap-1.5">
                  <div
                    className={cn(
                      'font-mono px-1 rounded-sm text-right',
                      acc.currentBalance < 0
                        ? 'text-red-500 bg-red-50'
                        : 'text-emerald-600 bg-emerald-50',
                    )}
                  >
                    {formatCurrency(acc.currentBalance)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium min-w-[40px] text-right">
                    ({pct > 0 && acc.currentBalance > 0 ? '+' : ''}
                    {pct.toFixed(1)}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
