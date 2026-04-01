import { useFinanceStore } from '@/stores/financeStore'
import { MonthlyClosingDialog } from './MonthlyClosingDialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Download } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DashboardHeader({ onExport }: { onExport: (filters: any) => void }) {
  const financeStore = useFinanceStore()
  const { profile } = useAuth()

  const filters = financeStore.filters || {}
  const setFilters = financeStore.setFilters

  const currentMonth = (
    filters.months?.[0]?.toString() ||
    filters.month?.toString() ||
    (new Date().getMonth() + 1).toString()
  ).padStart(2, '0')
  const currentYear =
    filters.years?.[0]?.toString() ||
    filters.year?.toString() ||
    new Date().getFullYear().toString()

  const monthsList = [
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

  const yearsList = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

  const handleMonthChange = (value: string) => {
    const numericValue = parseInt(value, 10)
    if (typeof (financeStore as any).setMonth === 'function')
      (financeStore as any).setMonth(numericValue)
    if (typeof setFilters === 'function') {
      setFilters({
        ...filters,
        months: [value],
        month: numericValue,
        period: 'monthly',
        dateRange: undefined,
      })
    }

    // Força atualização dos dados ao trocar o mês
    if (typeof (financeStore as any).fetchTransactions === 'function')
      (financeStore as any).fetchTransactions()
    if (typeof (financeStore as any).fetchMonthlyMetrics === 'function')
      (financeStore as any).fetchMonthlyMetrics()
    if (typeof (financeStore as any).loadData === 'function') (financeStore as any).loadData()
  }

  const handleYearChange = (value: string) => {
    const numericValue = parseInt(value, 10)
    if (typeof (financeStore as any).setYear === 'function')
      (financeStore as any).setYear(numericValue)
    if (typeof setFilters === 'function') {
      setFilters({
        ...filters,
        years: [value],
        year: numericValue,
        period: 'monthly',
        dateRange: undefined,
      })
    }

    // Força atualização dos dados ao trocar o ano
    if (typeof (financeStore as any).fetchTransactions === 'function')
      (financeStore as any).fetchTransactions()
    if (typeof (financeStore as any).fetchMonthlyMetrics === 'function')
      (financeStore as any).fetchMonthlyMetrics()
    if (typeof (financeStore as any).loadData === 'function') (financeStore as any).loadData()
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Painel Geral</h1>
        <p className="text-sm text-slate-500">Visão geral e indicadores de performance</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={currentMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {monthsList.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentYear} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[90px] text-xs">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {yearsList.map((y) => (
              <SelectItem key={y} value={y} className="text-xs">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2">
          {profile?.role === 'Administrador' && <MonthlyClosingDialog />}

          <Button
            onClick={() => onExport({ month: currentMonth, year: currentYear })}
            variant="default"
            size="sm"
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white flex gap-1 shadow-sm"
          >
            <Download className="w-3 h-3" />
            Exportar Relatório
          </Button>
        </div>
      </div>
    </div>
  )
}
