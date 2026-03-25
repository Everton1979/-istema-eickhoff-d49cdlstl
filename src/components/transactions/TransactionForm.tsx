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
import { useFinanceStore, PAYMENT_METHODS } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState, useMemo } from 'react'
import { Transaction } from '@/types/finance'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { cn, getTagColor } from '@/lib/utils'

const formSchema = z
  .object({
    date: z.string().min(1, 'Data é obrigatória'),
    description: z.string().min(2, 'Descrição é obrigatória'),
    amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
    paymentMethodId: z.string().optional(),
    status: z.enum(['PREVISTO', 'REALIZADO', 'VENCIDO']),
    tags: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'INCOME' && !data.paymentMethodId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Meio de pagamento é obrigatório para receitas',
        path: ['paymentMethodId'],
      })
    }
    if (data.type === 'EXPENSE') {
      if (!data.categoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Categoria é obrigatória para despesas',
          path: ['categoryId'],
        })
      }
      if (data.categoryId === 'VARIAVEL' && !data.subcategoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Subcategoria é obrigatória para despesas variáveis',
          path: ['subcategoryId'],
        })
      }
    }
  })

interface TransactionFormProps {
  onSuccess: () => void
  initialData?: Transaction | null
}

export function TransactionForm({ onSuccess, initialData }: TransactionFormProps) {
  const { transactions, addTransaction, updateTransaction } = useFinanceStore()
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
        subcategoryId: initialData.subcategoryId || '',
        paymentMethodId: initialData.paymentMethodId || '',
        tags: initialData.tags || '',
      }
    : {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        type: 'EXPENSE' as const,
        status: 'REALIZADO' as const,
        categoryId: '',
        subcategoryId: '',
        paymentMethodId: '',
        tags: '',
      }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const type = form.watch('type')
  const categoryId = form.watch('categoryId')

  useEffect(() => {
    if (!initialData) {
      if (type === 'INCOME') {
        form.setValue('categoryId', '')
        form.setValue('subcategoryId', '')
      } else {
        form.setValue('paymentMethodId', '')
        if (categoryId !== 'VARIAVEL') {
          form.setValue('subcategoryId', '')
        }
      }
    }
  }, [type, categoryId, form, initialData])

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
        description: values.description,
        status: values.status,
        categoryId: values.type === 'EXPENSE' ? values.categoryId || 'FIXA' : '',
        subcategoryId:
          values.type === 'EXPENSE' && values.categoryId === 'VARIAVEL'
            ? values.subcategoryId || ''
            : '',
        accountId: 'sicredi', // Auto-assigned unified account
        paymentMethodId: values.type === 'INCOME' ? values.paymentMethodId || '' : '',
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
              <FormItem>
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Conta de Luz / Venda de Produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

              {categoryId === 'VARIAVEL' && (
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <FormLabel>Subcategoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="materia_prima">Matéria-prima</SelectItem>
                          <SelectItem value="embalagens">Embalagens</SelectItem>
                          <SelectItem value="medicamentos_drogaria">
                            Medicamentos (Drogaria)
                          </SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                      <span
                        key={t}
                        className={cn(
                          'flex items-center gap-1 pl-2 pr-1 py-1 rounded text-xs font-medium border',
                          getTagColor(t),
                        )}
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="hover:text-red-600 rounded-full p-0.5 hover:bg-black/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
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
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full transition-colors border hover:opacity-80',
                              getTagColor(t),
                            )}
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
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meio de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((pm) => (
                          <SelectItem key={pm.id} value={pm.id}>
                            {pm.name}
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
