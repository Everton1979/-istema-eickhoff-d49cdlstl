import { RefreshCw, XCircle, Home } from 'lucide-react'
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

  return (
    <div className="bg-[#1e3a5f] text-white rounded-t-md px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-400 rounded-sm" />
        <h2 className="font-bold text-sm tracking-wide hidden sm:block">DASHBOARD FINANCEIRO</h2>
        <h2 className="font-bold text-sm tracking-wide sm:hidden">DASHBOARD</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-200">Ano:</span>
          <Select value={selectedYear} onValueChange={(val) => setFilter('years', [val])}>
            <SelectTrigger className="h-7 w-[80px] sm:w-[100px] bg-[#152943] border-none text-white focus:ring-1 focus:ring-blue-400 text-xs">
              <SelectValue placeholder="Selecione..." />
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

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
              <Home className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20 hidden sm:flex"
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
