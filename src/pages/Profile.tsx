import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Download, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState } from 'react'
import { format } from 'date-fns'

export default function Profile() {
  const { profile } = useAuth()
  const [exporting, setExporting] = useState(false)

  const handleExportData = async () => {
    setExporting(true)
    try {
      const { data: transactions } = await supabase.from('transactions').select('*')
      const { data: appointments } = await supabase.from('appointments').select('*')
      const { data: metrics } = await supabase.from('monthly_metrics').select('*')
      const { data: settings } = await supabase.from('user_settings').select('*')

      const exportData = {
        profile,
        transactions,
        appointments,
        monthly_metrics: metrics,
        user_settings: settings,
        exported_at: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_financeiro_${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Backup exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar os dados.')
    } finally {
      setExporting(false)
    }
  }

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

            <div>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Exportar Dados</h2>
              <p className="text-sm text-slate-600 mb-4">
                Faça o download de todos os seus dados financeiros em formato JSON para fins de
                backup. Isso garante que você sempre tenha uma cópia segura das suas transações e
                métricas.
              </p>
              <Button
                onClick={handleExportData}
                disabled={exporting}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exportando...' : 'Fazer Backup dos Dados'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
