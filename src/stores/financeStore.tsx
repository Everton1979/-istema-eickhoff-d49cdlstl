import React, { createContext, useContext, useState, useMemo } from 'react'
import { Transaction, Account, Category, CostCenter } from '@/types/finance'
import { ACCOUNTS, CATEGORIES, COST_CENTERS, INITIAL_TRANSACTIONS } from '@/lib/mockData'

interface FinanceFilters {
  years: string[]
  months: string[]
  statuses: string[]
  costCenters: string[]
}

interface FinanceContextType {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  costCenters: CostCenter[]
  filters: FinanceFilters
  setFilter: (key: keyof FinanceFilters, values: string[]) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  filteredTransactions: Transaction[]
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [filters, setFilters] = useState<FinanceFilters>({
    years: ['2023'],
    months: [],
    statuses: [],
    costCenters: [],
  })

  const setFilter = (key: keyof FinanceFilters, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }))
  }

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: `trx-new-${Date.now()}` }
    setTransactions((prev) => [newTx, ...prev])
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date)
      const txYear = txDate.getFullYear().toString()
      const txMonth = (txDate.getMonth() + 1).toString().padStart(2, '0')

      if (filters.years.length > 0 && !filters.years.includes(txYear)) return false
      if (filters.months.length > 0 && !filters.months.includes(txMonth)) return false
      if (filters.statuses.length > 0 && !filters.statuses.includes(tx.status)) return false
      if (filters.costCenters.length > 0 && !filters.costCenters.includes(tx.costCenterId))
        return false

      return true
    })
  }, [transactions, filters])

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts: ACCOUNTS,
        categories: CATEGORIES,
        costCenters: COST_CENTERS,
        filters,
        setFilter,
        addTransaction,
        filteredTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinanceStore() {
  const context = useContext(FinanceContext)
  if (!context) throw new Error('useFinanceStore must be used within a FinanceProvider')
  return context
}
