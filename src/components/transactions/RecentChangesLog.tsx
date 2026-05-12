import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function RecentChangesLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*, profiles:user_id (razao_social, nome_fantasia)')
      .eq('entity', 'Transação')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) setLogs(data)
    setLoading(false)
  }

  const formatCurrency = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return val
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      Number(val),
    )
  }

  if (loading)
    return <div className="py-8 text-center text-sm text-slate-500">Carregando logs...</div>

  return (
    <div className="mt-6 space-y-4">
      {logs.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-4">
          Nenhuma alteração recente encontrada.
        </div>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="bg-white border rounded-md p-3 shadow-sm text-sm">
            <div className="flex justify-between items-start mb-2 border-b pb-2">
              <div>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-bold tracking-wide uppercase ${log.action === 'REVERTER' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                >
                  {log.action}
                </Badge>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">
                  {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                {log.profiles?.razao_social || log.profiles?.nome_fantasia || 'Usuário'}
              </div>
            </div>

            {log.details?.original && log.details?.updated && (
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div className="bg-rose-50/50 p-2 rounded border border-rose-100">
                  <span className="font-semibold text-rose-700 block mb-1">Antes</span>
                  <div className="space-y-0.5 text-slate-600">
                    <div>
                      Status: <span className="font-medium">{log.details.original.status}</span>
                    </div>
                    {log.details.original.amount !== undefined && (
                      <div>
                        Valor:{' '}
                        <span className="font-medium">
                          {formatCurrency(log.details.original.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100">
                  <span className="font-semibold text-emerald-700 block mb-1">Depois</span>
                  <div className="space-y-0.5 text-slate-600">
                    <div
                      className={
                        log.details.updated.status !== log.details.original.status
                          ? 'text-amber-700 font-bold'
                          : ''
                      }
                    >
                      Status: <span className="font-medium">{log.details.updated.status}</span>
                    </div>
                    {log.details.updated.amount !== undefined && (
                      <div
                        className={
                          Number(log.details.updated.amount) !== Number(log.details.original.amount)
                            ? 'text-amber-700 font-bold'
                            : ''
                        }
                      >
                        Valor:{' '}
                        <span className="font-medium">
                          {formatCurrency(log.details.updated.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {log.action === 'REVERTER' && log.details?.restored_data && (
              <div className="bg-purple-50 p-2.5 rounded text-xs text-purple-800 mt-3 border border-purple-100 font-medium">
                <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
                Revertido para{' '}
                <strong className="text-purple-900">{log.details.restored_data.status}</strong>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
