import { Account, Category, Transaction } from '@/types/finance'
import { addDays, format, subMonths } from 'date-fns'

export const ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Dinheiro', initialBalance: 15000 },
  { id: 'acc2', name: 'Stone', initialBalance: 25000 },
  { id: 'acc3', name: 'Pagbank', initialBalance: 10000 },
  { id: 'acc4', name: 'PIX', initialBalance: 50000 },
]

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Receita com Produtos', type: 'INCOME', isVariable: false },
  { id: 'cat2', name: 'Receita com Serviços', type: 'INCOME', isVariable: false },
  { id: 'cat3', name: 'Outras Receitas', type: 'INCOME', isVariable: false },
  { id: 'cat4', name: 'Custos com Produtos', type: 'EXPENSE', isVariable: true },
  { id: 'cat5', name: 'Despesas com Pessoal', type: 'EXPENSE', isVariable: false },
  { id: 'cat6', name: 'Despesas Administrativas', type: 'EXPENSE', isVariable: false },
  { id: 'cat7', name: 'Investimentos em Marketing', type: 'EXPENSE', isVariable: true },
]

// Generate 300 random transactions for the last 24 months
export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = []
  const today = new Date('2023-12-31') // Fixed end date to match 2023 data assumption

  for (let i = 0; i < 300; i++) {
    const isIncome = Math.random() > 0.6
    const catList = CATEGORIES.filter((c) => c.type === (isIncome ? 'INCOME' : 'EXPENSE'))
    const category = catList[Math.floor(Math.random() * catList.length)]
    const date = addDays(
      subMonths(today, Math.floor(Math.random() * 24)),
      -Math.floor(Math.random() * 30),
    )

    let status: 'PREVISTO' | 'REALIZADO' | 'VENCIDO' = 'REALIZADO'
    if (date > new Date('2023-10-01')) {
      status = Math.random() > 0.5 ? 'PREVISTO' : Math.random() > 0.8 ? 'VENCIDO' : 'REALIZADO'
    }

    transactions.push({
      id: `trx-${i}`,
      date: format(date, 'yyyy-MM-dd'),
      description: `Transação Mockada ${i}`,
      amount: Math.floor(Math.random() * (isIncome ? 15000 : 8000)) + 100,
      type: isIncome ? 'INCOME' : 'EXPENSE',
      categoryId: category.id,
      accountId: ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)].id,
      status,
    })
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const INITIAL_TRANSACTIONS = generateMockTransactions()
