import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { Transaction, Account, Category } from '@/types/finance'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export const ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Dinheiro', initialBalance: 0 },
  { id: 'acc2', name: 'Stone', initialBalance: 0 },
  { id: 'acc3', name: 'Pagbank', initialBalance: 0 },
  { id: 'acc4', name: 'PIX', initialBalance: 0 },
]

export const CATEGORIES: Category[] = [
  { id: 'FIXA', name: 'Fixa', type: 'EXPENSE', isVariable: false },
  { id: 'VARIAVEL', name: 'Variável', type: 'EXPENSE', isVariable: true },
]

interface FinanceFilters {
  years: string[]
  months: string[]
  statuses: string[]
}

interface FinanceContextType {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  filters: FinanceFilters
  setFilter: (key: keyof FinanceFilters, values: string[]) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>
  filteredTransactions: Transaction[]
  updateAccountInitialBalances: (balances: Record<string, number>) => Promise<{ error: any }>
  loadingData: boolean
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const mapTypeToDB = (type: string) => (type === 'INCOME' ? 'receita' : 'despesa')
const mapTypeFromDB = (type: string) => (type === 'receita' ? 'INCOME' : 'EXPENSE')

const mapCategoryToDB = (cat: string) => {
  if (!cat) return null
  return cat === 'FIXA' ? 'fixa' : 'variável'
}
const mapCategoryFromDB = (cat: string | null) => {
  if (!cat) return ''
  return cat === 'fixa' ? 'FIXA' : 'VARIAVEL'
}

const mapAccountToDB = (acc: string) => {
  if (!acc) return null
  if (acc === 'acc1') return 'dinheiro'
  if (acc === 'acc2') return 'stone'
  if (acc === 'acc3') return 'pagbank'
  if (acc === 'acc4') return 'pix'
  return null
}
const mapAccountFromDB = (acc: string | null) => {
  if (!acc) return ''
  if (acc === 'dinheiro') return 'acc1'
  if (acc === 'stone') return 'acc2'
  if (acc === 'pagbank') return 'acc3'
  if (acc === 'pix') return 'acc4'
  return ''
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS)
  const [loadingData, setLoadingData] = useState(true)
  const [filters, setFilters] = useState<FinanceFilters>({
    years: [new Date().getFullYear().toString()],
    months: [],
    statuses: [],
  })

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setTransactions([])
      setAccounts(ACCOUNTS)
      setLoadingData(false)
    }
  }, [user])

  const fetchData = async () => {
    setLoadingData(true)
    if (!user) return

    const [txRes, settingsRes] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
    ])

    if (txRes.data) {
      setTransactions(
        txRes.data.map((d) => ({
          id: d.id,
          date: d.date,
          description: d.description,
          amount: Number(d.amount),
          type: mapTypeFromDB(d.type) as any,
          categoryId: mapCategoryFromDB(d.category),
          accountId: mapAccountFromDB(d.account),
          status: d.status as any,
        })),
      )
    }

    let accBalances = { acc1: 0, acc2: 0, acc3: 0, acc4: 0 }
    if (settingsRes.data) {
      accBalances = {
        acc1: Number(settingsRes.data.initial_balance_dinheiro || 0),
        acc2: Number(settingsRes.data.initial_balance_stone || 0),
        acc3: Number(settingsRes.data.initial_balance_pagbank || 0),
        acc4: Number(settingsRes.data.initial_balance_pix || 0),
      }
    }

    setAccounts([
      { id: 'acc1', name: 'Dinheiro', initialBalance: accBalances.acc1 },
      { id: 'acc2', name: 'Stone', initialBalance: accBalances.acc2 },
      { id: 'acc3', name: 'Pagbank', initialBalance: accBalances.acc3 },
      { id: 'acc4', name: 'PIX', initialBalance: accBalances.acc4 },
    ])

    setLoadingData(false)
  }

  const setFilter = (key: keyof FinanceFilters, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }))
  }

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!user) return
    const dbType = mapTypeToDB(tx.type)
    const dbCategory = dbType === 'despesa' ? mapCategoryToDB(tx.categoryId) : null
    const dbAccount = dbType === 'receita' ? mapAccountToDB(tx.accountId) : null

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        description: tx.description,
        amount: tx.amount,
        type: dbType,
        category: dbCategory,
        account: dbAccount,
        status: tx.status,
        date: new Date(tx.date).toISOString(),
      })
      .select()
      .single()

    if (!error && data) {
      const newTx: Transaction = {
        id: data.id,
        date: data.date,
        description: data.description,
        amount: Number(data.amount),
        type: mapTypeFromDB(data.type) as any,
        categoryId: mapCategoryFromDB(data.category),
        accountId: mapAccountFromDB(data.account),
        status: data.status as any,
      }
      setTransactions((prev) => [newTx, ...prev])
    } else if (error) {
      throw error
    }
  }

  const updateAccountInitialBalances = async (balances: Record<string, number>) => {
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase.from('user_settings').upsert(
      {
        user_id: user.id,
        initial_balance_dinheiro: balances.acc1 ?? 0,
        initial_balance_stone: balances.acc2 ?? 0,
        initial_balance_pagbank: balances.acc3 ?? 0,
        initial_balance_pix: balances.acc4 ?? 0,
      },
      { onConflict: 'user_id' },
    )

    if (!error) {
      setAccounts((prev) =>
        prev.map((a) => ({ ...a, initialBalance: balances[a.id] ?? a.initialBalance })),
      )
    }
    return { error }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date)
      const txYear = txDate.getFullYear().toString()
      const txMonth = (txDate.getMonth() + 1).toString().padStart(2, '0')

      if (filters.years.length > 0 && !filters.years.includes(txYear)) return false
      if (filters.months.length > 0 && !filters.months.includes(txMonth)) return false
      if (filters.statuses.length > 0 && !filters.statuses.includes(tx.status)) return false

      return true
    })
  }, [transactions, filters])

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        categories: CATEGORIES,
        filters,
        setFilter,
        addTransaction,
        filteredTransactions,
        updateAccountInitialBalances,
        loadingData,
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
