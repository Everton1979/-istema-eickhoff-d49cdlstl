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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { UserProfile, useAuth } from '@/hooks/use-auth'

export function UserManagement() {
  const { profile: currentProfile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentProfile?.id) {
      toast.error('Você não pode alterar seu próprio papel por aqui.')
      return
    }

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) {
      toast.error('Erro ao atualizar papel do usuário')
    } else {
      toast.success('Papel atualizado com sucesso')
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)))
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando usuários...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead className="w-[200px]">Papel de Acesso</TableHead>
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
                <Select
                  value={u.role}
                  onValueChange={(val) => handleRoleChange(u.id, val)}
                  disabled={u.id === currentProfile?.id}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Colaborador">Colaborador</SelectItem>
                    <SelectItem value="Visitante">Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
