import { useFinanceStore } from '@/stores/financeStore'
import { MonthlyDataDialog } from './MonthlyDataDialog'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ExportReportDialog } from './ExportReportDialog'
import { DREDialog } from './DREDialog'
import { MonthlyEvolutionDialog } from './MonthlyEvolutionDialog'
import { BackupDataButton } from './BackupDataButton'
import { Link } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'

const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

export function DashboardHeader({ onExport }: { onExport: (filters: any) => void }) {
  const financeStore = useFinanceStore()
  const { profile } = useAuth()

  const filters = financeStore.filters
  const setFilter = financeStore.setFilter

  const currentYear = new Date().getFullYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString())

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-2 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div>
        <h1 className="text-xl font-bold text-slate-800">$istema Eickhoff - Painel Geral</h1>
        <p className="text-sm text-slate-500">Visão geral e indicadores de performance</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-[140px] text-sm bg-slate-50 border-slate-200 justify-start font-normal text-slate-700"
            >
              {filters.months.length === 0
                ? 'Todos os Meses'
                : filters.months.length === 1
                  ? MONTHS.find((m) => m.value === filters.months[0])?.label
                  : `${filters.months.length} meses`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            <DropdownMenuLabel>Meses</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.months.length === 0}
              onCheckedChange={() => setFilter('months', [])}
            >
              Todos
            </DropdownMenuCheckboxItem>
            {MONTHS.map((m) => (
              <DropdownMenuCheckboxItem
                key={m.value}
                checked={filters.months.includes(m.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilter('months', [...filters.months, m.value])
                  } else {
                    setFilter(
                      'months',
                      filters.months.filter((v) => v !== m.value),
                    )
                  }
                }}
              >
                {m.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-[130px] text-sm bg-slate-50 border-slate-200 justify-start font-normal text-slate-700"
            >
              {filters.years.length === 0
                ? 'Todos os Anos'
                : filters.years.length === 1
                  ? filters.years[0]
                  : `${filters.years.length} anos`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[140px]">
            <DropdownMenuLabel>Anos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.years.length === 0}
              onCheckedChange={() => setFilter('years', [])}
            >
              Todos
            </DropdownMenuCheckboxItem>
            {YEARS.map((y) => (
              <DropdownMenuCheckboxItem
                key={y}
                checked={filters.years.includes(y)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilter('years', [...filters.years, y])
                  } else {
                    setFilter(
                      'years',
                      filters.years.filter((v) => v !== y),
                    )
                  }
                }}
              >
                {y}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/transacoes"
            className="h-11 px-4 flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm font-bold transition-colors mr-1"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transações
          </Link>
          <MonthlyDataDialog />
          <ExportReportDialog onExport={onExport} />
          <BackupDataButton />
          <DREDialog />
          <MonthlyEvolutionDialog />
        </div>
      </div>
    </div>
  )
}
