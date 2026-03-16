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

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  categoryId: string
  accountId: string
  status: TransactionStatus
}
