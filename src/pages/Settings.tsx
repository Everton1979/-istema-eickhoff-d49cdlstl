import { useFinanceStore } from '@/stores/financeStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

export default function Settings() {
  const { accounts, updateAccountInitialBalances } = useFinanceStore()
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const initial: Record<string, string> = {}
    accounts.forEach((acc) => {
      initial[acc.id] = acc.initialBalance.toString()
    })
    setBalances(initial)
  }, [accounts])

  const handleChange = (id: string, value: string) => {
    setBalances((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    let success = true
    const parsedBalances: Record<string, number> = {}

    Object.entries(balances).forEach(([id, value]) => {
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        parsedBalances[id] = numValue
      } else {
        success = false
      }
    })

    if (success) {
      const { error } = await updateAccountInitialBalances(parsedBalances)
      if (error) {
        toast.error('Erro ao salvar as configurações.')
      } else {
        toast.success('Configurações salvas com sucesso!')
      }
    } else {
      toast.error('Alguns valores não são válidos.')
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-md border p-6 animate-fade-in-up overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as preferências e saldos iniciais do sistema.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Saldos Iniciais das Contas</CardTitle>
            <CardDescription>
              Defina o saldo inicial para cada uma das suas contas. Isso afetará o cálculo do saldo
              atual no dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4"
              >
                <Label htmlFor={`acc-${acc.id}`} className="sm:text-right font-medium col-span-1">
                  {acc.name}
                </Label>
                <div className="sm:col-span-3">
                  <Input
                    id={`acc-${acc.id}`}
                    type="number"
                    step="0.01"
                    value={balances[acc.id] ?? ''}
                    onChange={(e) => handleChange(acc.id, e.target.value)}
                    className="max-w-[200px]"
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
