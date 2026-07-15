import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { useState, useMemo } from 'react'
import { TrendingUp, ArrowUpRight, HelpCircle, Activity } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from 'react-router-dom'

export function KumonSimulator() {
  const { filteredMonthlyMetrics } = useFinanceStore()
  const [priceAdjustment, setPriceAdjustment] = useState(1)

  const avgFormulas = useMemo(() => {
    if (filteredMonthlyMetrics.length === 0) return 0
    const total = filteredMonthlyMetrics.reduce(
      (sum, m) => sum + (m.num_formulas_capsulas || 0) + (m.num_formulas_dermato || 0),
      0,
    )
    return total / filteredMonthlyMetrics.length
  }, [filteredMonthlyMetrics])

  const projectedGain = avgFormulas * priceAdjustment

  return (
    <Card className="border-green-300 bg-green-200/50 shadow-sm relative overflow-hidden">
      <div className="absolute -right-6 -top-6 text-emerald-500/10 z-0 pointer-events-none">
        <Activity className="w-32 h-32" />
      </div>
      <CardContent className="p-5 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Simulador de Impacto (KUMON)
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/glossario#simulador-kumon">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400 hover:text-emerald-600 cursor-pointer" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-center" side="top">
                  <p className="text-xs">
                    Simula o ganho marginal. Veja o impacto de pequenos ajustes no lucro final.
                  </p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <p className="text-xs font-bold text-emerald-700 mb-4">
              Ajuste o valor para simular o acréscimo médio no preço de venda ou redução de custo
              unitário.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">
                  Ajuste de Preço/Custo Unitário:
                </span>
                <span className="text-sm font-black text-emerald-600 bg-white px-2 py-0.5 rounded border border-green-300">
                  + R$ {priceAdjustment.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[priceAdjustment]}
                min={0}
                max={10}
                step={0.5}
                onValueChange={(val) => setPriceAdjustment(val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-emerald-600/70 font-bold px-1">
                <span>R$ 0</span>
                <span>R$ 5</span>
                <span>R$ 10</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-5/12 bg-white rounded-lg p-4 border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Ganho Projetado no Mês
            </span>
            <p className="text-3xl font-black text-emerald-600 flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-6 h-6" />
              R$ {projectedGain.toFixed(2)}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">
              Baseado na média de <strong>{Math.round(avgFormulas)}</strong> fórmulas/mês.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
