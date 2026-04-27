import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { UserManagement } from '@/components/settings/UserManagement'
import { Users as UsersIcon } from 'lucide-react'

export default function Users() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9]">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-md">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Gestão de Usuários</h1>
              <p className="text-sm text-slate-500">
                Gerencie o acesso e os níveis de permissão da sua equipe.
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border">
            <UserManagement />
          </div>
        </div>
      </div>
    </div>
  )
}
