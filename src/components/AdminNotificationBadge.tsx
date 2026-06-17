import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function AdminNotificationBadge() {
  const { profile } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!profile || (profile.role !== 'Administrador' && profile.role !== 'Master')) return

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

    const channel = supabase
      .channel('public:profiles:pending')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchPending()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.role])

  if (!profile || (profile.role !== 'Administrador' && profile.role !== 'Master')) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/usuarios"
          className="relative flex items-center justify-center p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors ml-1"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-[#0f172a]" />
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end" className="text-xs font-medium">
        {pendingCount > 0
          ? `${pendingCount} ${pendingCount === 1 ? 'usuário aguardando aprovação' : 'usuários aguardando aprovação'}`
          : 'Nenhum usuário pendente'}
      </TooltipContent>
    </Tooltip>
  )
}
