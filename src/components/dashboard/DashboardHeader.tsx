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
  const { signOut, canManageUsers, isColaborador } = useAuth()
  const isDemo = financeStore.isDemoMode

  const filters = financeStore.filters
  const setFilter = financeStore.setFilter

  const currentYear = new Date().getFullYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => (currentYear - 3 + i).toString())

  const activeMonth = filters.months.length === 1 ? filters.months[0] : ''
  const activeYear = filters.years.length === 1 ? filters.years[0] : ''

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-b-4 border-blue-600 dark:border-blue-500">
      <div className="flex items-center gap-4">
        <div className="p-5 md:p-6 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400 shrink-0">
          <LayoutDashboard className="w-16 h-16 md:w-20 md:h-20" />
        </div>
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Painel Geral
          </h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 md:mt-4">
            <Select value={activeMonth} onValueChange={(val) => setFilter('months', [val])}>
              <SelectTrigger className="h-14 md:h-16 text-lg md:text-xl px-4 font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 w-[160px] md:w-[200px]">
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
              <SelectTrigger className="h-14 md:h-16 text-lg md:text-xl px-4 font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 w-[120px] md:w-[160px]">
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
        {!isColaborador && (
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
        )}

        {!isDemo && canManageUsers && (
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
        )}

        {!isDemo && (
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
        )}

        {!isColaborador && (
          <div className="flex items-center">
            <BackupDataButton />
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            {isDemo ? (
              <button
                onClick={() => {
                  financeStore.setIsDemoMode(false)
                  window.location.href = '/login'
                }}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md text-blue-600 transition-colors flex items-center gap-1 font-semibold text-xs"
                title="Acessar Login"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </TooltipTrigger>
          <TooltipContent>{isDemo ? 'Ir para Login' : 'Sair'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
