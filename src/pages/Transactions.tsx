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
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { DeleteTransactionDialog } from '@/components/transactions/DeleteTransactionDialog'
import { format } from 'date-fns'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Transaction } from '@/types/finance'

export default function Transactions() {
  const { filteredTransactions, categories, accounts, loadingData } = useFinanceStore()
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'PREVISTO' | 'VENCIDO'>('ALL')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredData = filteredTransactions.filter((t) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      t.description.toLowerCase().includes(searchLower) ||
      (t.tags && t.tags.toLowerCase().includes(searchLower))

    if (!matchesSearch) return false

    const tDate = new Date(t.date)
    tDate.setHours(0, 0, 0, 0)

    if (quickFilter === 'PREVISTO') {
      return t.status === 'PREVISTO' || tDate > today
    }
    if (quickFilter === 'VENCIDO') {
      return tDate < today && t.status !== 'REALIZADO'
    }

    return true
  })

  const getCategoryName = (id: string, type: string) => {
    if (type === 'INCOME') return '-'
    if (!id) return '-'
    if (id === 'FIXA') return 'Fixa'
    if (id === 'VARIAVEL') return 'Variável'
    return categories.find((c) => c.id === id)?.name || id
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

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-md border overflow-hidden p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Transações</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus lançamentos financeiros</p>
        </div>
        <div className="flex gap-2">
          {profile?.role !== 'Visitante' && (
            <Sheet open={isSheetOpen} onOpenChange={handleSheetChange}>
              <SheetTrigger asChild>
                <Button
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => setEditingTx(null)}
                >
                  <Plus className="h-4 w-4" /> Novo Lançamento
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{editingTx ? 'Editar Transação' : 'Adicionar Transação'}</SheetTitle>
                </SheetHeader>
                <TransactionForm
                  onSuccess={() => handleSheetChange(false)}
                  initialData={editingTx}
                />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar descrição ou tag..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-md border shadow-sm">
          <Button
            variant={quickFilter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            className={cn('text-xs h-8 px-4', quickFilter === 'ALL' && 'shadow-sm')}
            onClick={() => setQuickFilter('ALL')}
          >
            Todos
          </Button>
          <Button
            variant={quickFilter === 'PREVISTO' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'text-xs h-8 px-4',
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
              'text-xs h-8 px-4',
              quickFilter === 'VENCIDO' && 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
            )}
            onClick={() => setQuickFilter('VENCIDO')}
          >
            Vencidos
          </Button>
        </div>
      </div>

      <div className="rounded-md border flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-28">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              {(profile?.role === 'Administrador' || profile?.role === 'Colaborador') && (
                <TableHead className="text-center w-24">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Carregando transações...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhuma transação encontrada no período.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap font-medium text-slate-600">
                    {format(new Date(tx.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{tx.description}</div>
                    {tx.tags && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tx.tags
                          .split(',')
                          .filter(Boolean)
                          .map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {getCategoryName(tx.categoryId, tx.type)}
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
                  {(profile?.role === 'Administrador' || profile?.role === 'Colaborador') && (
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
                        {profile?.role === 'Administrador' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingId(tx.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground mt-2 text-right">
        Total de {filteredData.length} transações no período selecionado.
      </div>

      <DeleteTransactionDialog
        id={deletingId}
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      />
    </div>
  )
}
