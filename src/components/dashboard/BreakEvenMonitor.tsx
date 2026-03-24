import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function BreakEvenMonitor() {
  const { filteredTransactions, categories, filters } = useFinanceStore()

  const metrics = useMemo(() => {
    let receitas = 0
    let custosVariaveis = 0
    let custosFixos = 0

    const targetStatuses = filters.statuses.length > 0 ? filters.statuses : ['REALIZADO']

    filteredTransactions.forEach((tx) => {
      if (targetStatuses.includes(tx.status)) {
        if (tx.type === 'INCOME') {
          receitas += tx.amount
        } else {
          const cat = categories.find((c) => c.id === tx.categoryId)
          if (cat?.isVariable) {
            custosVariaveis += tx.amount
          } else {
            custosFixos += tx.amount
          }
        }
      }
    })

    const margem = receitas - custosVariaveis
    const indiceMargem = receitas > 0 ? margem / receitas : 0
    const pontoEquilibrio = indiceMargem > 0 ? custosFixos / indiceMargem : 0

    return { receitas, pontoEquilibrio }
  }, [filteredTransactions, categories, filters])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const target = metrics.pontoEquilibrio
  const current = metrics.receitas
  const percentage = target > 0 ? (current / target) * 100 : 0
  const clampedPercentage = Math.min(percentage, 100)
  const remaining = Math.max(0, target - current)

  const isProfitable = current >= target && target > 0
  const isClose = percentage >= 80 && percentage < 100

  return (
    <Card className="rounded-sm shadow-sm border flex flex-col h-full bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div
        className={cn(
          'absolute top-0 left-0 w-full h-1',
          isProfitable ? 'bg-emerald-500' : isClose ? 'bg-yellow-400' : 'bg-blue-500',
        )}
      />

      <CardContent className="p-3 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 text-slate-700">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              Monitor Ponto de Equilíbrio
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-center" side="bottom">
                  <div className="text-xs space-y-1">
                    <p>
                      Indica o momento em que a receita cobre todos os custos (fixos e variáveis).
                    </p>
                    <p className="text-[10px] text-slate-300">
                      <span className="font-semibold text-red-400">{'< 100%'}</span>: Prejuízo |{' '}
                      <span className="font-semibold text-yellow-400">{'= 100%'}</span>: Zero a zero
                      | <span className="font-semibold text-emerald-400">{'> 100%'}</span>: Lucro
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </h3>
          </div>
          {isProfitable && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
              <CheckCircle2 className="w-3 h-3" /> Em Lucro
            </div>
          )}
          {isClose && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-sm">
              <AlertCircle className="w-3 h-3" /> Quase lá!
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 justify-center">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase">Receita Atual</p>
              <p
                className={cn(
                  'text-lg font-bold tracking-tight leading-none',
                  isProfitable ? 'text-emerald-600' : 'text-slate-800',
                )}
              >
                {formatCurrency(current)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-medium uppercase">Meta (P.E.)</p>
              <p className="text-sm font-bold text-slate-600 leading-none">
                {formatCurrency(target)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-700',
                  isProfitable ? 'bg-emerald-500' : isClose ? 'bg-yellow-400' : 'bg-blue-500',
                )}
                style={{ width: `${clampedPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-semibold text-slate-600">
                {percentage.toFixed(1)}% atingido
              </span>
              {!isProfitable && target > 0 && (
                <span className="text-slate-500">
                  Faltam{' '}
                  <span className="font-bold text-slate-700">{formatCurrency(remaining)}</span>
                </span>
              )}
              {isProfitable && (
                <span className="text-emerald-600 font-medium">
                  Operação gerando lucro líquido!
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
