import { useState, useMemo, useEffect } from 'react'
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
import { BrainCircuit, FileText, Loader2, Search } from 'lucide-react'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { Transaction } from '@/types/finance'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AnalyticalIntelligenceDialog() {
  const { fetchTransactionsForExport, filters, categories, monthlyMetrics } = useFinanceStore()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<Transaction[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Sync date range with global filters on open
  useEffect(() => {
    if (filters.years.length === 1 && filters.months.length === 1) {
      const year = parseInt(filters.years[0])
      const month = parseInt(filters.months[0])
      const firstDayDate = new Date(year, month - 1, 1)
      const lastDayDate = new Date(year, month, 0)

      const formatLocal = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      }

      setStartDate(formatLocal(firstDayDate))
      setEndDate(formatLocal(lastDayDate))
    } else {
      const now = new Date()
      const formatLocal = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      }
      setStartDate(formatLocal(new Date(now.getFullYear(), now.getMonth(), 1)))
      setEndDate(formatLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0)))
    }
  }, [filters.years, filters.months, open])

  const { toast } = useToast()

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const txs = await fetchTransactionsForExport(startDate, endDate, 'ALL')
      setData(txs)
      setHasSearched(true)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao buscar dados para a Inteligência Analítica.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const kpis = useMemo(() => {
    let receitas = 0
    let despesasFluxo = 0
    let custoVariavelTotal = 0
    let custosFixos = 0

    data.forEach((tx) => {
      // Considera apenas transações realizadas e desconsidera retiradas e aportes não operacionais
      if (tx.status !== 'REALIZADO') return

      if (tx.type === 'INCOME') {
        receitas += tx.amount
      } else if (tx.type === 'EXPENSE') {
        despesasFluxo += tx.amount
        const cat = categories.find((c) => c.id === tx.categoryId)
        if (cat?.isVariable) {
          custoVariavelTotal += tx.amount
        } else {
          custosFixos += tx.amount
        }
      }
    })

    // Sum orders count from monthly metrics that fall inside the date range
    let totalOrders = 0

    // Parse start and end dates to check overlap
    const startObj = new Date(`${startDate}T00:00:00Z`)
    const endObj = new Date(`${endDate}T23:59:59Z`)
    const startYear = startObj.getUTCFullYear()
    const startMonth = startObj.getUTCMonth() + 1
    const endYear = endObj.getUTCFullYear()
    const endMonth = endObj.getUTCMonth() + 1

    monthlyMetrics.forEach((m) => {
      // Check if metric's year/month falls within the range
      const isAfterOrEqualStart =
        m.year > startYear || (m.year === startYear && m.month >= startMonth)
      const isBeforeOrEqualEnd = m.year < endYear || (m.year === endYear && m.month <= endMonth)
      if (isAfterOrEqualStart && isBeforeOrEqualEnd) {
        totalOrders += m.orders_count || 0
      }
    })

    const margem = receitas - custoVariavelTotal
    const lucro = receitas - despesasFluxo
    const ebitda = margem - custosFixos
    const indiceMargem = receitas > 0 ? margem / receitas : 0
    const pontoEquilibrio = indiceMargem > 0 ? custosFixos / indiceMargem : 0
    const cma = totalOrders > 0 ? margem / totalOrders : 0

    return {
      receitas,
      despesas: despesasFluxo,
      custoVariavelTotal,
      custosFixos,
      margem,
      lucro,
      ebitda,
      pontoEquilibrio,
      cma,
      totalOrders,
    }
  }, [data, categories, monthlyMetrics, startDate, endDate])

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const generatePDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Por favor, permita pop-ups no seu navegador para gerar o PDF.',
        variant: 'destructive',
      })
      return
    }

    const formatDate = (dateStr: string) => {
      const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T12:00:00Z')
      return d.toLocaleDateString('pt-BR')
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Inteligência Analítica</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #64748b; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
            .card-title { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
            .card-value { font-size: 20px; font-weight: bold; color: #0f172a; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            @media print {
              body { padding: 0; }
              .card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Inteligência Analítica</h1>
          <div class="subtitle">Período Analisado: ${formatDate(startDate)} a ${formatDate(endDate)}</div>
          
          <div class="grid">
            <div class="card">
              <div class="card-title">Receitas Realizadas</div>
              <div class="card-value">${formatCurrency(kpis.receitas)}</div>
            </div>
            <div class="card">
              <div class="card-title">Despesas Operacionais</div>
              <div class="card-value negative">${formatCurrency(-kpis.despesas)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #3b82f6;">
              <div class="card-title">Margem de Contribuição</div>
              <div class="card-value">${formatCurrency(kpis.margem)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #10b981;">
              <div class="card-title">EBITDA</div>
              <div class="card-value ${kpis.ebitda >= 0 ? 'positive' : 'negative'}">${formatCurrency(kpis.ebitda)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #64748b;">
              <div class="card-title">Ponto de Equilíbrio</div>
              <div class="card-value">${formatCurrency(kpis.pontoEquilibrio)}</div>
            </div>
            <div class="card" style="border-left: 4px solid #f59e0b;">
              <div class="card-title">CMa (Contribuição Média)</div>
              <div class="card-value">${formatCurrency(kpis.cma)}</div>
            </div>
            <div class="card" style="grid-column: span 2; border-left: 4px solid #8b5cf6;">
              <div class="card-title">Lucro Líquido Realizado</div>
              <div class="card-value ${kpis.lucro >= 0 ? 'positive' : 'negative'}">${formatCurrency(kpis.lucro)}</div>
            </div>
          </div>
          
          <div style="font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center;">
            * Este relatório considera estritamente movimentos operacionais com status REALIZADO, excluindo aportes, cortesias e retiradas não-operacionais.
          </div>
          
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-11 px-4 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 flex gap-2 shadow-sm font-bold w-full"
        >
          <BrainCircuit className="w-4 h-4 text-indigo-600" />
          Inteligência Analítica
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Inteligência Analítica Estratégica</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50 border-b flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Analisar Período
            </Button>

            {hasSearched && (
              <Button
                onClick={generatePDF}
                variant="secondary"
                className="ml-auto gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <FileText className="w-4 h-4" />
                Exportar PDF
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 p-6">
            {!hasSearched ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20 text-center">
                <BrainCircuit className="w-16 h-16 text-slate-200 mb-4" />
                <p>
                  Selecione o período e clique em "Analisar Período" para visualizar os indicadores
                  estratégicos.
                </p>
                <p className="text-sm mt-2 max-w-md">
                  O relatório extrai os dados reais da operação, removendo ruídos como aportes
                  externos e retiradas de sócios, focando apenas no core business.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Receitas Realizadas
                  </h3>
                  <p className="text-3xl font-black text-blue-600">
                    {formatCurrency(kpis.receitas)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Total de entradas operacionais com status realizado.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Despesas Operacionais
                  </h3>
                  <p className="text-3xl font-black text-red-500">
                    {formatCurrency(-kpis.despesas)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Todas saídas categorizadas como despesas e custos.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Margem de Contribuição
                  </h3>
                  <p className="text-3xl font-black text-slate-800">
                    {formatCurrency(kpis.margem)}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-400">Receitas - Custos Variáveis</p>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {kpis.receitas > 0 ? ((kpis.margem / kpis.receitas) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm border-t-4 border-t-emerald-500 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">EBITDA</h3>
                  <p
                    className={`text-3xl font-black ${kpis.ebitda >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(kpis.ebitda)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Margem de Contribuição - Custos Fixos
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Ponto de Equilíbrio
                  </h3>
                  <p className="text-3xl font-black text-slate-700">
                    {formatCurrency(kpis.pontoEquilibrio)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Faturamento mínimo para cobrir os custos fixos.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">
                    CMa (Contribuição Média)
                  </h3>
                  <p className="text-3xl font-black text-amber-600">{formatCurrency(kpis.cma)}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Margem gerada por cada fórmula ({kpis.totalOrders} pedidos).
                  </p>
                </div>

                <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md flex flex-col justify-center text-center">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Lucro Líquido Realizado
                  </h3>
                  <p
                    className={`text-5xl font-black ${kpis.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {formatCurrency(kpis.lucro)}
                  </p>
                  <p className="text-sm text-slate-500 mt-3">
                    Resultado final do caixa operacional (Receitas - Despesas).
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
