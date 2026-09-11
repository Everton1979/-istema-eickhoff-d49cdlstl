import { useState } from 'react'
import { AlertTriangle, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useForgottenExpenses, ForgottenExpenseItem } from '@/hooks/use-forgotten-expenses'
import { useFinanceStore } from '@/stores/financeStore'

interface ForgottenExpensesAlertProps {
  onAddTransactionWithDescription?: (item: ForgottenExpenseItem) => void
}

/**
 * Formata data no formato DD/MM (ex: "10/07")
 */
function formatDayMonth(dateStr: string): string {
  if (!dateStr) return ''
  const parts = (dateStr.includes('T') ? dateStr.split('T')[0] : dateStr).split('-')
  if (parts.length < 3) return dateStr
  return `${parts[2]}/${parts[1]}`
}

/**
 * Cartão discreto de alerta no topo do Dashboard indicando despesas
 * recorrentes/fixas do mês anterior que ainda não foram lançadas neste mês.
 */
export function ForgottenExpensesAlert({
  onAddTransactionWithDescription,
}: ForgottenExpensesAlertProps) {
  const { transactions, setTransactionSheetOpen } = useFinanceStore()
  const pendingExpenses = useForgottenExpenses(transactions)
  const [expanded, setExpanded] = useState(false)

  if (!pendingExpenses || pendingExpenses.length === 0) {
    return null
  }

  const count = pendingExpenses.length
  // Exibe até 3 despesas diretamente se não estiver expandido
  const visibleExpenses = expanded ? pendingExpenses : pendingExpenses.slice(0, 3)

  const handleLaunch = (item: ForgottenExpenseItem) => {
    if (onAddTransactionWithDescription) {
      onAddTransactionWithDescription(item)
    } else {
      setTransactionSheetOpen(true)
    }
  }

  return (
    <div
      role="region"
      aria-label="Alerta de lançamentos esquecidos"
      className="w-full bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-xl p-4 sm:p-5 shadow-sm text-amber-950 dark:text-amber-100 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-wide uppercase text-amber-900 dark:text-amber-200">
                ALERTA DE LANÇAMENTO ESQUECIDO
              </h3>
              <Badge
                variant="outline"
                className="border-amber-400 bg-amber-100/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-extrabold uppercase px-2 py-0"
              >
                {count} {count === 1 ? 'DESPESA PENDENTE' : 'DESPESAS PENDENTES'}
              </Badge>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
              Despesas fixas do mês anterior que atingiram a data esperada e ainda não foram
              registradas neste mês.
            </p>
          </div>
        </div>

        {count > 3 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="self-start md:self-center h-8 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 uppercase gap-1"
          >
            {expanded ? (
              <>
                VER MENOS <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                VER TODAS ({count}) <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Lista de despesas pendentes */}
      <div className="mt-3.5 pt-3 border-t border-amber-200/80 dark:border-amber-800/40 space-y-2">
        {visibleExpenses.map((item) => (
          <div
            key={item.key}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-amber-200/60 dark:border-amber-800/30 text-xs hover:bg-white dark:hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">⚠️</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium truncate">
                A despesa{' '}
                <strong className="font-bold text-slate-900 dark:text-white">
                  &ldquo;{item.description}&rdquo;
                </strong>{' '}
                ainda não foi lançada neste mês{' '}
                <span className="text-slate-500 dark:text-slate-400">
                  (lançada em {formatDayMonth(item.lastMonthDate)} no mês anterior
                  {item.lastMonthAmount > 0 &&
                    ` — R$ ${item.lastMonthAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  ).
                </span>
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleLaunch(item)}
              className="h-7 px-3 text-[11px] font-bold text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 shrink-0 self-end sm:self-center uppercase flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              LANÇAR AGORA
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
