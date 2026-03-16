import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState, useMemo } from 'react'
import { Transaction } from '@/types/finance'
import { X, Plus, Tag as TagIcon } from 'lucide-react'

const formSchema = z
  .object({
    date: z.string().min(1, 'Data é obrigatória'),
    description: z.string().optional(),
    amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
    status: z.enum(['PREVISTO', 'REALIZADO', 'VENCIDO']),
    tags: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'INCOME' && !data.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Método de entrada é obrigatório para receitas',
        path: ['accountId'],
      })
    }
    if (data.type === 'EXPENSE' && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Categoria é obrigatória para despesas',
        path: ['categoryId'],
      })
    }
    if (data.type === 'EXPENSE' && (!data.description || data.description.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Descrição é obrigatória para despesas',
        path: ['description'],
      })
    }
  })

interface TransactionFormProps {
  onSuccess: () => void
  initialData?: Transaction | null
}

export function TransactionForm({ onSuccess, initialData }: TransactionFormProps) {
  const { accounts, transactions, addTransaction, updateTransaction } = useFinanceStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [tagsList, setTagsList] = useState<string[]>(
    initialData?.tags ? initialData.tags.split(',').filter(Boolean) : [],
  )
  const [tagInput, setTagInput] = useState('')

  const allUniqueTags = useMemo(() => {
    const t = new Set<string>()
    transactions.forEach((tx) => {
      if (tx.tags) {
        tx.tags.split(',').forEach((x) => {
          if (x.trim()) t.add(x.trim())
        })
      }
    })
    return Array.from(t).sort()
  }, [transactions])

  const defaultValues = initialData
    ? {
        date: new Date(initialData.date).toISOString().split('T')[0],
        description: initialData.description,
        amount: initialData.amount,
        type: initialData.type,
        status: initialData.status,
        categoryId: initialData.categoryId || '',
        accountId: initialData.accountId || '',
        tags: initialData.tags || '',
      }
    : {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        type: 'EXPENSE' as const,
        status: 'REALIZADO' as const,
        categoryId: '',
        accountId: '',
        tags: '',
      }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const type = form.watch('type')

  useEffect(() => {
    if (!initialData) {
      if (type === 'INCOME') {
        form.setValue('categoryId', '')
        form.setValue('status', 'REALIZADO')
      } else {
        form.setValue('accountId', '')
      }
    }
  }, [type, form, initialData])

  const addTag = (tagToAdd?: string) => {
    const val = (tagToAdd || tagInput).trim()
    if (val && !tagsList.includes(val)) {
      const newList = [...tagsList, val]
      setTagsList(newList)
      form.setValue('tags', newList.join(','))
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    const newList = tagsList.filter((t) => t !== tagToRemove)
    setTagsList(newList)
    form.setValue('tags', newList.join(','))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const payload = {
        ...values,
        description:
          values.type === 'INCOME' ? 'Receita Registrada' : values.description || 'Despesa',
        status: values.type === 'INCOME' ? 'REALIZADO' : values.status,
        categoryId: values.type === 'EXPENSE' ? values.categoryId || 'FIXA' : '',
        accountId: values.type === 'INCOME' ? values.accountId || 'acc1' : '',
        tags: tagsList.join(','),
      }

      if (initialData) {
        await updateTransaction(initialData.id, payload as any)
        toast({ title: 'Sucesso', description: 'Transação atualizada com sucesso!' })
      } else {
        await addTransaction(payload as any)
        toast({ title: 'Sucesso', description: 'Transação salva com sucesso!' })
      }
      form.reset()
      setTagsList([])
      onSuccess()
    } catch (error) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao salvar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className={type === 'INCOME' ? 'col-span-2' : ''}>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {type === 'EXPENSE' && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PREVISTO">Previsto</SelectItem>
                      <SelectItem value="REALIZADO">Realizado</SelectItem>
                      <SelectItem value="VENCIDO">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === 'EXPENSE' && (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Conta de Luz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 transition-all duration-300 min-h-[80px]">
          {type === 'EXPENSE' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXA">Fixa</SelectItem>
                        <SelectItem value="VARIAVEL">Variável</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5" /> Tags (Opcional)
                </FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Adicionar tag..."
                    className="h-9"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => addTag()}
                    className="h-9 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagsList.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="flex items-center gap-1 pl-2 pr-1 py-1"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="text-slate-500 hover:text-red-500 rounded-full p-0.5 hover:bg-slate-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {allUniqueTags.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-[10px] text-slate-500 mb-1.5">Tags Sugeridas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allUniqueTags
                        .filter((t) => !tagsList.includes(t))
                        .slice(0, 8)
                        .map((t) => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => addTag(t)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full transition-colors border border-slate-200"
                          >
                            {t}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === 'INCOME' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de entrada</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
        </Button>
      </form>
    </Form>
  )
}
