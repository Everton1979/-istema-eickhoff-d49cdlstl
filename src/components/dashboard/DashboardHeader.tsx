import { useFinanceStore } from '@/stores/financeStore'
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
import { BackupDataButton } from './BackupDataButton'
import { Link } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, UserCircle, LogOut } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

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

export function DashboardHeader() {
  const financeStore = useFinanceStore()
  const { signOut } = useAuth()

  const filters = financeStore.filters
  const setFilter = financeStore.setFilter

  const currentYear = new Date().getFullYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString())

  const currentPeriod =
    PERIODS.find((p) => JSON.stringify(p.months) === JSON.stringify(filters.months)) || PERIODS[0]

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-b-4 border-blue-600 dark:border-blue-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400">
          <LayoutDashboard className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Painel Geral
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
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
                  size="sm"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
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
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
        <ThemeToggle />

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/glossario"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Glossário</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/usuarios"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
            >
              <Users className="w-5 h-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Usuários</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/perfil"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
            >
              <UserCircle className="w-5 h-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Perfil</TooltipContent>
        </Tooltip>

        <div className="flex items-center">
          <BackupDataButton />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Sair</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
