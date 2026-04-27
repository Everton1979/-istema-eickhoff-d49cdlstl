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
import { Trash2, UserPlus, Edit } from 'lucide-react'
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

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('email')
    if (data) setUsers(data as UserProfile[])
    if (error) toast.error('Erro ao carregar usuários')
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'create', email: newEmail, password: newPassword },
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

  const pendingCount = users.filter((u) => u.status === 'Pendente').length

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-yellow-900">Aprovação Pendente</h3>
            <p className="text-sm">
              Você tem {pendingCount}{' '}
              {pendingCount === 1 ? 'usuário aguardando' : 'usuários aguardando'} aprovação para
              acessar o sistema.
            </p>
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
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead className="w-[120px]">Dias Restantes</TableHead>
              <TableHead className="w-[100px]">Papel</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
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
                      {(u.cidade_estado || u.bairro) && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {u.cidade_estado} {u.bairro ? `- ${u.bairro}` : ''}
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
                      u.status === 'Pendente' &&
                        'bg-amber-500 hover:bg-amber-600 text-white border-transparent',
                    )}
                    onClick={() => {
                      if (u.role !== 'Administrador') {
                        setEditingUser(u)
                      }
                    }}
                  >
                    {u.role === 'Administrador' ? 'Ativo' : u.status || 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
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
