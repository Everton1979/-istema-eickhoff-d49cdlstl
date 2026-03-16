import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Pencil, Check, X } from 'lucide-react'
import { useState, useMemo } from 'react'

export function SalesTargetProgress() {
  const { monthlyMetrics, saveMonthlyMetric, filters } = useFinanceStore()
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState('')

  const { metric, monthName } = useMemo(() => {
    const currentYear = parseInt(filters.years[0] || new Date().getFullYear().toString())
    const currentMonth =
      filters.months.length > 0 ? parseInt(filters.months[0]) : new Date().getMonth() + 1
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

    const found = monthlyMetrics.find((m) => m.year === currentYear && m.month === currentMonth)
    return {
      metric: found || {
        month: currentMonth,
        year: currentYear,
        sales_target: 0,
        total_system_sales: 0,
        raw_material_costs: 0,
        orders_count: 0,
        id: '',
      },
      monthName: `${monthLabels[currentMonth - 1]}/${currentYear}`,
    }
  }, [monthlyMetrics, filters])

  const target = metric.sales_target
  const sales = metric.total_system_sales
  const percentage = target > 0 ? Math.min((sales / target) * 100, 100) : 0

  const handleEdit = () => {
    setTempValue(target.toString())
    setIsEditing(true)
  }

  const handleSave = async () => {
    const val = parseFloat(tempValue)
    if (!isNaN(val) && val >= 0) {
      await saveMonthlyMetric({ ...metric, sales_target: val })
    }
    setIsEditing(false)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <Card className="rounded-sm shadow-sm h-full flex flex-col justify-center border-t-4 border-t-emerald-500">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Target className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              Meta de Vendas ({monthName})
            </h3>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-emerald-600"
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
                type="number"
                className="h-7 text-xs pl-6"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <Button
              size="icon"
              className="h-7 w-7 bg-emerald-500 hover:bg-emerald-600"
              onClick={handleSave}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-500"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-end mb-1">
            <div>
              <p className="text-[10px] text-gray-500 font-medium">Realizado</p>
              <p className="text-sm font-bold text-gray-800">{formatCurrency(sales)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-medium">Objetivo</p>
              <p className="text-sm font-bold text-emerald-600">{formatCurrency(target)}</p>
            </div>
          </div>
        )}

        <div className="space-y-1 mt-1">
          <Progress value={percentage} className="h-2 bg-gray-100" />
          <p className="text-[10px] text-right font-medium text-emerald-600">
            {percentage.toFixed(1)}% alcançado
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
