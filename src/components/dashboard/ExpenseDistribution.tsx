import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'

export function ExpenseDistribution() {
  const { filteredTransactions } = useFinanceStore()

  const { pctFixa, pctVariavel, totalExpenses } = useMemo(() => {
    let cfaTotal = 0
    let varExpenses = 0

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE') {
        if (t.categoryId === 'FIXA') cfaTotal += t.amount
        if (t.categoryId === 'VARIAVEL') varExpenses += t.amount
      }
    })

    const total = cfaTotal + varExpenses
    return {
      totalExpenses: total,
      pctFixa: total > 0 ? (cfaTotal / total) * 100 : 0,
      pctVariavel: total > 0 ? (varExpenses / total) * 100 : 0,
    }
  }, [filteredTransactions])

  if (totalExpenses === 0) return null

  return (
    <div className="bg-white p-3 rounded-sm border shadow-sm flex flex-col justify-center">
      <h3 className="text-[10px] font-bold text-gray-600 uppercase mb-2">
        Distribuição de Despesas
      </h3>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-100">
        <div
          style={{ width: `${pctFixa}%` }}
          className="bg-orange-400 transition-all duration-500"
        />
        <div
          style={{ width: `${pctVariavel}%` }}
          className="bg-emerald-400 transition-all duration-500"
        />
      </div>
      <div className="flex justify-between text-[10px] mt-1">
        <span className="text-orange-600 font-medium">Fixas: {pctFixa.toFixed(1)}%</span>
        <span className="text-emerald-600 font-medium">Variáveis: {pctVariavel.toFixed(1)}%</span>
      </div>
    </div>
  )
}
