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
import { FileText, Loader2, PieChart as PieChartIcon, Search } from 'lucide-react'
import { useFinanceStore, PAYMENT_METHODS } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { Transaction } from '@/types/finance'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DREDialog() {
  const { fetchTransactionsForExport, filters } = useFinanceStore()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<Transaction[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Sync DRE date range with global filters
  useEffect(() => {
    if (filters.years.length > 0 && filters.months.length > 0) {
      const years = filters.years.map((y) => parseInt(y, 10)).sort((a, b) => a - b)
      const months = filters.months.map((m) => parseInt(m, 10)).sort((a, b) => a - b)

      const startYear = years[0]
      const startMonth = months[0]
      const endYear = years[years.length - 1]
      const endMonth = months[months.length - 1]

      const firstDayDate = new Date(startYear, startMonth - 1, 1)
      const lastDayDate = new Date(endYear, endMonth, 0)

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
  }, [filters.years, filters.months])
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

  const SUBCATEGORY_LABELS: Record<string, string> = {
    prolabore: 'Pró-labore',
    pessoal: 'Pessoal, Encargos e Benefícios',
    infraestrutura: 'Infraestrutura e Aluguel',
    operacional_administrativo: 'Operacional e Administrativo',
    utilidades: 'Utilidades (Energia, Água, Internet)',
    servicos_profissionais: 'Serviços Profissionais e Conformidade',
    seguros: 'Seguros',
    financeiro: 'Taxas Bancárias e Tarifas',
    marketing: 'Marketing e Social',
    softwares_assinaturas: 'Softwares e Assinaturas',
    juros_multas: 'Juros, Multas e Encargos',
    materia_prima: 'Matéria-prima e Ativos',
    embalagens: 'Embalagens',
    medicamentos_drogaria: 'Medicamentos Drogaria',
    impostos: 'Impostos e Tributos',
    taxas_cartao: 'Taxas de Cartão',
    logistica: 'Logística e Fretes',
    fidelidade_promocao: 'Fidelidade e Promoção',
    outros: 'Outros',
  }

  const dre = useMemo(() => {
    const receitasOperacionais: Record<string, number> = {}
    const receitasNaoOperacionais: Record<string, number> = {}
    const variaveis: Record<string, number> = {}
    const fixas: Record<string, number> = {}
    const financeiras: Record<string, number> = {}
    const investimentos: Record<string, number> = {}
    let totalReceitasOperacionais = 0
    let totalReceitasNaoOperacionais = 0
    let totalVariaveis = 0
    let totalFixas = 0
    let totalFinanceiras = 0
    let totalInvestimentos = 0

    data.forEach((tx) => {
      if (tx.status !== 'REALIZADO') return

      if (tx.type !== 'INCOME' && tx.type !== 'EXPENSE') {
        if (tx.type === 'INVESTIMENTO') {
          const invName = tx.description || 'Equipamentos e Investimentos'
          investimentos[invName] = (investimentos[invName] || 0) + tx.amount
          totalInvestimentos += tx.amount
        }
        return // Exclude from operational calculations
      }

      const rawSub = tx.subcategoryId || 'outros'
      const sub = SUBCATEGORY_LABELS[rawSub] || rawSub

      if (tx.type === 'INCOME') {
        if (tx.categoryId === 'RECEITA_NAO_OPERACIONAL') {
          receitasNaoOperacionais['Dividendos e Lucros'] =
            (receitasNaoOperacionais['Dividendos e Lucros'] || 0) + tx.amount
          totalReceitasNaoOperacionais += tx.amount
        } else {
          let name = 'Vendas/Serviços'
          if (tx.paymentMethodId) {
            const pm = PAYMENT_METHODS.find((p) => p.id === tx.paymentMethodId)
            if (pm) name = `Vendas - ${pm.name}`
          }
          receitasOperacionais[name] = (receitasOperacionais[name] || 0) + tx.amount
          totalReceitasOperacionais += tx.amount
        }
      } else if (tx.type === 'EXPENSE') {
        if (tx.categoryId === 'VARIAVEL') {
          variaveis[sub] = (variaveis[sub] || 0) + tx.amount
          totalVariaveis += tx.amount
        } else {
          if (tx.subcategoryId === 'juros_multas') {
            financeiras['Juros, Multas e Encargos'] =
              (financeiras['Juros, Multas e Encargos'] || 0) + tx.amount
            totalFinanceiras += tx.amount
          } else {
            fixas[sub] = (fixas[sub] || 0) + tx.amount
            totalFixas += tx.amount
          }
        }
      }
    })

    const margemContribuicao = totalReceitasOperacionais - totalVariaveis
    const resultadoOperacional = margemContribuicao - totalFixas
    // Ensure Lucro Líquido matches exactly (Total Receitas - Total Despesas)
    const resultadoLiquido =
      resultadoOperacional - totalInvestimentos + totalReceitasNaoOperacionais - totalFinanceiras

    return {
      receitasOperacionais,
      totalReceitasOperacionais,
      receitasNaoOperacionais,
      totalReceitasNaoOperacionais,
      variaveis,
      totalVariaveis,
      fixas,
      totalFixas,
      financeiras,
      totalFinanceiras,
      investimentos,
      totalInvestimentos,
      margemContribuicao,
      resultadoOperacional,
      resultadoLiquido,
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
                <td class="amount positive">${formatCurrency(dre.totalReceitasOperacionais)}</td>
              </tr>
              ${renderRows(dre.receitasOperacionais)}
              
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

              <tr class="total-row">
                <td>(=) Resultado Operacional</td>
                <td class="amount ${dre.resultadoOperacional >= 0 ? 'positive' : 'negative'}">${formatCurrency(dre.resultadoOperacional)}</td>
              </tr>
              
              <tr class="group-header">
                <td>(-) Investimentos / Equipamentos</td>
                <td class="amount negative">${formatCurrency(dre.totalInvestimentos)}</td>
              </tr>
              ${renderRows(dre.investimentos)}
              
              <tr class="group-header">
                <td>(+) Receitas Não Operacionais</td>
                <td class="amount positive">${formatCurrency(dre.totalReceitasNaoOperacionais)}</td>
              </tr>
              ${renderRows(dre.receitasNaoOperacionais)}
              
              <tr class="group-header">
                <td>(-) Despesas Financeiras</td>
                <td class="amount negative">${formatCurrency(dre.totalFinanceiras)}</td>
              </tr>
              ${renderRows(dre.financeiras)}
              
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
          className="h-11 px-4 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 flex gap-2 shadow-sm font-bold w-full"
        >
          <PieChartIcon className="w-4 h-4 text-emerald-600" />
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
                            {formatCurrency(dre.totalReceitasOperacionais)}
                          </td>
                        </tr>
                        {Object.entries(dre.receitasOperacionais)
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

                        <tr className="bg-slate-100 font-bold border-y">
                          <td className="p-3">(=) Resultado Operacional</td>
                          <td
                            className={`p-3 text-right ${dre.resultadoOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {formatCurrency(dre.resultadoOperacional)}
                          </td>
                        </tr>

                        <tr className="bg-slate-50 font-semibold border-y">
                          <td className="p-3">(-) Investimentos / Equipamentos</td>
                          <td className="p-3 text-right text-red-600">
                            {formatCurrency(dre.totalInvestimentos)}
                          </td>
                        </tr>
                        {Object.entries(dre.investimentos)
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
                          <td className="p-3">(+) Receitas Não Operacionais</td>
                          <td className="p-3 text-right text-green-600">
                            {formatCurrency(dre.totalReceitasNaoOperacionais)}
                          </td>
                        </tr>
                        {Object.entries(dre.receitasNaoOperacionais)
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
                          <td className="p-3">(-) Despesas Financeiras</td>
                          <td className="p-3 text-right text-red-600">
                            {formatCurrency(dre.totalFinanceiras)}
                          </td>
                        </tr>
                        {Object.entries(dre.financeiras)
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
