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
        'rounded-lg shadow-sm border border-slate-300 w-full flex flex-col justify-center relative',
        colorClass,
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <div className={cn('flex items-center gap-1.5 font-bold', textClass)}>
              <Target className="w-4 h-4 shrink-0 text-slate-800" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900">
                {title}
              </h3>
              {dataSourceLabel && (
                <span className="text-[9px] bg-slate-800 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide shadow-sm">
                  {dataSourceLabel}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[10px] text-slate-600 font-semibold italic mt-1 ml-[22px]">
                {subtitle}
              </p>
            )}
          </div>
          {isEditable && !isEditing && !readonly && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 absolute right-3 top-3 bg-blue-50 rounded-full p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors"
              onClick={handleEdit}
              title="Definir meta do mês"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1.5 text-xs text-slate-500 font-semibold">
                R$
              </span>
              <Input
                type="text"
                inputMode="numeric"
                className="h-8 text-sm pl-8 bg-white border-slate-300 font-bold text-slate-800"
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
              className={cn('h-8 w-8 shrink-0 text-white shadow-sm', bgClass)}
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:text-slate-900 shrink-0"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wide">
                Meta Mês
              </p>
              <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {formatCurrency(target)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wide">
                Realizado
              </p>
              <p
                className={cn(
                  'text-lg sm:text-xl font-black tracking-tight text-slate-900',
                  textClass,
                )}
              >
                {formatCurrency(achieved)}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5 mt-2">
          <Progress
            value={achievedPct}
            className={cn('h-2.5 bg-black/15 rounded-full', progressColorClass)}
          />
          <div className="flex justify-between items-start text-[11px] mt-1.5">
            {!isPastMonth ? (
              <div className="flex flex-col">
                <p className="text-slate-700 font-bold">
                  Diária:{' '}
                  <span className="text-slate-900 font-black">{formatCurrency(dailyTarget)}</span>
                </p>
                <span className="text-slate-500 font-semibold text-[9px]">
                  ({workingDays} dias úteis)
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-slate-700 font-bold">
                  Status:{' '}
                  <span
                    className={cn(
                      'font-black',
                      achieved >= target && target > 0 ? 'text-emerald-700' : 'text-slate-700',
                    )}
                  >
                    {achieved >= target && target > 0 ? 'Meta Batida' : 'Não Atingida'}
                  </span>
                </p>
              </div>
            )}
            {target > 0 && remaining > 0 && (
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-800">
                  {isPastMonth ? 'Faltou:' : 'Falta:'}{' '}
                  <strong className="text-slate-900">{formatCurrency(remaining)}</strong>
                </span>
                {showPercentage && (
                  <span className="text-slate-600 font-semibold text-[10px]">
                    ({remainingPct.toFixed(1)}% restando)
                  </span>
                )}
              </div>
            )}
            {target > 0 && exceeded > 0 && (
              <div className="flex flex-col items-end">
                <span className="font-bold text-emerald-800">
                  {isPastMonth ? 'Superou:' : 'Superado:'} +{formatCurrency(exceeded)}
                </span>
                {showPercentage && (
                  <span className="font-semibold text-[10px] text-emerald-700">
                    ({((exceeded / target) * 100).toFixed(1)}% acima)
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
  const { monthlyMetrics, saveMonthlyMetric, filters, isDemoMode } = useFinanceStore()
  const { profile } = useAuth()
  const isEditableRole =
    isDemoMode ||
    profile?.role === 'Administrador' ||
    profile?.role === 'Colaborador' ||
    profile?.role === 'Master' ||
    profile?.role === 'admin' ||
    profile?.is_super_admin

  const { metric, workingDays, isPastMonth, currentMonth, currentYear } = useMemo(() => {
    const today = new Date()
    const cYear = parseInt((filters?.years && filters.years[0]) || today.getFullYear().toString())

    let wDays = 0
    let defaultMonth = 1
    let foundMetric = null
    let pastMonth = false

    if (!Array.isArray(filters?.months) || filters.months.length === 0) {
      pastMonth = cYear < today.getFullYear()
      const yearMetrics = (monthlyMetrics || []).filter((m) => m.year === cYear)

      const sumTargetManipulacao = yearMetrics.reduce(
        (acc, curr) => acc + (curr.meta_vendas_sistema_manipulacao || 0),
        0,
      )
      const sumTargetRevenda = yearMetrics.reduce(
        (acc, curr) => acc + (curr.meta_vendas_sistema_revenda || 0),
        0,
      )

      foundMetric = {
        meta_vendas_sistema_manipulacao: sumTargetManipulacao,
        meta_vendas_sistema_revenda: sumTargetRevenda,
      }
      wDays = 252 // approx yearly
    } else {
      const cMonth = parseInt(filters.months[0])
      pastMonth =
        cYear < today.getFullYear() ||
        (cYear === today.getFullYear() && cMonth < today.getMonth() + 1)
      defaultMonth = cMonth

      foundMetric = (monthlyMetrics || []).find((m) => m.year === cYear && m.month === cMonth)

      wDays = getWorkingDays(cYear, cMonth)
    }

    return {
      currentMonth: defaultMonth,
      currentYear: cYear,
      isPastMonth: pastMonth,
      metric: foundMetric || {
        id: '',
        month: defaultMonth,
        year: cYear,
        sales_target: 0,
        global_sales_target: 0,
        meta_vendas_manipulacao: 0,
        meta_vendas_extra: 0,
        meta_vendas_sistema_manipulacao: 0,
        meta_vendas_sistema_revenda: 0,
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

  const targetManipulacao = metric.meta_vendas_sistema_manipulacao || 0
  const targetRevenda = metric.meta_vendas_sistema_revenda || 0
  const targetTotal = targetManipulacao + targetRevenda

  const systemManipulacao = (metric.vendas_capsulas || 0) + (metric.vendas_dermato || 0)
  const systemRevenda = metric.vendas_revenda || 0
  const systemTotal = systemManipulacao + systemRevenda

  const handleSaveManipulacao = async (val: number) => {
    const existing = (monthlyMetrics || []).find(
      (m) => m.year === currentYear && m.month === currentMonth,
    )
    await saveMonthlyMetric({
      month: currentMonth,
      year: currentYear,
      orders_count: existing?.orders_count || 0,
      total_system_sales: existing?.total_system_sales || 0,
      raw_material_costs: existing?.raw_material_costs || 0,
      sales_target: val + (existing?.meta_vendas_sistema_revenda || 0),
      global_sales_target: val + (existing?.meta_vendas_sistema_revenda || 0),
      num_formulas_capsulas: existing?.num_formulas_capsulas || 0,
      vendas_capsulas: existing?.vendas_capsulas || 0,
      custo_mp_emb_capsulas: existing?.custo_mp_emb_capsulas || 0,
      num_formulas_dermato: existing?.num_formulas_dermato || 0,
      vendas_dermato: existing?.vendas_dermato || 0,
      custo_mp_emb_dermato: existing?.custo_mp_emb_dermato || 0,
      vendas_revenda: existing?.vendas_revenda || 0,
      custo_revenda: existing?.custo_revenda || 0,
      colaboradores_capsulas: existing?.colaboradores_capsulas || 0,
      colaboradores_dermato: existing?.colaboradores_dermato || 0,
      colaboradores_vendas: existing?.colaboradores_vendas || 0,
      meta_vendas_manipulacao: val,
      meta_vendas_extra: existing?.meta_vendas_extra || 0,
      meta_vendas_sistema_manipulacao: val,
      meta_vendas_sistema_revenda: existing?.meta_vendas_sistema_revenda || 0,
    })
  }

  const handleSaveRevenda = async (val: number) => {
    const existing = (monthlyMetrics || []).find(
      (m) => m.year === currentYear && m.month === currentMonth,
    )
    await saveMonthlyMetric({
      month: currentMonth,
      year: currentYear,
      orders_count: existing?.orders_count || 0,
      total_system_sales: existing?.total_system_sales || 0,
      raw_material_costs: existing?.raw_material_costs || 0,
      sales_target: (existing?.meta_vendas_sistema_manipulacao || 0) + val,
      global_sales_target: (existing?.meta_vendas_sistema_manipulacao || 0) + val,
      num_formulas_capsulas: existing?.num_formulas_capsulas || 0,
      vendas_capsulas: existing?.vendas_capsulas || 0,
      custo_mp_emb_capsulas: existing?.custo_mp_emb_capsulas || 0,
      num_formulas_dermato: existing?.num_formulas_dermato || 0,
      vendas_dermato: existing?.vendas_dermato || 0,
      custo_mp_emb_dermato: existing?.custo_mp_emb_dermato || 0,
      vendas_revenda: existing?.vendas_revenda || 0,
      custo_revenda: existing?.custo_revenda || 0,
      colaboradores_capsulas: existing?.colaboradores_capsulas || 0,
      colaboradores_dermato: existing?.colaboradores_dermato || 0,
      colaboradores_vendas: existing?.colaboradores_vendas || 0,
      meta_vendas_manipulacao: existing?.meta_vendas_manipulacao || 0,
      meta_vendas_extra: val,
      meta_vendas_sistema_manipulacao: existing?.meta_vendas_sistema_manipulacao || 0,
      meta_vendas_sistema_revenda: val,
    })
  }

  const isSpecificMonthSelected = Array.isArray(filters?.months) && filters.months.length > 0
  const canEdit = Boolean(isEditableRole && isSpecificMonthSelected)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 py-0.5">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span className="w-2 h-5 bg-blue-600 rounded-sm inline-block" />
          Metas
        </h3>
        <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2.5 py-1 flex items-center gap-1.5 font-medium">
          <Pencil className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          Clique no lápis para definir a meta do mês
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TargetCard
          title="Vendas Manipulação"
          subtitle="* Dados extraídos do sistema (Ex. Fórmula Certa)."
          target={targetManipulacao}
          achieved={systemManipulacao}
          workingDays={workingDays}
          isPastMonth={isPastMonth}
          isEditable={canEdit}
          readonly={false}
          onSave={handleSaveManipulacao}
          showPercentage={false}
          dataSourceLabel="Dados do Sistema"
          colorClass="bg-blue-100/90"
          textClass="text-slate-900"
          hoverTextClass="hover:text-blue-700"
          bgClass="bg-blue-600 hover:bg-blue-700"
          progressColorClass="[&>div]:bg-blue-600"
        />

        <TargetCard
          title="Vendas Revenda"
          subtitle="* Dados extraídos do sistema (Ex. Fórmula Certa)."
          target={targetRevenda}
          achieved={systemRevenda}
          workingDays={workingDays}
          isPastMonth={isPastMonth}
          isEditable={canEdit}
          readonly={false}
          onSave={handleSaveRevenda}
          showPercentage={false}
          dataSourceLabel="Dados do Sistema"
          colorClass="bg-purple-100/90"
          textClass="text-slate-900"
          hoverTextClass="hover:text-purple-700"
          bgClass="bg-purple-600 hover:bg-purple-700"
          progressColorClass="[&>div]:bg-purple-600"
        />

        <TargetCard
          title="Vendas Totais"
          subtitle="* Dados extraídos do sistema (Ex. Fórmula Certa)."
          target={targetTotal}
          achieved={systemTotal}
          workingDays={workingDays}
          isPastMonth={isPastMonth}
          isEditable={false}
          readonly={true}
          showPercentage={true}
          dataSourceLabel="Dados do Sistema"
          colorClass="bg-emerald-100/90"
          textClass="text-slate-900"
          hoverTextClass="hover:text-emerald-700"
          bgClass="bg-emerald-600 hover:bg-emerald-700"
          progressColorClass="[&>div]:bg-emerald-600"
        />
      </div>
    </div>
  )
}
