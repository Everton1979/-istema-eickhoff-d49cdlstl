import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Database, Save } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useFinanceStore } from '@/stores/financeStore'
import { useDraft } from '@/hooks/use-draft'
import { cn } from '@/lib/utils'

const parseCurrency = (val: string | number) => {
  if (typeof val === 'number') return val
  if (!val) return 0
  const clean = String(val).replace(/\./g, '').replace(',', '.')
  return Number(clean) || 0
}

const formatCurrencyString = (val: number | null | undefined) => {
  if (val === null || val === undefined) return ''
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function CurrencyInput({
  value,
  onChange,
  disabled,
  placeholder,
  required,
}: {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  placeholder?: string
  required?: boolean
}) {
  const [localValue, setLocalValue] = useState(value)
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d,.-]/g, '')
    setLocalValue(val)
    onChange(val)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocused.current = false
    let val = e.target.value
    if (!val) {
      setLocalValue('')
      onChange('')
      return
    }

    val = val.replace(/[^\d,.-]/g, '')
    val = val.replace(/\./g, ',')
    const parts = val.split(',')
    if (parts.length > 2) {
      val = parts[0] + ',' + parts.slice(1).join('')
    }

    const clean = val.replace(',', '.')
    const num = Number(clean)
    if (!isNaN(num) && val !== '') {
      const formatted = num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      setLocalValue(formatted)
      onChange(formatted)
    } else {
      setLocalValue('')
      onChange('')
    }
  }

  const handleFocus = () => {
    isFocused.current = true
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      required={required}
      placeholder={placeholder || '0,00'}
      className={cn(
        'h-12 sm:h-10 text-base sm:text-sm',
        required && !localValue && !isFocused.current
          ? 'border-red-400 dark:border-red-500/50'
          : '',
      )}
    />
  )
}

export function MonthlyDataDialog() {
  const { user } = useAuth()
  const { monthlyMetrics, saveMonthlyMetric, filters } = useFinanceStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { draft, saveDraft, clearDraft } = useDraft('monthly-data-draft', {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    isDirty: false,
    formData: {
      num_formulas_capsulas: '',
      vendas_capsulas: '',
      custo_mp_emb_capsulas: '',
      num_formulas_dermato: '',
      vendas_dermato: '',
      custo_mp_emb_dermato: '',
      colaboradores_capsulas: '',
      colaboradores_dermato: '',
      colaboradores_vendas: '',
    },
  })

  const { month, year, formData, isDirty } = draft

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#dados-manipulacao') {
        setOpen(true)
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)

    const handleEvent = () => setOpen(true)
    window.addEventListener('open-dados-manipulacao', handleEvent)

    return () => {
      window.removeEventListener('hashchange', checkHash)
      window.removeEventListener('open-dados-manipulacao', handleEvent)
    }
  }, [])

  const currentExisting = useMemo(() => {
    return monthlyMetrics.find((m) => m.month === month && m.year === year)
  }, [monthlyMetrics, month, year])

  useEffect(() => {
    if (open && !isDirty) {
      const targetMonth =
        filters.months.length > 0
          ? parseInt(filters.months[filters.months.length - 1], 10)
          : new Date().getMonth() + 1
      const targetYear =
        filters.years.length === 1 ? parseInt(filters.years[0], 10) : new Date().getFullYear()

      if (targetMonth !== month || targetYear !== year) {
        saveDraft((prev) => ({ ...prev, month: targetMonth, year: targetYear }))
      }
    }
  }, [open, filters.months, filters.years, isDirty, month, year, saveDraft])

  useEffect(() => {
    if (!open) return
    if (isDirty) return

    const expectedData = currentExisting
      ? {
          num_formulas_capsulas: String(currentExisting.num_formulas_capsulas || ''),
          vendas_capsulas: formatCurrencyString(currentExisting.vendas_capsulas),
          custo_mp_emb_capsulas: formatCurrencyString(currentExisting.custo_mp_emb_capsulas),
          num_formulas_dermato: String(currentExisting.num_formulas_dermato || ''),
          vendas_dermato: formatCurrencyString(currentExisting.vendas_dermato),
          custo_mp_emb_dermato: formatCurrencyString(currentExisting.custo_mp_emb_dermato),
          colaboradores_capsulas: String(currentExisting.colaboradores_capsulas || ''),
          colaboradores_dermato: String(currentExisting.colaboradores_dermato || ''),
          colaboradores_vendas: String(currentExisting.colaboradores_vendas || ''),
        }
      : {
          num_formulas_capsulas: '',
          vendas_capsulas: '',
          custo_mp_emb_capsulas: '',
          num_formulas_dermato: '',
          vendas_dermato: '',
          custo_mp_emb_dermato: '',
          colaboradores_capsulas: '',
          colaboradores_dermato: '',
          colaboradores_vendas: '',
        }

    const isDifferent = JSON.stringify(formData) !== JSON.stringify(expectedData)

    if (isDifferent) {
      saveDraft((prev) => ({
        ...prev,
        isDirty: false,
        formData: expectedData,
      }))
    }
  }, [open, currentExisting, isDirty, formData, saveDraft])

  const orders_count =
    (Number(formData.num_formulas_capsulas) || 0) + (Number(formData.num_formulas_dermato) || 0)
  const total_system_sales =
    parseCurrency(formData.vendas_capsulas) + parseCurrency(formData.vendas_dermato)
  const raw_material_costs =
    parseCurrency(formData.custo_mp_emb_capsulas) + parseCurrency(formData.custo_mp_emb_dermato)

  const handleChange = (field: string, value: string) => {
    saveDraft((prev) => ({
      ...prev,
      isDirty: true,
      formData: { ...prev.formData, [field]: value },
    }))
  }

  const handleMonthChange = (val: number) => {
    saveDraft((prev) => ({ ...prev, month: val, isDirty: false }))
  }

  const handleYearChange = (val: number) => {
    saveDraft((prev) => ({ ...prev, year: val, isDirty: false }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const payload = {
        month: month,
        year: year,
        orders_count: orders_count,
        total_system_sales: total_system_sales,
        raw_material_costs: raw_material_costs,
        num_formulas_capsulas: Number(formData.num_formulas_capsulas) || 0,
        vendas_capsulas: parseCurrency(formData.vendas_capsulas),
        custo_mp_emb_capsulas: parseCurrency(formData.custo_mp_emb_capsulas),
        num_formulas_dermato: Number(formData.num_formulas_dermato) || 0,
        vendas_dermato: parseCurrency(formData.vendas_dermato),
        custo_mp_emb_dermato: parseCurrency(formData.custo_mp_emb_dermato),
        colaboradores_capsulas: Number(formData.colaboradores_capsulas) || 0,
        colaboradores_dermato: Number(formData.colaboradores_dermato) || 0,
        colaboradores_vendas: Number(formData.colaboradores_vendas) || 0,
      }

      await saveMonthlyMetric(payload)

      toast.success('Dados mensais salvos com sucesso!')
      clearDraft()
      setOpen(false)
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao salvar os dados: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          id="btn-dados-manipulacao"
          className="h-11 py-1 px-3 gap-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border-indigo-200 dark:border-indigo-800 shadow-sm flex flex-col items-center justify-center"
        >
          <span className="flex items-center gap-1.5 font-bold text-sm leading-none">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            Dados Manipulação
          </span>
          <span className="text-[10px] font-medium opacity-80 leading-none">
            Preencher no fechamento do mês
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[95vw] sm:w-full rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Entrada de Dados Mensais (Manipulação)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">
                Mês Referência <span className="text-red-500">*</span>
              </Label>
              <Select value={String(month)} onValueChange={(val) => handleMonthChange(Number(val))}>
                <SelectTrigger className="bg-white dark:bg-slate-950 h-12 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">
                Ano Referência <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                value={year || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  handleYearChange(val ? Number(val) : 0)
                }}
                required
                className="bg-white dark:bg-slate-950 h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2 flex-wrap">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-sm shrink-0" />
              Setor Cápsulas
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                (Dados extraídos do seu sistema)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>
                  Nº Fórmulas <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.num_formulas_capsulas}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    handleChange('num_formulas_capsulas', val)
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    !formData.num_formulas_capsulas ? 'border-red-400 dark:border-red-500/50' : '',
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Vendas (R$) <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  required
                  value={formData.vendas_capsulas}
                  onChange={(val) => handleChange('vendas_capsulas', val)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Custo MP/Emb (R$) <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  required
                  value={formData.custo_mp_emb_capsulas}
                  onChange={(val) => handleChange('custo_mp_emb_capsulas', val)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Colaboradores <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.colaboradores_capsulas}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    handleChange('colaboradores_capsulas', val)
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    !formData.colaboradores_capsulas ? 'border-red-400 dark:border-red-500/50' : '',
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2 flex-wrap">
              <div className="w-1.5 h-4 bg-purple-500 rounded-sm shrink-0" />
              Setor Dermato
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                (Dados extraídos do seu sistema)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>
                  Nº Fórmulas <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.num_formulas_dermato}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    handleChange('num_formulas_dermato', val)
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    !formData.num_formulas_dermato ? 'border-red-400 dark:border-red-500/50' : '',
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Vendas (R$) <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  required
                  value={formData.vendas_dermato}
                  onChange={(val) => handleChange('vendas_dermato', val)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Custo MP/Emb (R$) <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  required
                  value={formData.custo_mp_emb_dermato}
                  onChange={(val) => handleChange('custo_mp_emb_dermato', val)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Colaboradores <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.colaboradores_dermato}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    handleChange('colaboradores_dermato', val)
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    !formData.colaboradores_dermato ? 'border-red-400 dark:border-red-500/50' : '',
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-sm shrink-0" />
              Dados Gerais do Sistema
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pedidos Totais (Cápsulas + Dermato)</Label>
                <Input
                  type="number"
                  value={orders_count || ''}
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas Totais (R$)</Label>
                <Input
                  type="text"
                  value={total_system_sales ? formatCurrencyString(total_system_sales) : ''}
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo MP/Emb (R$)</Label>
                <Input
                  type="text"
                  value={raw_material_costs ? formatCurrencyString(raw_material_costs) : ''}
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Colaboradores Vendas <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  required
                  value={formData.colaboradores_vendas}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    handleChange('colaboradores_vendas', val)
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    !formData.colaboradores_vendas ? 'border-red-400 dark:border-red-500/50' : '',
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Colaboradores</Label>
                <Input
                  type="number"
                  value={
                    (Number(formData.colaboradores_capsulas) || 0) +
                      (Number(formData.colaboradores_dermato) || 0) +
                      (Number(formData.colaboradores_vendas) || 0) || ''
                  }
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-end w-full mt-8 border-t border-slate-100 dark:border-slate-800 pt-4 gap-3 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Dados'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
