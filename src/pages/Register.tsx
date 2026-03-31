import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

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
    const { error } = await signUp(email, password)

    setLoading(false)
    if (error) {
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.')
    } else {
      toast.success('Conta criada com sucesso! Você já pode fazer login.')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#1e3a8a] rounded-md flex items-center justify-center text-white">
            <LayoutDashboard className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Criar sua Conta</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Comece a gerenciar as finanças da sua farmácia
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
            disabled={loading}
          >
            {loading ? 'Aguarde...' : 'Criar Conta'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-[#1e3a8a] font-semibold hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  )
}
