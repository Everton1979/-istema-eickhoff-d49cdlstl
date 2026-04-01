import { useState } from 'react'
import { useFinanceStore } from '@/stores/financeStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileText, Table as TableIcon } from 'lucide-react'
import { format } from 'date-fns'

export function ExportModal({ onExport }: { onExport: (filters: any) => void }) {
  const { transactions } = useFinanceStore()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [isOpen, setIsOpen] = useState(false)

  const handleExportCSV = () => {
    let filtered = transactions

    if (startDate) {
      filtered = filtered.filter((t) => t.date.substring(0, 10) >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.date.substring(0, 10) <= endDate)
    }
    if (type !== 'ALL') {
      filtered = filtered.filter((t) => t.type === type)
    }

    filtered = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Generate CSV
    const headers = [
      'Data',
      'Descrição',
      'Tipo',
      'Categoria',
      'Subcategoria',
      'Valor',
      'Status',
      'Tags',
    ]
    const rows = filtered.map((t) => [
      format(new Date(t.date), 'dd/MM/yyyy'),
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'INCOME' ? 'Receita' : 'Despesa',
      t.categoryId === 'FIXA' ? 'Fixa' : t.categoryId === 'VARIAVEL' ? 'Variável' : t.categoryId,
      t.subcategoryId || '',
      t.amount.toFixed(2).replace('.', ','),
      t.status,
      `"${(t.tags || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    }) // BOM for excel
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_financeiro_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsOpen(false)
  }

  const handleExportPDF = () => {
    onExport({ startDate, endDate, type })
    setIsOpen(false)
    setTimeout(() => {
      window.print()
      // reset filters after print so normal dashboard doesn't keep showing custom print header if user prints normally
      setTimeout(() => onExport(null), 1000)
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs bg-white text-blue-900 border-none hover:bg-gray-100 hidden sm:flex gap-1"
        >
          <Download className="w-3 h-3" /> Exportar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório Financeiro</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tudo (Receitas e Despesas)</SelectItem>
                <SelectItem value="INCOME">Apenas Receitas</SelectItem>
                <SelectItem value="EXPENSE">Apenas Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            O relatório listará <strong>todas</strong> as transações do período escolhido, ignorando
            os filtros de mês/ano do dashboard.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <TableIcon className="w-4 h-4 text-emerald-600" />
            Excel (CSV)
          </Button>
          <Button
            onClick={handleExportPDF}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="w-4 h-4" />
            Gerar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
