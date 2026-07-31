import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { XOctagon, LogOut, MessageCircle, Mail, ChevronDown } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useState } from 'react'

export default function BlockedAccess() {
  const { signOut, profile, loading } = useAuth()
  const [contactOpen, setContactOpen] = useState(false)

  if (loading) return null

  const isBlocked = profile?.status === 'Bloqueado'
  const isExpired = profile?.plan_end_date && new Date() > new Date(profile.plan_end_date)

  const isMaster =
    profile?.is_super_admin ||
    profile?.role === 'admin' ||
    profile?.role === 'Master' ||
    profile?.role === 'Administrador'
  if (isMaster) {
    return <Navigate to="/dashboard" replace />
  }

  if (!isBlocked && !isExpired && profile?.status === 'Ativo') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 animate-fade-in print:hidden">
      <div className="max-w-lg w-full">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <XOctagon className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-slate-700 text-lg font-medium">
              O prazo da sua assinatura terminou. Procure o administrador para renovação.
            </p>

            <Button
              onClick={signOut}
              variant="outline"
              className="gap-2 text-slate-600 hover:text-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </Button>

            <Collapsible open={contactOpen} onOpenChange={setContactOpen}>
              <CollapsibleTrigger asChild>
                <button className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Dúvidas? Fale conosco
                  <ChevronDown className="w-3 h-3" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="animate-fade-in">
                <div className="flex flex-col gap-2 mt-3 text-xs text-slate-500">
                  <a
                    href="https://wa.me/55981416666"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 hover:text-slate-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    (55) 9814-16666
                  </a>
                  <a
                    href="mailto:farmaciaeickhoff@terra.com.br"
                    className="inline-flex items-center justify-center gap-1.5 hover:text-slate-700 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    farmaciaeickhoff@terra.com.br
                  </a>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
