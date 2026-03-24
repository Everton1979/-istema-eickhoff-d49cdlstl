import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'

export function ExpenseDistribution() {
  const { filteredTransactions, filters } = useFinanceStore()

  const { pctFixa, pctVariavel, totalExpenses, cfaTotal, varExpenses } = useMemo(() => {
    let cfaTotal = 0
    let varExpenses = 0

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE' && targetStatuses.includes(t.status)) {
        if (t.categoryId === 'FIXA') cfaTotal += t.amount
        if (t.categoryId === 'VARIAVEL') varExpenses += t.amount
      }
    })

    const total = cfaTotal + varExpenses
    return {
      totalExpenses: total,
      cfaTotal,
      varExpenses,
      pctFixa: total > 0 ? (cfaTotal / total) * 100 : 0,
      pctVariavel: total > 0 ? (varExpenses / total) * 100 : 0,
    }
  }, [filteredTransactions, filters])

  if (totalExpenses === 0) return null

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="bg-white p-3 rounded-sm border shadow-sm flex flex-col justify-center h-full min-h-[90px]">
      <h3 className="text-[10px] font-bold text-gray-600 uppercase mb-3">
        Distribuição de Despesas
      </h3>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-100 mb-3">
        <div
          style={{ width: `${pctFixa}%` }}
          className="bg-orange-400 transition-all duration-500"
        />
        <div
          style={{ width: `${pctVariavel}%` }}
          className="bg-emerald-400 transition-all duration-500"
        />
      </div>
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-gray-600 font-medium">Fixas ({pctFixa.toFixed(1)}%)</span>
          </div>
          <span className="font-bold text-orange-600">{formatCurrency(cfaTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-gray-600 font-medium">Variáveis ({pctVariavel.toFixed(1)}%)</span>
          </div>
          <span className="font-bold text-emerald-600">{formatCurrency(varExpenses)}</span>
        </div>
      </div>
    </div>
  )
}
