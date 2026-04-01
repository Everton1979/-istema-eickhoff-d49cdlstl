import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { LayoutDashboard, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)

    setLoading(false)
    if (error) {
      toast.error('Erro ao enviar e-mail de recuperação. Verifique se o e-mail está correto.')
    } else {
      setSubmitted(true)
      toast.success('E-mail de recuperação enviado!')
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Recuperar Senha</h2>

        {submitted ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Se houver uma conta associada a <strong>{email}</strong>, você receberá um e-mail com
              as instruções para redefinir sua senha.
            </p>
            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 mt-4 text-left">
              <strong>Nota importante:</strong> O e-mail pode chegar com o remetente ou título{' '}
              <strong>"Supabase Auth"</strong>. Verifique sua caixa de entrada e também a pasta de
              Spam/Lixo Eletrônico.
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-sm text-[#1e3a8a] hover:underline mt-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4 text-center">
              Digite seu e-mail cadastrado e enviaremos um link para você criar uma nova senha.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 mt-2"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-[#1e3a8a] hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
