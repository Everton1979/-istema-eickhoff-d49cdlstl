import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
  Printer,
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
        'w-full justify-start text-left font-normal bg-white dark:bg-slate-950 h-12 sm:h-10 text-base sm:text-sm',
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
  const [previewData, setPreviewData] = useState<{
    data: Transaction[]
    startStr: string
    endStr: string
    type: string
  } | null>(null)

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

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const formatDate = (dateStr: string) => {
    const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T12:00:00Z')
    return d.toLocaleDateString('pt-BR')
  }

  const handlePrint = () => {
    window.print()
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
        toast({
          title: 'Exportação concluída',
          description: `${data.length} lançamentos exportados com sucesso!`,
        })
        setOpen(false)
      } else {
        setPreviewData({ data, startStr, endStr, type })
        toast({
          title: 'Pré-visualização gerada',
          description: `Relatório gerado com sucesso. Você pode conferir os dados antes de imprimir.`,
        })
      }
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

  const typeLabel =
    previewData?.type === 'ALL'
      ? 'Todos os Lançamentos'
      : previewData?.type === 'INCOME'
        ? 'Apenas Receitas'
        : 'Apenas Despesas'

  const totalReceitas =
    previewData?.data
      .filter((d) => d.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0) || 0
  const totalDespesas =
    previewData?.data
      .filter((d) => d.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0) || 0
  const saldo = totalReceitas - totalDespesas

  return (
    <>
      <style>{`
      @media print {
        body * { visibility: hidden; }
        .printable-area, .printable-area * { visibility: visible; }
        .printable-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
      }
    `}</style>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val)
          if (!val) setPreviewData(null)
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-11 px-4 text-sm bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 flex gap-2 shadow-sm font-bold"
          >
            <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Exportar Relatório
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            'rounded-xl flex flex-col transition-all duration-300',
            previewData
              ? 'w-[95vw] sm:w-[90vw] max-w-5xl h-[90vh] p-0'
              : 'p-4 sm:p-6 w-[95vw] sm:w-full max-w-[425px]',
          )}
        >
          {previewData ? (
            <>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b bg-slate-50 dark:bg-slate-900 rounded-t-xl print:hidden shrink-0">
                <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Visualização do Relatório
                </DialogTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewData(null)}
                    className="flex-1 sm:flex-none"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir / Salvar PDF
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 sm:p-8 bg-white text-black printable-area">
                <div className="max-w-[800px] mx-auto">
                  <div className="border-b-2 border-slate-200 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Relatório Financeiro</h1>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200 break-inside-avoid">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Período</h3>
                      <p className="text-sm text-slate-800 font-medium">
                        {formatDate(previewData.startStr)} a {formatDate(previewData.endStr)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong>Tipo:</strong> {typeLabel}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Resumo</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex justify-between">
                          <span>Total Receitas:</span>
                          <span className="text-green-600 font-medium">
                            {formatCurrency(totalReceitas)}
                          </span>
                        </p>
                        <p className="text-sm text-slate-600 flex justify-between">
                          <span>Total Despesas:</span>
                          <span className="text-red-600 font-medium">
                            {formatCurrency(totalDespesas)}
                          </span>
                        </p>
                        <div className="h-px bg-slate-200 my-1"></div>
                        <p className="text-sm text-slate-800 font-bold flex justify-between">
                          <span>Saldo no Período:</span>
                          <span className={saldo >= 0 ? 'text-blue-600' : 'text-red-600'}>
                            {formatCurrency(saldo)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-50">
                          <th className="py-2 px-3 text-left font-bold text-slate-700 whitespace-nowrap">
                            Data
                          </th>
                          <th className="py-2 px-3 text-left font-bold text-slate-700">
                            Descrição
                          </th>
                          <th className="py-2 px-3 text-left font-bold text-slate-700">
                            Categoria
                          </th>
                          <th className="py-2 px-3 text-left font-bold text-slate-700">Tipo</th>
                          <th className="py-2 px-3 text-left font-bold text-slate-700">Status</th>
                          <th className="py-2 px-3 text-right font-bold text-slate-700 whitespace-nowrap">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewData.data.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                              {formatDate(tx.date)}
                            </td>
                            <td className="py-2 px-3 text-slate-800">{tx.description}</td>
                            <td className="py-2 px-3 text-slate-600">
                              {(tx.category as any) || (tx as any).categoryId || '-'}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={cn(
                                  'inline-flex px-2 py-0.5 rounded text-[11px] font-medium',
                                  tx.type === 'INCOME'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700',
                                )}
                              >
                                {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 text-[12px]">{tx.status}</td>
                            <td
                              className={cn(
                                'py-2 px-3 text-right font-medium whitespace-nowrap',
                                tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600',
                              )}
                            >
                              {formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
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
                    <ResponsiveDatePicker
                      date={endDate}
                      setDate={setEndDate}
                      disabled={isExporting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Lançamento</Label>
                  <Select value={type} onValueChange={setType} disabled={isExporting}>
                    <SelectTrigger className="bg-white dark:bg-slate-950 h-12 sm:h-10 text-base sm:text-sm">
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
                  className="w-full h-12 sm:h-10 text-base sm:text-sm bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 font-bold shadow-sm"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Visualizar PDF
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
