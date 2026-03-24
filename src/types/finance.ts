export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionStatus = 'PREVISTO' | 'REALIZADO' | 'VENCIDO'

export interface Category {
  id: string
  name: string
  type: TransactionType
  isVariable: boolean
}

export interface Account {
  id: string
  name: string
  initialBalance: number
}

export interface PaymentMethod {
  id: string
  name: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  categoryId: string
  accountId: string
  paymentMethodId?: string
  status: TransactionStatus
  tags?: string
}

export interface MonthlyMetric {
  id: string
  month: number
  year: number
  orders_count: number
  total_system_sales: number
  raw_material_costs: number
  sales_target: number
}
