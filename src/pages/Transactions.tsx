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
import { Plus, Search, Pencil, Trash2, Info, Download } from 'lucide-react'
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
  const { filteredTransactions, accounts, loadingData, filters } = useFinanceStore()
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [dayFilter, setDayFilter] = useState<string>('ALL')
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'PREVISTO' | 'VENCIDO'>('ALL')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const activeMonthsText =
    filters.months.length > 0
      ? filters.months.map((m) => MONTHS_PT[parseInt(m, 10) - 1]).join(', ')
      : 'Todos os meses'

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

      // 2. Receitas (INCOME) antes de Despesas (EXPENSE)
      if (a.type === 'INCOME' && b.type === 'EXPENSE') return -1
      if (a.type === 'EXPENSE' && b.type === 'INCOME') return 1

      // 3. Ordem crescente de valor
      if (a.amount !== b.amount) {
        return a.amount - b.amount
      }

      // Se forem do mesmo tipo e status, mantém a ordem cronológica original baseada na string completa
      return b.date.localeCompare(a.date)
    })

  const SUBCATEGORY_LABELS: Record<string, string> = {
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
    if (tx.type === 'INCOME') return '-'
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
    if (type === 'EXPENSE') return '-'
    if (!id) return '-'
    return accounts.find((a) => a.id === id)?.name || id
  }

  const formatCurrency = (val: number, type: string) => {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      val,
    )
    return type === 'EXPENSE' ? `- ${formatted}` : formatted
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setIsSheetOpen(true)
  }

  const handleSheetChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) setEditingTx(null)
  }

  const handleExportExcel = () => {
    let receitas = 0
    let despesas = 0

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'REALIZADO') {
        if (tx.type === 'INCOME') receitas += tx.amount
        else despesas += tx.amount
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
            <h1 className="text-2xl font-bold text-primary">Transações</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus lançamentos financeiros</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
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

            <Sheet open={isSheetOpen} onOpenChange={handleSheetChange}>
              <SheetTrigger asChild>
                <Button
                  className="gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => setEditingTx(null)}
                >
                  <Plus className="h-4 w-4" /> Novo Lançamento
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto w-full sm:max-w-md p-4 sm:p-6">
                <SheetHeader>
                  <SheetTitle>{editingTx ? 'Editar Transação' : 'Adicionar Transação'}</SheetTitle>
                </SheetHeader>
                <TransactionForm
                  onSuccess={() => handleSheetChange(false)}
                  initialData={editingTx}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="bg-blue-50 text-blue-700 p-3 rounded-md mb-6 flex flex-col sm:flex-row sm:items-center gap-2 text-sm border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Exibindo transações do período filtrado: <strong>{activeMonthsText}</strong>
            </span>
          </div>
          <span className="text-blue-600/80 text-xs sm:ml-auto">
            (Altere o filtro de mês no menu lateral do Painel Geral)
          </span>
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
                          tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500',
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
          <div className="font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md ml-auto">
            Total visível: <span className="text-primary">{filteredData.length}</span> transações
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
