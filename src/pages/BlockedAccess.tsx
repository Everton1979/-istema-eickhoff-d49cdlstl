import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { XOctagon, LogOut, Loader2, CreditCard, QrCode } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'mensal',
    name: 'Mensal',
    price: 9700,
    priceFormatted: 'R$ 97,00',
    description: 'Acesso por 30 dias',
    installments: '1x no cartão',
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    price: 26190,
    priceFormatted: 'R$ 261,90',
    description: 'Acesso por 90 dias',
    installments: 'Até 3x sem juros',
  },
  {
    id: 'semestral',
    name: 'Semestral',
    price: 49470,
    priceFormatted: 'R$ 494,70',
    description: 'Acesso por 180 dias',
    installments: 'Até 6x sem juros',
  },
  {
    id: 'anual',
    name: 'Anual',
    price: 93120,
    priceFormatted: 'R$ 931,20',
    description: 'Acesso por 365 dias',
    installments: 'Até 12x sem juros',
  },
]

export default function BlockedAccess() {
  const { signOut, profile, loading } = useAuth()
  const { toast } = useToast()

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showBillingForm, setShowBillingForm] = useState(false)

  const [taxId, setTaxId] = useState(profile?.cnpj || '')
  const [phone, setPhone] = useState(profile?.telefone || '')

  if (loading) return null

  const isBlocked = profile?.status === 'Bloqueado'
  const isExpired = profile?.plan_end_date && new Date() > new Date(profile.plan_end_date)

  if (
    profile?.role === 'Administrador' ||
    profile?.role === 'Master' ||
    profile?.is_super_admin ||
    (!isBlocked && !isExpired && profile?.status === 'Ativo')
  ) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    if (!profile?.cnpj || !profile?.telefone) {
      setTaxId(profile?.cnpj || '')
      setPhone(profile?.telefone || '')
      setShowBillingForm(true)
    } else {
      handleCheckout(planId, profile.cnpj, profile.telefone)
    }
  }

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taxId || !phone) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, preencha o CPF/CNPJ e Telefone.',
        variant: 'destructive',
      })
      return
    }

    setIsCheckingOut(true)
    const { error } = await supabase
      .from('profiles')
      .update({ cnpj: taxId, telefone: phone })
      .eq('id', profile!.id)
    if (error) {
      toast({
        title: 'Erro ao salvar dados',
        description: error.message,
        variant: 'destructive',
      })
      setIsCheckingOut(false)
      return
    }

    handleCheckout(selectedPlan!, taxId, phone)
  }

  const handleCheckout = async (planId: string, currentTaxId: string, currentPhone: string) => {
    try {
      setIsCheckingOut(true)
      const plan = PLANS.find((p) => p.id === planId)
      if (!plan) return

      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: plan.id,
          price: plan.price,
          frequency: 'ONE_TIME',
          taxId: currentTaxId,
          cellphone: currentPhone,
          origin: window.location.origin,
        },
      })

      if (response.error) throw new Error(response.error.message || 'Erro ao gerar checkout')

      const { url, error } = response.data

      if (error) {
        throw new Error(error.message || error)
      }

      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL de checkout não retornada')
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro no checkout',
        description: err.message || 'Não foi possível iniciar o pagamento. Tente novamente.',
        variant: 'destructive',
      })
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 animate-fade-in print:hidden">
      <div className="max-w-5xl w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <XOctagon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            {isExpired
              ? 'O período do seu plano de acesso expirou. Para continuar utilizando o sistema, escolha um dos planos abaixo.'
              : 'Seu acesso ao sistema foi temporariamente bloqueado. Regularize sua assinatura para restaurar o acesso.'}
          </p>
        </div>

        {!showBillingForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col',
                  plan.id === 'anual' ? 'border-primary shadow-md' : '',
                )}
              >
                {plan.id === 'anual' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    MELHOR CUSTO-BENEFÍCIO
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center flex-1">
                  <div className="text-3xl font-bold text-slate-800 mb-4">
                    {plan.priceFormatted}
                  </div>

                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>{plan.installments}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4 text-slate-400" />
                      <span>Pix à vista</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.id === 'anual' ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut && selectedPlan === plan.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Selecionar Plano
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Dados de Faturamento</CardTitle>
              <CardDescription>
                Precisamos de mais alguns dados para gerar seu pagamento de forma segura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="billing-form" onSubmit={handleBillingSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">CPF ou CNPJ</Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (com DDD)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBillingForm(false)}
                disabled={isCheckingOut}
              >
                Voltar
              </Button>
              <Button type="submit" form="billing-form" disabled={isCheckingOut} className="flex-1">
                {isCheckingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Ir para o Pagamento
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-xl border border-slate-200 text-sm shadow-sm gap-4">
          <div className="text-slate-600 text-center sm:text-left">
            Dúvidas? Fale conosco:{' '}
            <a
              href="https://wa.me/55981416666"
              className="text-primary font-medium hover:underline ml-1"
            >
              (55) 9814-1666
            </a>{' '}
            ou{' '}
            <a
              href="mailto:evertoneickchoff@terra.com.br"
              className="text-primary font-medium hover:underline"
            >
              evertoneickchoff@terra.com.br
            </a>
          </div>
          <Button
            onClick={signOut}
            variant="ghost"
            className="gap-2 text-slate-500 hover:text-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  )
}
