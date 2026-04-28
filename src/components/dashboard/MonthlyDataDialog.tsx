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

export function MonthlyDataDialog() {
  const { user } = useAuth()
  const { monthlyMetrics, saveMonthlyMetric } = useFinanceStore()
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
    if (!open) return
    if (isDirty) return

    const expectedData = currentExisting
      ? {
          num_formulas_capsulas: currentExisting.num_formulas_capsulas
            ? String(currentExisting.num_formulas_capsulas)
            : '',
          vendas_capsulas: currentExisting.vendas_capsulas
            ? String(currentExisting.vendas_capsulas)
            : '',
          custo_mp_emb_capsulas: currentExisting.custo_mp_emb_capsulas
            ? String(currentExisting.custo_mp_emb_capsulas)
            : '',
          num_formulas_dermato: currentExisting.num_formulas_dermato
            ? String(currentExisting.num_formulas_dermato)
            : '',
          vendas_dermato: currentExisting.vendas_dermato
            ? String(currentExisting.vendas_dermato)
            : '',
          custo_mp_emb_dermato: currentExisting.custo_mp_emb_dermato
            ? String(currentExisting.custo_mp_emb_dermato)
            : '',
          colaboradores_capsulas: currentExisting.colaboradores_capsulas
            ? String(currentExisting.colaboradores_capsulas)
            : '',
          colaboradores_dermato: currentExisting.colaboradores_dermato
            ? String(currentExisting.colaboradores_dermato)
            : '',
          colaboradores_vendas: currentExisting.colaboradores_vendas
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
    (Number(formData.vendas_capsulas) || 0) + (Number(formData.vendas_dermato) || 0)
  const raw_material_costs =
    (Number(formData.custo_mp_emb_capsulas) || 0) + (Number(formData.custo_mp_emb_dermato) || 0)

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
        vendas_capsulas: Number(formData.vendas_capsulas) || 0,
        custo_mp_emb_capsulas: Number(formData.custo_mp_emb_capsulas) || 0,
        num_formulas_dermato: Number(formData.num_formulas_dermato) || 0,
        vendas_dermato: Number(formData.vendas_dermato) || 0,
        custo_mp_emb_dermato: Number(formData.custo_mp_emb_dermato) || 0,
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
          className="h-11 py-1 px-3 gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 shadow-sm flex flex-col items-center justify-center"
        >
          <span className="flex items-center gap-1.5 font-bold text-sm leading-none">
            <Database className="w-4 h-4 text-indigo-600" />
            Dados Manipulação
          </span>
          <span className="text-[10px] font-medium opacity-80 leading-none">
            Preencher no fechamento do mês
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Entrada de Dados Mensais (Manipulação)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Mês Referência</Label>
              <Select value={String(month)} onValueChange={(val) => handleMonthChange(Number(val))}>
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
                value={year}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                required
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-sm" />
              Setor Cápsulas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Nº Fórmulas</Label>
                <Input
                  type="number"
                  value={formData.num_formulas_capsulas}
                  onChange={(e) => handleChange('num_formulas_capsulas', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.vendas_capsulas}
                  onChange={(e) => handleChange('vendas_capsulas', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo MP/Emb (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_mp_emb_capsulas}
                  onChange={(e) => handleChange('custo_mp_emb_capsulas', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Colaboradores</Label>
                <Input
                  type="number"
                  value={formData.colaboradores_capsulas}
                  onChange={(e) => handleChange('colaboradores_capsulas', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-purple-500 rounded-sm" />
              Setor Dermato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Nº Fórmulas</Label>
                <Input
                  type="number"
                  value={formData.num_formulas_dermato}
                  onChange={(e) => handleChange('num_formulas_dermato', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.vendas_dermato}
                  onChange={(e) => handleChange('vendas_dermato', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo MP/Emb (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_mp_emb_dermato}
                  onChange={(e) => handleChange('custo_mp_emb_dermato', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Colaboradores</Label>
                <Input
                  type="number"
                  value={formData.colaboradores_dermato}
                  onChange={(e) => handleChange('colaboradores_dermato', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-sm" />
              Dados Gerais do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pedidos Totais (Cápsulas + Dermato)</Label>
                <Input
                  type="number"
                  value={orders_count || ''}
                  disabled
                  className="bg-slate-50 text-slate-500 font-medium"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendas Totais (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={total_system_sales || ''}
                  disabled
                  className="bg-slate-50 text-slate-500 font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Matéria Prima (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={raw_material_costs || ''}
                  disabled
                  className="bg-slate-50 text-slate-500 font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Colaboradores Vendas</Label>
                <Input
                  type="number"
                  value={formData.colaboradores_vendas}
                  onChange={(e) => handleChange('colaboradores_vendas', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Colaboradores</Label>
                <Input
                  type="number"
                  value={
                    (Number(formData.colaboradores_capsulas) || 0) +
                    (Number(formData.colaboradores_dermato) || 0) +
                    (Number(formData.colaboradores_vendas) || 0)
                  }
                  disabled
                  className="bg-slate-50 text-slate-500 font-medium"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end w-full mt-8 border-t border-slate-100 pt-4">
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
