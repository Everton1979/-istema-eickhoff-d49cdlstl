import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function useKpiMetrics() {
  const { transactions, filteredMonthlyMetrics, categories, filters } = useFinanceStore()

  return useMemo(() => {
    const totalRawMaterial = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + m.raw_material_costs,
      0,
    )

    let receitas = 0
    let despesasFluxo = 0
    let custosVariaveisOperacionais = 0
    let custosFixos = 0

    transactions.forEach((tx) => {
      let txDateStr = ''
      if (tx.date.includes('T')) {
        txDateStr = tx.date.split('T')[0]
      } else {
        txDateStr = tx.date.substring(0, 10)
      }

      const txYear = txDateStr.substring(0, 4)
      const txMonth = txDateStr.substring(5, 7)

      if (filters.years && filters.years.length > 0 && !filters.years.includes(txYear)) return
      if (filters.months && filters.months.length > 0 && !filters.months.includes(txMonth)) return

      if (tx.status === 'REALIZADO') {
        if (tx.type === 'INCOME') {
          receitas += tx.amount
        } else if (tx.type === 'EXPENSE') {
          despesasFluxo += tx.amount
          const cat = categories.find((c) => c.id === tx.categoryId)
          if (cat?.isVariable) {
            if (
              tx.subcategoryId !== 'materia_prima' &&
              tx.subcategoryId !== 'embalagens' &&
              tx.subcategoryId !== 'medicamentos_drogaria'
            ) {
              custosVariaveisOperacionais += tx.amount
            }
          } else {
            custosFixos += tx.amount
          }
        }
      }
    })

    const margem = receitas - (custosVariaveisOperacionais + totalRawMaterial)
    const lucro = receitas - despesasFluxo
    const ebitda = margem - custosFixos
    const indiceMargem = receitas > 0 ? margem / receitas : 0
    const pontoEquilibrio = indiceMargem > 0 ? custosFixos / indiceMargem : 0

    return { receitas, despesas: despesasFluxo, margem, lucro, ebitda, pontoEquilibrio }
  }, [transactions, filteredMonthlyMetrics, categories, filters])
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)

function KpiCard({ kpi }: { kpi: any }) {
  return (
    <Card className={cn('rounded-sm border-t-4 shadow-sm bg-white', kpi.border)}>
      <CardContent className="p-2 text-center flex flex-col justify-center h-full">
        <h3 className="text-[10px] font-bold text-gray-600 uppercase mb-1 flex items-center justify-center gap-1">
          {kpi.title}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={`/glossario#${kpi.id}`}>
                <HelpCircle className="w-3 h-3 text-gray-400 hover:text-blue-600 cursor-pointer" />
              </Link>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-center" side="bottom">
              <p className="text-xs">{kpi.tooltip}</p>
              <p className="text-[9px] text-blue-300 mt-1 border-t border-slate-700/50 pt-1">
                Clique para ver no Glossário
              </p>
            </TooltipContent>
          </Tooltip>
        </h3>
        <p className={cn('text-xl font-bold tracking-tight', kpi.color)}>{kpi.value}</p>
      </CardContent>
    </Card>
  )
}

export function OperationalKpis() {
  const metrics = useKpiMetrics()
  const kpis = [
    {
      id: 'receitas-operacionais',
      title: 'RECEITAS',
      tooltip: 'Total de entradas financeiras realizadas no período.',
      value: formatCurrency(metrics.receitas),
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      id: 'despesas-e-custos',
      title: 'DESPESAS E CUSTOS',
      tooltip: 'Soma de todas as saídas de caixa realizadas (fixas e variáveis).',
      value: formatCurrency(-metrics.despesas),
      color: 'text-red-500',
      border: 'border-t-red-500',
    },
    {
      id: 'lucro-liquido',
      title: 'LUCRO LÍQUIDO',
      tooltip: 'Resultado final de caixa (Receitas Realizadas - Despesas Realizadas).',
      value: formatCurrency(metrics.lucro),
      color: metrics.lucro >= 0 ? 'text-emerald-600' : 'text-red-600',
      border: metrics.lucro >= 0 ? 'border-t-emerald-500' : 'border-t-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} kpi={kpi} />
      ))}
    </div>
  )
}

export function StrategicKpis() {
  const metrics = useKpiMetrics()
  const kpis = [
    {
      id: 'ebitda',
      title: 'EBITDA',
      tooltip: 'Geração de caixa operacional (Margem de Contribuição - Custos Fixos).',
      value: formatCurrency(metrics.ebitda),
      color: metrics.ebitda >= 0 ? 'text-emerald-600' : 'text-red-600',
      border: metrics.ebitda >= 0 ? 'border-t-emerald-500' : 'border-t-red-500',
    },
    {
      id: 'margem-de-contribuicao',
      title: 'MARGEM DE CONTRIBUIÇÃO',
      tooltip: 'Receita bruta menos custos variáveis operacionais e insumos.',
      value: formatCurrency(metrics.margem),
      color: 'text-blue-600',
      border: 'border-t-blue-500',
    },
    {
      id: 'ponto-de-equilibrio',
      title: 'PONTO DE EQUILÍBRIO',
      tooltip: 'Faturamento necessário para cobrir a parcela fixa de custos.',
      value: formatCurrency(metrics.pontoEquilibrio),
      color: 'text-slate-600',
      border: 'border-t-slate-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} kpi={kpi} />
      ))}
    </div>
  )
}
