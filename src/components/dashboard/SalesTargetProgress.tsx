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
  dataSourceLabel,
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
              {dataSourceLabel && (
                <span className="text-[8px] bg-black/80 text-white px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide">
                  {dataSourceLabel}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[9px] text-black/70 font-bold italic mt-1 ml-[22px]">{subtitle}</p>
            )}{' '}
          </div>
          {isEditable && !isEditing && !readonly && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-5 w-5 absolute right-2 top-2 text-black/50', hoverTextClass)}
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
              className={cn('h-7 w-7 shrink-0 text-black', bgClass)}
              onClick={handleSave}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-black/70 shrink-0"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-end mb-1">
            <div>
              <p className="text-[10px] text-black/70 font-bold">Meta Mês</p>
              <p className="text-sm font-bold text-black">{formatCurrency(target)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-black/70 font-bold">Realizado</p>
              <p className={cn('text-sm font-bold', textClass)}>{formatCurrency(achieved)}</p>
            </div>
          </div>
        )}

        <div className="space-y-1 mt-1.5">
          <Progress value={achievedPct} className={cn('h-2 bg-black/20', progressColorClass)} />
          <div className="flex justify-between items-start text-[10px] mt-1">
            {!isPastMonth ? (
              <div className="flex flex-col">
                <p className="text-black/70 font-bold">
                  Diária:{' '}
                  <span className="text-black font-bold">{formatCurrency(dailyTarget)}</span>
                </p>
                <span className="text-black/50 font-bold text-[8px] -mt-0.5">
                  ({workingDays} dias úteis)
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-black/70 font-bold">
                  Status:{' '}
                  <span
                    className={cn(
                      'font-bold',
                      achieved >= target && target > 0 ? textClass : 'text-black/70',
                    )}
                  >
                    {achieved >= target && target > 0 ? 'Meta Batida' : 'Não Atingida'}
                  </span>
                </p>
              </div>
            )}
            {target > 0 && remaining > 0 && (
              <div className="flex flex-col items-end">
                <span className="font-bold text-black/80">
                  {isPastMonth ? 'Faltou:' : 'Falta:'} {formatCurrency(remaining)}
                </span>
                {showPercentage && (
                  <span className="text-black/60 font-bold text-[9px] -mt-0.5">
                    ({remainingPct.toFixed(1)}% restando)
                  </span>
                )}
              </div>
            )}
            {target > 0 && exceeded > 0 && (
              <div className="flex flex-col items-end">
                <span className="font-bold text-black">
                  {isPastMonth ? 'Superou:' : 'Superado:'} +{formatCurrency(exceeded)}
                </span>
                {showPercentage && (
                  <span className="font-bold text-[9px] -mt-0.5 text-black/80">
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

export function SystemSalesCards() {
  const { monthlyMetrics, filters } = useFinanceStore()

  const { metric, workingDays, isPastMonth } = useMemo(() => {
    const today = new Date()
    const currentYear = parseInt(
      (filters?.years && filters.years[0]) || today.getFullYear().toString(),
    )

    let wDays = 0
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
      wDays = 252 // approx yearly
    } else {
      const currentMonth = parseInt(filters.months[0])
      pastMonth =
        currentYear < today.getFullYear() ||
        (currentYear === today.getFullYear() && currentMonth < today.getMonth() + 1)
      defaultMonth = currentMonth

      foundMetric = (monthlyMetrics || []).find(
        (m) => m.year === currentYear && m.month === currentMonth,
      )

      wDays = getWorkingDays(currentYear, currentMonth)
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
      workingDays: wDays,
    }
  }, [monthlyMetrics, filters])

  const targetManipulacao = metric.meta_vendas_manipulacao || 0
  const targetExtra = metric.meta_vendas_extra || 0
  const targetTotal = targetManipulacao + targetExtra

  const systemManipulacao = (metric.vendas_capsulas || 0) + (metric.vendas_dermato || 0)
  const systemRevenda = metric.vendas_revenda || 0
  const systemTotal = systemManipulacao + systemRevenda

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1 py-1">
        <div className="flex-1 h-px bg-black/10" />
        <p className="text-[11px] text-slate-600 font-medium text-center max-w-2xl">
          Comparativo entre as receitas realizadas (transações) e as vendas registradas no sistema
          (Ex. Fórmula Certa). Os dados do sistema são preenchidos no fechamento do mês.
        </p>
        <div className="flex-1 h-px bg-black/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TargetCard
          title="Vendas Sistema Manipulação"
          subtitle="* Dados extraídos do sistema (Ex. Fórmula Certa)."
          target={targetManipulacao}
          achieved={systemManipulacao}
          workingDays={workingDays}
          isPastMonth={isPastMonth}
          isEditable={false}
          readonly={true}
          showPercentage={false}
          dataSourceLabel="Dados do Sistema"
          colorClass="bg-blue-100"
          textClass="text-black"
          hoverTextClass="hover:text-black"
          bgClass="bg-blue-600 hover:bg-blue-700"
          progressColorClass="[&>div]:bg-blue-700"
        />

        <TargetCard
          title="Vendas Sistema Revenda"
          subtitle="* Dados extraídos do sistema (Ex. Fórmula Certa)."
          target={targetExtra}
          achieved={systemRevenda}
          workingDays={workingDays}
          isPastMonth={isPastMonth}
          isEditable={false}
          readonly={true}
          showPercentage={false}
          dataSourceLabel="Dados do Sistema"
          colorClass="bg-purple-100"
          textClass="text-black"
          hoverTextClass="hover:text-black"
          bgClass="bg-purple-600 hover:bg-purple-700"
          progressColorClass="[&>div]:bg-purple-700"
        />

        <TargetCard
          title="Vendas Sistema Totais"
          subtitle="* Dados extraídos do sistema (Ex. Fórmula Certa)."
          target={targetTotal}
          achieved={systemTotal}
          workingDays={workingDays}
          isPastMonth={isPastMonth}
          isEditable={false}
          readonly={true}
          showPercentage={true}
          dataSourceLabel="Dados do Sistema"
          colorClass="bg-green-100"
          textClass="text-black"
          hoverTextClass="hover:text-black"
          bgClass="bg-emerald-600 hover:bg-emerald-700"
          progressColorClass="[&>div]:bg-emerald-700"
        />
      </div>
    </div>
  )
}
