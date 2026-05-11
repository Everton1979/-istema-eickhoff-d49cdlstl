import { useFinanceStore } from '@/stores/financeStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ListFilter, Wallet, CalendarDays } from 'lucide-react'
import { useMemo } from 'react'

export function SidebarFilters() {
  const { filters, setFilter, filteredTransactions } = useFinanceStore()

  const toggleMonth = (m: string) => {
    setFilter('months', filters.months.includes(m) ? [] : [m])
  }

  const isPeriodActive = (vals: string[]) => {
    if (filters.months.length !== vals.length) return false
    return vals.every((v) => filters.months.includes(v))
  }

  const summary = useMemo(() => {
    let entradas = 0
    let saidas = 0

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') entradas += tx.amount
      else saidas += tx.amount
    })

    return { entradas, saidas, saldo: entradas - saidas }
  }, [filteredTransactions])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-2 border-b pb-1">
        <ListFilter className="w-3 h-3" /> {title}
      </div>
      {children}
    </div>
  )

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const monthLabels = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ]

  return (
    <ScrollArea className="h-full bg-blue-50/50 p-3 rounded-bl-md border-r min-w-[200px]">
      <div className="mb-4">
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-2 border-b pb-1">
          <CalendarDays className="w-3 h-3" /> Período
        </div>
        <Tabs defaultValue="meses" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-slate-200/50 gap-1 mb-3">
            <TabsTrigger
              value="meses"
              className="text-[9px] py-1 px-0.5 data-[state=active]:bg-[#5f9ea0] data-[state=active]:text-white"
            >
              Meses
            </TabsTrigger>
            <TabsTrigger
              value="anual"
              className="text-[9px] py-1 px-0.5 data-[state=active]:bg-[#5f9ea0] data-[state=active]:text-white"
            >
              Anual
            </TabsTrigger>
            <TabsTrigger
              value="semestres"
              className="text-[9px] py-1 px-0.5 data-[state=active]:bg-[#5f9ea0] data-[state=active]:text-white"
            >
              Semestres
            </TabsTrigger>
            <TabsTrigger
              value="trimestres"
              className="text-[9px] py-1 px-0.5 data-[state=active]:bg-[#5f9ea0] data-[state=active]:text-white"
            >
              Trimestres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meses" className="mt-0">
            <div className="grid grid-cols-3 gap-1">
              {months.map((m, i) => (
                <button
                  key={m}
                  onClick={() => toggleMonth(m)}
                  className={cn(
                    'text-[10px] py-1.5 rounded-sm text-center transition-colors border',
                    filters.months.includes(m) && filters.months.length === 1
                      ? 'bg-[#5f9ea0] text-white font-medium border-transparent'
                      : filters.months.includes(m)
                        ? 'bg-[#5f9ea0]/80 text-white font-medium border-transparent'
                        : 'bg-white hover:bg-gray-100',
                  )}
                >
                  {monthLabels[i]}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anual" className="mt-0">
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => setFilter('months', months)}
                className={cn(
                  'text-xs py-2 rounded-sm text-center transition-colors border',
                  isPeriodActive(months)
                    ? 'bg-[#5f9ea0] text-white font-medium border-transparent'
                    : 'bg-white hover:bg-gray-100',
                )}
              >
                Ano Completo
              </button>
            </div>
          </TabsContent>

          <TabsContent value="semestres" className="mt-0">
            <div className="grid grid-cols-1 gap-1">
              {[
                { label: '1º Semestre', vals: ['01', '02', '03', '04', '05', '06'] },
                { label: '2º Semestre', vals: ['07', '08', '09', '10', '11', '12'] },
              ].map((sem) => (
                <button
                  key={sem.label}
                  onClick={() => setFilter('months', sem.vals)}
                  className={cn(
                    'text-xs py-2 rounded-sm text-center transition-colors border',
                    isPeriodActive(sem.vals)
                      ? 'bg-[#5f9ea0] text-white font-medium border-transparent'
                      : 'bg-white hover:bg-gray-100',
                  )}
                >
                  {sem.label}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trimestres" className="mt-0">
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: '1º Trim', vals: ['01', '02', '03'] },
                { label: '2º Trim', vals: ['04', '05', '06'] },
                { label: '3º Trim', vals: ['07', '08', '09'] },
                { label: '4º Trim', vals: ['10', '11', '12'] },
              ].map((trim) => (
                <button
                  key={trim.label}
                  onClick={() => setFilter('months', trim.vals)}
                  className={cn(
                    'text-[10px] py-2 rounded-sm text-center transition-colors border',
                    isPeriodActive(trim.vals)
                      ? 'bg-[#5f9ea0] text-white font-medium border-transparent'
                      : 'bg-white hover:bg-gray-100',
                  )}
                >
                  {trim.label}
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4 px-1">
        <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-blue-500" /> Resumo Rápido
        </h3>
        <div className="flex flex-col gap-2">
          <div className="bg-white p-2 rounded-sm border border-emerald-100 shadow-sm flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Entradas</span>
            <span className="text-xs font-bold text-emerald-600 leading-none">
              {formatCurrency(summary.entradas)}
            </span>
          </div>
          <div className="bg-white p-2 rounded-sm border border-red-100 shadow-sm flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5 leading-tight">
              Saídas
            </span>
            <span className="text-xs font-bold text-red-500 leading-none mt-1">
              {formatCurrency(summary.saidas)}
            </span>
          </div>
          <div
            className={cn(
              'bg-white p-2 rounded-sm border shadow-sm flex flex-col mt-1',
              summary.saldo >= 0 ? 'border-blue-100' : 'border-orange-100',
            )}
          >
            <span className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">
              Saldo Filtrado
            </span>
            <span
              className={cn(
                'text-xs font-bold leading-none',
                summary.saldo >= 0 ? 'text-blue-600' : 'text-orange-600',
              )}
            >
              {formatCurrency(summary.saldo)}
            </span>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
