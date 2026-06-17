import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2, UserPlus, Edit, Mail, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { UserProfile, useAuth } from '@/hooks/use-auth'
import { UserEditDialog } from './UserEditDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

export function UserManagement() {
  const { profile: currentProfile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)

  const isMaster = currentProfile?.role === 'Master' || currentProfile?.is_super_admin

  const fetchUsers = async () => {
    if (!currentProfile) return
    setLoading(true)
    const targetApp = currentProfile.app_name || currentProfile.id
    let query = supabase.from('profiles').select('*').order('email')

    if (!isMaster) {
      query = query.eq('app_name', targetApp).neq('status', 'Pendente')
    }

    const { data, error } = await query
    if (data) setUsers(data as UserProfile[])
    if (error) toast.error('Erro ao carregar usuários')
    setLoading(false)
  }

  const handleResendEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) throw error
      toast.success(`E-mail de confirmação reenviado para ${email}`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reenviar e-mail')
    }
  }

  useEffect(() => {
    if (currentProfile) {
      fetchUsers()
    }
  }, [currentProfile?.app_name])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: newEmail,
          password: newPassword,
          app_name: currentProfile?.app_name || currentProfile?.id,
        },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast.success('Usuário criado com sucesso')
      setIsDialogOpen(false)
      setNewEmail('')
      setNewPassword('')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar usuário')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentProfile?.id) {
      toast.error('Você não pode excluir a si mesmo.')
      return
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', userId },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast.success('Usuário excluído com sucesso')
      setUsers(users.filter((u) => u.id !== userId))
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir usuário')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando usuários...</div>
  }

  const sortedUsers = [...users].sort((a, b) => {
    const isPendingA = a.status === 'Pendente' || !a.status
    const isPendingB = b.status === 'Pendente' || !b.status

    // 1. Pendentes at the top
    if (isPendingA && !isPendingB) return -1
    if (isPendingB && !isPendingA) return 1

    // 2. Administradores no fundo
    if (a.role === 'Administrador' && b.role !== 'Administrador') return 1
    if (b.role === 'Administrador' && a.role !== 'Administrador') return -1

    // 3. Sort by days remaining (ascending)
    const getDays = (dateStr: string | null | undefined) => {
      if (!dateStr) return 999999 // No expiration -> bottom
      const end = new Date(dateStr)
      if (isNaN(end.getTime())) return 999999
      end.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    const daysA = getDays(a.plan_end_date)
    const daysB = getDays(b.plan_end_date)

    return daysA - daysB
  })

  const pendingCount = users.filter((u) => u.status === 'Pendente' || !u.status).length

  return (
    <div className="space-y-4">
      {pendingCount > 0 && isMaster && (
        <div className="bg-destructive/10 border-2 border-destructive text-destructive p-5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-destructive text-destructive-foreground p-2.5 rounded-full animate-pulse">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Ação Necessária: Aprovação de Cadastros
              </h3>
              <p className="text-base font-medium mt-1">
                Existem <strong className="text-destructive text-lg">{pendingCount}</strong>{' '}
                {pendingCount === 1 ? 'novo usuário aguardando' : 'novos usuários aguardando'}{' '}
                liberação de acesso ao sistema.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Criando...' : 'Cadastrar Usuário'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <UserEditDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onUpdate={fetchUsers}
      />

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa / Local</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead className="w-[120px]">Dias Restantes</TableHead>
              <TableHead className="w-[100px]">Papel</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((u) => (
              <TableRow key={u.id} className="group">
                <TableCell>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {u.email}
                    {u.id === currentProfile?.id && (
                      <Badge variant="secondary" className="text-[10px]">
                        Você
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {u.razao_social ? (
                    <div>
                      <div className="font-medium text-sm">{u.razao_social}</div>
                      <div className="text-xs text-muted-foreground">CNPJ: {u.cnpj}</div>
                      {u.cidade_estado && (
                        <div className="text-xs font-semibold text-blue-600 mt-0.5 flex items-center gap-1">
                          {u.cidade_estado}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {u.responsavel ? (
                    <div>
                      <div className="text-sm">{u.responsavel}</div>
                      <div className="text-xs text-muted-foreground">{u.telefone}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-bold text-slate-700 uppercase">
                    {u.plan_type || 'free'}
                  </div>
                  {u.plan_end_date && (
                    <div
                      className={cn(
                        'text-[10px] mt-0.5',
                        new Date() > new Date(u.plan_end_date)
                          ? 'text-red-600 font-bold'
                          : 'text-slate-500',
                      )}
                    >
                      Vence: {new Date(u.plan_end_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    if (!u.plan_end_date) return <span className="text-xs text-slate-500">-</span>
                    const end = new Date(u.plan_end_date)
                    end.setHours(0, 0, 0, 0)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const diffDays = Math.ceil(
                      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                    )

                    if (diffDays < 0) {
                      return (
                        <Badge variant="destructive" className="text-[10px]">
                          Vencido
                        </Badge>
                      )
                    }
                    return (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-xs font-bold',
                            diffDays <= 3 ? 'text-amber-600' : 'text-emerald-600',
                          )}
                        >
                          {diffDays} {diffDays === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>
                    )
                  })()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs bg-slate-100">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      u.role === 'Administrador'
                        ? 'default'
                        : u.status === 'Ativo'
                          ? 'default'
                          : u.status === 'Bloqueado'
                            ? 'destructive'
                            : 'secondary'
                    }
                    className={cn(
                      'text-xs cursor-pointer hover:opacity-80 transition-opacity',
                      (!u.status || u.status === 'Pendente') &&
                        'bg-amber-500 hover:bg-amber-600 text-white border-transparent',
                    )}
                    onClick={() => {
                      if (u.role !== 'Administrador') {
                        setEditingUser(u)
                      }
                    }}
                  >
                    {u.role === 'Administrador' ? 'Ativo' : !u.status ? 'Pendente' : u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {(!u.status || u.status === 'Pendente') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Reenviar e-mail de confirmação"
                        className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                        onClick={() => handleResendEmail(u.email)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      onClick={() => setEditingUser(u)}
                      disabled={u.id === currentProfile?.id && u.role === 'Administrador'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === currentProfile?.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
