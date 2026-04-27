import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { XOctagon, Mail, MessageCircle, LogOut } from 'lucide-react'
import { Navigate } from 'react-router-dom'

export default function BlockedAccess() {
  const { signOut, profile, loading } = useAuth()

  if (loading) return null

  const isBlocked = profile?.status === 'Bloqueado'
  const isExpired = profile?.plan_end_date && new Date() > new Date(profile.plan_end_date)

  if (
    profile?.role === 'Administrador' ||
    (!isBlocked && !isExpired && profile?.status === 'Ativo')
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-fade-in print:hidden">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center space-y-6 border border-slate-200">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <XOctagon className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h1>
          <p className="text-slate-600">
            {isExpired
              ? 'O período do seu plano de acesso expirou.'
              : 'Seu acesso ao sistema foi temporariamente bloqueado.'}
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-sm text-left space-y-4 shadow-inner">
          <p className="text-slate-700">
            Para regularizar seu acesso e renovar seu plano, por favor entre em contato com o
            supervisor do sistema através dos canais abaixo:
          </p>

          <div className="space-y-3 mt-4">
            <a
              href="mailto:evertoneickchoff@terra.com.br"
              className="flex items-center gap-3 p-3 bg-white rounded-md border hover:bg-slate-50 transition-colors text-slate-700 font-medium"
            >
              <div className="bg-blue-100 p-2 rounded-md text-blue-600">
                <Mail className="w-5 h-5" />
              </div>
              <span className="truncate">evertoneickchoff@terra.com.br</span>
            </a>

            <a
              href="https://wa.me/55981416666"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white rounded-md border hover:bg-green-50 transition-colors text-slate-700 font-medium"
            >
              <div className="bg-green-100 p-2 rounded-md text-green-600">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span>(55) 9814-1666</span>
            </a>
          </div>
        </div>

        <Button onClick={signOut} variant="outline" className="w-full h-12 text-base gap-2">
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </Button>
      </div>
    </div>
  )
}
