import { useFinanceStore } from '@/stores/financeStore'
import { Bell, AlertCircle, Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { useMemo } from 'react'

export function ExpirationAlerts() {
  const { transactions } = useFinanceStore()

  const alerts = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const pending = transactions.filter((t) => t.status !== 'REALIZADO')
    const dueToday: typeof transactions = []
    const overdue: typeof transactions = []

    pending.forEach((t) => {
      const d = new Date(t.date)
      d.setHours(0, 0, 0, 0)
      if (d < today || t.status === 'VENCIDO') {
        overdue.push(t)
      } else if (d.getTime() === today.getTime()) {
        dueToday.push(t)
      }
    })

    return {
      dueToday: dueToday.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      overdue: overdue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      total: dueToday.length + overdue.length,
    }
  }, [transactions])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-white hover:bg-white/20"
        >
          <Bell className="h-4 w-4" />
          {alerts.total > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#1e3a5f]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-slate-200">
        <div className="bg-slate-200 border-b px-4 py-3 flex items-center justify-between rounded-t-md">
          <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" /> Alertas
          </h4>
          <Badge variant="secondary" className="bg-slate-300 hover:bg-slate-300 text-slate-700">
            {alerts.total}
          </Badge>
        </div>

        <ScrollArea className="h-[300px]">
          {alerts.total === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
              <div className="bg-slate-200 p-3 rounded-full">
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-bold">Nenhum alerta no momento.</p>
              <p className="text-xs font-bold">Tudo em dia!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.overdue.length > 0 && (
                <div className="p-2 bg-red-200/50">
                  <div className="text-[10px] font-bold text-red-800 uppercase px-2 py-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Vencidos ({alerts.overdue.length})
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {alerts.overdue.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-2 rounded-sm border border-red-100 flex justify-between items-center shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {t.description}
                          </p>
                          <p className="text-[10px] text-red-600 font-bold mt-0.5">
                            Venceu em {format(new Date(t.date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                  <div className="p-2 bg-red-200/50">
                  <div className="text-[10px] font-bold text-red-800 uppercase px-2 py-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Vencidos ({alerts.overdue.length})
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {alerts.overdue.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-2 rounded-sm border border-red-100 flex justify-between items-center shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {t.description}
                          </p>
                          <p className="text-[10px] text-red-600 font-bold mt-0.5">
                            Venceu em {format(new Date(t.date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-800">
                            {formatCurrency(t.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alerts.dueToday.length > 0 && (
                <div className="p-2 bg-yellow-200/50">
                  <div className="text-[10px] font-bold text-amber-800 uppercase px-2 py-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Vence Hoje ({alerts.dueToday.length})
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {alerts.dueToday.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-2 rounded-sm border border-amber-100 flex justify-between items-center shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {t.description}
                          </p>
                          <p className="text-[10px] text-amber-600 font-bold mt-0.5">Previsto</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-800">
                            {formatCurrency(t.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
