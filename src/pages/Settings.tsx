import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFinanceStore } from '@/stores/financeStore'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const { accounts, updateAccountInitialBalances } = useFinanceStore()
  const { toast } = useToast()
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initial: Record<string, string> = {}
    accounts.forEach((a) => {
      initial[a.id] = a.initialBalance.toString()
    })
    setBalances(initial)
  }, [accounts])

  const handleSave = async () => {
    setLoading(true)
    const numericBalances: Record<string, number> = {}
    Object.keys(balances).forEach((k) => {
      numericBalances[k] = parseFloat(balances[k]) || 0
    })

    const { error } = await updateAccountInitialBalances(numericBalances)
    setLoading(false)

    if (!error) {
      toast({ title: 'Sucesso', description: 'Saldos atualizados com sucesso.' })
    } else {
      toast({ title: 'Erro', description: 'Erro ao atualizar saldos.', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9]">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="rounded-sm shadow-sm border-t-4 border-t-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-slate-800">Saldos Iniciais</CardTitle>
              <CardDescription>
                Configure o saldo inicial da sua conta bancária consolidada para o cálculo correto
                no Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Conta {acc.name}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-slate-500">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-8"
                      value={balances[acc.id] || ''}
                      onChange={(e) =>
                        setBalances((prev) => ({ ...prev, [acc.id]: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ))}
              <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto mt-4">
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
