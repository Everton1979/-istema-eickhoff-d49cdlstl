import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, ArrowRight, HelpCircle } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from 'react-router-dom'

export function PricingAssistant() {
  const { filteredMonthlyMetrics, filteredTransactions, filters } = useFinanceStore()
  const [cost, setCost] = useState('')

  const markupMultiplier = useMemo(() => {
    if (filteredMonthlyMetrics.length === 0) return 1

    let cfa = 0
    let varExpOperacional = 0

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE' && targetStatuses.includes(t.status)) {
        if (t.categoryId === 'FIXA') cfa += t.amount
        if (t.categoryId === 'VARIAVEL') {
          if (
            t.subcategoryId !== 'materia_prima' &&
            t.subcategoryId !== 'embalagens' &&
            t.subcategoryId !== 'medicamentos_drogaria'
          ) {
            varExpOperacional += t.amount
          }
        }
      }
    })

    const sales = filteredMonthlyMetrics.reduce((sum, m) => sum + m.total_system_sales, 0)
    const raw = filteredMonthlyMetrics.reduce((sum, m) => sum + m.raw_material_costs, 0)

    const divisor = sales > 0 ? (sales - (cfa + varExpOperacional + raw)) / sales : 0
    return divisor > 0 ? 1 / divisor : 1
  }, [filteredMonthlyMetrics, filteredTransactions, filters])

  const numericCost = parseFloat(cost)
  const suggestedPrice = !isNaN(numericCost) && numericCost > 0 ? numericCost * markupMultiplier : 0

  return (
    <Card className="rounded-sm shadow-sm w-full flex flex-col justify-center border-t-4 border-t-purple-500 bg-gradient-to-br from-white to-purple-50/30">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 text-purple-700 mb-3">
          <Calculator className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1">
            Assistente de Precificação
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/glossario#assistente-precificacao">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400 hover:text-purple-600 cursor-pointer" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center" side="bottom">
                <p className="text-xs">
                  Ferramenta que projeta o preço de venda sugerido utilizando o Markup Multiplicador
                  configurado.
                </p>
                <p className="text-[9px] text-purple-300 mt-1 border-t border-slate-700/50 pt-1">
                  Clique para ver no Glossário
                </p>
              </TooltipContent>
            </Tooltip>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">
              Custo (MP + Emb)
            </Label>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-xs text-gray-500 font-medium">R$</span>
              <Input
                type="number"
                step="0.01"
                className="h-7 text-xs pl-7 bg-white shadow-inner"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="text-purple-400 mt-4 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex-1 text-right bg-white p-1.5 rounded-sm border border-purple-100 shadow-sm">
            <Label className="text-[10px] text-purple-600/70 uppercase tracking-wider block">
              Preço Sugerido
            </Label>
            <p className="text-sm font-bold text-purple-700 font-mono tracking-tight mt-0.5">
              R$ {suggestedPrice.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-gray-400 text-center">
          Baseado no Markup atual:{' '}
          <span className="font-semibold text-purple-600">{markupMultiplier.toFixed(2)}x</span>
        </div>
      </CardContent>
    </Card>
  )
}
