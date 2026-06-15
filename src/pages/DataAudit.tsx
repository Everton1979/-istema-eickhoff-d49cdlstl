import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RefreshCw, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

type GroupedData = {
  user_id: string
  project_id: string
  total_lancamentos: number
  receitas_total: number
  despesas_total: number
}

export default function DataAudit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<GroupedData[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const d1Start = new Date('2026-04-01T00:00:00-03:00').toISOString()
      const d1End = new Date('2026-04-12T23:59:59.999-03:00').toISOString()
      const d2Start = new Date('2026-06-01T00:00:00-03:00').toISOString()
      const d2End = new Date('2026-06-30T23:59:59.999-03:00').toISOString()

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('user_id, project_id, amount')
        .or(`and(date.gte.${d1Start},date.lte.${d1End}),and(date.gte.${d2Start},date.lte.${d2End})`)

      if (txError) throw txError

      const groups: Record<string, GroupedData> = {}

      ;(txData || []).forEach((t) => {
        const key = `${t.user_id}_${t.project_id}`
        if (!groups[key]) {
          groups[key] = {
            user_id: t.user_id || 'N/A',
            project_id: t.project_id || 'N/A',
            total_lancamentos: 0,
            receitas_total: 0,
            despesas_total: 0,
          }
        }

        groups[key].total_lancamentos += 1

        const amount = Number(t.amount)
        if (amount > 0) {
          groups[key].receitas_total += amount
        } else if (amount < 0) {
          groups[key].despesas_total += Math.abs(amount)
        }
      })

      const results = Object.values(groups).sort((a, b) => a.user_id.localeCompare(b.user_id))
      setData(results)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao buscar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const globalReceitas = data.reduce((acc, row) => acc + row.receitas_total, 0)
  const globalDespesas = data.reduce((acc, row) => acc + row.despesas_total, 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Auditoria de Dados</h1>
          <p className="text-muted-foreground mt-2">
            Diagnóstico de lançamentos (01 a 12 de Abril, 01 a 30 de Junho de 2026)
          </p>
        </div>
        <div>
          <Button onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {!error && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Geral - Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(globalReceitas)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Geral - Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600">
                  {formatCurrency(globalDespesas)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Agrupamento por Usuário e Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && data.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  Buscando registros...
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  Nenhum registro encontrado para estes períodos.
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Project ID</TableHead>
                        <TableHead className="text-right">Total Lançamentos</TableHead>
                        <TableHead className="text-right">Receitas</TableHead>
                        <TableHead className="text-right">Despesas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow
                          key={`${row.user_id}_${row.project_id}`}
                          className="hover:bg-slate-50"
                        >
                          <TableCell className="font-medium font-mono text-xs text-slate-700">
                            {row.user_id}
                          </TableCell>
                          <TableCell className="font-medium font-mono text-xs text-slate-600">
                            {row.project_id}
                          </TableCell>
                          <TableCell className="text-right">{row.total_lancamentos}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            {formatCurrency(row.receitas_total)}
                          </TableCell>
                          <TableCell className="text-right text-rose-600 font-medium">
                            {formatCurrency(row.despesas_total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
