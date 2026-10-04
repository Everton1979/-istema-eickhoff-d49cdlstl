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
    const headers = ['Data', 'Descrição', 'Observações', 'Valor', 'Tipo', 'Categoria', 'Status']
    const rows = data.map((tx) => {
      const dateObj = tx.date.includes('T') ? new Date(tx.date) : new Date(tx.date + 'T12:00:00Z')
      return [
        dateObj.toLocaleDateString('pt-BR'),
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${(tx.tags || '').replace(/"/g, '""')}"`,
        tx.amount.toString().replace('.', ','),
        tx.type === 'INCOME' ? 'Receita' : tx.type === 'INVESTIMENTO' ? 'Investimento' : 'Despesa',
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
    if (!previewData) return

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    const rowsHtml = previewData.data
      .map((tx) => {
        const typeBadgeClass =
          tx.type === 'INCOME'
            ? 'badge-income'
            : tx.type === 'INVESTIMENTO'
              ? 'badge-invest'
              : 'badge-expense'
        const typeLabel =
          tx.type === 'INCOME' ? 'Receita' : tx.type === 'INVESTIMENTO' ? 'Investimento' : 'Despesa'
        const valueClass = tx.type === 'INCOME' ? 'text-income' : 'text-expense'
        const catName =
          (tx.category as any) || (tx as any).categoryId || (tx as any).subcategoryId || '-'

        return `
          <tr>
            <td class="nowrap">${formatDate(tx.date)}</td>
            <td class="bold">${escapeHtml(tx.description || '-')}</td>
            <td class="text-muted">${escapeHtml(tx.tags || '-')}</td>
            <td class="text-muted">${escapeHtml(catName)}</td>
            <td><span class="badge ${typeBadgeClass}">${typeLabel}</span></td>
            <td class="text-muted">${escapeHtml(tx.status || 'REALIZADO')}</td>
            <td class="amount ${valueClass}">${formatCurrency(tx.amount)}</td>
          </tr>
        `
      })
      .join('')

    const printHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>RELATÓRIO FINANCEIRO - SISTEMA EICKHOFF</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 10mm 14mm 10mm;
      @top-center {
        content: "SISTEMA EICKHOFF • RELATÓRIO FINANCEIRO • PERÍODO: ${formatDate(previewData.startStr)} A ${formatDate(previewData.endStr)}";
        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #64748b;
        text-transform: uppercase;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 4px;
        margin-bottom: 6px;
      }
      @bottom-left {
        content: "EMITIDO EM: " attr(data-date);
        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
        text-transform: uppercase;
      }
      @bottom-right {
        content: "PÁGINA " counter(page) " DE " counter(pages);
        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #475569;
        text-transform: uppercase;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #0f172a;
      font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9.5pt;
      line-height: 1.35;
    }

    /* Layout em tabela mestra para garantir cabeçalho e rodapé repetidos em todos os motores */
    table.master-layout {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }

    thead.master-header {
      display: table-header-group;
    }

    tfoot.master-footer {
      display: table-footer-group;
    }

    tbody.master-body {
      display: table-row-group;
    }

    .master-header-cell {
      padding: 0 0 10px 0;
      border: none;
    }

    .master-footer-cell {
      padding: 8px 0 0 0;
      border: none;
    }

    .master-content-cell {
      padding: 0;
      border: none;
    }

    /* Cabeçalho do documento */
    .doc-running-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .doc-brand {
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #0f172a;
      text-transform: uppercase;
    }

    .doc-period-tag {
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      text-transform: uppercase;
    }

    /* Rodapé do documento */
    .doc-running-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 6px;
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
    }

    .page-number-native::after {
      content: "PÁGINA " counter(page);
      font-weight: 700;
      color: #334155;
    }

    /* Seções principais com quebra inteligente */
    .section-title-box {
      background: #1e293b;
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      break-after: avoid;
      page-break-after: avoid;
    }

    .section-title-box h1 {
      margin: 0;
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .section-title-box .badge-white {
      background: rgba(255, 255, 255, 0.2);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .card-kpi {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: left;
    }

    .card-kpi .kpi-label {
      font-size: 7pt;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 3px;
    }

    .card-kpi .kpi-value {
      font-size: 11pt;
      font-weight: 900;
      letter-spacing: -0.2px;
    }

    .info-strip {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .info-strip strong {
      text-transform: uppercase;
      color: #1e293b;
    }

    /* Tabela de Lançamentos */
    .table-section {
      width: 100%;
      margin-top: 4px;
    }

    .section-heading {
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin: 0 0 6px 0;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      break-after: avoid;
      page-break-after: avoid;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }

    table.data-table thead {
      display: table-header-group;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    table.data-table thead th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      padding: 6px 6px;
      border-bottom: 1.5px solid #cbd5e1;
      border-top: 1px solid #cbd5e1;
      text-align: left;
      font-size: 7.5pt;
      letter-spacing: 0.3px;
    }

    table.data-table thead th.amount {
      text-align: right;
    }

    table.data-table tbody tr {
      break-inside: avoid;
      page-break-inside: avoid;
      border-bottom: 1px solid #e2e8f0;
    }

    table.data-table tbody tr:nth-child(even) {
      background: #fbfcfe;
    }

    table.data-table td {
      padding: 5px 6px;
      vertical-align: middle;
      color: #1e293b;
    }

    table.data-table td.amount {
      text-align: right;
      font-weight: 700;
      white-space: nowrap;
    }

    .nowrap {
      white-space: nowrap;
    }

    .bold {
      font-weight: 700;
    }

    .text-muted {
      color: #64748b;
      font-size: 7.5pt;
    }

    .text-income {
      color: #15803d;
    }

    .text-expense {
      color: #b91c1c;
    }

    .text-invest {
      color: #4338ca;
    }

    .badge {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .badge-income {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .badge-expense {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }

    .badge-invest {
      background: #e0e7ff;
      color: #4338ca;
      border: 1px solid #a5b4fc;
    }
  </style>
</head>
<body>
  <table class="master-layout">
    <thead class="master-header">
      <tr>
        <td class="master-header-cell">
          <div class="doc-running-header">
            <div class="doc-brand">SISTEMA EICKHOFF • GESTÃO FINANCEIRA</div>
            <div class="doc-period-tag">PERÍODO: ${formatDate(previewData.startStr)} A ${formatDate(previewData.endStr)}</div>
          </div>
        </td>
      </tr>
    </thead>

    <tfoot class="master-footer">
      <tr>
        <td class="master-footer-cell">
          <div class="doc-running-footer">
            <div>SISTEMA EICKHOFF • DOCUMENTO CONFIDENCIAL</div>
            <div class="page-number-native"></div>
          </div>
        </td>
      </tr>
    </tfoot>

    <tbody class="master-body">
      <tr>
        <td class="master-content-cell">
          <!-- CABEÇALHO DA 1ª PÁGINA COM IDENTIFICAÇÃO E KPIs -->
          <div class="section-title-box">
            <h1>RELATÓRIO FINANCEIRO DE ENTRADAS E SAÍDAS</h1>
            <span class="badge-white">${escapeHtml(typeLabel.toUpperCase())}</span>
          </div>

          <div class="info-strip">
            <div>
              <strong>PERÍODO SELECIONADO:</strong> ${formatDate(previewData.startStr)} A ${formatDate(previewData.endStr)}
            </div>
            <div>
              <strong>TOTAL DE LANÇAMENTOS:</strong> ${previewData.data.length} ITENS
            </div>
          </div>

          <div class="summary-grid">
            <div class="card-kpi">
              <div class="kpi-label">TOTAL RECEITAS</div>
              <div class="kpi-value text-income">${formatCurrency(totalReceitas)}</div>
            </div>
            <div class="card-kpi">
              <div class="kpi-label">DESPESAS OPERACIONAIS</div>
              <div class="kpi-value text-expense">${formatCurrency(totalDespesas)}</div>
            </div>
            <div class="card-kpi">
              <div class="kpi-label">INVESTIMENTOS</div>
              <div class="kpi-value text-invest">${formatCurrency(totalInvestimentos)}</div>
            </div>
            <div class="card-kpi">
              <div class="kpi-label">SALDO FINAL (CAIXA)</div>
              <div class="kpi-value ${saldo >= 0 ? 'text-income' : 'text-expense'}">${formatCurrency(saldo)}</div>
            </div>
          </div>

          <!-- DETALHAMENTO DE TRANSAÇÕES COMPLETO -->
          <div class="table-section">
            <div class="section-heading">
              <span>DETALHAMENTO DE LANÇAMENTOS DO PERÍODO</span>
              <span class="text-muted">${previewData.data.length} REGISTROS (DO PRIMEIRO AO ÚLTIMO DIA)</span>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 75px;">DATA</th>
                  <th>DESCRIÇÃO</th>
                  <th style="width: 120px;">OBSERVAÇÕES</th>
                  <th style="width: 110px;">CATEGORIA</th>
                  <th style="width: 80px;">TIPO</th>
                  <th style="width: 75px;">STATUS</th>
                  <th class="amount" style="width: 90px;">VALOR</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`

    const printFrameId = '__eickhoff_print_iframe__'
    let iframe = document.getElementById(printFrameId) as HTMLIFrameElement | null
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = printFrameId
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)
    }

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument
    if (!frameDoc || !iframe.contentWindow) {
      window.print()
      return
    }

    frameDoc.open()
    frameDoc.write(printHtml)
    frameDoc.close()

    setTimeout(() => {
      try {
        iframe?.contentWindow?.focus()
        iframe?.contentWindow?.print()
      } catch (err) {
        console.error('Erro ao acionar impressão via iframe:', err)
        window.print()
      }
    }, 400)
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

      const rawData = await fetchTransactionsForExport(startStr, endStr, type)
      const data = rawData.filter((tx) => tx.type !== 'PARTNER_WITHDRAWAL')

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
      .filter((d) => d.type === 'INCOME' && d.status === 'REALIZADO')
      .reduce((acc, curr) => acc + curr.amount, 0) || 0
  const totalDespesas =
    previewData?.data
      .filter((d) => d.type === 'EXPENSE' && d.status === 'REALIZADO')
      .reduce((acc, curr) => acc + curr.amount, 0) || 0
  const totalInvestimentos =
    previewData?.data
      .filter((d) => d.type === 'INVESTIMENTO' && d.status === 'REALIZADO')
      .reduce((acc, curr) => acc + curr.amount, 0) || 0

  const totalOutrasSaidas = totalInvestimentos
  const saldo = totalReceitas - totalDespesas - totalOutrasSaidas

  return (
    <>
      <style>{`
      @media print {
        html, body {
          overflow: visible !important;
          height: auto !important;
        }
        body * { visibility: hidden; }
        .printable-area, .printable-area * { visibility: visible; }
        .printable-area {
          position: static !important;
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
            className="h-11 px-4 text-sm bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 flex gap-2 shadow-sm font-bold w-full"
          >
            <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Relatório Entradas/Saídas
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
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Visualização do Relatório Financeiro
                  </DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    PERÍODO: {formatDate(previewData.startStr)} A {formatDate(previewData.endStr)} •{' '}
                    {previewData.data.length} LANÇAMENTOS
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewData(null)}
                    className="flex-1 sm:flex-none uppercase text-xs font-bold"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-sm uppercase text-xs tracking-wide"
                  >
                    <Printer className="w-4 h-4" />
                    Salvar PDF / Imprimir
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 sm:p-8 bg-white text-black printable-area">
                <div className="max-w-[850px] mx-auto">
                  <div className="border-b-2 border-slate-900 pb-3 mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                        SISTEMA EICKHOFF • GESTÃO FINANCEIRA
                      </span>
                      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Relatório Financeiro de Entradas e Saídas
                      </h1>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase rounded">
                        {typeLabel.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1 border-r border-slate-200 pr-4">
                      <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                        Período Selecionado
                      </h3>
                      <p className="text-base text-slate-900 font-extrabold">
                        {formatDate(previewData.startStr)} a {formatDate(previewData.endStr)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 uppercase">
                        <strong>Tipo:</strong> {typeLabel}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 uppercase">
                        <strong>Lançamentos:</strong> {previewData.data.length} registros
                      </p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                        Resumo Consolidado
                      </h3>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-700 flex justify-between">
                          <span className="font-semibold uppercase">Total Receitas:</span>
                          <span className="text-green-700 font-bold">
                            {formatCurrency(totalReceitas)}
                          </span>
                        </p>
                        <p className="text-xs text-slate-700 flex justify-between">
                          <span className="font-semibold uppercase">Despesas Operacionais:</span>
                          <span className="text-red-700 font-bold">
                            {formatCurrency(totalDespesas)}
                          </span>
                        </p>
                        {totalInvestimentos > 0 && (
                          <p className="text-xs text-slate-700 flex justify-between">
                            <span className="font-semibold uppercase">Investimentos:</span>
                            <span className="text-indigo-700 font-bold">
                              {formatCurrency(totalInvestimentos)}
                            </span>
                          </p>
                        )}
                        <div className="h-px bg-slate-200 my-1"></div>
                        <p className="text-xs text-slate-900 font-black flex justify-between">
                          <span className="uppercase">Saldo Final (Caixa):</span>
                          <span
                            className={
                              saldo >= 0 ? 'text-green-700 font-black' : 'text-red-700 font-black'
                            }
                          >
                            {formatCurrency(saldo)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Detalhamento Completo ({previewData.data.length} Lançamentos)
                    </h3>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase">
                      Do primeiro ao último dia
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 bg-slate-100">
                          <th className="py-2.5 px-3 text-left font-black text-slate-700 whitespace-nowrap uppercase">
                            Data
                          </th>
                          <th className="py-2.5 px-3 text-left font-black text-slate-700 uppercase">
                            Descrição
                          </th>
                          <th className="py-2.5 px-3 text-left font-black text-slate-700 uppercase">
                            Observações
                          </th>
                          <th className="py-2.5 px-3 text-left font-black text-slate-700 uppercase">
                            Categoria
                          </th>
                          <th className="py-2.5 px-3 text-left font-black text-slate-700 uppercase">
                            Tipo
                          </th>
                          <th className="py-2.5 px-3 text-left font-black text-slate-700 uppercase">
                            Status
                          </th>
                          <th className="py-2.5 px-3 text-right font-black text-slate-700 whitespace-nowrap uppercase">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewData.data.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-slate-700 whitespace-nowrap font-medium">
                              {formatDate(tx.date)}
                            </td>
                            <td className="py-2 px-3 text-slate-900 font-bold">{tx.description}</td>
                            <td className="py-2 px-3 text-slate-600">{tx.tags || '-'}</td>
                            <td className="py-2 px-3 text-slate-600">
                              {(tx.category as any) ||
                                (tx as any).categoryId ||
                                (tx as any).subcategoryId ||
                                '-'}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={cn(
                                  'inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                                  tx.type === 'INCOME'
                                    ? 'bg-green-100 text-green-800'
                                    : tx.type === 'INVESTIMENTO'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-red-100 text-red-800',
                                )}
                              >
                                {tx.type === 'INCOME'
                                  ? 'Receita'
                                  : tx.type === 'INVESTIMENTO'
                                    ? 'Investimento'
                                    : 'Despesa'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 text-[11px] font-medium uppercase">
                              {tx.status}
                            </td>
                            <td
                              className={cn(
                                'py-2 px-3 text-right font-bold whitespace-nowrap',
                                tx.type === 'INCOME' ? 'text-green-700' : 'text-red-700',
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
                <DialogTitle>Relatório Entradas/Saídas</DialogTitle>
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
