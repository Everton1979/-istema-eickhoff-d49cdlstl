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

function TargetCard({
  title,
  subtitle,
  target,
  achieved,
  workingDays,
  isPastMonth,
  isEditable,
  onSave,
  colorClass,
  textClass,
  hoverTextClass,
  bgClass,
  progressColorClass,
  readonly,
  showPercentage,
}: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState('')

  const remaining = Math.max(0, target - achieved)
  const exceeded = Math.max(0, achieved - target)
  const remainingPct = target > 0 ? (remaining / target) * 100 : 0
  const achievedPct = target > 0 ? Math.min((achieved / target) * 100, 100) : 0
  const dailyTarget = workingDays > 0 ? target / workingDays : 0

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  const handleEdit = () => {
    if (target === 0) {
      setTempValue('')
    } else {
      setTempValue(
        target.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      )
    }
    setIsEditing(true)
  }

  const handleSave = () => {
    const cleanStr = tempValue.replace(/\./g, '').replace(',', '.')
    const val = parseFloat(cleanStr)
    if (!isNaN(val) && val >= 0) {
      onSave(val)
    }
    setIsEditing(false)
  }

  return (
    <Card
      className={cn(
        'rounded-sm shadow-sm w-full flex flex-col justify-center relative',
        colorClass,
      )}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <div className={cn('flex items-center gap-1.5 font-bold', textClass)}>
              <Target className="w-4 h-4 shrink-0" />
              <h3 className="text-xs uppercase tracking-wide">{title}</h3>
            </div>
            {subtitle && (
              <p className="text-[9px] text-white/70 font-medium italic mt-1 ml-[22px]">
                {subtitle}
              </p>
            )}
          </div>
          {isEditable && !isEditing && !readonly && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-5 w-5 absolute right-2 top-2 text-white/50', hoverTextClass)}
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
                type="text"
                inputMode="numeric"
                className="h-7 text-xs pl-6"
                value={tempValue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  if (!raw) {
                    setTempValue('')
                    return
                  }
                  const num = parseInt(raw, 10) / 100
                  setTempValue(
                    num.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                  )
                }}
                onFocus={(e) => e.target.select()}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <Button
              size="icon"
              className={cn('h-7 w-7 shrink-0 text-white', bgClass)}
              onClick={handleSave}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/70 shrink-0"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-end mb-1">
            <div>
              <p className="text-[10px] text-white/70 font-medium">Meta Mês</p>
              <p className="text-sm font-bold text-white">{formatCurrency(target)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/70 font-medium">Realizado</p>
              <p className={cn('text-sm font-bold', textClass)}>{formatCurrency(achieved)}</p>
            </div>
          </div>
        )}

        <div className="space-y-1 mt-1.5">
          <Progress value={achievedPct} className={cn('h-2 bg-white/20', progressColorClass)} />
          <div className="flex justify-between items-start text-[10px] mt-1">
            {!isPastMonth ? (
              <div className="flex flex-col">
                <p className="text-white/70 font-medium">
                  Diária:{' '}
                  <span className="text-white font-bold">{formatCurrency(dailyTarget)}</span>
                </p>
                <span className="text-white/50 text-[8px] -mt-0.5">({workingDays} dias úteis)</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-white/70 font-medium">
                  Status:{' '}
                  <span
                    className={cn(
                      'font-bold',
                      achieved >= target && target > 0 ? textClass : 'text-amber-300',
                    )}
                  >
                    {achieved >= target && target > 0 ? 'Meta Batida' : 'Não Atingida'}
                  </span>
                </p>
              </div>
            )}
            {target > 0 && remaining > 0 && (
              <div className="flex flex-col items-end">
                <span className="font-bold text-amber-200">
                  {isPastMonth ? 'Faltou:' : 'Falta:'} {formatCurrency(remaining)}
                </span>
                {showPercentage && (
                  <span className="text-amber-200/80 font-medium text-[9px] -mt-0.5">
                    ({remainingPct.toFixed(1)}% restando)
                  </span>
                )}
              </div>
            )}
            {target > 0 && exceeded > 0 && (
              <div className="flex flex-col items-end">
                <span className={cn('font-bold', textClass)}>
                  {isPastMonth ? 'Superou:' : 'Superado:'} +{formatCurrency(exceeded)}
                </span>
                {showPercentage && (
                  <span className={cn('font-medium text-[9px] -mt-0.5', textClass)}>
                    ({((exceeded / target) * 100).toFixed(1)}% acima da meta)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SalesTargetsDashboard() {
  const { monthlyMetrics, saveMonthlyMetric, filters, transactions } = useFinanceStore()
  const { profile } = useAuth()

  const { metric, monthName, workingDays, totalAchieved, isPastMonth } = useMemo(() => {
    const today = new Date()
    const currentYear = parseInt(
      (filters?.years && filters.years[0]) || today.getFullYear().toString(),
    )
    const targetStatuses =
      Array.isArray(filters?.statuses) && filters.statuses.length > 0
        ? filters.statuses
        : ['REALIZADO']

    let inc = 0
    let wDays = 0
    let mName = ''
    let defaultMonth = 1
    let foundMetric = null
    let pastMonth = false

    if (!Array.isArray(filters?.months) || filters.months.length === 0) {
      pastMonth = currentYear < today.getFullYear()
      const yearMetrics = (monthlyMetrics || []).filter((m) => m.year === currentYear)

      const sumTargetManipulacao = yearMetrics.reduce(
        (acc, curr) => acc + (curr.meta_vendas_manipulacao || 0),
        0,
      )
      const sumTargetExtra = yearMetrics.reduce(
        (acc, curr) => acc + (curr.meta_vendas_extra || 0),
        0,
      )

      foundMetric = {
        meta_vendas_manipulacao: sumTargetManipulacao,
        meta_vendas_extra: sumTargetExtra,
      }

      ;(transactions || []).forEach((tx) => {
        const d = new Date(tx.date)
        if (
          d.getFullYear() === currentYear &&
          tx.type === 'INCOME' &&
          targetStatuses.includes(tx.status)
        ) {
          inc += tx.amount
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
          inc += tx.amount
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
        meta_vendas_manipulacao: 0,
        meta_vendas_extra: 0,
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
      totalAchieved: inc,
    }
  }, [monthlyMetrics, filters, transactions])

  const targetManipulacao = metric.meta_vendas_manipulacao || 0
  const targetExtra = metric.meta_vendas_extra || 0
  const targetTotal = targetManipulacao + targetExtra

  let achievedManipulacao = 0
  let achievedExtra = 0

  if (targetTotal > 0) {
    achievedManipulacao = totalAchieved * (targetManipulacao / targetTotal)
    achievedExtra = totalAchieved * (targetExtra / targetTotal)
  } else {
    achievedManipulacao = totalAchieved
    achievedExtra = 0
  }

  const isEditable =
    profile?.role !== 'Visitante' && Array.isArray(filters?.months) && filters.months.length > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TargetCard
        title="Meta Vendas Manipulação"
        subtitle="* Clique no lápis para definir."
        target={targetManipulacao}
        achieved={achievedManipulacao}
        workingDays={workingDays}
        isPastMonth={isPastMonth}
        isEditable={isEditable}
        showPercentage={false}
        onSave={(val: number) => saveMonthlyMetric({ ...metric, meta_vendas_manipulacao: val })}
        colorClass="bg-blue-500"
        textClass="text-white"
        hoverTextClass="hover:text-white"
        bgClass="bg-blue-600 hover:bg-blue-700"
        progressColorClass="[&>div]:bg-white/80"
      />

      <TargetCard
        title="Meta Vendas Extra"
        subtitle="* Drogaria, revenda, etc."
        target={targetExtra}
        achieved={achievedExtra}
        workingDays={workingDays}
        isPastMonth={isPastMonth}
        isEditable={isEditable}
        showPercentage={false}
        onSave={(val: number) => saveMonthlyMetric({ ...metric, meta_vendas_extra: val })}
        colorClass="bg-purple-500"
        textClass="text-white"
        hoverTextClass="hover:text-white"
        bgClass="bg-purple-600 hover:bg-purple-700"
        progressColorClass="[&>div]:bg-white/80"
      />

      <TargetCard
        title="Meta Vendas Totais"
        subtitle="* Soma automática das metas."
        target={targetTotal}
        achieved={totalAchieved}
        workingDays={workingDays}
        isPastMonth={isPastMonth}
        isEditable={false}
        readonly={true}
        showPercentage={true}
        colorClass="bg-emerald-500"
        textClass="text-white"
        hoverTextClass="hover:text-white"
        bgClass="bg-emerald-600 hover:bg-emerald-700"
        progressColorClass="[&>div]:bg-white/80"
      />
    </div>
  )
}
