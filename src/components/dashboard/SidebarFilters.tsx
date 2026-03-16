import { useFinanceStore } from '@/stores/financeStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ListFilter } from 'lucide-react'

export function SidebarFilters() {
  const { filters, setFilter } = useFinanceStore()

  const toggleFilter = (key: keyof typeof filters, value: string) => {
    const current = filters[key] as string[]
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setFilter(key, updated)
  }

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
    <ScrollArea className="h-full bg-blue-50/50 p-3 rounded-bl-md border-r min-w-[180px]">
      <FilterSection title="Ano">
        <div className="flex flex-col gap-1">
          {['2022', '2023'].map((year) => (
            <button
              key={year}
              onClick={() => toggleFilter('years', year)}
              className={cn(
                'text-xs py-1 px-2 rounded-sm text-left transition-colors',
                filters.years.includes(year)
                  ? 'bg-[#5f9ea0] text-white font-medium'
                  : 'bg-white hover:bg-gray-100 border',
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Mês">
        <div className="grid grid-cols-3 gap-1">
          {months.map((m, i) => (
            <button
              key={m}
              onClick={() => toggleFilter('months', m)}
              className={cn(
                'text-[10px] py-1 rounded-sm text-center transition-colors border',
                filters.months.includes(m)
                  ? 'bg-[#5f9ea0] text-white font-medium border-transparent'
                  : 'bg-white hover:bg-gray-100',
              )}
            >
              {monthLabels[i]}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Status">
        <div className="flex flex-col gap-1">
          {['Previsto', 'Realizado', 'Vencido'].map((status) => (
            <button
              key={status}
              onClick={() => toggleFilter('statuses', status.toUpperCase())}
              className={cn(
                'text-xs py-1 px-2 rounded-sm text-left transition-colors border',
                filters.statuses.includes(status.toUpperCase())
                  ? 'bg-[#5f9ea0] text-white font-medium'
                  : 'bg-white hover:bg-gray-100',
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </FilterSection>
    </ScrollArea>
  )
}
