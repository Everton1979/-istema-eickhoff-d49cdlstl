import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { UserProfile, useAuth } from '@/hooks/use-auth'

interface UserEditDialogProps {
  user: UserProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function UserEditDialog({ user, open, onOpenChange, onUpdate }: UserEditDialogProps) {
  const { profile } = useAuth()
  const isMasterEmail = profile?.email === 'farmaciaeickhoff@terra.com.br'

  const [status, setStatus] = useState('Pendente')
  const [role, setRole] = useState('Usuário')
  const [planType, setPlanType] = useState('free')
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setStatus(user.status || 'Pendente')
      setRole(user.role || 'Usuário')
      setPlanType(user.plan_type || 'free')
      setAdminNotes(user.admin_notes || '')
    }
  }, [user])

  if (!user) return null

  const handleSave = async () => {
    setLoading(true)
    try {
      let startDate = user.plan_start_date
      let endDate = user.plan_end_date

      if (status === 'Ativo' && user.status !== 'Ativo' && !startDate) {
        startDate = new Date().toISOString()
        const days = getPlanDays(planType)
        const dateObj = new Date()
        dateObj.setDate(dateObj.getDate() + days)
        endDate = dateObj.toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          status,
          role,
          plan_type: planType,
          admin_notes: adminNotes,
          ...(startDate ? { plan_start_date: startDate } : {}),
          ...(endDate ? { plan_end_date: endDate } : {}),
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Usuário atualizado com sucesso')
      onUpdate()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleRenew = async () => {
    if (!confirm('Deseja iniciar/renovar o plano deste usuário a partir de hoje?')) return
    setLoading(true)
    try {
      const startDate = new Date().toISOString()
      const days = getPlanDays(planType)
      const dateObj = new Date()
      dateObj.setDate(dateObj.getDate() + days)
      const endDate = dateObj.toISOString()

      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'Ativo',
          plan_type: planType,
          plan_start_date: startDate,
          plan_end_date: endDate,
          admin_notes: adminNotes,
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Plano iniciado/renovado com sucesso')
      onUpdate()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao renovar plano')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Gerenciar Acesso: {user.responsavel || user.razao_social || user.email}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status de Acesso</Label>
              <Select value={status} onValueChange={setStatus} disabled={!isMasterEmail}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Ativo">Ativo (Liberado)</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Papel (Role)</Label>
              <Select value={role} onValueChange={setRole} disabled={!isMasterEmail}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Usuário">Usuário</SelectItem>
                  <SelectItem value="Visitante">Visitante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (40 dias)</SelectItem>
                  <SelectItem value="mensal">Mensal (30 dias)</SelectItem>
                  <SelectItem value="trimestral">Trimestral (90 dias)</SelectItem>
                  <SelectItem value="semestral">Semestral (180 dias)</SelectItem>
                  <SelectItem value="anual">Anual (360 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md border">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 uppercase">Início do Plano</Label>
              <div className="font-medium">{formatDate(user.plan_start_date)}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 uppercase">Fim do Plano</Label>
              <div className="font-medium flex items-center gap-2">
                {formatDate(user.plan_end_date)}
                {user.plan_end_date &&
                  !isNaN(new Date(user.plan_end_date).getTime()) &&
                  new Date() > new Date(user.plan_end_date) && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      VENCIDO
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações Internas (Visível só para Admin)</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Anotações sobre o cliente, pagamentos, histórico..."
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <Button
            variant="secondary"
            onClick={handleRenew}
            disabled={loading}
            className="w-full sm:w-auto font-medium"
          >
            Renovar / Iniciar Plano
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getPlanDays(plan: string) {
  switch (plan) {
    case 'free':
      return 40
    case 'mensal':
      return 30
    case 'trimestral':
      return 90
    case 'semestral':
      return 180
    case 'anual':
      return 360
    default:
      return 40
  }
}
