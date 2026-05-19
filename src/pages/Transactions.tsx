import { useState } from 'react'
import { useFinanceStore } from '@/stores/financeStore'
import { useAuth } from '@/hooks/use-auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { DeleteTransactionDialog } from '@/components/transactions/DeleteTransactionDialog'
import { Plus, Search, Pencil, Trash2, Info, Download, Activity } from 'lucide-react'
import { cn, getTagColor } from '@/lib/utils'
import { Transaction } from '@/types/finance'
import { PrintableReport } from '@/components/dashboard/PrintableReport'
const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export default function Transactions() {
  const {
    filteredTransactions,
    accounts,
    loadingData,
    filters,
    setFilter,
    isTransactionSheetOpen,
    setTransactionSheetOpen,
    editingTransaction,
    setEditingTransaction,
  } = useFinanceStore()
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<
    'ALL' | 'PREVISTO' | 'VENCIDO' | 'CORTESIA' | 'PARTNER_WITHDRAWAL' | 'RECEITAS' | 'DESPESAS'
  >('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const dayFilter = filters.dayFilter || 'ALL'

  const setDayFilter = (val: string) => setFilter('dayFilter', val)

  const filteredData = filteredTransactions
    .filter((t) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        t.description.toLowerCase().includes(searchLower) ||
        (t.tags && t.tags.toLowerCase().includes(searchLower))

      if (!matchesSearch) return false

      const datePart = t.date.split('T')[0]
      const [year, month, day] = datePart.split('-').map(Number)

      if (dayFilter !== 'ALL' && day !== parseInt(dayFilter, 10)) {
        return false
      }

      const tDate = new Date(year, month - 1, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (quickFilter === 'PREVISTO') {
        return t.status === 'PREVISTO' || tDate > today
      }
      if (quickFilter === 'VENCIDO') {
        return tDate < today && t.status !== 'REALIZADO'
      }
      if (quickFilter === 'CORTESIA') {
        return t.type === 'CORTESIA'
      }
      if (quickFilter === 'PARTNER_WITHDRAWAL') {
        return t.type === 'PARTNER_WITHDRAWAL'
      }
      if (quickFilter === 'RECEITAS') {
        return t.type === 'INCOME'
      }
      if (quickFilter === 'DESPESAS') {
        return t.type === 'EXPENSE'
      }

      return true
    })
    .sort((a, b) => {
      const dateA = a.date.split('T')[0]
      const dateB = b.date.split('T')[0]

      if (dateA !== dateB) {
        return dateB.localeCompare(dateA) // Ordem decrescente de data
      }

      // Dentro do mesmo dia:
      // 1. PREVISTO aparece primeiro
      if (a.status === 'PREVISTO' && b.status !== 'PREVISTO') return -1
      if (a.status !== 'PREVISTO' && b.status === 'PREVISTO') return 1

      // 2. Ordem de tipos: Receitas > Despesas > Retiradas > Cortesias
      const typeWeight = (type: string) =>
        type === 'INCOME' ? 0 : type === 'EXPENSE' ? 1 : type === 'PARTNER_WITHDRAWAL' ? 2 : 3
      if (typeWeight(a.type) !== typeWeight(b.type)) {
        return typeWeight(a.type) - typeWeight(b.type)
      }

      // 3. Ordem crescente de valor
      if (a.amount !== b.amount) {
        return a.amount - b.amount
      }

      // Se forem do mesmo tipo e status, mantém a ordem cronológica original baseada na string completa
      return b.date.localeCompare(a.date)
    })

  const SUBCATEGORY_LABELS: Record<string, string> = {
    prolabore: 'Pró-labore',
    pessoal: 'Pessoal',
    infraestrutura: 'Infraestrutura',
    operacional_administrativo: 'Operacional e Admin.',
    utilidades: 'Utilidades',
    servicos_profissionais: 'Serv. Profissionais e Conformidade',
    seguros: 'Seguros',
    financeiro: 'Financeiro',
    marketing: 'Marketing e Social',
    materia_prima: 'Matéria-prima',
    embalagens: 'Embalagens',
    medicamentos_drogaria: 'Medicamentos Drogaria',
    impostos: 'Impostos',
    taxas_cartao: 'Taxas de Cartão',
    logistica: 'Logística',
    fidelidade_promocao: 'Fidelidade e Promoção',
    outros: 'Outros',
  }

  const getCategoryName = (tx: Transaction) => {
    if (
      tx.type === 'INCOME' ||
      tx.type === 'CORTESIA' ||
      tx.type === 'PARTNER_WITHDRAWAL' ||
      tx.type === 'INVESTIMENTO'
    )
      return '-'
    if (!tx.categoryId) return '-'
    let name = tx.categoryId === 'FIXA' ? 'Fixa' : 'Variável'
    if (tx.subcategoryId && SUBCATEGORY_LABELS[tx.subcategoryId]) {
      name += ` (${SUBCATEGORY_LABELS[tx.subcategoryId]})`
    } else if (tx.subcategoryId) {
      name += ` (${tx.subcategoryId})`
    }
    return name
  }

  const getAccountName = (id: string, type: string) => {
    if (type === 'EXPENSE' || type === 'CORTESIA' || type === 'PARTNER_WITHDRAWAL') return '-'
    if (!id) return '-'
    return accounts.find((a) => a.id === id)?.name || id
  }

  const formatCurrency = (val: number, type: string) => {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      val,
    )
    return type === 'EXPENSE' || type === 'PARTNER_WITHDRAWAL' || type === 'INVESTIMENTO'
      ? `- ${formatted}`
      : formatted
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setTransactionSheetOpen(true)
  }

  const handleSheetChange = (open: boolean) => {
    setTransactionSheetOpen(open)
    if (!open) setEditingTransaction(null)
  }

  const visibleBalance = filteredData.reduce((acc, tx) => {
    if (tx.type === 'INCOME') return acc + tx.amount
    if (tx.type === 'EXPENSE' || tx.type === 'PARTNER_WITHDRAWAL' || tx.type === 'INVESTIMENTO')
      return acc - tx.amount
    return acc
  }, 0)

  const handleExportExcel = () => {
    let receitas = 0
    let despesas = 0

    filteredData.forEach((tx) => {
      if (tx.status === 'REALIZADO') {
        if (tx.type === 'INCOME') receitas += tx.amount
        else if (tx.type === 'EXPENSE') despesas += tx.amount
      }
    })
    const lucro = receitas - despesas

    const summaryRows = [
      ['RESUMO OPERACIONAL'],
      ['Receitas (Realizadas)', receitas.toFixed(2).replace('.', ',')],
      ['Despesas Totais (Caixa)', despesas.toFixed(2).replace('.', ',')],
      ['Lucro Operacional (Caixa)', lucro.toFixed(2).replace('.', ',')],
      [],
      ['EXTRATO DE DESPESAS'],
    ]

    const headers = ['Data', 'Descrição', 'Categoria', 'Conta', 'Status', 'Valor', 'Observações']

    const exportData = filteredData
      .filter((tx) => tx.type === 'EXPENSE')
      .sort((a, b) => {
        const dateA = a.date.split('T')[0]
        const dateB = b.date.split('T')[0]
        return dateA.localeCompare(dateB) // crescente
      })

    const rows = exportData.map((tx) => [
      tx.date.split('T')[0].split('-').reverse().join('/'),
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${getCategoryName(tx)}"`,
      `"${getAccountName(tx.accountId, tx.type)}"`,
      tx.status,
      `-${tx.amount.toFixed(2).replace('.', ',')}`,
      `"${tx.tags || ''}"`,
    ])

    const csvContent =
      '\uFEFF' +
      summaryRows.map((r) => r.join(';')).join('\n') +
      '\n' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `extrato_despesas_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col custom-scrollbar">
      <PrintableReport />
      <div className="flex flex-col bg-white rounded-md shadow-md border p-4 sm:p-6 animate-fade-in-up mb-8 w-full print:hidden shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">Transações</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus lançamentos financeiros
            </p>
            {filters.months?.[0] && filters.years?.[0] && (
              <div className="mt-2 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md inline-flex items-center gap-2">
                Exibindo: {MONTHS_PT[parseInt(filters.months[0], 10) - 1]}/{filters.years[0]}
                <span className="text-xs font-normal text-slate-500 italic ml-2">
                  (Para alterar o mês, acesse o Painel Geral)
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 text-slate-600 flex-1 sm:flex-none">
                  <Download className="h-4 w-4" /> Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>Exportar para Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>Salvar como PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isTransactionSheetOpen} onOpenChange={handleSheetChange}>
              <SheetTrigger asChild>
                <Button
                  className="gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => setEditingTransaction(null)}
                >
                  <Plus className="h-4 w-4" /> Novo Lançamento
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto w-full sm:max-w-md p-4 sm:p-6">
                <SheetHeader>
                  <SheetTitle>
                    {editingTransaction ? 'Editar Transação' : 'Adicionar Transação'}
                  </SheetTitle>
                </SheetHeader>
                <TransactionForm
                  onSuccess={() => handleSheetChange(false)}
                  initialData={editingTransaction}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar descrição ou observação..."
                className="pl-8 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={dayFilter} onValueChange={setDayFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Dia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os dias</SelectItem>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <SelectItem key={d} value={d.toString()}>
                    Dia {d.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-md border shadow-sm w-full sm:w-auto overflow-x-auto custom-scrollbar">
            <Button
              variant={quickFilter === 'ALL' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'ALL' && 'shadow-sm',
              )}
              onClick={() => setQuickFilter('ALL')}
            >
              Todos
            </Button>
            <Button
              variant={quickFilter === 'PREVISTO' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'PREVISTO' && 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
              )}
              onClick={() => setQuickFilter('PREVISTO')}
            >
              Previstos
            </Button>
            <Button
              variant={quickFilter === 'VENCIDO' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'VENCIDO' && 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
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
                  'bg-orange-500 text-white hover:bg-orange-600 shadow-sm',
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
                  'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
              )}
              onClick={() => setQuickFilter('PARTNER_WITHDRAWAL')}
            >
              Retiradas Sócios
            </Button>
            <Button
              variant={quickFilter === 'RECEITAS' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'RECEITAS' &&
                  'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
              )}
              onClick={() => setQuickFilter('RECEITAS')}
            >
              Receitas
            </Button>
            <Button
              variant={quickFilter === 'DESPESAS' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'text-xs h-8 px-4 whitespace-nowrap flex-1 sm:flex-none',
                quickFilter === 'DESPESAS' && 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
              )}
              onClick={() => setQuickFilter('DESPESAS')}
            >
              Despesas
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-white relative w-full overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh] w-full custom-scrollbar">
            <Table className="min-w-[800px] w-full">
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b">
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
                      <TableCell className="text-xs text-slate-600">
                        {getCategoryName(tx)}
                      </TableCell>
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
                            tx.status === 'REALIZADO' && 'bg-emerald-500 hover:bg-emerald-600',
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
              <div className="font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-md">
                Total Cortesias:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  filteredData.reduce((acc, tx) => acc + tx.amount, 0),
                )}
              </div>
            )}

            {quickFilter === 'PARTNER_WITHDRAWAL' && (
              <div className="font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-md">
                Total Retiradas:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  filteredData.reduce((acc, tx) => acc + tx.amount, 0),
                )}
              </div>
            )}

            {quickFilter === 'RECEITAS' && (
              <div className="font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md">
                Total Receitas:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  filteredData.reduce((acc, tx) => acc + tx.amount, 0),
                )}
              </div>
            )}

            {quickFilter === 'DESPESAS' && (
              <div className="font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-100 shadow-sm">
                Total Despesas:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  filteredData.reduce((acc, tx) => acc + tx.amount, 0),
                )}
              </div>
            )}

            {quickFilter === 'PREVISTO' && (
              <div className="font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 shadow-sm">
                Total Previsto:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  filteredData.reduce((acc, tx) => acc + tx.amount, 0),
                )}
              </div>
            )}

            {quickFilter === 'VENCIDO' && (
              <div className="font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-100 shadow-sm">
                Total Vencido:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  filteredData.reduce((acc, tx) => acc + tx.amount, 0),
                )}
              </div>
            )}

            {quickFilter !== 'CORTESIA' &&
              quickFilter !== 'PARTNER_WITHDRAWAL' &&
              quickFilter !== 'RECEITAS' &&
              quickFilter !== 'DESPESAS' &&
              quickFilter !== 'PREVISTO' &&
              quickFilter !== 'VENCIDO' &&
              filteredData.length > 0 && (
                <div
                  className={cn(
                    'font-semibold px-3 py-1.5 rounded-md border shadow-sm flex gap-4',
                    visibleBalance >= 0
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                      : 'text-red-700 bg-red-50 border-red-100',
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

            <div className="font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
              Total visível: <span className="text-primary">{filteredData.length}</span> transações
            </div>
          </div>
        </div>

        <DeleteTransactionDialog
          id={deletingId}
          open={!!deletingId}
          onOpenChange={(open) => !open && setDeletingId(null)}
        />
      </div>
    </div>
  )
}
