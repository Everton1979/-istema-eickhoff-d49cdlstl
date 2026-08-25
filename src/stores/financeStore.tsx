import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { Transaction, Account, Category, MonthlyMetric, PaymentMethod } from '@/types/finance'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export const ACCOUNTS: Account[] = [
  { id: 'conta_principal', name: 'Conta Principal', initialBalance: 0 },
]

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
  { id: 'INVESTIMENTO', name: 'Equipamentos e Investimentos', type: 'EXPENSE', isVariable: false },
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
  dayFilter: string
  statuses?: string[]
}

interface FinanceContextType {
  isDemoMode: boolean
  hasUserSettings: boolean | null
  completeOnboarding: () => Promise<void>
  isTransactionSheetOpen: boolean
  setTransactionSheetOpen: (open: boolean) => void
  editingTransaction: Transaction | null
  setEditingTransaction: (tx: Transaction | null) => void
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
  fetchData: (force?: boolean) => Promise<void>
  fetchTransactionsForExport: (
    startDate: string,
    endDate: string,
    type: string,
  ) => Promise<Transaction[]>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const mapTypeToDB = (type: string) => {
  if (type === 'INCOME') return 'receita'
  if (type === 'CORTESIA') return 'cortesia'
  if (type === 'PARTNER_WITHDRAWAL') return 'retirada_socios'
  if (type === 'INVESTIMENTO') return 'investimento'
  return 'despesa'
}
const mapTypeFromDB = (type: string | null, category?: string | null) => {
  const cat = (category || '').toLowerCase().trim()
  if (cat === 'cortesia') return 'CORTESIA'
  if (cat === 'retirada_socios' || cat === 'retirada de sócios' || cat === 'retirada')
    return 'PARTNER_WITHDRAWAL'
  if (cat === 'investimento') return 'INVESTIMENTO'

  if (!type) return 'EXPENSE'
  const t = type.toLowerCase().trim()
  if (t === 'receita' || t === 'income') return 'INCOME'
  if (t === 'cortesia') return 'CORTESIA'
  if (t === 'retirada_socios') return 'PARTNER_WITHDRAWAL'
  if (t === 'investimento') return 'INVESTIMENTO'
  return 'EXPENSE'
}

const mapCategoryToDB = (cat: string | undefined) => {
  if (!cat) return null
  const c = cat.toUpperCase()
  if (c === 'FIXA') return 'fixa'
  if (c === 'VARIAVEL') return 'variável'
  if (c === 'INVESTIMENTO') return 'investimento'
  if (c === 'RECEITA_OPERACIONAL') return 'receita_operacional'
  if (c === 'RECEITA_NAO_OPERACIONAL') return 'receita_nao_operacional'
  return cat.toLowerCase()
}
const mapCategoryFromDB = (cat: string | null) => {
  if (!cat) return ''
  const c = cat.toLowerCase().trim()
  if (c === 'fixa') return 'FIXA'
  if (c === 'variável' || c === 'variavel') return 'VARIAVEL'
  if (c === 'investimento') return 'INVESTIMENTO'
  if (c === 'receita_operacional') return 'RECEITA_OPERACIONAL'
  if (c === 'receita_nao_operacional') return 'RECEITA_NAO_OPERACIONAL'
  if (c === 'cortesia') return 'CORTESIA'
  if (c === 'retirada_socios' || c === 'retirada de sócios' || c === 'retirada')
    return 'PARTNER_WITHDRAWAL'
  return cat.toUpperCase()
}

const mapAccountToDB = (acc: string) => acc || 'conta_principal'
const mapAccountFromDB = (acc: string | null) =>
  !acc || acc === 'sicredi' ? 'conta_principal' : acc

const mapPaymentMethodToDB = (pm: string | undefined) => pm || null
const mapPaymentMethodFromDB = (pm: string | null) => {
  if (!pm) return ''
  if (pm === 'banco' || pm === 'corretora') return 'banco_corretora'
  return pm
}

const now = new Date()
const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 'd1',
    date: new Date(now.getFullYear(), now.getMonth(), 15, 12).toISOString(),
    description: 'Venda Balcão',
    amount: 1500,
    type: 'INCOME',
    categoryId: 'RECEITA_OPERACIONAL',
    accountId: 'conta_principal',
    status: 'REALIZADO',
    tags: '',
  },
  {
    id: 'd2',
    date: new Date(now.getFullYear(), now.getMonth(), 16, 12).toISOString(),
    description: 'Fornecedor A',
    amount: -500,
    type: 'EXPENSE',
    categoryId: 'VARIAVEL',
    accountId: 'conta_principal',
    status: 'REALIZADO',
    tags: '',
  },
]

const DUMMY_METRICS: MonthlyMetric[] = [
  {
    id: 'm1',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    orders_count: 120,
    total_system_sales: 15000,
    raw_material_costs: 4000,
    sales_target: 20000,
    global_sales_target: 30000,
    num_formulas_capsulas: 50,
    vendas_capsulas: 8000,
    custo_mp_emb_capsulas: 2000,
    num_formulas_dermato: 70,
    vendas_dermato: 7000,
    custo_mp_emb_dermato: 2000,
    vendas_revenda: 2000,
    custo_revenda: 1500,
    colaboradores_capsulas: 2,
    colaboradores_dermato: 2,
    colaboradores_vendas: 3,
    meta_vendas_manipulacao: 15000,
    meta_vendas_extra: 5000,
    meta_vendas_sistema_manipulacao: 15000,
    meta_vendas_sistema_revenda: 5000,
  },
]

const ensureUtcNoon = (dateStr: string) => {
  if (!dateStr) return new Date().toISOString()
  if (dateStr.includes('T')) return dateStr
  return new Date(`${dateStr}T12:00:00Z`).toISOString()
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const isDemoModeRef = React.useRef(false)
  const [isDemoMode, setIsDemoModeState] = useState(false)
  const [hasUserSettings, setHasUserSettings] = useState<boolean | null>(null)

  const setIsDemoMode = (val: boolean) => {
    isDemoModeRef.current = val
    setIsDemoModeState(val)
  }

  const completeOnboarding = async () => {
    setHasUserSettings(true)
    const pid = profile?.app_name || user?.id
    if (user && pid) {
      await supabase.from('user_settings').upsert(
        {
          user_id: user.id,
          project_id: pid,
        },
        { onConflict: 'user_id,project_id' },
      )
    }
  }

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS)
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetric[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isTransactionSheetOpen, setTransactionSheetOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const lastProjectIdRef = React.useRef<string | null>(null)

  const [filters, setFilters] = useState<FinanceFilters>(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    const currentYear = now.getFullYear().toString()
    return {
      startDate: firstDay,
      endDate: lastDay,
      type: 'ALL',
      years: [currentYear],
      months: [(now.getMonth() + 1).toString().padStart(2, '0')],
      dayFilter: 'ALL',
      statuses: ['REALIZADO'],
    }
  })

  const projectId = profile?.app_name || user?.id
  const isMasterUser =
    profile?.is_super_admin ||
    profile?.role === 'admin' ||
    profile?.role === 'Master' ||
    profile?.role === 'Administrador'

  useEffect(() => {
    if (user && (profile || isMasterUser) && projectId) {
      fetchData()
    } else if (!user) {
      setTransactions([])
      setMonthlyMetrics([])
      setAccounts(ACCOUNTS)
      setLoadingData(false)
    }
  }, [user, profile?.app_name, projectId, isMasterUser])

  const fetchData = async (force: boolean = false) => {
    if (!user || (!profile && !isMasterUser) || !projectId) return

    const isNewProject = lastProjectIdRef.current !== projectId && lastProjectIdRef.current !== null
    lastProjectIdRef.current = projectId

    let hasCache = false

    if (force || isNewProject) {
      setTransactions([])
      setMonthlyMetrics([])
    } else {
      // Load from cache first for instant UI response (Performance Optimization)
      try {
        // Clean up old cache keys to prevent vitiated data from previous bugs
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith('finance_tx_cache_') ||
            key.startsWith('finance_metrics_cache_') ||
            key.startsWith('v2_finance_tx_cache_') ||
            key.startsWith('v2_finance_metrics_cache_') ||
            key.startsWith('v3_finance_tx_cache_') ||
            key.startsWith('v3_finance_metrics_cache_') ||
            key.startsWith('v4_finance_tx_cache_') ||
            key.startsWith('v4_finance_metrics_cache_') ||
            key.startsWith('v5_finance_tx_cache_') ||
            key.startsWith('v5_finance_metrics_cache_')
          ) {
            localStorage.removeItem(key)
          }
        })
        sessionStorage.clear() // Force clear session storage to remove stale queries if any

        const cachedTx = localStorage.getItem(`v6_finance_tx_cache_${user.id}_${projectId}`)
        if (cachedTx) {
          if (transactions.length === 0) setTransactions(JSON.parse(cachedTx))
          hasCache = true
        }
        const cachedMetrics = localStorage.getItem(
          `v6_finance_metrics_cache_${user.id}_${projectId}`,
        )
        if (cachedMetrics) {
          if (monthlyMetrics.length === 0) setMonthlyMetrics(JSON.parse(cachedMetrics))
          hasCache = true
        }
      } catch (e) {
        console.warn('Cache loading failed', e)
      }
    }

    // Only set loading to true if we don't have cache/existing data or if forcing
    if (force || isNewProject || (!hasCache && transactions.length === 0)) {
      setLoadingData(true)
    }

    const txQuery = supabase
      .from('transactions')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    const fetchAllTransactions = async (query: any) => {
      let allData: any[] = []
      let page = 0
      const pageSize = 1000
      while (true) {
        const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1)
        if (error) break
        if (data && data.length > 0) {
          allData = [...allData, ...data]
          if (data.length < pageSize) break
          page++
        } else {
          break
        }
      }
      return allData
    }

    const metricQuery = supabase
      .from('monthly_metrics')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .limit(5000)

    const [txData, settingsRes, metricsRes] = await Promise.all([
      fetchAllTransactions(txQuery),
      supabase
        .from('user_settings')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      metricQuery,
    ])

    let parsedTx: Transaction[] = []
    let parsedMetrics: MonthlyMetric[] = []

    if (txData) {
      parsedTx = txData.map((d: any) => ({
        id: d.id,
        date: d.date || '',
        description: d.description || '',
        amount: Number(d.amount) || 0,
        type: mapTypeFromDB(d.type, d.category) as any,
        categoryId: mapCategoryFromDB(d.category),
        subcategoryId: d.subcategory || '',
        accountId: mapAccountFromDB(d.account),
        paymentMethodId: mapPaymentMethodFromDB(d.payment_method),
        status: (d.status || 'REALIZADO').toUpperCase() as any,
        tags: d.tags || '',
      }))
      if (user?.id)
        localStorage.setItem(
          `v6_finance_tx_cache_${user.id}_${projectId}`,
          JSON.stringify(parsedTx),
        )
    }

    if (metricsRes.data) {
      parsedMetrics = metricsRes.data.map((m: any) => ({
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
        vendas_revenda: Number(m.vendas_revenda || 0),
        custo_revenda: Number(m.custo_revenda || 0),
        colaboradores_capsulas: Number(m.colaboradores_capsulas || 0),
        colaboradores_dermato: Number(m.colaboradores_dermato || 0),
        colaboradores_vendas: Number(m.colaboradores_vendas || 0),
        meta_vendas_manipulacao: Number(m.meta_vendas_manipulacao || 0),
        meta_vendas_extra: Number(m.meta_vendas_extra || 0),
        meta_vendas_sistema_manipulacao: Number(m.meta_vendas_sistema_manipulacao || 0),
        meta_vendas_sistema_revenda: Number(m.meta_vendas_sistema_revenda || 0),
      }))
      if (user?.id)
        localStorage.setItem(
          `v6_finance_metrics_cache_${user.id}_${projectId}`,
          JSON.stringify(parsedMetrics),
        )
    }

    setIsDemoMode(false)
    setTransactions(parsedTx)
    setMonthlyMetrics(parsedMetrics)

    let accBalances = { conta_principal: 0 }
    if (settingsRes.data) {
      setHasUserSettings(true)
      const data = settingsRes.data as any
      accBalances = {
        conta_principal: Number(data.initial_balance_sicredi || 0),
      }
    } else {
      setHasUserSettings(false)
    }

    setAccounts([
      {
        id: 'conta_principal',
        name: 'Conta Principal',
        initialBalance: accBalances.conta_principal,
      },
    ])

    setLoadingData(false)
  }

  const setFilter = (key: keyof FinanceFilters, values: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: values }
      if (key === 'startDate' && typeof values === 'string') {
        const datePart = values.split('T')[0]
        if (datePart && datePart.length >= 10) {
          const parts = datePart.split('-')
          if (parts.length >= 3) {
            newFilters.years = [parts[0]]
            newFilters.months = [parts[1]]
          }
        }
      }
      return newFilters
    })
  }

  const logAction = async (action: string, entity: string, entity_id?: string, details?: any) => {
    if (!user || !profile) return
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        project_id: projectId,
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
    if (!user || !profile) return
    const dbType = mapTypeToDB(tx.type)
    const formattedDate = ensureUtcNoon(tx.date)

    const payload: any = {
      user_id: user.id,
      project_id: projectId,
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
        type: mapTypeFromDB(data.type, data.category) as any,
        categoryId: mapCategoryFromDB(data.category),
        subcategoryId: (data as any).subcategory || '',
        accountId: mapAccountFromDB(data.account),
        paymentMethodId: mapPaymentMethodFromDB((data as any).payment_method),
        status: (data.status || 'REALIZADO').toUpperCase() as any,
        tags: (data as any).tags || '',
      }
      if (isDemoModeRef.current) {
        setIsDemoMode(false)
        setMonthlyMetrics([])
        setTransactions([newTx])
        if (user?.id)
          localStorage.setItem(
            `v6_finance_tx_cache_${user.id}_${projectId}`,
            JSON.stringify([newTx]),
          )
      } else {
        setTransactions((prev) => {
          const updated = [newTx, ...prev]
          if (user?.id)
            localStorage.setItem(
              `v6_finance_tx_cache_${user.id}_${projectId}`,
              JSON.stringify(updated),
            )
          return updated
        })
      }
      await logAction('CRIAR', 'Transação', data.id, {
        description: data.description,
        amount: data.amount,
        type: data.type,
      })
    } else if (error) throw error
  }

  const updateTransaction = async (id: string, tx: Partial<Omit<Transaction, 'id'>>) => {
    if (!user || !profile) return
    const original = transactions.find((t) => t.id === id)
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
      setTransactions((prev) => {
        const updated = prev.map((t) =>
          t.id === id
            ? {
                ...t,
                date: data.date,
                description: data.description,
                amount: Number(data.amount),
                type: mapTypeFromDB(data.type, data.category) as any,
                categoryId: mapCategoryFromDB(data.category),
                subcategoryId: (data as any).subcategory || '',
                accountId: mapAccountFromDB(data.account),
                paymentMethodId: mapPaymentMethodFromDB((data as any).payment_method),
                status: (data.status || 'REALIZADO').toUpperCase() as any,
                tags: (data as any).tags || '',
              }
            : t,
        )
        if (user?.id)
          localStorage.setItem(
            `v6_finance_tx_cache_${user.id}_${projectId}`,
            JSON.stringify(updated),
          )
        return updated
      })
      await logAction('ATUALIZAR', 'Transação', id, {
        original: original
          ? {
              description: original.description,
              amount: original.amount,
              type: original.type,
              status: original.status,
              date: original.date,
            }
          : null,
        updated: {
          description: data.description,
          amount: data.amount,
          type: data.type,
          status: data.status,
          date: data.date,
        },
      })
    } else if (error) throw error
  }

  const deleteTransaction = async (id: string) => {
    if (!user || !profile) return
    const original = transactions.find((t) => t.id === id)
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) {
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id)
        if (user?.id)
          localStorage.setItem(
            `v6_finance_tx_cache_${user.id}_${projectId}`,
            JSON.stringify(updated),
          )
        return updated
      })
      await logAction('EXCLUIR', 'Transação', id, {
        deleted_data: original
          ? {
              description: original.description,
              amount: original.amount,
              type: original.type,
              status: original.status,
              date: original.date,
            }
          : null,
      })
    } else throw error
  }

  const saveMonthlyMetric = async (metric: Omit<MonthlyMetric, 'id'>) => {
    if (!user || !profile) return

    const existing = monthlyMetrics.find((m) => m.month === metric.month && m.year === metric.year)

    const orders_count = (metric.num_formulas_capsulas || 0) + (metric.num_formulas_dermato || 0)
    const total_system_sales = (metric.vendas_capsulas || 0) + (metric.vendas_dermato || 0)
    const raw_material_costs =
      (metric.custo_mp_emb_capsulas || 0) + (metric.custo_mp_emb_dermato || 0)

    const payload = {
      project_id: projectId,
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
      vendas_revenda: metric.vendas_revenda || 0,
      custo_revenda: metric.custo_revenda || 0,
      colaboradores_capsulas: metric.colaboradores_capsulas || 0,
      colaboradores_dermato: metric.colaboradores_dermato || 0,
      colaboradores_vendas: metric.colaboradores_vendas || 0,
      meta_vendas_manipulacao:
        metric.meta_vendas_manipulacao !== undefined
          ? metric.meta_vendas_manipulacao
          : existing?.meta_vendas_manipulacao || 0,
      meta_vendas_extra:
        metric.meta_vendas_extra !== undefined
          ? metric.meta_vendas_extra
          : existing?.meta_vendas_extra || 0,
      meta_vendas_sistema_manipulacao:
        metric.meta_vendas_sistema_manipulacao !== undefined
          ? metric.meta_vendas_sistema_manipulacao
          : existing?.meta_vendas_sistema_manipulacao || 0,
      meta_vendas_sistema_revenda:
        metric.meta_vendas_sistema_revenda !== undefined
          ? metric.meta_vendas_sistema_revenda
          : existing?.meta_vendas_sistema_revenda || 0,
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
      const newMetric = {
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
        vendas_revenda: Number(data.vendas_revenda || 0),
        custo_revenda: Number(data.custo_revenda || 0),
        colaboradores_capsulas: Number(data.colaboradores_capsulas || 0),
        colaboradores_dermato: Number(data.colaboradores_dermato || 0),
        colaboradores_vendas: Number(data.colaboradores_vendas || 0),
        meta_vendas_manipulacao: Number(data.meta_vendas_manipulacao || 0),
        meta_vendas_extra: Number(data.meta_vendas_extra || 0),
        meta_vendas_sistema_manipulacao: Number(data.meta_vendas_sistema_manipulacao || 0),
        meta_vendas_sistema_revenda: Number(data.meta_vendas_sistema_revenda || 0),
      }

      if (isDemoModeRef.current) {
        setIsDemoMode(false)
        setTransactions([])
        setMonthlyMetrics([newMetric])
        if (user?.id)
          localStorage.setItem(
            `v6_finance_metrics_cache_${user.id}_${projectId}`,
            JSON.stringify([newMetric]),
          )
      } else {
        setMonthlyMetrics((prev) => {
          const filtered = prev.filter((m) => m.id !== data.id)
          const updated = [...filtered, newMetric]
          if (user?.id)
            localStorage.setItem(
              `v6_finance_metrics_cache_${user.id}_${projectId}`,
              JSON.stringify(updated),
            )
          return updated
        })
      }
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
    if (!user || !profile) return []

    let allData: any[] = []
    let page = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .gte('date', `${startDate}T00:00:00.000-03:00`)
        .lte('date', `${endDate}T23:59:59.999-03:00`)
        .order('date', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (type === 'INCOME') {
        query = query.eq('type', 'receita')
      } else if (type === 'EXPENSE') {
        query = query.eq('type', 'despesa')
      } else if (type === 'CORTESIA') {
        query = query.eq('type', 'cortesia')
      } else if (type === 'PARTNER_WITHDRAWAL') {
        query = query.eq('type', 'retirada_socios')
      } else if (type === 'INVESTIMENTO') {
        query = query.eq('type', 'investimento')
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching transactions for export:', error)
        break
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data]
        if (data.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }

    return allData
      .filter((d: any) => (d.status || 'REALIZADO').toUpperCase() === 'REALIZADO')
      .map((d: any) => ({
        id: d.id,
        date: d.date || '',
        description: d.description || '',
        amount: Number(d.amount) || 0,
        type: mapTypeFromDB(d.type, d.category) as any,
        categoryId: mapCategoryFromDB(d.category),
        subcategoryId: d.subcategory || '',
        accountId: mapAccountFromDB(d.account),
        paymentMethodId: mapPaymentMethodFromDB(d.payment_method),
        status: (d.status || 'REALIZADO').toUpperCase() as any,
        tags: d.tags || '',
      }))
  }

  const updateAccountInitialBalances = async (balances: Record<string, number>) => {
    if (!user || !profile) return { error: 'Not authenticated' }

    const payload: any = {
      user_id: user.id,
      project_id: projectId,
      initial_balance_sicredi: balances.conta_principal ?? balances.sicredi ?? 0,
      initial_balance_dinheiro: balances.dinheiro ?? 0,
      initial_balance_stone: balances.stone ?? 0,
      initial_balance_pagbank: balances.pagbank ?? 0,
      initial_balance_pix: balances.pix ?? 0,
      initial_balance_banricompras: balances.banricompras ?? 0,
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
      if (!tx || !tx.date) return false

      try {
        let txYear, txMonth
        const datePart = tx.date.split('T')[0]
        const parts = datePart.split('-')
        if (parts.length < 3) return false
        txYear = parts[0]
        txMonth = parts[1]

        if (filters.years && filters.years.length > 0 && !filters.years.includes(txYear))
          return false
        if (filters.months && filters.months.length > 0 && !filters.months.includes(txMonth))
          return false

        return true
      } catch (e) {
        return false
      }
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
        isTransactionSheetOpen,
        setTransactionSheetOpen,
        editingTransaction,
        setEditingTransaction,
        isDemoMode,
        hasUserSettings,
        completeOnboarding,
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
