import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { XOctagon, LogOut, Loader2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

const PLANS = [
  {
    id: 'mensal',
    name: 'Mensal',
    price: 14990,
    priceFormatted: 'R$ 149,90',
    description: 'Acesso por 30 dias',
    installmentsCount: 1,
    link: 'https://app.abacatepay.com/pay/bill_Ade3dg2GZNNxpJjagAk46dMW',
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    price: 40490,
    priceFormatted: 'R$ 404,90',
    description: 'Acesso por 90 dias',
    installmentsCount: 3,
    link: 'https://app.abacatepay.com/pay/bill_q4H3h0aTDKuw63XhaC2RngZy',
  },
  {
    id: 'semestral',
    name: 'Semestral',
    price: 76490,
    priceFormatted: 'R$ 764,90',
    description: 'Acesso por 180 dias',
    installmentsCount: 6,
    link: 'https://app.abacatepay.com/pay/bill_LfMQqX6wZ5sJeRLS5j3YHbQz',
  },
  {
    id: 'anual',
    name: 'Anual',
    price: 125900,
    priceFormatted: 'R$ 1.259,00',
    description: 'Acesso por 365 dias',
    installmentsCount: 12,
    link: 'https://app.abacatepay.com/pay/bill_2QK4U6we2BYTKuAMRdWFePWk',
  },
]

export default function BlockedAccess() {
  const { signOut, profile, loading } = useAuth()
  const { toast } = useToast()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (plan: any) => {
    setLoadingPlan(plan.id)
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          plan: plan.id,
          price: plan.price,
          origin: window.location.origin,
        },
      })

      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL de checkout não retornada')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      toast({
        title: 'Erro ao gerar pagamento',
        description: err.message || 'Por favor, tente novamente ou entre em contato com o suporte.',
        variant: 'destructive',
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  if (loading) return null

  const isBlocked = profile?.status === 'Bloqueado'
  const isExpired = profile?.plan_end_date && new Date() > new Date(profile.plan_end_date)

  // Bypass only for the exact master email
  if (profile?.email === 'farmaciaeickhoff@terra.com.br') {
    return <Navigate to="/dashboard" replace />
  }

  if (!isBlocked && !isExpired && profile?.status === 'Ativo') {
    return <Navigate to="/dashboard" replace />
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

        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTitle className="text-amber-800 font-bold mb-2">⚠️ Atenção</AlertTitle>
          <AlertDescription className="text-amber-700">
            Após realizar o pagamento, por favor envie o comprovante para o nosso WhatsApp{' '}
            <a
              href="https://wa.me/55981416666"
              className="font-bold underline hover:text-amber-900"
              target="_blank"
              rel="noreferrer"
            >
              (55) 9814-16666
            </a>{' '}
            ou para o e-mail{' '}
            <a
              href="mailto:farmaciaeickhoff@terra.com.br"
              className="font-bold underline hover:text-amber-900"
            >
              farmaciaeickhoff@terra.com.br
            </a>{' '}
            para que o seu acesso seja liberado.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const installmentValue = plan.price / 100 / plan.installmentsCount
            const formattedInstallment = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(installmentValue)

            return (
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
                <CardContent className="text-center flex-1 flex flex-col justify-center">
                  <div className="text-3xl font-bold text-slate-800">{plan.priceFormatted}</div>
                  {plan.installmentsCount > 1 ? (
                    <div className="text-sm text-slate-500 mt-2 font-medium">
                      {plan.installmentsCount}x de {formattedInstallment}
                    </div>
                  ) : (
                    <div className="text-sm text-transparent mt-2 select-none" aria-hidden>
                      1x de R$ 0,00
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.id === 'anual' ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aguarde...
                      </>
                    ) : (
                      'Selecionar Plano'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-xl border border-slate-200 text-sm shadow-sm gap-4">
          <div className="text-slate-600 text-center sm:text-left">
            Dúvidas? Fale conosco:{' '}
            <a
              href="https://wa.me/55981416666"
              className="text-primary font-medium hover:underline ml-1"
            >
              (55) 9814-16666
            </a>{' '}
            ou{' '}
            <a
              href="mailto:farmaciaeickhoff@terra.com.br"
              className="text-primary font-medium hover:underline"
            >
              farmaciaeickhoff@terra.com.br
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
