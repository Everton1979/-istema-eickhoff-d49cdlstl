import { Account, Category, CostCenter, Transaction } from '@/types/finance'
import { addDays, format, subMonths } from 'date-fns'

export const ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Itaú', initialBalance: 150635 },
  { id: 'acc2', name: 'Caixa', initialBalance: 76266 },
  { id: 'acc3', name: 'Nuconta', initialBalance: 41087 },
  { id: 'acc4', name: 'SICOOB', initialBalance: 20282 },
  { id: 'acc5', name: 'BB', initialBalance: -46126 },
]

export const COST_CENTERS: CostCenter[] = [
  { id: 'cc1', name: 'Vendas' },
  { id: 'cc2', name: 'R&D' },
  { id: 'cc3', name: 'Lab' },
  { id: 'cc4', name: 'Adm' },
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

// Generate 200 random transactions for the last 12 months
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
      costCenterId: COST_CENTERS[Math.floor(Math.random() * COST_CENTERS.length)].id,
      status,
    })
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const INITIAL_TRANSACTIONS = generateMockTransactions()
