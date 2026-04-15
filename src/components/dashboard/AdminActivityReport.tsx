import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Users, Activity, CheckCircle2, Clock } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ProfileStats {
  total: number
  active: number
  pending: number
  recent: any[]
}

export function AdminActivityReport() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<ProfileStats>({ total: 0, active: 0, pending: 0, recent: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role !== 'Administrador') return

    const fetchStats = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const active = data.filter(
            (p) => p.status === 'Ativo' || p.role === 'Administrador',
          ).length
          const pending = data.filter(
            (p) => p.status === 'Pendente' && p.role !== 'Administrador',
          ).length

          setStats({
            total: data.length,
            active,
            pending,
            recent: data.slice(0, 5), // Last 5 registered users
          })
        }
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [profile])

  if (profile?.role !== 'Administrador') return null

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-slate-500">
        Carregando painel de atividade...
      </div>
    )
  }

  return (
    <section className="w-full mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-6 bg-indigo-600 rounded-sm" />
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
          Visão Geral do Sistema (Administrativo)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Usuários</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Usuários Ativos</p>
            <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Aguardando Aprovação</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            Últimos Clientes Cadastrados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recent.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {user.razao_social || user.company_name || '-'}
                      </div>
                      <div className="text-xs text-slate-500">CNPJ: {user.cnpj || '-'}</div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <div className="text-sm">{user.responsavel || '-'}</div>
                      <div className="text-xs text-slate-500">{user.telefone || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'Ativo' || user.role === 'Administrador'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          user.status === 'Pendente' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                        }
                      >
                        {user.role === 'Administrador' ? 'Admin' : user.status || 'Pendente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
