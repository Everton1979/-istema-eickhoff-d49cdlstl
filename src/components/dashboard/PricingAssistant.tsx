import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, HelpCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useState, useMemo, forwardRef, useRef, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

const PricingCurrencyInput = forwardRef<HTMLInputElement, any>(
  ({ value, onChange, className, placeholder, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(() => {
      if (value !== undefined && value !== '') {
        const num = typeof value === 'string' ? parseFloat(value) : value
        return num.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }
      return ''
    })
    const isFocused = useRef(false)

    useEffect(() => {
      if (!isFocused.current) {
        if (value !== undefined && value !== '') {
          const num = typeof value === 'string' ? parseFloat(value) : value
          setLocalValue(
            num.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          )
        } else {
          setLocalValue('')
        }
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '')
      if (!val) {
        setLocalValue('')
        onChange('')
        return
      }
      const num = parseInt(val, 10) / 100
      const formatted = num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      setLocalValue(formatted)
      onChange(num)
    }

    const handleBlur = () => {
      isFocused.current = false
    }

    const handleFocus = () => {
      isFocused.current = true
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={className}
        placeholder={placeholder}
      />
    )
  },
)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PricingAssistant() {
  const { filters, isDemoMode, monthlyMetrics, transactions } = useFinanceStore()
  const { user, profile } = useAuth()

  const [cost, setCost] = useState<number | ''>('')
  const [tipoFormula, setTipoFormula] = useState<'capsulas' | 'dermato'>('capsulas')

  const [historyMetrics, setHistoryMetrics] = useState<any[]>([])
  const [historyTx, setHistoryTx] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const filterYears = filters.years.join(',')
  const filterMonths = filters.months.join(',')

  useEffect(() => {
    const activeYear =
      filters.years.length === 1 ? parseInt(filters.years[0]) : new Date().getFullYear()
    const activeMonth =
      filters.months.length === 1 ? parseInt(filters.months[0]) : new Date().getMonth() + 1

    const targetMonths = Array.from({ length: 3 }).map((_, i) => {
      const d = new Date(activeYear, activeMonth - 2 - i, 1)
      return { month: d.getMonth() + 1, year: d.getFullYear() }
    })

    if (isDemoMode) {
      // Use in-memory monthlyMetrics and transactions for the 3 target months
      const targetKeys = targetMonths.map((t) => `${t.year}-${t.month}`)
      const matchedMetrics = monthlyMetrics.filter((m) =>
        targetKeys.includes(`${m.year}-${m.month}`),
      )
      const matchedTx = transactions.filter((t) => {
        if (!t.date || t.status !== 'REALIZADO' || t.type !== 'EXPENSE') return false
        const datePart = t.date.split('T')[0]
        const parts = datePart.split('-')
        if (parts.length < 3) return false
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10)
        return targetKeys.includes(`${y}-${m}`)
      })

      setHistoryMetrics(matchedMetrics)
      setHistoryTx(
        matchedTx.map((t) => ({
          date: t.date,
          amount: t.amount,
          type: t.type,
          category: t.categoryId,
          subcategory: t.subcategoryId,
          status: t.status,
        })),
      )
      setIsLoadingHistory(false)
      return
    }

    if (!user) return

    const fetchHistory = async () => {
      setIsLoadingHistory(true)

      const orString = targetMonths
        .map((t) => `and(month.eq.${t.month},year.eq.${t.year})`)
        .join(',')
      const projectId = profile?.app_name || 'farmacia_eickhoff'

      const metricsQuery = supabase
        .from('monthly_metrics')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .or(orString)

      const oldest = targetMonths[targetMonths.length - 1]
      const newest = targetMonths[0]

      const startDate = `${oldest.year}-${oldest.month.toString().padStart(2, '0')}-01T00:00:00.000Z`
      const lastDay = new Date(newest.year, newest.month, 0).getDate()
      const endDate = `${newest.year}-${newest.month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}T23:59:59.999Z`

      const txQuery = supabase
        .from('transactions')
        .select('date, amount, type, category, subcategory, status')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('status', 'REALIZADO')
        .eq('type', 'despesa')
        .gte('date', startDate)
        .lte('date', endDate)

      const [metricsRes, txRes] = await Promise.all([metricsQuery, txQuery])

      if (metricsRes.data) {
        setHistoryMetrics(metricsRes.data)
      } else {
        setHistoryMetrics([])
      }

      if (txRes.data) {
        setHistoryTx(txRes.data)
      } else {
        setHistoryTx([])
      }

      setIsLoadingHistory(false)
    }

    fetchHistory()
  }, [user, profile, filterYears, filterMonths, isDemoMode, monthlyMetrics, transactions])

  const stats = useMemo(() => {
    const COGS_SUBCATEGORIES = [
      'materia_prima',
      'embalagens',
      'medicamentos_drogaria',
      'insumos e ativos',
      'frascos, potes, rótulos e caixas',
      'produtos para revenda',
    ]

    const txByMonth: Record<string, { totalExpenses: number; insumos: number }> = {}

    historyTx.forEach((t) => {
      const datePart = (t.date || '').split('T')[0]
      const parts = datePart.split('-')
      if (parts.length < 3) return
      const monthKey = `${parts[0]}-${parts[1]}`

      if (!txByMonth[monthKey]) txByMonth[monthKey] = { totalExpenses: 0, insumos: 0 }

      const amount = Math.abs(Number(t.amount) || 0)
      txByMonth[monthKey].totalExpenses += amount

      const sub = (t.subcategory || '').toLowerCase().trim()
      if (COGS_SUBCATEGORIES.includes(sub)) {
        txByMonth[monthKey].insumos += amount
      }
    })

    const monthlyPerFormulaCosts: number[] = []

    historyMetrics.forEach((m) => {
      const monthKey = `${m.year}-${m.month.toString().padStart(2, '0')}`
      const txData = txByMonth[monthKey] || { totalExpenses: 0, insumos: 0 }

      const netExpense = txData.totalExpenses - txData.insumos

      const vendas_caps = m.vendas_capsulas || 0
      const vendas_derm = m.vendas_dermato || 0
      const vendas_revenda = m.vendas_revenda || 0
      const totalRevenue = vendas_caps + vendas_derm + vendas_revenda

      const proportion_grupo =
        tipoFormula === 'capsulas'
          ? totalRevenue > 0
            ? vendas_caps / totalRevenue
            : 0
          : totalRevenue > 0
            ? vendas_derm / totalRevenue
            : 0

      const n_grupo =
        tipoFormula === 'capsulas' ? m.num_formulas_capsulas || 0 : m.num_formulas_dermato || 0

      const allocatedCosts = netExpense * proportion_grupo
      const perFormula = n_grupo > 0 ? allocatedCosts / n_grupo : 0

      monthlyPerFormulaCosts.push(perFormula)
    })

    const precoMinimoPorFormula =
      monthlyPerFormulaCosts.length > 0
        ? monthlyPerFormulaCosts.reduce((sum, c) => sum + c, 0) / monthlyPerFormulaCosts.length
        : 0

    const vendas_caps_total = historyMetrics.reduce((sum, m) => sum + (m.vendas_capsulas || 0), 0)
    const vendas_derm_total = historyMetrics.reduce((sum, m) => sum + (m.vendas_dermato || 0), 0)
    const n_caps_total = historyMetrics.reduce((sum, m) => sum + (m.num_formulas_capsulas || 0), 0)
    const n_derm_total = historyMetrics.reduce((sum, m) => sum + (m.num_formulas_dermato || 0), 0)
    const mpemb_caps_total = historyMetrics.reduce(
      (sum, m) => sum + (m.custo_mp_emb_capsulas || 0),
      0,
    )
    const mpemb_derm_total = historyMetrics.reduce(
      (sum, m) => sum + (m.custo_mp_emb_dermato || 0),
      0,
    )

    const n_grupo_total = tipoFormula === 'capsulas' ? n_caps_total : n_derm_total
    const vendas_grupo = tipoFormula === 'capsulas' ? vendas_caps_total : vendas_derm_total
    const mpemb_grupo = tipoFormula === 'capsulas' ? mpemb_caps_total : mpemb_derm_total

    const precoMedioIdeal = n_grupo_total > 0 ? vendas_grupo / n_grupo_total : 0
    const mkpMultiplicador = mpemb_grupo > 0 ? vendas_grupo / mpemb_grupo : 0
    const custoMedioInsumo = n_grupo_total > 0 ? mpemb_grupo / n_grupo_total : 0

    return {
      precoMinimoPorFormula,
      taxaTecnica: 0,
      precoMedioIdeal,
      mkpMultiplicador,
      custoMedioInsumo,
      isUsingFallback: false,
    }
  }, [historyMetrics, historyTx, tipoFormula])

  const numericCost = typeof cost === 'number' ? cost : 0
  const hasCost = cost !== ''

  const mkpAlvo = stats.mkpMultiplicador > 0 ? stats.mkpMultiplicador : 6.0
  let mkpDinamico = mkpAlvo

  if (numericCost > 0) {
    const custoMedioHistorico = stats.custoMedioInsumo > 0 ? stats.custoMedioInsumo : numericCost
    mkpDinamico = mkpAlvo * Math.pow(custoMedioHistorico / numericCost, 0.5)

    const maxMarkup = 18.0
    const minMarkup = tipoFormula === 'dermato' ? 3.5 : 3.0

    mkpDinamico = Math.max(minMarkup, Math.min(maxMarkup, mkpDinamico))
  }

  const pisoSeguranca = hasCost
    ? numericCost + stats.precoMinimoPorFormula
    : stats.precoMinimoPorFormula
  const precoSugeridoBase = hasCost ? numericCost * mkpDinamico : 0
  const precoSugerido = hasCost ? Math.max(precoSugeridoBase, pisoSeguranca) : 0

  const isHittingFloor = hasCost && pisoSeguranca > precoSugeridoBase
  const suggestedIsHealthy = !isHittingFloor

  return (
    <div className="w-full flex flex-col justify-center bg-gradient-to-br from-white to-blue-50/30 h-full min-h-[140px] relative rounded-b-xl">
      <div className="p-4 md:p-6 flex flex-col h-full justify-between">
        <div className="mb-6 text-xs font-bold bg-blue-200 border border-blue-300 text-blue-800 p-3 rounded-md flex items-start gap-2 shadow-sm">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong className="font-bold">Observação Estratégica:</strong> Cálculos baseados na
            média dos últimos 3 meses consolidados (excluindo o mês atual).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full justify-between md:justify-start mb-6">
          <span className="text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-2">
            <Calculator className="w-5 h-5" /> Configurar Cenário:
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/glossario#assistente-precificacao">
                  <HelpCircle className="w-4 h-4 text-blue-400 hover:text-blue-600 cursor-pointer" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px] text-center" side="bottom">
                <p className="text-xs mb-1">
                  Sugere o preço usando <b>Markup Dinâmico</b> (inversamente proporcional ao custo
                  do insumo), sempre respeitando o Piso de Segurança.
                </p>
                <p className="text-[10px] text-slate-400">
                  Baseado no histórico consolidado dos últimos 3 meses (excluindo o mês atual).
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
          <Select value={tipoFormula} onValueChange={(val: any) => setTipoFormula(val)}>
            <SelectTrigger className="h-10 w-[160px] text-sm font-bold bg-white border-blue-300 text-blue-900 focus:ring-2 focus:ring-blue-500 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="capsulas" className="text-xs">
                Cápsulas
              </SelectItem>
              <SelectItem value="dermato" className="text-xs">
                Dermato
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3">
            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
              Custo (Matéria Prima + Embalagem)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-medium">R$</span>
              <PricingCurrencyInput
                className="h-10 text-sm font-bold pl-9 bg-white shadow-inner border-slate-300 focus-visible:ring-blue-500 transition-shadow hover:shadow-md"
                value={cost}
                onChange={(val: number | '') => setCost(val)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 w-full">
            <div
              className={cn(
                'flex flex-col p-4 rounded-lg border-2 shadow-md transition-colors relative overflow-hidden',
                hasCost
                  ? suggestedIsHealthy
                    ? 'bg-green-200 border-green-300'
                    : 'bg-red-200 border-red-300'
                  : 'bg-blue-200 border-blue-200',
              )}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-20"></div>
              <Label
                className={cn(
                  'text-xs font-bold uppercase tracking-wider flex items-center gap-1.5',
                  hasCost
                    ? suggestedIsHealthy
                      ? 'text-emerald-700'
                      : 'text-red-700'
                    : 'text-blue-600/70',
                )}
              >
                Preço Sugerido
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/glossario#preco-sugerido">
                      <HelpCircle className="w-3.5 h-3.5 opacity-60 hover:opacity-100 hover:text-blue-600 cursor-pointer transition-opacity" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px] text-center" side="top">
                    <p className="text-xs mb-1">
                      {hasCost
                        ? suggestedIsHealthy
                          ? 'Precificação saudável calculada pelo motor de Markup Dinâmico.'
                          : 'Preço ajustado automaticamente para o Piso de Segurança.'
                        : 'Calculado automaticamente baseado na curva de Markup Dinâmico.'}
                    </p>
                    {hasCost && (
                      <p className="text-[10px] mt-1 text-slate-400">
                        Markup elástico aplicado: {mkpDinamico.toFixed(2)}x
                      </p>
                    )}
                    <p className="text-[9px] text-blue-300 mt-2 border-t border-slate-700/50 pt-1">
                      Clique para ver fórmula no Glossário
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p
                    className={cn(
                      'text-2xl font-black font-mono tracking-tight leading-none',
                      hasCost
                        ? suggestedIsHealthy
                          ? 'text-emerald-800'
                          : 'text-amber-700'
                        : 'text-blue-700',
                    )}
                  >
                    R$ {precoSugerido.toFixed(2)}
                  </p>
                  {hasCost && (
                    <div className="mt-2 bg-white/50 px-2 py-0.5 rounded text-xs inline-block">
                      <span className="text-slate-500">MKP Alvo: </span>
                      <span
                        className={cn(
                          'font-bold',
                          suggestedIsHealthy ? 'text-emerald-700' : 'text-amber-700',
                        )}
                      >
                        {mkpDinamico.toFixed(2)}x
                      </span>
                    </div>
                  )}
                </div>
                {hasCost && suggestedIsHealthy && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80 mb-1" />
                )}
                {hasCost && !suggestedIsHealthy && (
                  <AlertTriangle className="w-8 h-8 text-amber-500 opacity-80 mb-1" />
                )}
              </div>
            </div>

            <div
              className={cn(
                'flex flex-col p-4 rounded-lg border-2 shadow-sm transition-colors relative overflow-hidden',
                'bg-white border-slate-200',
              )}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-400 opacity-20"></div>
              <Label
                className={cn(
                  'text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-600',
                )}
              >
                Piso de Segurança
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/glossario#piso-seguranca">
                      <HelpCircle className="w-3.5 h-3.5 opacity-60 hover:opacity-100 hover:text-blue-600 cursor-pointer transition-opacity" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px] text-center" side="top">
                    <p className="text-xs mb-1">
                      O valor mínimo vital. Cobre Custo MP + Embalagem + Blindagem Operacional.
                    </p>
                    <p className="text-[9px] text-blue-300 mt-2 border-t border-slate-700/50 pt-1">
                      Clique para ver composição no Glossário
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-center justify-between mt-2">
                <p className={cn('text-2xl font-black font-mono tracking-tight', 'text-slate-700')}>
                  R$ {pisoSeguranca.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {hasCost && (
          <div className="mt-4 bg-green-200/80 border border-green-300/60 rounded-lg p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Margem de Contribuição
                </Label>
                <span className="text-[10px] text-emerald-600/80 font-bold">
                  Preço Sugerido - Piso de Segurança
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-700 font-mono">
                R$ {Math.max(0, precoSugerido - pisoSeguranca).toFixed(2)}
              </span>
              <p className="text-[10px] text-emerald-600/70 font-bold">Sobras por fórmula</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-blue-200/50 relative">
          {isLoadingHistory && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-200 whitespace-nowrap z-10 opacity-90 animate-pulse">
              Atualizando histórico...
            </div>
          )}
          <div className="text-xs text-slate-600 text-center flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help flex items-center gap-1">
                  Histórico Setor (MKP Médio):{' '}
                  <span className="font-black text-blue-700 text-sm">{mkpAlvo.toFixed(2)}x</span>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center" side="top">
                <p className="text-xs">
                  Markup médio histórico do setor. Usado como base para a curva elástica.
                </p>
              </TooltipContent>
            </Tooltip>
            <span className="text-blue-300 hidden sm:inline">|</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help flex items-center gap-1">
                  Ticket Médio:{' '}
                  <span className="font-black text-emerald-700 text-sm">
                    R$ {stats.precoMedioIdeal.toFixed(2)}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center" side="top">
                <p className="text-xs">Ticket Médio Histórico do laboratório selecionado.</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-blue-300 hidden sm:inline">|</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help flex items-center gap-1">
                  Blindagem Operacional:{' '}
                  <span className="font-black text-slate-700 text-sm">
                    R$ {stats.precoMinimoPorFormula.toFixed(2)}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center" side="top">
                <p className="text-xs">
                  Custo de Estrutura rateado por fórmula (Fixos + Variáveis Gerais). Base para o
                  Piso de Segurança.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
