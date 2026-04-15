import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { supabase } from '@/lib/supabase/client'
import { FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles:user_id (email, razao_social, nome_fantasia)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Histórico de Atividades</h1>
                <p className="text-sm text-slate-500">
                  Visualize as ações realizadas pelos usuários no sistema.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar atividades..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Carregando histórico...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                      <TableCell className="whitespace-nowrap text-slate-600">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {log.profiles?.razao_social || log.profiles?.nome_fantasia || 'Usuário'}
                        </div>
                        <div className="text-xs text-slate-500">{log.profiles?.email}</div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                            log.action === 'CRIAR'
                              ? 'bg-emerald-100 text-emerald-700'
                              : log.action === 'ATUALIZAR'
                                ? 'bg-blue-100 text-blue-700'
                                : log.action === 'EXCLUIR'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium">{log.entity}</TableCell>
                      <TableCell
                        className="max-w-[250px] truncate text-slate-500 text-sm"
                        title={log.details ? JSON.stringify(log.details) : ''}
                      >
                        {log.details ? (
                          <span className="cursor-help border-b border-dashed border-slate-300 pb-0.5">
                            {log.details.description ||
                              log.details.type ||
                              JSON.stringify(log.details)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
