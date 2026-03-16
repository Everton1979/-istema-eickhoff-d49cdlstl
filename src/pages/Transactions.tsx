import { useState } from 'react'
import { useFinanceStore } from '@/stores/financeStore'
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
import { Plus, Search, Download, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Transaction } from '@/types/finance'

export default function Transactions() {
  const { transactions, categories, accounts, loadingData } = useFinanceStore()
  const [search, setSearch] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredData = transactions.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()),
  )

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
          <Button variant="outline" className="hidden sm:flex gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={handleSheetChange}>
            <SheetTrigger asChild>
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => setEditingTx(null)}
              >
                <Plus className="h-4 w-4" /> Novo Lançamento
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{editingTx ? 'Editar Transação' : 'Adicionar Transação'}</SheetTitle>
              </SheetHeader>
              <TransactionForm onSuccess={() => handleSheetChange(false)} initialData={editingTx} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Carregando transações...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.slice(0, 50).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(tx.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>{getCategoryName(tx.categoryId, tx.type)}</TableCell>
                  <TableCell>{getAccountName(tx.accountId, tx.type)}</TableCell>
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
                        'text-[10px]',
                        tx.status === 'REALIZADO' && 'bg-emerald-500 hover:bg-emerald-600',
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium',
                      tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500',
                    )}
                  >
                    {formatCurrency(tx.amount, tx.type)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => handleEdit(tx)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
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
      <div className="text-xs text-muted-foreground mt-2 text-right">
        Mostrando {Math.min(filteredData.length, 50)} registros de {filteredData.length}.
      </div>

      <DeleteTransactionDialog
        id={deletingId}
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      />
    </div>
  )
}
