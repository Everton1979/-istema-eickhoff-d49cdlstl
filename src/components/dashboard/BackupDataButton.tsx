import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'

export function BackupDataButton() {
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
