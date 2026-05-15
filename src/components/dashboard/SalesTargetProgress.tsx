import { useFinanceStore } from '@/stores/financeStore'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Pencil, Check, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { getWorkingDays } from '@/lib/holidays'
import { cn } from '@/lib/utils'

export function SalesTargetProgress({
  variant = 'GLOBAL',
}: {
  variant?: 'GLOBAL' | 'MANIPULACAO'
}) {
  const { monthlyMetrics, saveMonthlyMetric, filters, transactions } = useFinanceStore()
  const { profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState('')

  const { metric, monthName, workingDays, achieved, isPastMonth } = useMemo(() => {
    const today = new Date()
    const currentYear = parseInt(
      (filters?.years && filters.years[0]) || today.getFullYear().toString(),
    )
    const targetStatuses =
      Array.isArray(filters?.statuses) && filters.statuses.length > 0
        ? filters.statuses
        : ['REALIZADO']

    let target = 0
    let inc = 0
    let wDays = 0
    let mName = ''
    let defaultMonth = 1
    let foundMetric = null
    let pastMonth = false

    if (!Array.isArray(filters?.months) || filters.months.length === 0) {
      pastMonth = currentYear < today.getFullYear()
      target = (monthlyMetrics || [])
        .filter((m) => m.year === currentYear)
        .reduce(
          (sum, m) =>
            sum + (variant === 'GLOBAL' ? m.global_sales_target || 0 : m.sales_target || 0),
          0,
        )

      ;(transactions || []).forEach((tx) => {
        const d = new Date(tx.date)
        if (
          d.getFullYear() === currentYear &&
          tx.type === 'INCOME' &&
          targetStatuses.includes(tx.status)
        ) {
          if (variant === 'GLOBAL') {
            inc += tx.amount
          } else if (variant === 'MANIPULACAO') {
            inc += tx.amount
          }
        }
      })
      wDays = 252 // approx yearly
      mName = `Ano ${currentYear}`
    } else {
      const currentMonth = parseInt(filters.months[0])
      pastMonth =
        currentYear < today.getFullYear() ||
        (currentYear === today.getFullYear() && currentMonth < today.getMonth() + 1)
      defaultMonth = currentMonth
      const monthLabels = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ]

      foundMetric = (monthlyMetrics || []).find(
        (m) => m.year === currentYear && m.month === currentMonth,
      )
      target =
        variant === 'GLOBAL'
          ? foundMetric?.global_sales_target || 0
          : foundMetric?.sales_target || 0
      wDays = getWorkingDays(currentYear, currentMonth)
      mName = `${monthLabels[currentMonth - 1]}/${currentYear}`

      ;(transactions || []).forEach((tx) => {
        const d = new Date(tx.date)
        if (
          d.getFullYear() === currentYear &&
          d.getMonth() + 1 === currentMonth &&
          tx.type === 'INCOME' &&
          targetStatuses.includes(tx.status)
        ) {
          if (variant === 'GLOBAL') {
            inc += tx.amount
          } else if (variant === 'MANIPULACAO') {
            inc += tx.amount
          }
        }
      })
    }

    return {
      isPastMonth: pastMonth,
      metric: foundMetric || {
        id: '',
        month: defaultMonth,
        year: currentYear,
        sales_target: 0,
        global_sales_target: 0,
        orders_count: 0,
        total_system_sales: 0,
        raw_material_costs: 0,
        num_formulas_capsulas: 0,
        vendas_capsulas: 0,
        custo_mp_emb_capsulas: 0,
        num_formulas_dermato: 0,
        vendas_dermato: 0,
        custo_mp_emb_dermato: 0,
      },
      monthName: mName,
      workingDays: wDays,
      achieved: inc,
    }
  }, [monthlyMetrics, filters, transactions, variant])

  const target = variant === 'GLOBAL' ? metric.global_sales_target || 0 : metric.sales_target || 0
  const remaining = Math.max(0, target - achieved)
  const exceeded = Math.max(0, achieved - target)
  const remainingPct = target > 0 ? (remaining / target) * 100 : 0
  const achievedPct = target > 0 ? Math.min((achieved / target) * 100, 100) : 0
  const dailyTarget = workingDays > 0 ? target / workingDays : 0

  const handleEdit = () => {
    setTempValue(target.toString())
    setIsEditing(true)
  }

  const handleSave = async () => {
    const val = parseFloat(tempValue)
    if (!isNaN(val) && val >= 0) {
      if (variant === 'GLOBAL') {
        await saveMonthlyMetric({ ...metric, global_sales_target: val })
      } else {
        await saveMonthlyMetric({ ...metric, sales_target: val })
      }
    }
    setIsEditing(false)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <Card
      className={cn(
        'rounded-sm shadow-sm w-full flex flex-col justify-center border-t-4 relative',
        variant === 'GLOBAL' ? 'border-t-emerald-500' : 'border-t-blue-500',
      )}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div
            className={cn(
              'flex items-center gap-1.5',
              variant === 'GLOBAL' ? 'text-emerald-600' : 'text-blue-600',
            )}
          >
            <Target className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              Meta {variant === 'GLOBAL' ? 'Vendas Totais' : 'Vendas Manipulação'} ({monthName})
            </h3>
          </div>
          {!isEditing &&
            profile?.role !== 'Visitante' &&
            Array.isArray(filters?.months) &&
            filters.months.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-5 w-5 absolute right-2 top-2 text-gray-400',
                  variant === 'GLOBAL' ? 'hover:text-emerald-600' : 'hover:text-blue-600',
                )}
                onClick={handleEdit}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1.5 text-xs text-gray-500">R$</span>
              <Input
                type="number"
                className="h-7 text-xs pl-6"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <Button
              size="icon"
              className={cn(
                'h-7 w-7 shrink-0',
                variant === 'GLOBAL'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-blue-500 hover:bg-blue-600',
              )}
              onClick={handleSave}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-500 shrink-0"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-end mb-1">
            <div>
              <p className="text-[10px] text-gray-500 font-medium">Meta Mês</p>
              <p className="text-sm font-bold text-gray-800">{formatCurrency(target)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-medium">Realizado</p>
              <p
                className={cn(
                  'text-sm font-bold',
                  variant === 'GLOBAL' ? 'text-emerald-600' : 'text-blue-600',
                )}
              >
                {formatCurrency(achieved)}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1 mt-1.5">
          <Progress
            value={achievedPct}
            className={cn(
              'h-2 bg-gray-100',
              variant === 'GLOBAL' ? '[&>div]:bg-emerald-500' : '[&>div]:bg-blue-500',
            )}
          />
          <div className="flex justify-between items-start text-[10px] mt-1">
            {!isPastMonth ? (
              <div className="flex flex-col">
                <p className="text-gray-500 font-medium">
                  Diária:{' '}
                  <span className="text-gray-800 font-bold">{formatCurrency(dailyTarget)}</span>
                </p>
                <span className="text-gray-400 text-[8px] -mt-0.5">({workingDays} dias úteis)</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-gray-500 font-medium">
                  Status:{' '}
                  <span
                    className={cn(
                      'font-bold',
                      achieved >= target && target > 0
                        ? variant === 'GLOBAL'
                          ? 'text-emerald-600'
                          : 'text-blue-600'
                        : 'text-orange-500',
                    )}
                  >
                    {achieved >= target && target > 0 ? 'Meta Batida' : 'Não Atingida'}
                  </span>
                </p>
              </div>
            )}
            {target > 0 && remaining > 0 && (
              <div className="flex flex-col items-end">
                <span className="font-bold text-orange-500">
                  {isPastMonth ? 'Faltou:' : 'Falta:'} {formatCurrency(remaining)}
                </span>
                <span className="text-orange-400 font-medium text-[9px] -mt-0.5">
                  ({remainingPct.toFixed(1)}% restando)
                </span>
              </div>
            )}
            {target > 0 && exceeded > 0 && (
              <div className="flex flex-col items-end">
                <span
                  className={cn(
                    'font-bold',
                    variant === 'GLOBAL' ? 'text-emerald-600' : 'text-blue-600',
                  )}
                >
                  {isPastMonth ? 'Superou:' : 'Superado:'} +{formatCurrency(exceeded)}
                </span>
                <span
                  className={cn(
                    'font-medium text-[9px] -mt-0.5',
                    variant === 'GLOBAL' ? 'text-emerald-500' : 'text-blue-500',
                  )}
                >
                  ({((exceeded / target) * 100).toFixed(1)}% acima da meta)
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
