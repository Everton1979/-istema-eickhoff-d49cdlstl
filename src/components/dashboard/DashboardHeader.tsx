import { useFinanceStore } from '@/stores/financeStore'
import { MonthlyClosingDialog } from './MonthlyClosingDialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Download, FileText, FileSpreadsheet, CalendarIcon, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardHeader({ onExport }: { onExport: (filters: any) => void }) {
  const financeStore = useFinanceStore()
  const { profile } = useAuth()

  const filters = financeStore.filters || { startDate: '', endDate: '', type: 'ALL' }
  const setFilter = financeStore.setFilter

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-2 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Painel Geral</h1>
        <p className="text-sm text-slate-500">Visão geral e indicadores de performance</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-200">
          <CalendarIcon className="w-4 h-4 text-slate-500 ml-2" />
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilter('startDate', e.target.value)}
            className="h-9 text-sm w-[135px] bg-white border-slate-200 focus-visible:ring-1"
          />
          <span className="text-slate-400 text-xs font-medium px-1">até</span>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilter('endDate', e.target.value)}
            className="h-9 text-sm w-[135px] bg-white border-slate-200 focus-visible:ring-1"
          />
        </div>

        <Select value={filters.type || 'ALL'} onValueChange={(v) => setFilter('type', v)}>
          <SelectTrigger className="h-11 w-[180px] text-sm bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <SelectValue placeholder="Tipo" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-sm">
              Todos Lançamentos
            </SelectItem>
            <SelectItem value="INCOME" className="text-sm">
              Apenas Receitas
            </SelectItem>
            <SelectItem value="EXPENSE" className="text-sm">
              Apenas Despesas
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2">
          {profile?.role === 'Administrador' && <MonthlyClosingDialog />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-11 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white flex gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() =>
                  onExport({
                    format: 'pdf',
                    ts: Date.now(),
                  })
                }
                className="cursor-pointer py-3"
              >
                <FileText className="w-4 h-4 mr-3 text-red-500" />
                Exportar como PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onExport({
                    format: 'excel',
                    ts: Date.now(),
                  })
                }
                className="cursor-pointer py-3"
              >
                <FileSpreadsheet className="w-4 h-4 mr-3 text-green-500" />
                Exportar como Excel (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
