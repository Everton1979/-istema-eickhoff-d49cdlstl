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
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { Transaction } from '@/types/finance'

export function ExportReportDialog({ onExport }: { onExport?: (filters: any) => void }) {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(lastDay)
  const [type, setType] = useState('ALL')
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { fetchTransactionsForExport } = useFinanceStore()
  const { toast } = useToast()

  const generateCSV = (data: Transaction[]) => {
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
    link.setAttribute('download', `relatorio_financeiro_${startDate}_a_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generatePDF = (data: Transaction[]) => {
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
              <p>${formatDate(startDate)} a ${formatDate(endDate)}</p>
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

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true)
      toast({
        title: 'Buscando dados...',
        description: 'Coletando todos os lançamentos do período selecionado.',
      })

      const data = await fetchTransactionsForExport(startDate, endDate, type)

      if (data.length === 0) {
        toast({
          title: 'Nenhum dado',
          description: 'Não há transações para o período e filtros selecionados.',
          variant: 'destructive',
        })
        setIsExporting(false)
        return
      }

      if (format === 'excel') {
        generateCSV(data)
      } else {
        generatePDF(data)
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
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isExporting}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isExporting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Lançamento</Label>
            <Select value={type} onValueChange={setType} disabled={isExporting}>
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
            disabled={isExporting}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
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
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
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
