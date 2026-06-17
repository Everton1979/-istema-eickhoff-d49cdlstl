import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function PendingUsersAlert() {
  const { profile } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const isMaster = profile?.role === 'Master' || profile?.is_super_admin
    if (!isMaster) return

    const fetchPending = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('status', 'Pendente')

        if (error) {
          console.error('Error fetching pending users:', error)
          return
        }

        if (count !== null) setPendingCount(count)
      } catch (err) {
        console.error('Unexpected error fetching pending users:', err)
      }
    }

    fetchPending()
  }, [profile?.role, profile?.is_super_admin])

  if (pendingCount === 0) return null

  return (
    <Alert className="bg-orange-600 border-orange-700 text-white -mt-4 mb-6 shadow-md animate-in fade-in slide-in-from-top-2">
      <AlertCircle className="h-5 w-5 text-white" />
      <AlertTitle className="font-bold text-lg flex items-center gap-2">
        Ação Necessária: Aprovação de Cadastros
      </AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
        <span className="text-orange-50 text-base">
          Existem <strong className="text-white text-lg">{pendingCount}</strong>{' '}
          {pendingCount === 1 ? 'novo usuário aguardando' : 'novos usuários aguardando'} liberação
          de acesso ao sistema.
        </span>
        <Link
          to="/usuarios"
          className="flex items-center gap-2 font-bold hover:bg-orange-50 hover:text-orange-700 text-white bg-orange-700/50 border border-orange-500 px-4 py-2 rounded-full transition-colors whitespace-nowrap"
        >
          Analisar agora <ArrowRight className="w-4 h-4" />
        </Link>
      </AlertDescription>
    </Alert>
  )
}
