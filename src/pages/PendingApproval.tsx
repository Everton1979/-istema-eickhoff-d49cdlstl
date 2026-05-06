import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function PendingApproval() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile?.status === 'Ativo' || profile?.role === 'Administrador') {
      navigate('/dashboard')
    }
  }, [profile, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
            <Clock className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Conta em Análise</h2>
        <div className="text-gray-600 mb-8 space-y-4">
          <p>
            Cadastro realizado com sucesso! No momento, sua conta está com o status{' '}
            <strong>Pendente</strong>.
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm text-left border border-blue-100">
            <strong className="block mb-2 text-blue-900">Atenção aos próximos passos:</strong>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Verifique seu e-mail com o título <strong>"Supabase Auth"</strong>.
              </li>
              <li>
                Abra o e-mail e clique em <strong>"Confirm your mail"</strong> para confirmar a
                conta.
              </li>
              <li>Aguarde a aprovação do administrador para ter acesso total ao sistema.</li>
            </ol>
          </div>
        </div>
        <Button onClick={() => signOut()} variant="outline" className="w-full gap-2">
          <LogOut className="w-4 h-4" /> Sair
        </Button>
      </div>
    </div>
  )
}
