import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export function PendingUsersAlert() {
  const { isMaster } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
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
  }, [isMaster])

  if (pendingCount === 0 || !isMaster) return null

  return (
    <Alert className="bg-destructive/10 border-2 border-destructive text-destructive -mt-4 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2">
      <AlertCircle className="h-6 w-6 text-destructive animate-pulse" />
      <AlertTitle className="font-bold text-lg flex items-center gap-2 tracking-tight">
        Ação Necessária: Aprovação de Cadastros
      </AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
        <span className="text-destructive/90 text-base font-medium">
          Existem <strong className="text-destructive text-lg">{pendingCount}</strong>{' '}
          {pendingCount === 1 ? 'novo usuário aguardando' : 'novos usuários aguardando'} liberação
          de acesso ao sistema.
        </span>
        <Link
          to="/usuarios"
          className="flex items-center gap-2 font-bold hover:bg-destructive hover:text-destructive-foreground text-destructive bg-destructive/10 border border-destructive px-5 py-2.5 rounded-md transition-colors whitespace-nowrap"
        >
          Analisar agora <ArrowRight className="w-5 h-5" />
        </Link>
      </AlertDescription>
    </Alert>
  )
}
