import { useMemo, useState, useEffect } from 'react'
import { Pencil, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrencyInput, parseCurrencyInput, getTagColor } from '@/lib/utils'
import { useFinanceStore } from '@/stores/financeStore'
import { DeleteTransactionDialog } from '@/components/transactions/DeleteTransactionDialog'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { getDaysInMonth, getMonthDayOptions, clampDateToMonth } from '@/lib/calendar'
import { ALL_MONTHS_SENTINEL } from '@/lib/calendar'

export function Transactions() {
  const {
    transactions,
    categories,
    accounts,
    filters,
    setFilters,
    loadingData,
    deleteTransaction,
    fetchTransactions,
    visibleYears,
  } = useFinanceStore()

  const { user } = useAuth()
  const isColaborador = user?.profile === 'COLABORADOR'

  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<string | null>(null)
  const [editingTx, setEditingTx] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const allMonthsActive = filters.month === ALL_MONTHS_SENTINEL

  const months = [
    { value: ALL_MONTHS_SENTINEL, label: 'TODOS OS MESES' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  const years = visibleYears()

  useEffect(() => {
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (allMonthsActive) return
    const currentDay = filters.day ? Number(filters.day) : null
    if (!currentDay) return
    const daysInSelectedMonth = getDaysInMonth(Number(filters.year), Number(filters.month))
    if (currentDay > daysInSelectedMonth) {
      setFilters({ day: String(daysInSelectedMonth).padStart(2, '0') })
    }
  }, [allMonthsActive, filters.year, filters.month, filters.day, setFilters])

  const filteredData = useMemo(() => {
    let list = transactions

    // Filtro de período: mês específico do seletor, ou o ano inteiro com TODOS OS MESES
    if (allMonthsActive) {
      list = list.filter((tx) => tx.date.startsWith(String(filters.year)))
    } else {
      list = list.filter((tx) => tx.date.startsWith(`${filters.year}-${filters.month}`))
    }

    // Dia: só se aplica quando um mês específico está ativo
    if (!allMonthsActive && filters.day) {
      list = list.filter((tx) =>
        tx.date.startsWith(`${filters.year}-${filters.month}-${filters.day}`),
      )
    }

    if (filters.type) {
      list = list.filter((tx) => tx.type === filters.type)
    }
    if (filters.categoryId) {
      list = list.filter((tx) => tx.categoryId === filters.categoryId)
    }
    if (filters.status) {
      list = list.filter((tx) => tx.status === filters.status)
    }
    if (filters.accountId) {
      list = list.filter((tx) => tx.accountId === filters.accountId)
    }
    if (filters.tag) {
      list = list.filter((tx) => (tx.tags ?? '').includes(filters.tag!))
    }
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (tx) =>
          tx.description.toLowerCase().includes(s) ||
          (tx.notes ?? '').toLowerCase().includes(s) ||
          (tx.tags ?? '').toLowerCase().includes(s),
      )
    }
    if (quickFilter) {
      switch (quickFilter) {
        case 'RECEITAS':
          list = list.filter((tx) => tx.type === 'INCOME')
          break
        case 'DESPESAS':
          list = list.filter((tx) => tx.type === 'EXPENSE')
          break
        case 'PREVISTO':
          list = list.filter((tx) => tx.status === 'PREVISTO')
          break
        case 'VENCIDO':
          list = list.filter(
            (tx) =>
              tx.status === 'PREVISTO' &&
              new Date(tx.date) < new Date(new Date().toISOString().split('T')[0]),
          )
          break
        case 'CORTESIA':
          list = list.filter((tx) => (tx.tags ?? '').toLowerCase().includes('cortesia'))
          break
        case 'PARTNER_WITHDRAWAL':
          list = list.filter((tx) => tx.type === 'PARTNER_WITHDRAWAL')
          break
        case 'MP_EMB_MED':
          list = list.filter((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId)
            const name = (cat?.name ?? '').toLowerCase()
            return (
              name.includes('matéria-prima') ||
              name.includes('materia-prima') ||
              name.includes('embalagem') ||
              name.includes('medicamento')
            )
          })
          break
      }
    }

    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [transactions, filters, search, quickFilter, categories, allMonthsActive])

  const visibleBalance = filteredData
    .filter((tx) => tx.status === 'REALIZADO')
    .reduce((acc, tx) => acc + (tx.type === 'INCOME' ? tx.amount : -tx.amount), 0)

  const formatCurrency = (value: number, type: string) => {
    const abs = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(value))
    return type === 'EXPENSE' ? `-${abs}` : type === 'PARTNER_WITHDRAWAL' ? `-${abs}` : abs
  }

  const getCategoryName = (tx: any) => {
    const cat = categories.find((c) => c.id === tx.categoryId)
    return cat?.name ?? '—'
  }

  const getAccountName = (accountId: string, type: string) => {
    if (type === 'TRANSFER') return '—'
    const acc = accounts.find((a) => a.id === accountId)
    return acc?.name ?? '—'
  }

  const handleEdit = (tx: any) => {
    setEditingTx(tx)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Transações</h1>
        {!isColaborador && (
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => {
              setEditingTx(null)
              setFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Transação
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 uppercase">Mês</label>
              <Select
                value={filters.month}
                onValueChange={(v) => {
                  setFilters({ month: v, day: '' })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 uppercase">Ano</label>
              <Select value={filters.year} onValueChange={(v) => setFilters({ year: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!allMonthsActive && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 uppercase">Dia</label>
                <Select
                  value={filters.day || undefined}
                  onValueChange={(v) => setFilters({ day: v === 'all' ? '' : v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os dias" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthDayOptions(Number(filters.year), Number(filters.month)).map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 uppercase">Descrição</label>
              <Input
                placeholder="Buscar por descrição, observações ou tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filtros rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={quickFilter === 'TODOS' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none"
              onClick={() => setQuickFilter(null)}
            >
              Todos
            </Button>
            <Button
              variant={quickFilter === 'PREVISTO' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none"
              onClick={() => setQuickFilter('PREVISTO')}
            >
              Previstos
            </Button>
            <Button
              variant={quickFilter === 'VENCIDO' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'VENCIDO' && 'bg-red-400 text-black hover:bg-red-500 shadow-sm',
              )}
              onClick={() => setQuickFilter('VENCIDO')}
            >
              Vencidos
            </Button>
            <Button
              variant={quickFilter === 'CORTESIA' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'CORTESIA' &&
                  'bg-orange-400 text-black hover:bg-orange-500 shadow-sm',
              )}
              onClick={() => setQuickFilter('CORTESIA')}
            >
              Cortesias
            </Button>
            <Button
              variant={quickFilter === 'PARTNER_WITHDRAWAL' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'PARTNER_WITHDRAWAL' &&
                  'bg-purple-400 text-black hover:bg-purple-500 shadow-sm',
              )}
              onClick={() => setQuickFilter('PARTNER_WITHDRAWAL')}
            >
              Retiradas Sócios
            </Button>
            <Button
              variant={quickFilter === 'RECEITAS' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none gap-1.5',
                quickFilter === 'RECEITAS' &&
                  'bg-emerald-400 text-black hover:bg-emerald-500 shadow-sm',
              )}
              onClick={() => setQuickFilter('RECEITAS')}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Receitas
            </Button>
            <Button
              variant={quickFilter === 'DESPESAS' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none gap-1.5',
                quickFilter === 'DESPESAS' && 'bg-red-400 text-black hover:bg-red-500 shadow-sm',
              )}
              onClick={() => setQuickFilter('DESPESAS')}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Despesas
            </Button>
            <Button
              variant={quickFilter === 'MP_EMB_MED' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none gap-1.5',
                quickFilter === 'MP_EMB_MED' &&
                  'bg-amber-400 text-black hover:bg-amber-500 shadow-sm',
              )}
              onClick={() => setQuickFilter('MP_EMB_MED')}
            >
              Soma MP + EMB + MED
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border border-black/15 bg-white relative w-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] w-full custom-scrollbar">
          <Table className="min-w-[800px] w-full">
            <TableHeader className="bg-blue-50 sticky top-0 z-10 shadow-sm border-b border-black/15">
              <TableRow>
                <TableHead className="w-28">Data</TableHead>
                <TableHead>Descrição / Observações</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingData ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Carregando transações...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhuma transação encontrada no período ou com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50">
                    <TableCell className="whitespace-nowrap font-medium text-slate-600">
                      {tx.date.split('T')[0].split('-').reverse().join('/')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{tx.description}</div>
                      {tx.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tx.tags
                            .split(',')
                            .filter(Boolean)
                            .map((t) => {
                              const trimmed = t.trim()
                              return (
                                <span
                                  key={trimmed}
                                  className={cn(
                                    'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border',
                                    getTagColor(trimmed),
                                  )}
                                >
                                  {trimmed}
                                </span>
                              )
                            })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{getCategoryName(tx)}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {getAccountName(tx.accountId, tx.type)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.status === 'REALIZADO'
                            ? 'default'
                            : tx.status === 'PREVISTO'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className={cn(
                          'text-[10px] font-semibold',
                          tx.status === 'REALIZADO' &&
                            'bg-emerald-500 hover:bg-emerald-600 text-black',
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-bold',
                        tx.type === 'INCOME'
                          ? 'text-emerald-600'
                          : tx.type === 'EXPENSE'
                            ? 'text-red-500'
                            : tx.type === 'PARTNER_WITHDRAWAL'
                              ? 'text-purple-600'
                              : tx.type === 'INVESTIMENTO'
                                ? 'text-blue-600'
                                : 'text-orange-500',
                      )}
                    >
                      {formatCurrency(tx.amount, tx.type)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEdit(tx)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeletingId(tx.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-2 border-t text-sm">
        <div className="text-muted-foreground text-xs hidden sm:block">
          Role a tabela para ver mais lançamentos se houver.
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center ml-auto">
          {quickFilter === 'CORTESIA' && (
            <div className="font-bold text-black bg-orange-200 px-3 py-1.5 rounded-md">
              Total Cortesias:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredData.reduce((acc, tx) => acc + tx.amount, 0),
              )}
            </div>
          )}

          {quickFilter === 'PARTNER_WITHDRAWAL' && (
            <div className="font-bold text-black bg-purple-200 px-3 py-1.5 rounded-md">
              Total Retiradas:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredData.reduce((acc, tx) => acc + tx.amount, 0),
              )}
            </div>
          )}

          {quickFilter === 'RECEITAS' && (
            <div className="font-bold text-black bg-green-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Total Receitas:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredData
                  .filter((tx) => tx.status === 'REALIZADO')
                  .reduce((acc, tx) => acc + tx.amount, 0),
              )}
            </div>
          )}

          {quickFilter === 'DESPESAS' && (
            <div className="font-bold text-black bg-red-200 px-3 py-1.5 rounded-md border border-red-300 shadow-sm flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              Total Despesas:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredData
                  .filter((tx) => tx.status === 'REALIZADO')
                  .reduce((acc, tx) => acc + tx.amount, 0),
              )}
            </div>
          )}

          {quickFilter === 'PREVISTO' && (
            <div className="font-bold text-black bg-blue-200 px-3 py-1.5 rounded-md border border-blue-300 shadow-sm">
              Total Previsto:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredData.reduce((acc, tx) => acc + tx.amount, 0),
              )}
            </div>
          )}

          {quickFilter === 'VENCIDO' && (
            <div className="font-bold text-black bg-red-200 px-3 py-1.5 rounded-md border border-red-300 shadow-sm">
              Total Vencido:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredData.reduce((acc, tx) => acc + tx.amount, 0),
              )}
            </div>
          )}

          {quickFilter === 'MP_EMB_MED' && (
            <div className="font-bold text-black bg-yellow-200 px-3 py-1.5 rounded-md border border-yellow-300 shadow-sm flex items-center gap-1.5">
              Soma MP + EMB + MED:{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredData.reduce((acc, tx) => acc + tx.amount, 0),
              )}
            </div>
          )}

          {!isColaborador &&
            quickFilter !== 'CORTESIA' &&
            quickFilter !== 'PARTNER_WITHDRAWAL' &&
            quickFilter !== 'RECEITAS' &&
            quickFilter !== 'DESPESAS' &&
            quickFilter !== 'PREVISTO' &&
            quickFilter !== 'VENCIDO' &&
            quickFilter !== 'MP_EMB_MED' &&
            filteredData.length > 0 && (
              <div
                className={cn(
                  'font-bold px-3 py-1.5 rounded-md border shadow-sm flex gap-4 text-black',
                  visibleBalance >= 0
                    ? 'bg-green-200 border-green-300'
                    : 'bg-red-200 border-red-300',
                )}
              >
                <span>
                  Saldo visível:{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    visibleBalance,
                  )}
                </span>
              </div>
            )}

          <div className="font-bold text-slate-700 bg-slate-200 px-3 py-1.5 rounded-md">
            Total visível: <span className="text-primary">{filteredData.length}</span> transações
          </div>
        </div>
      </div>

      <DeleteTransactionDialog
        id={deletingId}
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      />

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} editingTransaction={editingTx} />
    </div>
  )
}
