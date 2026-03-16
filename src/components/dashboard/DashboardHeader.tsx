import { RefreshCw, Home, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useFinanceStore } from '@/stores/financeStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMemo } from 'react'
import { MonthlyClosingDialog } from './MonthlyClosingDialog'
import { ExpirationAlerts } from './ExpirationAlerts'

export function DashboardHeader() {
  const { filters, setFilter, transactions } = useFinanceStore()

  const years = useMemo(() => {
    const y = new Set<string>()
    transactions.forEach((tx) => y.add(new Date(tx.date).getFullYear().toString()))
    const currentYear = new Date().getFullYear().toString()
    y.add(currentYear)
    return Array.from(y).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const selectedYear = filters.years[0] || new Date().getFullYear().toString()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-[#1e3a5f] text-white rounded-t-md px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-400 rounded-sm" />
        <h2 className="font-bold text-sm tracking-wide hidden sm:block">DASHBOARD FINANCEIRO</h2>
        <h2 className="font-bold text-sm tracking-wide sm:hidden">DASHBOARD</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-7 text-xs bg-white text-blue-900 border-none hover:bg-gray-100 hidden md:flex gap-1"
        >
          <Printer className="w-3 h-3" /> Exportar PDF
        </Button>

        <MonthlyClosingDialog />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-200 hidden sm:inline">Ano:</span>
          <Select value={selectedYear} onValueChange={(val) => setFilter('years', [val])}>
            <SelectTrigger className="h-7 w-[70px] sm:w-[90px] bg-[#152943] border-none text-white focus:ring-1 focus:ring-blue-400 text-xs">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-0.5">
          <ExpirationAlerts />

          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
              <Home className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
