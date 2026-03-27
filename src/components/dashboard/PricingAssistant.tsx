import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function PricingAssistant() {
  const { filteredMonthlyMetrics, filteredTransactions, filters } = useFinanceStore()
  const [cost, setCost] = useState('')
  const [sellPrice, setSellPrice] = useState('')

  const { mkpTarget, precoMinimoPorFormula } = useMemo(() => {
    let cfaTotal = 0
    let varExpOperacional = 0

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE' && targetStatuses.includes(t.status)) {
        if (t.categoryId === 'FIXA') cfaTotal += t.amount
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

    const totalRawMaterial = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + m.raw_material_costs,
      0,
    )
    const totalOrders = filteredMonthlyMetrics.reduce((sum, m) => sum + m.orders_count, 0)
    const custoTotal = cfaTotal + varExpOperacional + totalRawMaterial

    const mkp = totalRawMaterial > 0 ? custoTotal / totalRawMaterial : 0
    const minPrice = totalOrders > 0 ? custoTotal / totalOrders : 0

    return { mkpTarget: mkp, precoMinimoPorFormula: minPrice }
  }, [filteredMonthlyMetrics, filteredTransactions, filters])

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCost(val)
    const numericCost = parseFloat(val)
    if (!isNaN(numericCost) && numericCost > 0) {
      setSellPrice((numericCost * mkpTarget).toFixed(2))
    } else {
      setSellPrice('')
    }
  }

  const numericSell = parseFloat(sellPrice)
  const isTestingPrice = !isNaN(numericSell) && numericSell > 0
  const isProfitable = isTestingPrice && numericSell >= precoMinimoPorFormula

  return (
    <Card className="rounded-sm shadow-sm w-full flex flex-col justify-center border-t-4 border-t-blue-500 bg-gradient-to-br from-white to-blue-50/30 h-full min-h-[140px]">
      <CardContent className="p-3 flex flex-col h-full justify-between">
        <div className="flex items-center gap-1.5 text-blue-700 mb-2">
          <Calculator className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1">
            Assistente de Precificação
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/glossario#assistente-precificacao">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 hover:text-blue-600 cursor-pointer" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-center" side="bottom">
                <p className="text-xs">
                  Sugere o preço de venda com base no seu Mark-up Alvo e compara o valor final com o
                  Preço Mínimo por Fórmula.
                </p>
                <p className="text-[9px] text-blue-300 mt-1 border-t border-blue-200/50 pt-1">
                  Clique para ver no Glossário
                </p>
              </TooltipContent>
            </Tooltip>
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
                Custo (MP+Emb)
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1.5 text-xs text-slate-500 font-medium">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className="h-7 text-xs pl-7 bg-white shadow-inner focus-visible:ring-blue-400"
                  value={cost}
                  onChange={handleCostChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex-1">
              <Label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">
                Preço de Venda
              </Label>
              <div className="relative">
                <span
                  className={cn(
                    'absolute left-2 top-1.5 text-xs font-medium',
                    isTestingPrice
                      ? isProfitable
                        ? 'text-emerald-600'
                        : 'text-red-600'
                      : 'text-slate-500',
                  )}
                >
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className={cn(
                    'h-7 text-xs pl-7 shadow-inner transition-colors',
                    isTestingPrice
                      ? isProfitable
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 focus-visible:ring-emerald-400'
                        : 'bg-red-50 border-red-300 text-red-700 focus-visible:ring-red-400'
                      : 'bg-white focus-visible:ring-blue-400',
                  )}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              'flex flex-col p-2 rounded-sm border shadow-sm transition-colors',
              isTestingPrice
                ? isProfitable
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
                : 'bg-white border-blue-100',
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <Label
                  className={cn(
                    'text-[10px] uppercase tracking-wider block',
                    isTestingPrice
                      ? isProfitable
                        ? 'text-emerald-700'
                        : 'text-red-700'
                      : 'text-blue-600/70',
                  )}
                >
                  Preço Mín. / Fórmula
                </Label>
                <p
                  className={cn(
                    'text-sm font-bold font-mono tracking-tight mt-0.5',
                    isTestingPrice
                      ? isProfitable
                        ? 'text-emerald-800'
                        : 'text-red-800'
                      : 'text-blue-700',
                  )}
                >
                  R$ {precoMinimoPorFormula.toFixed(2)}
                </p>
              </div>

              {isTestingPrice && (
                <div className="flex items-center animate-fade-in">
                  {isProfitable ? (
                    <div className="flex flex-col items-end">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-0.5" />
                      <span className="text-[9px] font-bold text-emerald-700 uppercase">
                        Venda Saudável
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <AlertTriangle className="w-4 h-4 text-red-600 mb-0.5" />
                      <span className="text-[9px] font-bold text-red-700 uppercase">
                        Abaixo do Mínimo
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isTestingPrice && (
              <div className="mt-1.5 border-t border-black/5 pt-1.5">
                {isProfitable ? (
                  <p className="text-[9px] text-emerald-600 font-medium text-center">
                    Valor atinge o preço mín./fórmula
                  </p>
                ) : (
                  <p className="text-[9px] text-red-600 font-medium text-center">
                    Valor é menor que preço mín./fórmula
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-[9px] text-slate-500 text-center bg-white/50 py-1 rounded border border-blue-100/50 flex justify-center gap-3">
          <span>
            Mark-up Alvo: <span className="font-bold text-blue-600">{mkpTarget.toFixed(2)}x</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
