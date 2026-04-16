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
import { Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { UserProfile, useAuth } from '@/hooks/use-auth'
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

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Ativo' ? 'Pendente' : 'Ativo'
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)
      if (error) throw error
      toast.success(`Status atualizado para ${newStatus}`)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar status')
    }
  }

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

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="w-[120px]">Papel</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
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
                  <Badge variant="outline" className="text-xs bg-slate-100">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      u.status === 'Ativo' || u.role === 'Administrador' ? 'default' : 'secondary'
                    }
                    className={cn(
                      'text-xs',
                      u.role !== 'Administrador' && 'cursor-pointer hover:opacity-80',
                      u.status === 'Pendente' && 'bg-yellow-500 hover:bg-yellow-600',
                    )}
                    onClick={() => {
                      if (u.role !== 'Administrador') {
                        handleToggleStatus(u.id, u.status || 'Pendente')
                      }
                    }}
                  >
                    {u.role === 'Administrador' ? 'Ativo' : u.status || 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={u.id === currentProfile?.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
