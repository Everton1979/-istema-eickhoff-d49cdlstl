import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useNavigate, Navigate, Link, useSearchParams } from 'react-router-dom'
import { LayoutDashboard, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Sua sessão expirou por inatividade')
    }
  }, [searchParams])

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
    setLoading(true)
    const { error } = await signIn(email, password)

    setLoading(false)
    if (error) {
      toast.error('Email ou senha incorretos.')
    } else {
      toast.success('Login realizado com sucesso!')
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">$istema Eickhoff</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
            disabled={loading}
          >
            {loading ? 'Aguarde...' : 'Entrar'}
          </Button>
          <div className="text-center mt-4 space-y-2">
            <div>
              <Link to="/esqueci-a-senha" className="text-sm text-[#1e3a8a] hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <div>
              <span className="text-sm text-gray-600">Não tem uma conta? </span>
              <Link to="/cadastro" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
                Cadastre-se
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-6 pt-4 text-center">
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
              <Link to="/termos-de-uso" className="hover:text-slate-800 hover:underline">
                Termos de Uso
              </Link>
              <span>•</span>
              <Link to="/politica-de-privacidade" className="hover:text-slate-800 hover:underline">
                Política de Privacidade (LGPD)
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
