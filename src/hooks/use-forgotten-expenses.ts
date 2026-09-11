import { useMemo } from 'react'
import { Transaction } from '@/types/finance'
import { normalizeDescription } from '@/hooks/use-expense-auto-categorize'

export interface ForgottenExpenseItem {
  key: string
  description: string
  lastMonthDate: string // YYYY-MM-DD da última ocorrência no mês anterior
  lastMonthDay: number // dia do mês (1 a 31)
  lastMonthAmount: number
  categoryId: string
  subcategoryId?: string
}

/**
 * Normaliza data no formato local/UTC pegando ano, mês e dia com segurança.
 */
function parseDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.substring(0, 10)
  const parts = clean.split('-')
  if (parts.length < 3) return null
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // 0-indexed
  const day = parseInt(parts[2], 10)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  return { year, month, day }
}

/**
 * Hook para detectar despesas recorrentes/fixas do mês anterior que ainda não foram
 * lançadas no mês atual após (ou no próprio) dia do vencimento/lançamento anterior.
 *
 * Regra:
 * - Para cada descrição de despesa FIXA lançada no mês anterior (ou identificada como recorrente).
 * - Se hoje é o mesmo dia do mês (ou já passou dele) e a despesa ainda NÃO foi lançada no mês atual:
 *   disparar o alerta.
 * - Comparação de descrição ignora acentos, espaços duplicados e caixa alta (normalizeDescription).
 */
export function useForgottenExpenses(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): ForgottenExpenseItem[] {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    const currentYear = referenceDate.getFullYear()
    const currentMonth = referenceDate.getMonth() // 0-indexed
    const currentDay = referenceDate.getDate()

    // Determina o ano e mês anterior
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1

    // 1. Coleta todas as despesas lançadas no mês atual (para checagem rápida)
    const currentMonthDescriptions = new Set<string>()
    for (const tx of transactions) {
      if (tx.type !== 'EXPENSE') continue
      const parsed = parseDateParts(tx.date)
      if (!parsed) continue
      if (parsed.year === currentYear && parsed.month === currentMonth) {
        const norm = normalizeDescription(tx.description)
        if (norm) {
          currentMonthDescriptions.add(norm)
        }
      }
    }

    // 2. Coleta despesas fixas/recorrentes lançadas no mês anterior
    // Agrupa pela descrição normalizada guardando a ocorrência mais recente do mês anterior
    const prevMonthExpenses = new Map<string, ForgottenExpenseItem>()

    for (const tx of transactions) {
      if (tx.type !== 'EXPENSE') continue

      // Considera despesas da categoria FIXA ou com tag "FIXA" / "Despesa Fixa"
      const isFixed =
        tx.categoryId === 'FIXA' ||
        String(tx.category || '')
          .toUpperCase()
          .includes('FIXA') ||
        String(tx.tags || '')
          .toUpperCase()
          .includes('FIXA')

      if (!isFixed) continue

      const parsed = parseDateParts(tx.date)
      if (!parsed) continue

      if (parsed.year === prevYear && parsed.month === prevMonth) {
        const norm = normalizeDescription(tx.description)
        if (!norm || norm.length < 2) continue

        const existing = prevMonthExpenses.get(norm)
        if (!existing || parsed.day > existing.lastMonthDay) {
          prevMonthExpenses.set(norm, {
            key: norm,
            description: (tx.description || '').trim().toUpperCase(),
            lastMonthDate: tx.date.includes('T') ? tx.date.split('T')[0] : tx.date.substring(0, 10),
            lastMonthDay: parsed.day,
            lastMonthAmount: Number(tx.amount) || 0,
            categoryId: tx.categoryId,
            subcategoryId: tx.subcategoryId,
          })
        }
      }
    }

    // 3. Filtra apenas as que:
    // a) Hoje >= dia em que foi lançada no mês anterior (ou já passou dele)
    // b) Ainda NÃO foi lançada no mês atual
    const pendingList: ForgottenExpenseItem[] = []

    for (const [norm, item] of prevMonthExpenses.entries()) {
      if (!currentMonthDescriptions.has(norm)) {
        if (currentDay >= item.lastMonthDay) {
          pendingList.push(item)
        }
      }
    }

    // Ordena pelo dia em que deveria ter sido lançada (mais atrasadas primeiro)
    pendingList.sort((a, b) => a.lastMonthDay - b.lastMonthDay)

    return pendingList
  }, [transactions, referenceDate])
}
