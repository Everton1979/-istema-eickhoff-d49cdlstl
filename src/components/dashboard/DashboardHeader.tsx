import { RefreshCw, Printer, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFinanceStore } from '@/stores/financeStore'
import { useAuth } from '@/hooks/use-auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMemo, useState } from 'react'
import { ExpirationAlerts } from './ExpirationAlerts'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const { filters, setFilter, transactions, filteredTransactions, accounts, fetchData } =
    useFinanceStore()
  const { profile } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const years = useMemo(() => {
    const y = new Set<string>()
    transactions.forEach((tx) => y.add(new Date(tx.date).getFullYear().toString()))
    const currentYear = new Date().getFullYear().toString()
    y.add(currentYear)
    return Array.from(y).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const selectedYear = filters.years[0] || new Date().getFullYear().toString()
  const selectedMonth = filters.months[0] || 'all'

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = () => {
    const getCategoryName = (tx: any) => {
      if (tx.type === 'INCOME') return '-'
      if (!tx.categoryId) return '-'
      let name = tx.categoryId === 'FIXA' ? 'Fixa' : 'Variável'
      if (tx.categoryId === 'VARIAVEL' && tx.subcategoryId) {
        if (tx.subcategoryId === 'materia_prima') name += ' (Matéria-prima)'
        else if (tx.subcategoryId === 'embalagens') name += ' (Embalagens)'
        else if (tx.subcategoryId === 'medicamentos_drogaria') name += ' (Medicamentos)'
        else if (tx.subcategoryId === 'outros') name += ' (Outros)'
      }
      return name
    }

    const getAccountName = (id: string, type: string) => {
      if (type === 'EXPENSE') return '-'
      if (!id) return '-'
      return accounts.find((a) => a.id === id)?.name || id
    }

    const headers = ['Data', 'Descrição', 'Categoria', 'Conta', 'Status', 'Valor', 'Tags']

    const sortedData = [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) return dateB - dateA
      return b.amount - a.amount
    })

    const rows = sortedData.map((tx) => [
      tx.date.split('T')[0].split('-').reverse().join('/'),
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${getCategoryName(tx)}"`,
      `"${getAccountName(tx.accountId, tx.type)}"`,
      tx.status,
      tx.type === 'EXPENSE' ? -tx.amount : tx.amount,
      `"${tx.tags || ''}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `dashboard_transacoes_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
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
          onClick={handleExportExcel}
          className="h-7 text-xs bg-white text-emerald-700 border-none hover:bg-emerald-50 hidden md:flex gap-1"
        >
          <FileSpreadsheet className="w-3 h-3" /> Exportar Excel
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-7 text-xs bg-white text-blue-900 border-none hover:bg-gray-100 hidden md:flex gap-1"
        >
          <Printer className="w-3 h-3" /> Exportar PDF
        </Button>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs font-medium text-blue-200 hidden sm:inline">Período:</span>
          <Select
            value={selectedMonth}
            onValueChange={(val) => setFilter('months', val === 'all' ? [] : [val])}
          >
            <SelectTrigger className="h-7 w-[90px] sm:w-[110px] bg-[#152943] border-none text-white focus:ring-1 focus:ring-blue-400 text-xs">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ano Todo</SelectItem>
              <SelectItem value="01">Janeiro</SelectItem>
              <SelectItem value="02">Fevereiro</SelectItem>
              <SelectItem value="03">Março</SelectItem>
              <SelectItem value="04">Abril</SelectItem>
              <SelectItem value="05">Maio</SelectItem>
              <SelectItem value="06">Junho</SelectItem>
              <SelectItem value="07">Julho</SelectItem>
              <SelectItem value="08">Agosto</SelectItem>
              <SelectItem value="09">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>

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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
          </Button>
        </div>
      </div>
    </div>
  )
}
