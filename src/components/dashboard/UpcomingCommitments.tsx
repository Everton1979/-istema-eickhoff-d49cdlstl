import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarClock, AlertCircle } from 'lucide-react'
import { useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function UpcomingCommitments() {
  const { transactions } = useFinanceStore()

  const upcoming = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const nextWeek = new Date(now)
    nextWeek.setDate(now.getDate() + 7)
    nextWeek.setHours(23, 59, 59, 999)

    return transactions
      .filter((tx) => {
        if (tx.type !== 'EXPENSE' || tx.status !== 'PREVISTO') return false
        const txDate = new Date(tx.date)
        return txDate >= now && txDate <= nextWeek
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5
  }, [transactions])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <Card className="rounded-sm shadow-sm border flex flex-col h-full bg-white relative overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="bg-slate-50 border-b px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700">
            <CalendarClock className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-bold uppercase tracking-wide">Compromissos (7 Dias)</h3>
          </div>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-medium">
            Top 5
          </span>
        </div>

        <ScrollArea className="flex-1">
          {upcoming.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {upcoming.map((tx) => {
                const dueToday = isToday(tx.date)
                return (
                  <div
                    key={tx.id}
                    className="p-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className={cn(
                          'flex flex-col items-center justify-center min-w-[32px] rounded-sm py-0.5 px-1 text-[9px] font-bold text-center leading-tight',
                          dueToday ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        <span>{formatDate(tx.date).split('/')[0]}</span>
                        <span className="text-[8px] font-medium opacity-80">
                          {formatDate(tx.date).split('/')[1]}
                        </span>
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-700 truncate flex items-center gap-1">
                          {tx.description}
                          {dueToday && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          {tx.categoryId === 'FIXA' ? 'Desp. Fixa' : 'Desp. Variável'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-red-600 ml-2 whitespace-nowrap">
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 min-h-[120px]">
              <CalendarClock className="w-6 h-6 mb-1 opacity-20" />
              <p className="text-xs text-center">
                Nenhum compromisso previsto
                <br />
                para os próximos 7 dias.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
