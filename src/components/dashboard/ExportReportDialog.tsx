import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'

export function ExportReportDialog({ onExport }: { onExport: (filters: any) => void }) {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(lastDay)
  const [type, setType] = useState('ALL')
  const [open, setOpen] = useState(false)

  const handleExport = (format: 'pdf' | 'excel') => {
    onExport({
      startDate,
      endDate,
      type,
      format,
      ts: Date.now(),
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="h-11 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white flex gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório Financeiro</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Lançamento</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Lançamentos</SelectItem>
                <SelectItem value="INCOME">Apenas Receitas</SelectItem>
                <SelectItem value="EXPENSE">Apenas Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            onClick={() => handleExport('pdf')}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar como PDF
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar como Excel (CSV)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
