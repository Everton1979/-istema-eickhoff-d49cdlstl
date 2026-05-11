import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { supabase } from '@/lib/supabase/client'
import { FileText, Search, Activity, AlertTriangle, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

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
      .limit(500)

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  const formatCurrency = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return val
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      Number(val),
    )
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const financialLogs = filteredLogs.filter((log) => log.entity === 'Transação')

  const renderDetails = (details: any) => {
    if (!details) return <span className="text-slate-400">-</span>

    if (details.original && details.updated) {
      return (
        <div className="flex flex-col xl:flex-row gap-2 xl:gap-4 text-xs w-full max-w-[600px]">
          <div className="bg-rose-50/50 p-2 rounded border border-rose-100 flex-1 min-w-[200px]">
            <div className="font-semibold text-rose-700 mb-1 flex items-center gap-1 pb-1 border-b border-rose-100">
              <AlertTriangle className="w-3 h-3" /> Antes
            </div>
            <div className="space-y-1 mt-1">
              {details.original.status && (
                <div>
                  <span className="font-medium text-slate-500">Status:</span>{' '}
                  {details.original.status}
                </div>
              )}
              {details.original.amount !== undefined && (
                <div>
                  <span className="font-medium text-slate-500">Valor:</span>{' '}
                  {formatCurrency(details.original.amount)}
                </div>
              )}
              {details.original.type && (
                <div>
                  <span className="font-medium text-slate-500">Tipo:</span> {details.original.type}
                </div>
              )}
              {details.original.date && (
                <div>
                  <span className="font-medium text-slate-500">Data:</span>{' '}
                  {details.original.date.split('T')[0]}
                </div>
              )}
            </div>
          </div>
          <div className="hidden xl:flex items-center justify-center text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100 flex-1 min-w-[200px]">
            <div className="font-semibold text-emerald-700 mb-1 flex items-center gap-1 pb-1 border-b border-emerald-100">
              <Activity className="w-3 h-3" /> Depois
            </div>
            <div className="space-y-1 mt-1">
              {details.updated.status && (
                <div
                  className={
                    details.updated.status !== details.original.status
                      ? 'text-amber-800 font-bold bg-amber-100/80 px-1 rounded-sm -ml-1 border border-amber-200 inline-block w-full'
                      : ''
                  }
                >
                  <span className="font-medium text-slate-500">Status:</span>{' '}
                  {details.updated.status}
                </div>
              )}
              {details.updated.amount !== undefined && (
                <div
                  className={
                    Number(details.updated.amount) !== Number(details.original.amount)
                      ? 'text-amber-800 font-bold bg-amber-100/80 px-1 rounded-sm -ml-1 border border-amber-200 inline-block w-full'
                      : ''
                  }
                >
                  <span className="font-medium text-slate-500">Valor:</span>{' '}
                  {formatCurrency(details.updated.amount)}
                </div>
              )}
              {details.updated.type && (
                <div>
                  <span className="font-medium text-slate-500">Tipo:</span> {details.updated.type}
                </div>
              )}
              {details.updated.date && (
                <div>
                  <span className="font-medium text-slate-500">Data:</span>{' '}
                  {details.updated.date.split('T')[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (details.deleted_data) {
      return (
        <div className="bg-rose-50/80 p-2 rounded border border-rose-200 text-xs max-w-[300px]">
          <div className="font-semibold text-rose-700 mb-1 border-b border-rose-200 pb-1">
            Dados Excluídos:
          </div>
          <div className="space-y-1 mt-1">
            {details.deleted_data.description && (
              <div>
                <span className="font-medium text-slate-500">Desc:</span>{' '}
                {details.deleted_data.description}
              </div>
            )}
            {details.deleted_data.amount !== undefined && (
              <div>
                <span className="font-medium text-slate-500">Valor:</span>{' '}
                {formatCurrency(details.deleted_data.amount)}
              </div>
            )}
            {details.deleted_data.status && (
              <div>
                <span className="font-medium text-slate-500">Status:</span>{' '}
                {details.deleted_data.status}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border max-w-[300px] max-h-[100px] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-[10px]">
          {JSON.stringify(details, null, 2)}
        </pre>
      </div>
    )
  }

  const renderTable = (data: any[]) => (
    <div className="bg-white rounded-md shadow-sm border overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-40">Data/Hora</TableHead>
            <TableHead className="w-48">Usuário</TableHead>
            <TableHead className="w-24">Ação</TableHead>
            <TableHead className="w-32">Módulo</TableHead>
            <TableHead>Detalhes da Modificação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Carregando histórico...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          ) : (
            data.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/50">
                <TableCell className="whitespace-nowrap text-slate-600 text-xs">
                  {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div
                    className="font-medium text-slate-900 text-sm truncate max-w-[150px]"
                    title={log.profiles?.razao_social || log.profiles?.nome_fantasia || 'Usuário'}
                  >
                    {log.profiles?.razao_social || log.profiles?.nome_fantasia || 'Usuário'}
                  </div>
                  <div
                    className="text-[10px] text-slate-500 truncate max-w-[150px]"
                    title={log.profiles?.email}
                  >
                    {log.profiles?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold tracking-wide uppercase ${
                      log.action === 'CRIAR'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : log.action === 'ATUALIZAR'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : log.action === 'EXCLUIR'
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-700 font-medium text-sm">{log.entity}</TableCell>
                <TableCell>{renderDetails(log.details)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Auditoria e Investigação</h1>
                <p className="text-sm text-slate-500">
                  Rastreie alterações de valores e status no sistema.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por usuário, ação ou valor..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="financial" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="financial" className="gap-2">
                <Activity className="w-4 h-4" /> Investigação Financeira
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <FileText className="w-4 h-4" /> Todos os Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-sm text-amber-800 flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong className="block mb-1">Dica de Investigação:</strong>
                  Se você notou uma queda brusca nas "Despesas Realizadas", procure por ações de{' '}
                  <strong>ATUALIZAR</strong> ou <strong>EXCLUIR</strong> nesta aba. É provável que
                  transações tenham sido alteradas de "REALIZADO" para "PREVISTO" ou "VENCIDO", ou
                  que tenham sido excluídas recentemente. Os dados alterados estarão grifados em
                  amarelo.
                </div>
              </div>
              {renderTable(financialLogs)}
            </TabsContent>

            <TabsContent value="all">{renderTable(filteredLogs)}</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
