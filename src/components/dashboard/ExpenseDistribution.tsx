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
    <div className="bg-white p-3 rounded-sm border shadow-sm flex flex-col justify-center">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Distribuição de Despesas
        </h3>
      </div>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-100 mb-3 shadow-inner">
        <div
          style={{ width: `${pctFixa}%` }}
          className="bg-orange-400 transition-all duration-500"
          title={`Fixas: ${pctFixa.toFixed(1)}%`}
        />
        <div
          style={{ width: `${pctVariavel}%` }}
          className="bg-emerald-400 transition-all duration-500"
          title={`Variáveis: ${pctVariavel.toFixed(1)}%`}
        />
      </div>
      <div className="flex justify-between items-center mt-1 px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium uppercase mb-0.5">
            <div className="w-2 h-2 rounded-sm bg-orange-400" />
            Fixas
          </div>
          <span className="font-bold text-orange-600 text-sm leading-none">
            {formatCurrency(cfaTotal)}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">{pctFixa.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col text-right items-end">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium uppercase mb-0.5">
            Variáveis
            <div className="w-2 h-2 rounded-sm bg-emerald-400" />
          </div>
          <span className="font-bold text-emerald-600 text-sm leading-none">
            {formatCurrency(varExpenses)}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">{pctVariavel.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
