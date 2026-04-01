import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for the password recovery event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        toast.info('Pronto! Agora você pode criar sua nova senha.')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)

    setLoading(false)
    if (error) {
      toast.error('Erro ao redefinir senha. O link pode ter expirado.')
    } else {
      toast.success('Senha atualizada com sucesso!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-[#1e3a8a] rounded-md flex items-center justify-center text-white">
            <LayoutDashboard className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Criar Nova Senha</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nova Senha
            </label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 mt-2"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar nova senha e entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
