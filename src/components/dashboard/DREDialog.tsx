import { useState, useMemo } from 'react'
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
import { FileText, Loader2, PieChart as PieChartIcon, Search } from 'lucide-react'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { Transaction } from '@/types/finance'
import { PieChart, Pie, Cell } from 'recharts'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
]

const chartConfig = {
  value: {
    label: 'Valor',
  },
}

export function DREDialog() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(lastDay)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<Transaction[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const { fetchTransactionsForExport } = useFinanceStore()
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
        description: 'Falha ao buscar dados para o DRE.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const dre = useMemo(() => {
    const receitas: Record<string, number> = {}
    const variaveis: Record<string, number> = {}
    const fixas: Record<string, number> = {}

    let totalReceitas = 0
    let totalVariaveis = 0
    let totalFixas = 0

    data.forEach((tx) => {
      const sub = tx.subcategoryId || 'Outros'
      if (tx.type === 'INCOME') {
        receitas[sub] = (receitas[sub] || 0) + tx.amount
        totalReceitas += tx.amount
      } else if (tx.type === 'EXPENSE') {
        if (tx.categoryId === 'VARIAVEL') {
          variaveis[sub] = (variaveis[sub] || 0) + tx.amount
          totalVariaveis += tx.amount
        } else {
          fixas[sub] = (fixas[sub] || 0) + tx.amount
          totalFixas += tx.amount
        }
      }
    })

    const margemContribuicao = totalReceitas - totalVariaveis
    const resultadoLiquido = margemContribuicao - totalFixas

    const receitasChart = Object.entries(receitas)
      .map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value)
    const despesasChart = [
      ...Object.entries(variaveis).map(([name, value]) => ({ name: `(V) ${name}`, value })),
      ...Object.entries(fixas).map(([name, value]) => ({ name: `(F) ${name}`, value })),
    ]
      .sort((a, b) => b.value - a.value)
      .map((item, i) => ({ ...item, fill: COLORS[i % COLORS.length] }))

    return {
      receitas,
      totalReceitas,
      variaveis,
      totalVariaveis,
      fixas,
      totalFixas,
      margemContribuicao,
      resultadoLiquido,
      receitasChart,
      despesasChart,
    }
  }, [data])

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

    const renderRows = (items: Record<string, number>) => {
      return Object.entries(items)
        .sort((a, b) => b[1] - a[1])
        .map(
          ([name, val]) => `
          <tr>
            <td style="padding-left: 20px;">${name}</td>
            <td class="amount">${formatCurrency(val)}</td>
          </tr>
        `,
        )
        .join('')
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Demonstração do Resultado do Exercício (DRE)</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; font-size: 24px; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border-bottom: 1px solid #eee; padding: 8px 12px; text-align: left; }
            th { font-weight: bold; background-color: #fafafa; }
            .amount { text-align: right; }
            .group-header { font-weight: bold; background-color: #f8f9fa; }
            .total-row { font-weight: bold; background-color: #f1f5f9; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Demonstração do Resultado do Exercício (DRE)</h1>
          <div class="subtitle">Período: ${formatDate(startDate)} a ${formatDate(endDate)}</div>
          
          <table>
            <tbody>
              <tr class="group-header">
                <td>Receita Operacional Bruta</td>
                <td class="amount positive">${formatCurrency(dre.totalReceitas)}</td>
              </tr>
              ${renderRows(dre.receitas)}
              
              <tr class="group-header">
                <td>(-) Custos e Despesas Variáveis</td>
                <td class="amount negative">${formatCurrency(dre.totalVariaveis)}</td>
              </tr>
              ${renderRows(dre.variaveis)}
              
              <tr class="total-row">
                <td>(=) Margem de Contribuição</td>
                <td class="amount ${dre.margemContribuicao >= 0 ? 'positive' : 'negative'}">${formatCurrency(dre.margemContribuicao)}</td>
              </tr>
              
              <tr class="group-header">
                <td>(-) Despesas Fixas</td>
                <td class="amount negative">${formatCurrency(dre.totalFixas)}</td>
              </tr>
              ${renderRows(dre.fixas)}
              
              <tr class="total-row" style="font-size: 16px; background-color: #e2e8f0;">
                <td>(=) Resultado Líquido</td>
                <td class="amount ${dre.resultadoLiquido >= 0 ? 'positive' : 'negative'}">${formatCurrency(dre.resultadoLiquido)}</td>
              </tr>
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-11 px-4 text-sm bg-white hover:bg-slate-50 text-slate-700 border-slate-200 flex gap-2 shadow-sm"
        >
          <PieChartIcon className="w-4 h-4 text-indigo-600" />
          DRE
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Demonstração do Resultado do Exercício (DRE)</DialogTitle>
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
            <Button onClick={handleSearch} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Gerar Visão
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
              <div className="h-full flex items-center justify-center text-slate-500 py-20">
                Selecione o período e clique em "Gerar Visão" para visualizar o DRE.
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <h3 className="text-sm font-semibold text-center mb-4 text-slate-700">
                      Composição de Receitas
                    </h3>
                    <div className="h-[250px]">
                      {dre.receitasChart.length > 0 ? (
                        <ChartContainer config={chartConfig} className="w-full h-full">
                          <PieChart>
                            <Pie
                              data={dre.receitasChart}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              nameKey="name"
                            >
                              {dre.receitasChart.map((entry, index) => (
                                <Cell key={entry.name} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(val) => formatCurrency(Number(val))}
                                />
                              }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400">
                          Sem dados de receita
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <h3 className="text-sm font-semibold text-center mb-4 text-slate-700">
                      Composição de Despesas
                    </h3>
                    <div className="h-[250px]">
                      {dre.despesasChart.length > 0 ? (
                        <ChartContainer config={chartConfig} className="w-full h-full">
                          <PieChart>
                            <Pie
                              data={dre.despesasChart}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              nameKey="name"
                            >
                              {dre.despesasChart.map((entry, index) => (
                                <Cell key={entry.name} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(val) => formatCurrency(Number(val))}
                                />
                              }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400">
                          Sem dados de despesa
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 border-b bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Demonstrativo Detalhado</h3>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="bg-slate-50 font-semibold border-b">
                          <td className="p-3">Receita Operacional Bruta</td>
                          <td className="p-3 text-right text-green-600">
                            {formatCurrency(dre.totalReceitas)}
                          </td>
                        </tr>
                        {Object.entries(dre.receitas)
                          .sort((a, b) => b[1] - a[1])
                          .map(([name, val]) => (
                            <tr key={name} className="border-b border-slate-100 last:border-0">
                              <td className="p-3 pl-8 text-slate-600">{name}</td>
                              <td className="p-3 text-right text-slate-700">
                                {formatCurrency(val)}
                              </td>
                            </tr>
                          ))}

                        <tr className="bg-slate-50 font-semibold border-y">
                          <td className="p-3">(-) Custos e Despesas Variáveis</td>
                          <td className="p-3 text-right text-red-600">
                            {formatCurrency(dre.totalVariaveis)}
                          </td>
                        </tr>
                        {Object.entries(dre.variaveis)
                          .sort((a, b) => b[1] - a[1])
                          .map(([name, val]) => (
                            <tr key={name} className="border-b border-slate-100 last:border-0">
                              <td className="p-3 pl-8 text-slate-600">{name}</td>
                              <td className="p-3 text-right text-slate-700">
                                {formatCurrency(val)}
                              </td>
                            </tr>
                          ))}

                        <tr className="bg-slate-100 font-bold border-y">
                          <td className="p-3">(=) Margem de Contribuição</td>
                          <td
                            className={`p-3 text-right ${dre.margemContribuicao >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {formatCurrency(dre.margemContribuicao)}
                          </td>
                        </tr>

                        <tr className="bg-slate-50 font-semibold border-y">
                          <td className="p-3">(-) Despesas Fixas</td>
                          <td className="p-3 text-right text-red-600">
                            {formatCurrency(dre.totalFixas)}
                          </td>
                        </tr>
                        {Object.entries(dre.fixas)
                          .sort((a, b) => b[1] - a[1])
                          .map(([name, val]) => (
                            <tr key={name} className="border-b border-slate-100 last:border-0">
                              <td className="p-3 pl-8 text-slate-600">{name}</td>
                              <td className="p-3 text-right text-slate-700">
                                {formatCurrency(val)}
                              </td>
                            </tr>
                          ))}

                        <tr className="bg-slate-200 font-bold text-base border-t">
                          <td className="p-4">(=) Resultado Líquido</td>
                          <td
                            className={`p-4 text-right ${dre.resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {formatCurrency(dre.resultadoLiquido)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
