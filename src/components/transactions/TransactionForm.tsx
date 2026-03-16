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
import { useFinanceStore } from '@/stores/financeStore'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

const formSchema = z
  .object({
    date: z.string().min(1, 'Data é obrigatória'),
    description: z.string().min(3, 'Descrição muito curta'),
    amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string().optional(),
    accountId: z.string().optional(),
    status: z.enum(['PREVISTO', 'REALIZADO', 'VENCIDO']),
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
  })

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { accounts, addTransaction } = useFinanceStore()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'EXPENSE',
      status: 'REALIZADO',
      categoryId: '',
      accountId: '',
    },
  })

  const type = form.watch('type')

  // Clear hidden fields when transaction type changes
  useEffect(() => {
    if (type === 'INCOME') {
      form.setValue('categoryId', '')
    } else {
      form.setValue('accountId', '')
    }
  }, [type, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addTransaction({
      ...values,
      categoryId: values.categoryId || '',
      accountId: values.accountId || '',
    } as any)
    toast({ title: 'Sucesso', description: 'Transação salva com sucesso!' })
    form.reset()
    onSuccess()
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
                <Input placeholder="Ex: Conta de Luz" {...field} />
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
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
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

        <Button type="submit" className="w-full mt-4">
          Salvar Lançamento
        </Button>
      </form>
    </Form>
  )
}
