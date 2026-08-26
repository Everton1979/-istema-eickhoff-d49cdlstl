import { useState, useEffect, useMemo } from 'react'
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Info,
  Activity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn, getTagColor } from '@/lib/utils'
import { Transaction } from '@/types/finance'
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
    | 'ALL'
    | 'PREVISTO'
    | 'VENCIDO'
    | 'CORTESIA'
    | 'PARTNER_WITHDRAWAL'
    | 'RECEITAS'
    | 'DESPESAS'
    | 'MP_EMB_MED'
  >('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const dayFilter = filters.dayFilter || 'ALL'

  const setDayFilter = (val: string) => setFilter('dayFilter', val)

  const prefillDate = useMemo(() => {
    const month = filters.months?.[0]
    const year = filters.years?.[0]
    if (dayFilter !== 'ALL' && month && year) {
      return `${year}-${month}-${dayFilter.padStart(2, '0')}`
    }
    return new Date().toISOString().split('T')[0]
  }, [dayFilter, filters.months, filters.years])

  useEffect(() => {
    const now = new Date()
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0')
    const currentYear = now.getFullYear().toString()

    setFilter('months', [currentMonth])
    setFilter('years', [currentYear])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        return t.type === 'INCOME' && t.status === 'REALIZADO'
      }
      if (quickFilter === 'DESPESAS') {
        return t.type === 'EXPENSE' && t.status === 'REALIZADO'
      }
      if (quickFilter === 'MP_EMB_MED') {
        const MP_EMB_MED_SUBCATEGORIES = [
          'materia_prima',
          'embalagens',
          'medicamentos_drogaria',
          'insumos e ativos',
          'frascos, potes, rótulos e caixas',
          'produtos para revenda',
        ]
        const sub = (t.subcategoryId || '').toLowerCase().trim()
        return t.status === 'REALIZADO' && MP_EMB_MED_SUBCATEGORIES.includes(sub)
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
    softwares_assinaturas: 'Softwares e Assinaturas',
    juros_multas: 'Juros e Multas',
    manutencao_equipamentos: 'Manutenção de Equipamentos',
    educacao_treinamentos: 'Educação e Treinamentos',
    limpeza_conservacao: 'Limpeza e Conservação',
    brindes_presentes: 'Brindes e Presentes',
    materia_prima: 'Matéria-prima',
    embalagens: 'Embalagens',
    medicamentos_drogaria: 'Medicamentos Drogaria',
    impostos: 'Impostos',
    taxas_cartao: 'Taxas de Cartão',
    logistica: 'Logística',
    fidelidade_promocao: 'Fidelidade e Promoção',
    marketing_variavel: 'Marketing Variável',
    comissoes: 'Comissões',
    materiais_consumo: 'Materiais de Consumo',
    devolucoes_perdas: 'Devoluções e Perdas',
    equipamentos: 'Equipamentos e Máquinas',
    obras_reformas: 'Obras e Reformas',
    mobiliario: 'Mobiliário e Instalações',
    tecnologia: 'Tecnologia',
    outros_investimentos: 'Outros Investimentos',
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

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col custom-scrollbar">
      {/* PrintableReport removed as unused in Transactions */}
      <div className="flex flex-col bg-white rounded-md shadow-md border border-black/15 p-4 sm:p-6 animate-fade-in-up mb-8 w-full print:hidden shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">Transações</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Gerencie seus lançamentos financeiros
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={filters.months?.[0] || String(new Date().getMonth() + 1).padStart(2, '0')}
                onValueChange={(val) => setFilter('months', [val])}
              >
                <SelectTrigger className="w-[140px] h-9 bg-white">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS_PT.map((m, i) => (
                    <SelectItem key={i} value={(i + 1).toString().padStart(2, '0')}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.years?.[0] || new Date().getFullYear().toString()}
                onValueChange={(val) => setFilter('years', [val])}
              >
                <SelectTrigger className="w-[100px] h-9 bg-white">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Sheet open={isTransactionSheetOpen} onOpenChange={handleSheetChange}>
              <SheetTrigger asChild>
                <Button
                  className="gap-2 flex-1 sm:flex-none w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600"
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
                  prefillDate={prefillDate}
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
                quickFilter === 'PREVISTO' && 'bg-blue-400 text-black hover:bg-blue-500 shadow-sm',
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
        </div>

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

            {quickFilter !== 'CORTESIA' &&
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
      </div>
    </div>
  )
}
