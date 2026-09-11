import { useMemo } from 'react'
import { Transaction } from '@/types/finance'

export interface ExpenseCategorizationSuggestion {
  categoryId: string
  subcategoryId: string
  count: number // total de ocorrências anteriores
  categoryLabel?: string
  subcategoryLabel?: string
}

/**
 * Normaliza uma descrição para comparação:
 * remove acentos, múltiplos espaços em branco e passa para maiúsculas.
 */
export function normalizeDescription(desc: string | null | undefined): string {
  if (!desc) return ''
  return desc
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

/**
 * Hook para inferir sugestão inteligente de categoria e subcategoria
 * para despesas a partir de 2 ou mais lançamentos prévios com a mesma descrição
 * (ou seja, o novo lançamento é o 3º ou subsequente).
 *
 * Em caso de empate de frequência, a ocorrência mais recente prevalece.
 */
export function useExpenseAutoCategorize(
  transactions: Transaction[],
  currentDescription: string | null | undefined,
  currentType: string,
  excludeTransactionId?: string | null,
): ExpenseCategorizationSuggestion | null {
  return useMemo(() => {
    // Aplicar apenas a despesas
    if (currentType !== 'EXPENSE') return null

    const normalizedTarget = normalizeDescription(currentDescription)
    // Exige descrição de pelo menos 2 caracteres úteis
    if (!normalizedTarget || normalizedTarget.length < 2) return null

    // Filtra transações anteriores de despesa correspondentes
    // Exclui a transação atual se estiver em modo de edição
    const matchingExpenses = transactions.filter((tx) => {
      if (excludeTransactionId && tx.id === excludeTransactionId) return false
      if (tx.type !== 'EXPENSE') return false
      if (!tx.categoryId || !tx.subcategoryId) return false
      return normalizeDescription(tx.description) === normalizedTarget
    })

    // Regra: a partir do 3º lançamento (já existem 2 ou mais lançamentos anteriores)
    if (matchingExpenses.length < 2) {
      return null
    }

    // Ordenar decrescente por data para desempatar pela mais recente
    const sortedExpenses = [...matchingExpenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    // Agrupar por par "categoryId:::subcategoryId"
    const frequencyMap = new Map<
      string,
      { categoryId: string; subcategoryId: string; count: number; latestDate: number }
    >()

    for (const tx of sortedExpenses) {
      const key = `${tx.categoryId}:::${tx.subcategoryId}`
      const dateTs = new Date(tx.date).getTime()
      const existing = frequencyMap.get(key)
      if (existing) {
        existing.count += 1
        if (dateTs > existing.latestDate) {
          existing.latestDate = dateTs
        }
      } else {
        frequencyMap.set(key, {
          categoryId: tx.categoryId,
          subcategoryId: tx.subcategoryId,
          count: 1,
          latestDate: dateTs,
        })
      }
    }

    let bestPair: {
      categoryId: string
      subcategoryId: string
      count: number
      latestDate: number
    } | null = null

    for (const item of frequencyMap.values()) {
      if (!bestPair) {
        bestPair = item
      } else if (item.count > bestPair.count) {
        bestPair = item
      } else if (item.count === bestPair.count && item.latestDate > bestPair.latestDate) {
        // Empate de frequência: escolhe a usada mais recentemente (aprendizado de correções)
        bestPair = item
      }
    }

    if (!bestPair) return null

    return {
      categoryId: bestPair.categoryId,
      subcategoryId: bestPair.subcategoryId,
      count: matchingExpenses.length,
    }
  }, [transactions, currentDescription, currentType, excludeTransactionId])
}
