import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { FileBarChart } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MonthlyClosingDialog() {
  const store = useFinanceStore()
  const { monthlyMetrics, saveMonthlyMetric, filters = {} } = store
  const { toast } = useToast()

  const currentMonth = (
    (filters as any)?.months?.[0]?.toString() || (new Date().getMonth() + 1).toString()
  ).padStart(2, '0')
  const currentYear =
    (filters as any)?.years?.[0]?.toString() || new Date().getFullYear().toString()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)

  // Cápsulas
  const [ordersCaps, setOrdersCaps] = useState('')
  const [salesCaps, setSalesCaps] = useState('')
  const [costsCaps, setCostsCaps] = useState('')

  // Dermato
  const [ordersDerm, setOrdersDerm] = useState('')
  const [salesDerm, setSalesDerm] = useState('')
  const [costsDerm, setCostsDerm] = useState('')

  useEffect(() => {
    if (open) {
      const existing = monthlyMetrics.find(
        (m) => m.month.toString().padStart(2, '0') === month && m.year.toString() === year,
      )
      if (existing) {
        setOrdersCaps(existing.num_formulas_capsulas?.toString() || '')
        setSalesCaps(existing.vendas_capsulas?.toString() || '')
        setCostsCaps(existing.custo_mp_emb_capsulas?.toString() || '')

        setOrdersDerm(existing.num_formulas_dermato?.toString() || '')
        setSalesDerm(existing.vendas_dermato?.toString() || '')
        setCostsDerm(existing.custo_mp_emb_dermato?.toString() || '')

        // Fallback for older data that wasn't split
        if (
          !existing.num_formulas_capsulas &&
          !existing.num_formulas_dermato &&
          existing.orders_count > 0
        ) {
          setOrdersCaps(existing.orders_count.toString())
          setSalesCaps(existing.total_system_sales.toString())
          setCostsCaps(existing.raw_material_costs.toString())
        }
      } else {
        setOrdersCaps('')
        setSalesCaps('')
        setCostsCaps('')
        setOrdersDerm('')
        setSalesDerm('')
        setCostsDerm('')
      }
    }
  }, [month, year, open, monthlyMetrics])

  const handleSave = async () => {
    try {
      setLoading(true)
      const existing = monthlyMetrics.find(
        (m) => m.month.toString().padStart(2, '0') === month && m.year.toString() === year,
      )

      const nCaps = parseInt(ordersCaps || '0', 10)
      const vCaps = parseFloat(salesCaps || '0')
      const cCaps = parseFloat(costsCaps || '0')

      const nDerm = parseInt(ordersDerm || '0', 10)
      const vDerm = parseFloat(salesDerm || '0')
      const cDerm = parseFloat(costsDerm || '0')

      await saveMonthlyMetric({
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        num_formulas_capsulas: nCaps,
        vendas_capsulas: vCaps,
        custo_mp_emb_capsulas: cCaps,
        num_formulas_dermato: nDerm,
        vendas_dermato: vDerm,
        custo_mp_emb_dermato: cDerm,
        orders_count: nCaps + nDerm,
        total_system_sales: vCaps + vDerm,
        raw_material_costs: cCaps + cDerm,
        sales_target: existing ? existing.sales_target : 0,
      } as any)

      toast({ title: 'Sucesso', description: 'Dados de manipulação salvos com sucesso.' })
      setOpen(false)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar os dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const monthsList = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  const yearsList = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs bg-white text-blue-900 border border-slate-200 hover:bg-slate-100 flex gap-1 shadow-sm"
        >
          <FileBarChart className="w-3 h-3" /> Dados Manipulação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Lançar Dados Manipulação</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6 pb-6">
          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsList.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearsList.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-3">
              <h4 className="text-sm font-bold text-slate-700">Grupo: Cápsulas</h4>
              <div className="space-y-2">
                <Label className="text-xs">Número de Fórmulas</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  value={ordersCaps}
                  onChange={(e) => setOrdersCaps(e.target.value)}
                  placeholder="Ex: 250"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Vendas Mensais (R$)</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  step="0.01"
                  value={salesCaps}
                  onChange={(e) => setSalesCaps(e.target.value)}
                  placeholder="Ex: 40000.00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Custo de MP/Embalagem (R$)</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  step="0.01"
                  value={costsCaps}
                  onChange={(e) => setCostsCaps(e.target.value)}
                  placeholder="Ex: 8000.00"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-3">
              <h4 className="text-sm font-bold text-slate-700">Grupo: Dermato</h4>
              <div className="space-y-2">
                <Label className="text-xs">Número de Fórmulas</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  value={ordersDerm}
                  onChange={(e) => setOrdersDerm(e.target.value)}
                  placeholder="Ex: 200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Vendas Mensais (R$)</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  step="0.01"
                  value={salesDerm}
                  onChange={(e) => setSalesDerm(e.target.value)}
                  placeholder="Ex: 35000.00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Custo de MP/Embalagem (R$)</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  step="0.01"
                  value={costsDerm}
                  onChange={(e) => setCostsDerm(e.target.value)}
                  placeholder="Ex: 7000.00"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? 'Salvando...' : 'Salvar Dados'}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
