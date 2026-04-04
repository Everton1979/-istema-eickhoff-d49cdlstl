import { useState, useEffect, useMemo } from 'react'
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
import { useDraft } from '@/hooks/use-draft'
import { toast } from 'sonner'
import { Database, Save, Trash2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFinanceStore } from '@/stores/financeStore'

const INITIAL_DRAFT = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  orders_count: '',
  total_system_sales: '',
  raw_material_costs: '',
  sales_target: '',
  num_formulas_capsulas: '',
  vendas_capsulas: '',
  custo_mp_emb_capsulas: '',
  num_formulas_dermato: '',
  vendas_dermato: '',
  custo_mp_emb_dermato: '',
}

export function MonthlyDataDialog() {
  const { user } = useAuth()
  const { monthlyMetrics, saveMonthlyMetric } = useFinanceStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft, clearDraft] = useDraft('monthly-metrics-draft', INITIAL_DRAFT)
  const [loading, setLoading] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [loadedMonthYear, setLoadedMonthYear] = useState<string>('')

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
    return monthlyMetrics.find(
      (m) => m.month === Number(draft.month) && m.year === Number(draft.year),
    )
  }, [monthlyMetrics, draft.month, draft.year])

  useEffect(() => {
    if (!open) {
      setLoadedMonthYear('')
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const currentMonthYear = `${draft.month}-${draft.year}`
      if (loadedMonthYear !== currentMonthYear) {
        if (currentExisting) {
          const isDraftEmpty = Object.keys(INITIAL_DRAFT).every((key) => {
            if (key === 'month' || key === 'year') return true
            return (
              draft[key as keyof typeof draft] === INITIAL_DRAFT[key as keyof typeof INITIAL_DRAFT]
            )
          })

          if (isDraftEmpty || loadedMonthYear !== '') {
            setDraft({
              month: currentExisting.month,
              year: currentExisting.year,
              orders_count: currentExisting.orders_count || '',
              total_system_sales: currentExisting.total_system_sales || '',
              raw_material_costs: currentExisting.raw_material_costs || '',
              sales_target: currentExisting.sales_target || '',
              num_formulas_capsulas: currentExisting.num_formulas_capsulas || '',
              vendas_capsulas: currentExisting.vendas_capsulas || '',
              custo_mp_emb_capsulas: currentExisting.custo_mp_emb_capsulas || '',
              num_formulas_dermato: currentExisting.num_formulas_dermato || '',
              vendas_dermato: currentExisting.vendas_dermato || '',
              custo_mp_emb_dermato: currentExisting.custo_mp_emb_dermato || '',
            })
          }
        } else if (loadedMonthYear !== '') {
          setDraft({
            ...INITIAL_DRAFT,
            month: draft.month,
            year: draft.year,
          })
        }
        setLoadedMonthYear(currentMonthYear)
      }
    }
  }, [draft.month, draft.year, open, currentExisting, loadedMonthYear, setDraft, draft])

  useEffect(() => {
    const normalize = (val: any) =>
      val === 0 || val === '0' || val === null || val === undefined || val === '' ? '' : String(val)
    const baseData = currentExisting
      ? {
          orders_count: currentExisting.orders_count,
          total_system_sales: currentExisting.total_system_sales,
          raw_material_costs: currentExisting.raw_material_costs,
          sales_target: currentExisting.sales_target,
          num_formulas_capsulas: currentExisting.num_formulas_capsulas,
          vendas_capsulas: currentExisting.vendas_capsulas,
          custo_mp_emb_capsulas: currentExisting.custo_mp_emb_capsulas,
          num_formulas_dermato: currentExisting.num_formulas_dermato,
          vendas_dermato: currentExisting.vendas_dermato,
          custo_mp_emb_dermato: currentExisting.custo_mp_emb_dermato,
        }
      : INITIAL_DRAFT

    const isDirty = Object.keys(baseData).some((key) => {
      if (key === 'month' || key === 'year') return false
      const draftVal = draft[key as keyof typeof draft]
      const baseVal = baseData[key as keyof typeof baseData]
      return normalize(draftVal) !== normalize(baseVal)
    })

    setHasDraft(isDirty)
  }, [draft, currentExisting])

  const handleChange = (field: string, value: string) => {
    setDraft((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const payload = {
        month: Number(draft.month),
        year: Number(draft.year),
        orders_count: Number(draft.orders_count) || 0,
        total_system_sales: Number(draft.total_system_sales) || 0,
        raw_material_costs: Number(draft.raw_material_costs) || 0,
        sales_target: Number(draft.sales_target) || 0,
        num_formulas_capsulas: Number(draft.num_formulas_capsulas) || 0,
        vendas_capsulas: Number(draft.vendas_capsulas) || 0,
        custo_mp_emb_capsulas: Number(draft.custo_mp_emb_capsulas) || 0,
        num_formulas_dermato: Number(draft.num_formulas_dermato) || 0,
        vendas_dermato: Number(draft.vendas_dermato) || 0,
        custo_mp_emb_dermato: Number(draft.custo_mp_emb_dermato) || 0,
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
          className="gap-2 bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm relative font-medium"
        >
          <Database className="w-4 h-4 text-indigo-500" />
          Dados Manipulação
          {hasDraft && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Entrada de Dados Mensais (Manipulação)
            {hasDraft && (
              <span className="text-xs font-normal bg-amber-100 text-amber-800 px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Rascunho recuperado
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {hasDraft && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800 pb-3 pt-3">
            <AlertDescription className="text-sm">
              Você tem dados não salvos em rascunho. Eles foram recuperados automaticamente para que
              você não perca seu progresso.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Mês Referência</Label>
              <Select
                value={String(draft.month)}
                onValueChange={(val) => handleChange('month', val)}
              >
                <SelectTrigger className="bg-white">
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
              <Label className="font-semibold text-slate-700">Ano Referência</Label>
              <Input
                type="number"
                min={2000}
                value={draft.year}
                onChange={(e) => handleChange('year', e.target.value)}
                required
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-sm" />
              Dados Gerais do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Pedidos Totais</Label>
                <Input
                  type="number"
                  value={draft.orders_count}
                  onChange={(e) => handleChange('orders_count', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas Totais (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.total_system_sales}
                  onChange={(e) => handleChange('total_system_sales', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Matéria Prima (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.raw_material_costs}
                  onChange={(e) => handleChange('raw_material_costs', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta de Vendas (meta de vendas de manipulados) (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.sales_target}
                  onChange={(e) => handleChange('sales_target', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-sm" />
              Setor Cápsulas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nº Fórmulas</Label>
                <Input
                  type="number"
                  value={draft.num_formulas_capsulas}
                  onChange={(e) => handleChange('num_formulas_capsulas', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.vendas_capsulas}
                  onChange={(e) => handleChange('vendas_capsulas', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo MP/Emb (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.custo_mp_emb_capsulas}
                  onChange={(e) => handleChange('custo_mp_emb_capsulas', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-purple-500 rounded-sm" />
              Setor Dermato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nº Fórmulas</Label>
                <Input
                  type="number"
                  value={draft.num_formulas_dermato}
                  onChange={(e) => handleChange('num_formulas_dermato', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.vendas_dermato}
                  onChange={(e) => handleChange('vendas_dermato', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo MP/Emb (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.custo_mp_emb_dermato}
                  onChange={(e) => handleChange('custo_mp_emb_dermato', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full mt-8 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={clearDraft}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Descartar Rascunho
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Dados'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
