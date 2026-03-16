import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, ArrowRight } from 'lucide-react'
import { useState, useMemo } from 'react'

export function PricingAssistant() {
  const { monthlyMetrics, transactions } = useFinanceStore()
  const [cost, setCost] = useState('')

  const markupMultiplier = useMemo(() => {
    if (monthlyMetrics.length === 0) return 1

    const sorted = [...monthlyMetrics].sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.month - a.month,
    )
    const latest = sorted[0]

    let cfa = 0
    let varExp = 0

    transactions.forEach((t) => {
      const d = new Date(t.date)
      if (
        d.getMonth() + 1 === latest.month &&
        d.getFullYear() === latest.year &&
        t.type === 'EXPENSE'
      ) {
        if (t.categoryId === 'FIXA') cfa += t.amount
        if (t.categoryId === 'VARIAVEL') varExp += t.amount
      }
    })

    const sales = latest.total_system_sales
    const raw = latest.raw_material_costs
    const divisor = sales > 0 ? (sales - (cfa + varExp + raw)) / sales : 0
    return divisor > 0 ? 1 / divisor : 1
  }, [monthlyMetrics, transactions])

  const numericCost = parseFloat(cost)
  const suggestedPrice = !isNaN(numericCost) && numericCost > 0 ? numericCost * markupMultiplier : 0

  return (
    <Card className="rounded-sm shadow-sm h-full flex flex-col justify-center border-t-4 border-t-purple-500 bg-gradient-to-br from-white to-purple-50/30">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 text-purple-700 mb-3">
          <Calculator className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wide">Assistente de Precificação</h3>
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
