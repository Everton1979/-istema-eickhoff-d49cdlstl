import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, Clock, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function PendingApproval() {
  const { signOut, profile, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (
      !loading &&
      profile &&
      (profile.status === 'Ativo' || profile.role === 'Administrador' || profile.role === 'Master')
    ) {
      navigate('/dashboard', { replace: true })
    }
  }, [profile, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1e3a8a] rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            Controle Financeiro
          </span>
        </div>
        {user ? (
          <Button
            onClick={() => signOut()}
            variant="ghost"
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        ) : (
          <Link to="/login">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Login
            </Button>
          </Link>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 animate-fade-in-up">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 shadow-sm border border-amber-200">
              <Clock className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
              Conta em Análise
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Cadastro realizado com sucesso! Sua conta está sendo analisada e aguarda a aprovação
              do administrador do sistema.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mt-8">
            <Card className="border-2 border-amber-200 shadow-lg relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-4">
                  Aprovação do Administrador
                </h3>
                <p className="text-slate-600 leading-relaxed text-base mb-6">
                  O administrador do sistema já foi notificado e revisará sua solicitação de acesso
                  em breve.
                </p>
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 flex items-start gap-3 w-full">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-amber-900 font-medium text-left">
                    Assim que sua conta for aprovada, você terá acesso total ao painel e a todas as
                    ferramentas. Sua tela será redirecionada automaticamente.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm">
            Está com dificuldades? Entre em contato com o administrador do sistema para agilizar a
            liberação.
          </div>
        </div>
      </main>
    </div>
  )
}
