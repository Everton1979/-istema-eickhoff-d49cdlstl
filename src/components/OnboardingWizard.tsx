import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinanceStore } from '@/stores/financeStore'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'

export function OnboardingWizard() {
  const { hasUserSettings, completeOnboarding, updateAccountInitialBalances } = useFinanceStore()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [balances, setBalances] = useState({
    sicredi: '',
    dinheiro: '',
    stone: '',
    pagbank: '',
    pix: '',
    banricompras: '',
  })

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setIsLoading(true)
      await updateAccountInitialBalances({
        sicredi: parseCurrencyInput(balances.sicredi) || 0,
        dinheiro: parseCurrencyInput(balances.dinheiro) || 0,
        stone: parseCurrencyInput(balances.stone) || 0,
        pagbank: parseCurrencyInput(balances.pagbank) || 0,
        pix: parseCurrencyInput(balances.pix) || 0,
        banricompras: parseCurrencyInput(balances.banricompras) || 0,
      })
      setIsLoading(false)
      setStep(3)
    } else {
      setIsLoading(true)
      await completeOnboarding()
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  if (hasUserSettings !== false) return null

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) handleSkip()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Bem-vindo ao Sistema'}
            {step === 2 && 'Configuração Inicial'}
            {step === 3 && 'Primeiro Mês'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 &&
              'Vamos configurar sua conta rapidamente para você começar a aproveitar o sistema.'}
            {step === 2 &&
              'Insira o saldo inicial das suas contas para um controle financeiro mais preciso.'}
            {step === 3 &&
              'Você está pronto para começar! Seu painel está preenchido com dados de exemplo. Registre sua primeira transação ou métrica para substituí-los pelos seus dados.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="text-sm text-slate-600 space-y-4">
              <p>O Sistema de Controle Financeiro ajudará você a:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Acompanhar receitas e despesas</li>
                <li>Monitorar metas de vendas</li>
                <li>Analisar a performance estratégica</li>
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sicredi</Label>
                <Input
                  value={balances.sicredi}
                  onChange={(e) =>
                    setBalances({ ...balances, sicredi: formatCurrencyInput(e.target.value) })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Dinheiro (Caixa)</Label>
                <Input
                  value={balances.dinheiro}
                  onChange={(e) =>
                    setBalances({ ...balances, dinheiro: formatCurrencyInput(e.target.value) })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Stone</Label>
                <Input
                  value={balances.stone}
                  onChange={(e) =>
                    setBalances({ ...balances, stone: formatCurrencyInput(e.target.value) })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>PagBank</Label>
                <Input
                  value={balances.pagbank}
                  onChange={(e) =>
                    setBalances({ ...balances, pagbank: formatCurrencyInput(e.target.value) })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Pix</Label>
                <Input
                  value={balances.pix}
                  onChange={(e) =>
                    setBalances({ ...balances, pix: formatCurrencyInput(e.target.value) })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Banricompras</Label>
                <Input
                  value={balances.banricompras}
                  onChange={(e) =>
                    setBalances({ ...balances, banricompras: formatCurrencyInput(e.target.value) })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center text-slate-600 text-sm">
              <p className="mb-2 font-medium text-indigo-600">
                O modo de demonstração está ativado para você explorar o sistema livremente.
              </p>
              <p>
                Para adicionar seus primeiros dados, utilize os botões no painel:{' '}
                <strong>"Transações"</strong> ou <strong>"Dados do Sistema"</strong>.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
          <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
            Pular
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? 'Salvando...' : step === 3 ? 'Concluir' : 'Próximo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
