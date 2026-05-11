import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, Clock, Mail, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function PendingApproval() {
  const { signOut, profile, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const displayEmail = location.state?.email || user?.email || 'seu e-mail'

  useEffect(() => {
    if (profile?.status === 'Ativo' || profile?.role === 'Administrador') {
      navigate('/dashboard')
    }
  }, [profile, navigate])

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
              Seu cadastro foi realizado com sucesso! Para garantir a segurança e o acesso correto
              aos seus dados, siga os <strong>dois passos obrigatórios</strong> abaixo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative mt-8">
            <Card className="border-2 border-blue-200 shadow-lg relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider block mb-1">
                      Passo 1
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">
                      Confirme seu E-mail
                    </h3>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 text-base">
                  Enviamos um link de confirmação para <strong>{displayEmail}</strong>. Procure na
                  sua caixa de entrada ou na pasta de spam por um e-mail com o título{' '}
                  <strong>"Supabase Auth"</strong> ou <strong>"Confirm Your Signup"</strong>.
                </p>
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-blue-900 font-medium">
                    Abra a mensagem e clique no link de confirmação para validar sua identidade e
                    ativar o login.
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-slate-50 rounded-full items-center justify-center border-4 border-white shadow-sm">
              <ArrowRight className="w-6 h-6 text-slate-400" />
            </div>

            <Card className="border-2 border-amber-200 shadow-lg relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-amber-600 uppercase tracking-wider block mb-1">
                      Passo 2
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">
                      Aprovação do Admin
                    </h3>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 text-base flex-1">
                  Após confirmar seu e-mail, sua conta ficará com o status <strong>Pendente</strong>
                  . O administrador do sistema já foi notificado e revisará sua solicitação de
                  acesso em breve.
                </p>
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 flex items-start gap-3 mt-auto">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-amber-900 font-medium">
                    Assim que sua conta for aprovada, você terá acesso total ao painel e a todas as
                    ferramentas.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center bg-white p-6 rounded-lg border shadow-sm">
            <p className="text-slate-600 font-medium">
              Se você já concluiu a validação de e-mail e foi aprovado, sua tela será redirecionada
              automaticamente para o Dashboard.
            </p>
            <p className="mt-2 text-slate-500 text-sm">
              Está com dificuldades? Entre em contato com o administrador do sistema para agilizar a
              liberação.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
