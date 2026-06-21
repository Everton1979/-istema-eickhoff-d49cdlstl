import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'

export function BackupDataButton() {
  const { user, profile } = useAuth()
  const [exporting, setExporting] = useState(false)

  const fetchAll = async (tableName: string, projectId?: string) => {
    let allData: any[] = []
    let from = 0
    const limit = 1000
    let hasMore = true

    while (hasMore) {
      // Using 'as any' to allow dynamic table names without strict type errors for the table name
      let query = supabase
        .from(tableName as any)
        .select('*')
        .range(from, from + limit - 1)

      if (projectId) {
        query = query.eq('project_id', projectId) as any
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        allData = allData.concat(data)
        if (data.length < limit) {
          hasMore = false
        } else {
          from += limit
        }
      } else {
        hasMore = false
      }
    }
    return allData
  }

  const handleExportData = async () => {
    if (!user) {
      toast.error('Usuário não autenticado.')
      return
    }

    const toastId = toast.loading(
      'Preparando backup dos dados. Isso pode levar alguns instantes...',
    )
    setExporting(true)

    try {
      const { data: userRec } = await supabase
        .from('users')
        .select('project_id')
        .eq('user_id', user.id)
        .maybeSingle()

      const projectId = userRec?.project_id

      const transactions = await fetchAll('transactions', projectId)
      const appointments = await fetchAll('appointments', projectId)
      const metrics = await fetchAll('monthly_metrics', projectId)
      const settings = await fetchAll('user_settings', projectId)

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

      toast.success('Backup exportado com sucesso!', { id: toastId })
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar os dados.', { id: toastId })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExportData}
      disabled={exporting}
      variant="outline"
      className="h-11 px-4 gap-2 bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 shadow-sm font-bold"
      title="Fazer Backup dos Dados"
    >
      <Download className="w-4 h-4 text-slate-600" />
      <span className="hidden lg:inline">{exporting ? 'Aguarde...' : 'Backup'}</span>
    </Button>
  )
}
