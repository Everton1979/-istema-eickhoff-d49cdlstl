import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Calendar } from '@/components/ui/calendar'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { Transaction } from '@/types/finance'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

function ResponsiveDatePicker({
  date,
  setDate,
  disabled,
}: {
  date: Date | undefined
  setDate: (d: Date | undefined) => void
  disabled?: boolean
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const ButtonContent = (
    <Button
      variant="outline"
      className={cn(
        'w-full justify-start text-left font-normal bg-white h-12 sm:h-10 text-base sm:text-sm',
        !date && 'text-muted-foreground',
      )}
      disabled={disabled}
    >
      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
      {date ? format(date, 'P', { locale: ptBR }) : <span>Selecione</span>}
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{ButtonContent}</DrawerTrigger>
        <DrawerContent>
          <div className="p-4 flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setOpen(false)
              }}
              initialFocus
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{ButtonContent}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d)
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function ExportReportDialog({ onExport }: { onExport?: (filters: any) => void }) {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [startDate, setStartDate] = useState<Date | undefined>(firstDay)
  const [endDate, setEndDate] = useState<Date | undefined>(lastDay)
  const [type, setType] = useState('ALL')
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { fetchTransactionsForExport } = useFinanceStore()
  const { toast } = useToast()

  const generateCSV = (data: Transaction[], startStr: string, endStr: string) => {
    const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Status']
    const rows = data.map((tx) => {
      const dateObj = tx.date.includes('T') ? new Date(tx.date) : new Date(tx.date + 'T12:00:00Z')
      return [
        dateObj.toLocaleDateString('pt-BR'),
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount.toString().replace('.', ','),
        tx.type === 'INCOME' ? 'Receita' : 'Despesa',
        tx.categoryId || '',
        tx.status || '',
      ]
    })

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_financeiro_${startStr}_a_${endStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generatePDF = (data: Transaction[], startStr: string, endStr: string) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Por favor, permita pop-ups no seu navegador para gerar o PDF.',
        variant: 'destructive',
      })
      return
    }

    const totalReceitas = data
      .filter((d) => d.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0)
    const totalDespesas = data
      .filter((d) => d.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0)
    const saldo = totalReceitas - totalDespesas

    const formatCurrency = (val: number) =>
      val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const formatDate = (dateStr: string) => {
      const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T12:00:00Z')
      return d.toLocaleDateString('pt-BR')
    }

    const typeLabel =
      type === 'ALL'
        ? 'Todos os Lançamentos'
        : type === 'INCOME'
          ? 'Apenas Receitas'
          : 'Apenas Despesas'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; font-size: 24px; }
            .summary { display: flex; gap: 20px; margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; }
            .summary div { flex: 1; }
            .summary p { margin: 5px 0; font-size: 14px; }
            .summary h3 { margin: 0 0 10px 0; font-size: 16px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            .receita { color: #16a34a; font-weight: 500; }
            .despesa { color: #dc2626; font-weight: 500; }
            .amount { text-align: right; }
            @media print {
              body { padding: 0; }
              .summary { break-inside: avoid; }
              table { break-inside: auto; }
              tr { break-inside: avoid; break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <div class="summary">
            <div>
              <h3>Período</h3>
              <p>${formatDate(startStr)} a ${formatDate(endStr)}</p>
              <p><strong>Tipo:</strong> ${typeLabel}</p>
            </div>
            <div>
              <h3>Resumo</h3>
              <p><strong>Total Receitas:</strong> <span class="receita">${formatCurrency(totalReceitas)}</span></p>
              <p><strong>Total Despesas:</strong> <span class="despesa">${formatCurrency(totalDespesas)}</span></p>
              <p><strong>Saldo no Período:</strong> <strong>${formatCurrency(saldo)}</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Status</th>
                <th class="amount">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (tx) => `
                <tr>
                  <td>${formatDate(tx.date)}</td>
                  <td>${tx.description}</td>
                  <td>${tx.categoryId || '-'}</td>
                  <td class="${tx.type === 'INCOME' ? 'receita' : 'despesa'}">${tx.type === 'INCOME' ? 'Receita' : 'Despesa'}</td>
                  <td>${tx.status}</td>
                  <td class="amount">${formatCurrency(tx.amount)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print(); 
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  const handleExport = async (formatType: 'pdf' | 'excel') => {
    if (!startDate || !endDate) {
      toast({
        title: 'Datas inválidas',
        description: 'Por favor, selecione as datas de início e fim no calendário.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsExporting(true)
      toast({
        title: 'Buscando dados...',
        description: 'Coletando todos os lançamentos do período selecionado.',
      })

      const startStr = format(startDate, 'yyyy-MM-dd')
      const endStr = format(endDate, 'yyyy-MM-dd')

      const data = await fetchTransactionsForExport(startStr, endStr, type)

      if (data.length === 0) {
        toast({
          title: 'Nenhum dado',
          description: 'Não há transações para o período e filtros selecionados.',
          variant: 'destructive',
        })
        setIsExporting(false)
        return
      }

      if (formatType === 'excel') {
        generateCSV(data, startStr, endStr)
      } else {
        generatePDF(data, startStr, endStr)
      }

      toast({
        title: 'Exportação concluída',
        description: `${data.length} lançamentos exportados com sucesso!`,
      })

      setOpen(false)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao gerar o relatório. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-11 px-4 text-sm bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 flex gap-2 shadow-sm font-bold"
        >
          <Download className="w-4 h-4 text-sky-600" />
          Exportar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="p-4 sm:p-6 w-[95vw] sm:w-full max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle>Exportar Relatório Financeiro</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Data Inicial</Label>
              <ResponsiveDatePicker
                date={startDate}
                setDate={setStartDate}
                disabled={isExporting}
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>Data Final</Label>
              <ResponsiveDatePicker date={endDate} setDate={setEndDate} disabled={isExporting} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Lançamento</Label>
            <Select value={type} onValueChange={setType} disabled={isExporting}>
              <SelectTrigger className="bg-white h-12 sm:h-10 text-base sm:text-sm">
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
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="w-full h-12 sm:h-10 text-base sm:text-sm bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Exportar como PDF
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="w-full h-12 sm:h-10 text-base sm:text-sm bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Exportar como Excel (CSV)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
