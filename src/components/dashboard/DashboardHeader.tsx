import { useFinanceStore } from '@/stores/financeStore'
import { MonthlyDataDialog } from './MonthlyDataDialog'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ExportReportDialog } from './ExportReportDialog'
import { DREDialog } from './DREDialog'
import { BackupDataButton } from './BackupDataButton'
import { Link } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from '@/components/ThemeToggle'

const PERIODS = [
  { label: 'Janeiro', value: '01', months: ['01'] },
  { label: 'Fevereiro', value: '02', months: ['02'] },
  { label: 'Março', value: '03', months: ['03'] },
  { label: 'Abril', value: '04', months: ['04'] },
  { label: 'Maio', value: '05', months: ['05'] },
  { label: 'Junho', value: '06', months: ['06'] },
  { label: 'Julho', value: '07', months: ['07'] },
  { label: 'Agosto', value: '08', months: ['08'] },
  { label: 'Setembro', value: '09', months: ['09'] },
  { label: 'Outubro', value: '10', months: ['10'] },
  { label: 'Novembro', value: '11', months: ['11'] },
  { label: 'Dezembro', value: '12', months: ['12'] },
  { label: 'Anual', value: 'anual', months: [] },
  { label: '1º Semestre', value: 'sem-1', months: ['01', '02', '03', '04', '05', '06'] },
  { label: '2º Semestre', value: 'sem-2', months: ['07', '08', '09', '10', '11', '12'] },
  { label: '1º Trimestre', value: 'tri-1', months: ['01', '02', '03'] },
  { label: '2º Trimestre', value: 'tri-2', months: ['04', '05', '06'] },
  { label: '3º Trimestre', value: 'tri-3', months: ['07', '08', '09'] },
  { label: '4º Trimestre', value: 'tri-4', months: ['10', '11', '12'] },
]

export function DashboardHeader({ onExport }: { onExport: (filters: any) => void }) {
  const financeStore = useFinanceStore()
  const { profile } = useAuth()

  const filters = financeStore.filters
  const setFilter = financeStore.setFilter

  const currentYear = new Date().getFullYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString())

  const currentPeriod =
    PERIODS.find((p) => JSON.stringify(p.months) === JSON.stringify(filters.months)) || PERIODS[0]

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-2 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          $istema Eickhoff - Painel Geral
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visão geral e indicadores de performance
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-[160px] text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 justify-start font-normal text-slate-700 dark:text-slate-300"
            >
              {currentPeriod.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            <DropdownMenuLabel>Período</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[250px]">
              <DropdownMenuRadioGroup
                value={currentPeriod.value}
                onValueChange={(val) => {
                  const p = PERIODS.find((x) => x.value === val)
                  if (p) setFilter('months', p.months)
                }}
              >
                {PERIODS.map((p) => (
                  <DropdownMenuRadioItem key={p.value} value={p.value}>
                    {p.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-[130px] text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 justify-start font-normal text-slate-700 dark:text-slate-300"
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

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2 flex-wrap">
          <ThemeToggle />
          <Link
            to="/transacoes"
            className="h-11 px-4 flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm font-bold transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transações
          </Link>
          <MonthlyDataDialog />
          <ExportReportDialog onExport={onExport} />
          <BackupDataButton />
          <DREDialog />
        </div>
      </div>
    </div>
  )
}
