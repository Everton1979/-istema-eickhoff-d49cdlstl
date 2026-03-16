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
          {balances.map((acc, i) => (
            <div
              key={acc.id}
              className={cn(
                'grid grid-cols-2 text-xs py-1 px-2 border-b last:border-0',
                i % 2 === 0 ? 'bg-blue-50/30' : 'bg-white',
              )}
            >
              <div className="font-semibold text-gray-700">{acc.name}</div>
              <div
                className={cn(
                  'text-right font-mono',
                  acc.currentBalance < 0
                    ? 'text-red-500 bg-red-50'
                    : 'text-emerald-600 bg-emerald-50',
                )}
              >
                {formatCurrency(acc.currentBalance)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
