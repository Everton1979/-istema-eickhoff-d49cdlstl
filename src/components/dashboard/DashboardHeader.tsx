import { useFinanceStore } from '@/stores/financeStore'
import { MonthlyDataDialog } from './MonthlyDataDialog'
import { useAuth } from '@/hooks/use-auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
        <h1 className="text-xl font-bold text-slate-800">Painel Geral</h1>
        <p className="text-sm text-slate-500">Visão geral e indicadores de performance</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.months[0] || ''} onValueChange={(v) => setFilter('months', [v])}>
          <SelectTrigger className="h-11 w-[140px] text-sm bg-slate-50 border-slate-200">
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

        <Select value={filters.years[0] || ''} onValueChange={(v) => setFilter('years', [v])}>
          <SelectTrigger className="h-11 w-[110px] text-sm bg-slate-50 border-slate-200">
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
