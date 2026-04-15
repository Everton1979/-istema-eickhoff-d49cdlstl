import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useAuth } from '@/hooks/use-auth'
import { User } from 'lucide-react'

export default function Profile() {
  const { profile } = useAuth()

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Meu Perfil</h1>
              <p className="text-sm text-slate-500">
                Gerencie suas informações e exporte seus dados.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border space-y-6">
            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Informações da Conta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-base text-slate-900">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="text-base text-slate-900">{profile?.status || 'Ativo'}</p>
                </div>
                {profile?.razao_social && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Razão Social</p>
                    <p className="text-base text-slate-900">{profile?.razao_social}</p>
                  </div>
                )}
                {profile?.cnpj && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">CNPJ</p>
                    <p className="text-base text-slate-900">{profile?.cnpj}</p>
                  </div>
                )}
                {profile?.responsavel && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Responsável</p>
                    <p className="text-base text-slate-900">{profile?.responsavel}</p>
                  </div>
                )}
                {profile?.telefone && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Telefone</p>
                    <p className="text-base text-slate-900">{profile?.telefone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
