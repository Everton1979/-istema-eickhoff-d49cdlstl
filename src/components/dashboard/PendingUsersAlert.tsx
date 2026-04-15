import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function PendingUsersAlert() {
  const { profile } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (profile?.role !== 'Administrador') return

    const fetchPending = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pendente')

      if (count !== null) setPendingCount(count)
    }

    fetchPending()
  }, [profile?.role])

  if (pendingCount === 0) return null

  return (
    <Alert className="bg-amber-50 border-amber-200 text-amber-800 -mt-4 mb-6 shadow-sm">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertTitle className="font-semibold text-amber-800">Ação Necessária</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-1">
        <span>
          Existem {pendingCount} {pendingCount === 1 ? 'usuário aguardando' : 'usuários aguardando'}{' '}
          aprovação de acesso ao sistema.
        </span>
        <Link
          to="/usuarios"
          className="flex items-center gap-1 font-medium hover:underline text-amber-900 bg-amber-100/50 px-3 py-1 rounded-full text-sm"
        >
          Analisar agora <ArrowRight className="w-4 h-4" />
        </Link>
      </AlertDescription>
    </Alert>
  )
}
