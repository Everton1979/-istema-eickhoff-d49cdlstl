import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { Transaction, Account, Category, MonthlyMetric, PaymentMethod } from '@/types/finance'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export const ACCOUNTS: Account[] = [{ id: 'sicredi', name: 'Sicredi', initialBalance: 0 }]

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'dinheiro', name: 'Dinheiro' },
  { id: 'stone', name: 'Stone' },
  { id: 'pagbank', name: 'Pagbank' },
  { id: 'pix', name: 'PIX' },
  { id: 'banricompras', name: 'Banricompras' },
  { id: 'banco_corretora', name: 'Banco/Corretora' },
]

export const CATEGORIES: Category[] = [
  { id: 'FIXA', name: 'Fixa', type: 'EXPENSE', isVariable: false },
  { id: 'VARIAVEL', name: 'Variável', type: 'EXPENSE', isVariable: true },
  { id: 'RECEITA_OPERACIONAL', name: 'Receita Operacional', type: 'INCOME', isVariable: false },
  {
    id: 'RECEITA_NAO_OPERACIONAL',
    name: 'Receita Não Operacional',
    type: 'INCOME',
    isVariable: false,
  },
]

interface FinanceFilters {
  startDate: string
  endDate: string
  type: string
  years: string[]
  months: string[]
  statuses: string[]
}

interface FinanceContextType {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  monthlyMetrics: MonthlyMetric[]
  filters: FinanceFilters
  setFilter: (key: keyof FinanceFilters, values: any) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: string, tx: Partial<Omit<Transaction, 'id'>>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  saveMonthlyMetric: (metric: Omit<MonthlyMetric, 'id'>) => Promise<void>
  filteredTransactions: Transaction[]
  filteredMonthlyMetrics: MonthlyMetric[]
  updateAccountInitialBalances: (balances: Record<string, number>) => Promise<{ error: any }>
  loadingData: boolean
  fetchData: () => Promise<void>
  fetchTransactionsForExport: (
    startDate: string,
    endDate: string,
    type: string,
  ) => Promise<Transaction[]>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const PROJECT_ID = 'farmacia'

const mapTypeToDB = (type: string) => {
  if (type === 'INCOME') return 'receita'
  if (type === 'CORTESIA') return 'cortesia'
  if (type === 'PARTNER_WITHDRAWAL') return 'retirada_socios'
  return 'despesa'
}
const mapTypeFromDB = (type: string | null) => {
  if (!type) return 'EXPENSE'
  const t = type.toLowerCase().trim()
  if (t === 'receita' || t === 'income') return 'INCOME'
  if (t === 'cortesia') return 'CORTESIA'
  if (t === 'retirada_socios') return 'PARTNER_WITHDRAWAL'
  return 'EXPENSE'
}

const mapCategoryToDB = (cat: string | undefined) => {
  if (!cat) return null
  const c = cat.toUpperCase()
  if (c === 'FIXA') return 'fixa'
  if (c === 'VARIAVEL') return 'variável'
  if (c === 'RECEITA_OPERACIONAL') return 'receita_operacional'
  if (c === 'RECEITA_NAO_OPERACIONAL') return 'receita_nao_operacional'
  return cat.toLowerCase()
}
const mapCategoryFromDB = (cat: string | null) => {
  if (!cat) return ''
  const c = cat.toLowerCase().trim()
  if (c === 'fixa') return 'FIXA'
  if (c === 'variável' || c === 'variavel') return 'VARIAVEL'
  if (c === 'receita_operacional') return 'RECEITA_OPERACIONAL'
  if (c === 'receita_nao_operacional') return 'RECEITA_NAO_OPERACIONAL'
  return cat.toUpperCase()
}

const mapAccountToDB = (acc: string) => 'sicredi'
const mapAccountFromDB = (acc: string | null) => 'sicredi'

const mapPaymentMethodToDB = (pm: string | undefined) => pm || null
const mapPaymentMethodFromDB = (pm: string | null) => {
  if (!pm) return ''
  if (pm === 'banco' || pm === 'corretora') return 'banco_corretora'
  return pm
}

const ensureUtcNoon = (dateStr: string) => {
  if (dateStr.includes('T')) return dateStr
  return new Date(`${dateStr}T12:00:00Z`).toISOString()
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS)
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetric[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [filters, setFilters] = useState<FinanceFilters>(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    return {
      startDate: firstDay,
      endDate: lastDay,
      type: 'ALL',
      years: [now.getFullYear().toString()],
      months: [(now.getMonth() + 1).toString().padStart(2, '0')],
      statuses: [],
    }
  })

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setTransactions([])
      setMonthlyMetrics([])
      setAccounts(ACCOUNTS)
      setLoadingData(false)
    }
  }, [user])

  const fetchData = async () => {
    setLoadingData(true)
    if (!user) return

    const [txRes, settingsRes, metricsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', PROJECT_ID)
        .order('date', { ascending: false })
        .limit(10000),
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', PROJECT_ID)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('monthly_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', PROJECT_ID)
        .limit(5000),
    ])

    if (txRes.data) {
      setTransactions(
        txRes.data.map((d: any) => ({
          id: d.id,
          date: d.date,
          description: d.description,
          amount: Number(d.amount),
          type: mapTypeFromDB(d.type) as any,
          categoryId: mapCategoryFromDB(d.category),
          subcategoryId: d.subcategory || '',
          accountId: mapAccountFromDB(d.account),
          paymentMethodId: mapPaymentMethodFromDB(d.payment_method),
          status: (d.status || 'REALIZADO').toUpperCase() as any,
          tags: d.tags || '',
        })),
      )
    }

    if (metricsRes.data) {
      setMonthlyMetrics(
        metricsRes.data.map((m: any) => ({
          id: m.id,
          month: m.month,
          year: m.year,
          orders_count: Number(m.orders_count),
          total_system_sales: Number(m.total_system_sales),
          raw_material_costs: Number(m.raw_material_costs),
          sales_target: Number(m.sales_target || 0),
          global_sales_target: Number(m.global_sales_target || 0),
          num_formulas_capsulas: Number(m.num_formulas_capsulas || 0),
          vendas_capsulas: Number(m.vendas_capsulas || 0),
          custo_mp_emb_capsulas: Number(m.custo_mp_emb_capsulas || 0),
          num_formulas_dermato: Number(m.num_formulas_dermato || 0),
          vendas_dermato: Number(m.vendas_dermato || 0),
          custo_mp_emb_dermato: Number(m.custo_mp_emb_dermato || 0),
          colaboradores_capsulas: Number(m.colaboradores_capsulas || 0),
          colaboradores_dermato: Number(m.colaboradores_dermato || 0),
          colaboradores_vendas: Number(m.colaboradores_vendas || 0),
        })),
      )
    }

    let accBalances = { sicredi: 0 }
    if (settingsRes.data) {
      const data = settingsRes.data as any
      accBalances = {
        sicredi: Number(data.initial_balance_sicredi || 0),
      }
    }

    setAccounts([{ id: 'sicredi', name: 'Sicredi', initialBalance: accBalances.sicredi }])

    setLoadingData(false)
  }

  const setFilter = (key: keyof FinanceFilters, values: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: values }
      if (key === 'startDate' && typeof values === 'string') {
        const d = new Date(values)
        if (!isNaN(d.getTime())) {
          newFilters.months = [(d.getUTCMonth() + 1).toString().padStart(2, '0')]
          newFilters.years = [d.getUTCFullYear().toString()]
        }
      }
      return newFilters
    })
  }

  const logAction = async (action: string, entity: string, entity_id?: string, details?: any) => {
    if (!user) return
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        project_id: PROJECT_ID,
        action,
        entity,
        entity_id,
        details,
      })
    } catch (e) {
      console.error('Falha ao registrar log de auditoria', e)
    }
  }

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!user) return
    const dbType = mapTypeToDB(tx.type)
    const formattedDate = ensureUtcNoon(tx.date)

    const payload: any = {
      user_id: user.id,
      project_id: PROJECT_ID,
      description: tx.description,
      amount: tx.amount,
      type: dbType,
      category: mapCategoryToDB(tx.categoryId),
      subcategory: tx.subcategoryId || null,
      account: mapAccountToDB(tx.accountId),
      payment_method: dbType === 'receita' ? mapPaymentMethodToDB(tx.paymentMethodId) : null,
      status: tx.status,
      date: formattedDate,
      tags: tx.tags || '',
    }
    const { data, error } = await supabase.from('transactions').insert(payload).select().single()

    if (!error && data) {
      const newTx: Transaction = {
        id: data.id,
        date: data.date,
        description: data.description,
        amount: Number(data.amount),
        type: mapTypeFromDB(data.type) as any,
        categoryId: mapCategoryFromDB(data.category),
        subcategoryId: (data as any).subcategory || '',
        accountId: mapAccountFromDB(data.account),
        paymentMethodId: mapPaymentMethodFromDB((data as any).payment_method),
        status: (data.status || 'REALIZADO').toUpperCase() as any,
        tags: (data as any).tags || '',
      }
      setTransactions((prev) => [newTx, ...prev])
      await logAction('CRIAR', 'Transação', data.id, {
        description: data.description,
        amount: data.amount,
        type: data.type,
      })
    } else if (error) throw error
  }

  const updateTransaction = async (id: string, tx: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) return
    const updateData: any = {}
    if (tx.description !== undefined) updateData.description = tx.description
    if (tx.amount !== undefined) updateData.amount = tx.amount
    if (tx.type !== undefined) updateData.type = mapTypeToDB(tx.type)
    if (tx.categoryId !== undefined) updateData.category = mapCategoryToDB(tx.categoryId)
    if (tx.subcategoryId !== undefined) updateData.subcategory = tx.subcategoryId || null
    if (tx.accountId !== undefined) updateData.account = mapAccountToDB(tx.accountId)
    if (tx.paymentMethodId !== undefined)
      updateData.payment_method = mapPaymentMethodToDB(tx.paymentMethodId)
    if (tx.status !== undefined) updateData.status = tx.status
    if (tx.date !== undefined) updateData.date = ensureUtcNoon(tx.date)
    if (tx.tags !== undefined) updateData.tags = tx.tags

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                date: data.date,
                description: data.description,
                amount: Number(data.amount),
                type: mapTypeFromDB(data.type) as any,
                categoryId: mapCategoryFromDB(data.category),
                subcategoryId: (data as any).subcategory || '',
                accountId: mapAccountFromDB(data.account),
                paymentMethodId: mapPaymentMethodFromDB((data as any).payment_method),
                status: (data.status || 'REALIZADO').toUpperCase() as any,
                tags: (data as any).tags || '',
              }
            : t,
        ),
      )
      await logAction('ATUALIZAR', 'Transação', id, {
        description: data.description,
        amount: data.amount,
      })
    } else if (error) throw error
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      await logAction('EXCLUIR', 'Transação', id)
    } else throw error
  }

  const saveMonthlyMetric = async (metric: Omit<MonthlyMetric, 'id'>) => {
    if (!user) return

    const existing = monthlyMetrics.find((m) => m.month === metric.month && m.year === metric.year)

    const orders_count = (metric.num_formulas_capsulas || 0) + (metric.num_formulas_dermato || 0)
    const total_system_sales = (metric.vendas_capsulas || 0) + (metric.vendas_dermato || 0)
    const raw_material_costs =
      (metric.custo_mp_emb_capsulas || 0) + (metric.custo_mp_emb_dermato || 0)

    const payload = {
      project_id: PROJECT_ID,
      month: metric.month,
      year: metric.year,
      orders_count: metric.orders_count !== undefined ? metric.orders_count : orders_count,
      total_system_sales:
        metric.total_system_sales !== undefined ? metric.total_system_sales : total_system_sales,
      raw_material_costs:
        metric.raw_material_costs !== undefined ? metric.raw_material_costs : raw_material_costs,
      sales_target:
        metric.sales_target !== undefined ? metric.sales_target : existing?.sales_target || 0,
      global_sales_target:
        metric.global_sales_target !== undefined
          ? metric.global_sales_target
          : existing?.global_sales_target || 0,
      num_formulas_capsulas: metric.num_formulas_capsulas || 0,
      vendas_capsulas: metric.vendas_capsulas || 0,
      custo_mp_emb_capsulas: metric.custo_mp_emb_capsulas || 0,
      num_formulas_dermato: metric.num_formulas_dermato || 0,
      vendas_dermato: metric.vendas_dermato || 0,
      custo_mp_emb_dermato: metric.custo_mp_emb_dermato || 0,
      colaboradores_capsulas: metric.colaboradores_capsulas || 0,
      colaboradores_dermato: metric.colaboradores_dermato || 0,
      colaboradores_vendas: metric.colaboradores_vendas || 0,
      updated_at: new Date().toISOString(),
    }

    let result
    if (existing) {
      result = await supabase
        .from('monthly_metrics')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('monthly_metrics')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()
    }

    const { data, error } = result

    if (!error && data) {
      setMonthlyMetrics((prev) => {
        const filtered = prev.filter((m) => m.id !== data.id)
        return [
          ...filtered,
          {
            id: data.id,
            month: data.month,
            year: data.year,
            orders_count: Number(data.orders_count),
            total_system_sales: Number(data.total_system_sales),
            raw_material_costs: Number(data.raw_material_costs),
            sales_target: Number(data.sales_target || 0),
            global_sales_target: Number(data.global_sales_target || 0),
            num_formulas_capsulas: Number(data.num_formulas_capsulas || 0),
            vendas_capsulas: Number(data.vendas_capsulas || 0),
            custo_mp_emb_capsulas: Number(data.custo_mp_emb_capsulas || 0),
            num_formulas_dermato: Number(data.num_formulas_dermato || 0),
            vendas_dermato: Number(data.vendas_dermato || 0),
            custo_mp_emb_dermato: Number(data.custo_mp_emb_dermato || 0),
            colaboradores_capsulas: Number(data.colaboradores_capsulas || 0),
            colaboradores_dermato: Number(data.colaboradores_dermato || 0),
            colaboradores_vendas: Number(data.colaboradores_vendas || 0),
          },
        ]
      })
      await logAction(existing ? 'ATUALIZAR' : 'CRIAR', 'Métrica Mensal', data.id, {
        month: data.month,
        year: data.year,
      })
    } else if (error) throw error
  }

  const fetchTransactionsForExport = async (
    startDate: string,
    endDate: string,
    type: string,
  ): Promise<Transaction[]> => {
    if (!user) return []

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', PROJECT_ID)
      .gte('date', startDate)
      .lte('date', `${endDate}T23:59:59.999Z`)
      .order('date', { ascending: true })
      .limit(100000)

    if (type === 'INCOME') {
      query = query.eq('type', 'receita')
    } else if (type === 'EXPENSE') {
      query = query.eq('type', 'despesa')
    } else if (type === 'CORTESIA') {
      query = query.eq('type', 'cortesia')
    } else if (type === 'PARTNER_WITHDRAWAL') {
      query = query.eq('type', 'retirada_socios')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions for export:', error)
      return []
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      date: d.date,
      description: d.description,
      amount: Number(d.amount),
      type: mapTypeFromDB(d.type) as any,
      categoryId: mapCategoryFromDB(d.category),
      subcategoryId: d.subcategory || '',
      accountId: mapAccountFromDB(d.account),
      paymentMethodId: mapPaymentMethodFromDB(d.payment_method),
      status: (d.status || 'REALIZADO').toUpperCase() as any,
      tags: d.tags || '',
    }))
  }

  const updateAccountInitialBalances = async (balances: Record<string, number>) => {
    if (!user) return { error: 'Not authenticated' }

    const { data: existing } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('project_id', PROJECT_ID)
      .limit(1)
      .maybeSingle()

    const payload: any = {
      user_id: existing?.user_id || user.id,
      project_id: PROJECT_ID,
      initial_balance_sicredi: balances.sicredi ?? 0,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id,project_id' })

    if (!error) {
      setAccounts((prev) =>
        prev.map((a) => ({ ...a, initialBalance: balances[a.id] ?? a.initialBalance })),
      )
    }
    return { error }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      let txDateStr = ''
      if (tx.date.includes('T')) {
        txDateStr = tx.date.split('T')[0]
      } else {
        txDateStr = tx.date.substring(0, 10)
      }

      const txYear = txDateStr.substring(0, 4)
      const txMonth = txDateStr.substring(5, 7)

      if (filters.years && filters.years.length > 0 && !filters.years.includes(txYear)) return false
      if (filters.months && filters.months.length > 0 && !filters.months.includes(txMonth))
        return false

      if (
        filters.statuses &&
        filters.statuses.length > 0 &&
        !filters.statuses.includes(tx.status.toUpperCase())
      )
        return false

      return true
    })
  }, [transactions, filters])

  const filteredMonthlyMetrics = useMemo(() => {
    return monthlyMetrics.filter((m) => {
      if (filters.years.length > 0 && !filters.years.includes(m.year.toString())) return false
      if (
        filters.months.length > 0 &&
        !filters.months.includes(m.month.toString().padStart(2, '0'))
      )
        return false
      return true
    })
  }, [monthlyMetrics, filters])

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        categories: CATEGORIES,
        monthlyMetrics,
        filters,
        setFilter,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveMonthlyMetric,
        filteredTransactions,
        filteredMonthlyMetrics,
        updateAccountInitialBalances,
        loadingData,
        fetchData,
        fetchTransactionsForExport,
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
