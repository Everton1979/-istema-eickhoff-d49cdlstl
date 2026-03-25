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

export function MonthlyClosingDialog() {
  const { monthlyMetrics, saveMonthlyMetric, filters } = useFinanceStore()
  const { toast } = useToast()

  const currentMonth = filters.months[0] || (new Date().getMonth() + 1).toString().padStart(2, '0')
  const currentYear = filters.years[0] || new Date().getFullYear().toString()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [orders, setOrders] = useState('')
  const [sales, setSales] = useState('')
  const [costs, setCosts] = useState('')

  useEffect(() => {
    if (open) {
      const existing = monthlyMetrics.find(
        (m) => m.month.toString().padStart(2, '0') === month && m.year.toString() === year,
      )
      if (existing) {
        setOrders(existing.orders_count.toString())
        setSales(existing.total_system_sales.toString())
        setCosts(existing.raw_material_costs.toString())
      } else {
        setOrders('')
        setSales('')
        setCosts('')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, open])

  const handleSave = async () => {
    try {
      setLoading(true)
      const existing = monthlyMetrics.find(
        (m) => m.month.toString().padStart(2, '0') === month && m.year.toString() === year,
      )

      await saveMonthlyMetric({
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        orders_count: parseInt(orders || '0', 10),
        total_system_sales: parseFloat(sales || '0'),
        raw_material_costs: parseFloat(costs || '0'),
        sales_target: existing ? existing.sales_target : 0,
      })
      toast({ title: 'Sucesso', description: 'Fechamento mensal salvo com sucesso.' })
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
          className="h-7 text-xs bg-white text-blue-900 border-none hover:bg-gray-100 hidden sm:flex gap-1"
        >
          <FileBarChart className="w-3 h-3" /> Fechamento Mensal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lançar Fechamento Mensal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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

          <div className="space-y-2">
            <Label>Número de pedidos / Fórmulas</Label>
            <Input
              type="number"
              value={orders}
              onChange={(e) => setOrders(e.target.value)}
              placeholder="Ex: 450"
            />
          </div>

          <div className="space-y-2">
            <Label>Vendas Mensais do Sistema (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              placeholder="Ex: 75000.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Custo de Matérias Primas/Embalagem (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={costs}
              onChange={(e) => setCosts(e.target.value)}
              placeholder="Ex: 15000.00"
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full mt-2">
            {loading ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
