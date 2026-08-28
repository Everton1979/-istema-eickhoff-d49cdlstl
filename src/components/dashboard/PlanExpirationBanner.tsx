import { useAuth } from '@/hooks/use-auth'
import { AlertTriangle } from 'lucide-react'

export function PlanExpirationBanner() {
  const { profile } = useAuth()
  const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')

  if (isDemo) return null
  if (profile?.role === 'Administrador') return null
  if (!profile?.plan_end_date) return null

  const endDate = new Date(profile.plan_end_date)
  const today = new Date()

  endDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 3 || diffDays < 0) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-md shadow-sm flex items-start gap-3 mb-6 animate-in slide-in-from-top-2">
      <div className="bg-amber-100 p-2 rounded-full shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <h3 className="font-bold text-amber-800">Aviso de Vencimento de Plano</h3>
        <p className="text-sm mt-1">
          {diffDays === 0
            ? 'O seu plano expira hoje! '
            : `Faltam apenas ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} para o término do seu plano (${profile.plan_type?.toUpperCase()}). `}
          Entre em contato com o supervisor para renovação do plano de acesso para evitar a perda do
          mesmo.
        </p>
      </div>
    </div>
  )
}
