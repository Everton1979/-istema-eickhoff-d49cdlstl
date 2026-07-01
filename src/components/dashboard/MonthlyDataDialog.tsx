import { useState, useEffect, useMemo, useRef, forwardRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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

const CurrencyInput = forwardRef<HTMLInputElement, any>(
  ({ value, onChange, className, disabled, placeholder, required, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(() => {
      if (value !== undefined && value !== '') {
        const num = typeof value === 'string' ? parseCurrency(value) : value
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
          const num = typeof value === 'string' ? parseCurrency(value) : value
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
      <div className="relative">
        <span className="absolute left-3 top-3.5 sm:top-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          R$
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          required={required}
          placeholder={placeholder || '0,00'}
          className={cn(
            'pl-9 h-12 sm:h-10 text-base sm:text-sm',
            required && localValue === '' && !isFocused.current
              ? 'border-red-400 dark:border-red-500/50'
              : '',
            className,
          )}
        />
      </div>
    )
  },
)

export function MonthlyDataDialog() {
  const { user } = useAuth()
  const { monthlyMetrics, saveMonthlyMetric } = useFinanceStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isInitialMount = useRef(true)

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
      vendas_revenda: '',
      colaboradores_capsulas: '',
      colaboradores_dermato: '',
      colaboradores_vendas: '',
    },
  })

  const { month, year, formData, isDirty } = draft

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      if (searchParams.get('view')) {
        setSearchParams(
          (prev) => {
            prev.delete('view')
            return prev
          },
          { replace: true },
        )
      }
      if (
        window.location.hash === '#dados-sistema' ||
        window.location.hash === '#dados-manipulacao'
      ) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      return
    }
    if (searchParams.get('view') === 'dados-sistema') {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [searchParams])

  useEffect(() => {
    const checkHash = () => {
      if (
        window.location.hash === '#dados-sistema' ||
        window.location.hash === '#dados-manipulacao'
      ) {
        setSearchParams(
          (prev) => {
            prev.set('view', 'dados-sistema')
            return prev
          },
          { replace: true },
        )
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
    window.addEventListener('hashchange', checkHash)

    const handleEvent = () => {
      setSearchParams(
        (prev) => {
          prev.set('view', 'dados-sistema')
          return prev
        },
        { replace: true },
      )
    }
    window.addEventListener('open-dados-sistema', handleEvent)
    window.addEventListener('open-dados-manipulacao', handleEvent)

    return () => {
      window.removeEventListener('hashchange', checkHash)
      window.removeEventListener('open-dados-sistema', handleEvent)
      window.removeEventListener('open-dados-manipulacao', handleEvent)
    }
  }, [setSearchParams])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty) {
      const confirmClose = window.confirm(
        'Você tem alterações não salvas. Deseja realmente sair sem salvar?',
      )
      if (!confirmClose) return
    }

    setOpen(newOpen)

    if (newOpen) {
      setSearchParams(
        (prev) => {
          prev.set('view', 'dados-sistema')
          return prev
        },
        { replace: true },
      )
    } else {
      setSearchParams(
        (prev) => {
          prev.delete('view')
          return prev
        },
        { replace: true },
      )
    }
  }

  const currentExisting = useMemo(() => {
    return monthlyMetrics.find((m) => m.month === month && m.year === year)
  }, [monthlyMetrics, month, year])

  useEffect(() => {
    if (!open) return
    if (isDirty) return

    const expectedData = currentExisting
      ? {
          num_formulas_capsulas:
            currentExisting.num_formulas_capsulas != null
              ? String(currentExisting.num_formulas_capsulas)
              : '',
          vendas_capsulas: currentExisting.vendas_capsulas ?? '',
          custo_mp_emb_capsulas: currentExisting.custo_mp_emb_capsulas ?? '',
          num_formulas_dermato:
            currentExisting.num_formulas_dermato != null
              ? String(currentExisting.num_formulas_dermato)
              : '',
          vendas_dermato: currentExisting.vendas_dermato ?? '',
          custo_mp_emb_dermato: currentExisting.custo_mp_emb_dermato ?? '',
          vendas_revenda: currentExisting.vendas_revenda ?? '',
          colaboradores_capsulas:
            currentExisting.colaboradores_capsulas != null
              ? String(currentExisting.colaboradores_capsulas)
              : '',
          colaboradores_dermato:
            currentExisting.colaboradores_dermato != null
              ? String(currentExisting.colaboradores_dermato)
              : '',
          colaboradores_vendas:
            currentExisting.colaboradores_vendas != null
              ? String(currentExisting.colaboradores_vendas)
              : '',
        }
      : {
          num_formulas_capsulas: '',
          vendas_capsulas: '',
          custo_mp_emb_capsulas: '',
          num_formulas_dermato: '',
          vendas_dermato: '',
          custo_mp_emb_dermato: '',
          vendas_revenda: '',
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

  const vendas_capsulas_num = parseCurrency(formData.vendas_capsulas as string | number)
  const vendas_dermato_num = parseCurrency(formData.vendas_dermato as string | number)
  const vendas_revenda_num = parseCurrency(formData.vendas_revenda as string | number)

  const orders_count =
    (Number(formData.num_formulas_capsulas) || 0) + (Number(formData.num_formulas_dermato) || 0)

  const vendas_total_manipulacao = vendas_capsulas_num + vendas_dermato_num
  const total_system_sales = vendas_total_manipulacao + vendas_revenda_num

  const raw_material_costs =
    parseCurrency(formData.custo_mp_emb_capsulas as string | number) +
    parseCurrency(formData.custo_mp_emb_dermato as string | number)

  const handleChange = (field: string, value: string | number) => {
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

    if (
      formData.vendas_revenda === '' ||
      formData.vendas_revenda === undefined ||
      formData.vendas_revenda === null
    ) {
      toast.error('O campo Vendas (R$) do setor Revenda é obrigatório.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        month: month,
        year: year,
        orders_count: orders_count,
        total_system_sales: total_system_sales,
        raw_material_costs: raw_material_costs,
        num_formulas_capsulas: Number(formData.num_formulas_capsulas) || 0,
        vendas_capsulas: parseCurrency(formData.vendas_capsulas as string | number),
        custo_mp_emb_capsulas: parseCurrency(formData.custo_mp_emb_capsulas as string | number),
        num_formulas_dermato: Number(formData.num_formulas_dermato) || 0,
        vendas_dermato: vendas_dermato_num,
        custo_mp_emb_dermato: parseCurrency(formData.custo_mp_emb_dermato as string | number),
        vendas_revenda: vendas_revenda_num,
        colaboradores_capsulas: Number(formData.colaboradores_capsulas) || 0,
        colaboradores_dermato: Number(formData.colaboradores_dermato) || 0,
        colaboradores_vendas: Number(formData.colaboradores_vendas) || 0,
      }

      await saveMonthlyMetric(payload)

      toast.success('Dados mensais salvos com sucesso!')
      clearDraft()

      setOpen(false)
      setSearchParams(
        (prev) => {
          prev.delete('view')
          return prev
        },
        { replace: true },
      )
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao salvar os dados: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          id="btn-dados-sistema"
          className="h-11 py-1 px-3 gap-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border-indigo-200 dark:border-indigo-800 shadow-sm flex flex-col items-center justify-center"
        >
          <span className="flex items-center gap-1.5 font-bold text-sm leading-none">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            Dados do Sistema
          </span>
          <span className="text-[10px] font-medium opacity-80 leading-none">
            Preencher no fechamento do mês
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[95vw] sm:w-full rounded-xl"
        onInteractOutside={(e) => {
          if (isDirty) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isDirty) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Dados do Sistema
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Insira os dados mensais do sistema (ex: Fórmula Certa) para análise de performance.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-md p-4 mt-4 text-sm text-indigo-800 dark:text-indigo-300">
          <p>
            <strong>Atenção:</strong> Preencher com dados retirados do seu sistema (ex. Fórmula
            Certa). Lembre-se de <strong>diminuir o número de fórmulas</strong> que foram feitas
            como cortesias, produções internas, etc. (tudo que não gerou valor para ser cobrado do
            cliente), assim como <strong>diminuir o custo MP/Emb</strong> usados nessas fórmulas.
          </p>
          <p className="mt-2 text-xs opacity-80">
            * Esses dados das cortesias podem ser consultados no menu Transações filtrando por
            Cortesias.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
                value={year !== 0 ? year : ''}
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
                    handleChange('num_formulas_capsulas', val ? parseInt(val, 10).toString() : '')
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    formData.num_formulas_capsulas === ''
                      ? 'border-red-400 dark:border-red-500/50'
                      : '',
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
                    handleChange('colaboradores_capsulas', val ? parseInt(val, 10).toString() : '')
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    formData.colaboradores_capsulas === ''
                      ? 'border-red-400 dark:border-red-500/50'
                      : '',
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
                    handleChange('num_formulas_dermato', val ? parseInt(val, 10).toString() : '')
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    formData.num_formulas_dermato === ''
                      ? 'border-red-400 dark:border-red-500/50'
                      : '',
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
                    handleChange('colaboradores_dermato', val ? parseInt(val, 10).toString() : '')
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    formData.colaboradores_dermato === ''
                      ? 'border-red-400 dark:border-red-500/50'
                      : '',
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2 flex-wrap">
              <div className="w-1.5 h-4 bg-amber-500 rounded-sm shrink-0" />
              Setor Revenda
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                (Dados extraídos do seu sistema classificados como revenda)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>
                  Vendas (R$) <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  required
                  value={formData.vendas_revenda}
                  onChange={(val: any) => handleChange('vendas_revenda', val)}
                  placeholder="0,00"
                  className={cn(
                    formData.vendas_revenda === '' ||
                      formData.vendas_revenda === null ||
                      formData.vendas_revenda === undefined
                      ? 'border-red-400 dark:border-red-500/50'
                      : '',
                  )}
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
                    handleChange('colaboradores_vendas', val ? parseInt(val, 10).toString() : '')
                  }}
                  placeholder="0"
                  className={cn(
                    'h-12 sm:h-10 text-base sm:text-sm',
                    formData.colaboradores_vendas === ''
                      ? 'border-red-400 dark:border-red-500/50'
                      : '',
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2 flex-wrap">
              <div className="w-1.5 h-4 bg-blue-500 rounded-sm shrink-0" />
              Dados Gerais do Sistema
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                (Dados extraídos do seu sistema que não foram manipulados.)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pedidos Totais (Cápsulas + Dermato)</Label>
                <Input
                  type="text"
                  value={orders_count !== undefined ? orders_count.toString() : ''}
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas Total Manipulação (R$)</Label>
                <Input
                  type="text"
                  value={
                    vendas_total_manipulacao !== undefined
                      ? vendas_total_manipulacao.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : ''
                  }
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas Totais (R$)</Label>
                <Input
                  type="text"
                  value={
                    total_system_sales !== undefined
                      ? total_system_sales.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : ''
                  }
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo MP/Emb (R$)</Label>
                <Input
                  type="text"
                  value={
                    raw_material_costs !== undefined
                      ? raw_material_costs.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : ''
                  }
                  disabled
                  className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium h-12 sm:h-10 text-base sm:text-sm"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Colaboradores</Label>
                <Input
                  type="text"
                  value={(
                    (Number(formData.colaboradores_capsulas) || 0) +
                    (Number(formData.colaboradores_dermato) || 0) +
                    (Number(formData.colaboradores_vendas) || 0)
                  ).toString()}
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
              onClick={() => handleOpenChange(false)}
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
