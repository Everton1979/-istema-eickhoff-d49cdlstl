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
        <p className="text-gray-600 mb-8">
          Seu cadastro foi recebido com sucesso. No momento, sua conta está com o status{' '}
          <strong>Pendente</strong>. Aguarde a aprovação de um administrador para ter acesso total
          ao sistema.
        </p>
        <Button onClick={() => signOut()} variant="outline" className="w-full gap-2">
          <LogOut className="w-4 h-4" /> Sair
        </Button>
      </div>
    </div>
  )
}
