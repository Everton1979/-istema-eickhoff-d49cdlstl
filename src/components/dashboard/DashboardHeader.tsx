import { useFinanceStore } from '@/stores/financeStore'
import { useAuth } from '@/hooks/use-auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BackupDataButton } from './BackupDataButton'
import { Link } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, UserCircle, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const MONTHS = [
  { label: 'Janeiro', value: '01' },
  { label: 'Fevereiro', value: '02' },
  { label: 'Março', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Maio', value: '05' },
  { label: 'Junho', value: '06' },
  { label: 'Julho', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Setembro', value: '09' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
]

export function DashboardHeader() {
  const financeStore = useFinanceStore()
  const { signOut } = useAuth()

  const filters = financeStore.filters
  const setFilter = financeStore.setFilter

  const currentYear = new Date().getFullYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => (currentYear - 3 + i).toString())

  const activeMonth = filters.months.length === 1 ? filters.months[0] : ''
  const activeYear = filters.years.length === 1 ? filters.years[0] : ''

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-b-4 border-blue-600 dark:border-blue-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400 shrink-0">
          <LayoutDashboard className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Painel Geral
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Select value={activeMonth} onValueChange={(val) => setFilter('months', [val])}>
              <SelectTrigger className="h-8 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 w-[120px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeYear} onValueChange={(val) => setFilter('years', [val])}>
              <SelectTrigger className="h-8 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 w-[90px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
