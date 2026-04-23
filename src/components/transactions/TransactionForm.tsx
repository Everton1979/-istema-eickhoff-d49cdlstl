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
    description: z.string().optional(),
    amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
    type: z.enum(['INCOME', 'EXPENSE', 'CORTESIA']),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
    paymentMethodId: z.string().optional(),
    status: z.enum(['PREVISTO', 'REALIZADO', 'VENCIDO']),
    tags: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'INCOME') {
      if (!data.paymentMethodId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Meio de pagamento é obrigatório para receitas',
          path: ['paymentMethodId'],
        })
      }
      if (!data.categoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Categoria é obrigatória para receitas',
          path: ['categoryId'],
        })
      }
    }
    if (data.type === 'EXPENSE') {
      if (!data.description || data.description.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Descrição é obrigatória para despesas',
          path: ['description'],
        })
      }
      if (!data.categoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Categoria é obrigatória para despesas',
          path: ['categoryId'],
        })
      }
      if (!data.subcategoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Subcategoria é obrigatória para despesas',
          path: ['subcategoryId'],
        })
      }
    }
    if (data.type === 'CORTESIA') {
      if (!data.description || data.description.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Destinatário/Motivo é obrigatório para cortesias',
          path: ['description'],
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
        categoryId:
          initialData.categoryId || (initialData.type === 'INCOME' ? 'RECEITA_OPERACIONAL' : ''),
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
  const [prevType, setPrevType] = useState(initialData?.type || 'EXPENSE')
  const [prevCategoryId, setPrevCategoryId] = useState(initialData?.categoryId || '')

  useEffect(() => {
    if (type !== prevType) {
      if (type === 'INCOME') {
        form.setValue('categoryId', 'RECEITA_OPERACIONAL')
        form.setValue('subcategoryId', '')
        if (form.getValues('status') === 'VENCIDO') {
          form.setValue('status', 'REALIZADO')
        }
      } else if (type === 'CORTESIA') {
        form.setValue('categoryId', '')
        form.setValue('subcategoryId', '')
        form.setValue('paymentMethodId', '')
      } else {
        form.setValue('categoryId', '')
        form.setValue('paymentMethodId', '')
      }
      setPrevType(type)
    }
  }, [type, form, prevType])

  useEffect(() => {
    if (categoryId !== prevCategoryId) {
      form.setValue('subcategoryId', '')
      setPrevCategoryId(categoryId || '')
    }
  }, [categoryId, form, prevCategoryId])

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

      let finalDescription = values.description?.trim() || ''

      if (values.type === 'INCOME') {
        const allMethods = PAYMENT_METHODS
        const pmName = allMethods.find((p) => p.id === values.paymentMethodId)?.name || ''
        const newAutoDesc = pmName ? `Receita - ${pmName}` : 'Receita'

        if (initialData?.id && initialData.type === 'INCOME') {
          const wasAutoGenerated =
            allMethods.some((pm) => initialData.description === `Receita - ${pm.name}`) ||
            initialData.description === 'Receita'
          if (wasAutoGenerated) {
            finalDescription = newAutoDesc
          } else {
            finalDescription = initialData.description
          }
        } else {
          finalDescription = newAutoDesc
        }
      }

      const payload = {
        ...values,
        description: finalDescription,
        status: values.status,
        categoryId:
          values.categoryId ||
          (values.type === 'EXPENSE'
            ? 'FIXA'
            : values.type === 'INCOME'
              ? 'RECEITA_OPERACIONAL'
              : ''),
        subcategoryId: values.subcategoryId || '',
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
                    <SelectItem value="CORTESIA">Cortesia</SelectItem>
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
                    {(type === 'EXPENSE' || type === 'CORTESIA') && (
                      <SelectItem value="VENCIDO">Vencido</SelectItem>
                    )}
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

        {(type === 'EXPENSE' || type === 'CORTESIA') && (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                <FormLabel>{type === 'CORTESIA' ? 'Destinatário/Motivo' : 'Descrição'}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      type === 'CORTESIA'
                        ? 'Ex: Dr. João Silva / Amostra'
                        : 'Ex: Conta de Luz / Compra de Insumo'
                    }
                    {...field}
                    value={field.value || ''}
                  />
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

              {categoryId && (
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <FormLabel>Subcategoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a classificação..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryId === 'FIXA' && (
                            <>
                              <SelectItem value="prolabore">
                                Pró-labore: Retirada dos sócios
                              </SelectItem>
                              <SelectItem value="pessoal">
                                Pessoal: Salários, encargos (FGTS/INSS) e benefícios
                              </SelectItem>
                              <SelectItem value="infraestrutura">
                                Infraestrutura: Aluguel, IPTU e manutenção
                              </SelectItem>
                              <SelectItem value="operacional_administrativo">
                                Operacional e Admin.: Material de mercado, papelaria, informática,
                                lanche, escritório
                              </SelectItem>
                              <SelectItem value="softwares_assinaturas">
                                Softwares e Assinaturas: Mensalidades, relógio ponto, Sotech
                              </SelectItem>
                              <SelectItem value="utilidades">
                                Utilidades: Energia, água e internet/telefone
                              </SelectItem>
                              <SelectItem value="servicos_profissionais">
                                Serviços Prof. e Conformidade: Contabilidade, resíduos, qualidade,
                                conselho, segurança laboral
                              </SelectItem>
                              <SelectItem value="seguros">
                                Seguros: Seguro predial, pessoal, laboral e civil
                              </SelectItem>
                              <SelectItem value="financeiro">
                                Financeiro: Taxas bancárias e tarifas
                              </SelectItem>
                              <SelectItem value="marketing">
                                Marketing e Social: Divulgação, redes sociais, patrocínio e doação
                              </SelectItem>
                              <SelectItem value="juros_multas">
                                Financeiro: Juros, Multas e Encargos
                              </SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </>
                          )}
                          {categoryId === 'VARIAVEL' && (
                            <>
                              <SelectItem value="materia_prima">
                                Matéria-prima: Insumos e ativos
                              </SelectItem>
                              <SelectItem value="embalagens">
                                Embalagens: Frascos, potes, rótulos e caixas
                              </SelectItem>
                              <SelectItem value="medicamentos_drogaria">
                                Medicamentos Drogaria: Produtos para revenda
                              </SelectItem>
                              <SelectItem value="impostos">
                                Impostos: Simples Nacional, ICMS e tributos
                              </SelectItem>
                              <SelectItem value="taxas_cartao">
                                Taxas de Cartão: Comissões e antecipações
                              </SelectItem>
                              <SelectItem value="logistica">
                                Logística: Fretes e entregas
                              </SelectItem>
                              <SelectItem value="fidelidade_promocao">
                                Fidelidade e Promoção: Programa de fidelidade
                              </SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-2">
                <FormLabel className="flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5" /> Observações (Opcional)
                </FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Adicionar observação..."
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
                    <p className="text-[10px] text-slate-500 mb-1.5">Observações Sugeridas:</p>
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
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria da Receita</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RECEITA_OPERACIONAL">
                          Vendas/Serviços (Operacional)
                        </SelectItem>
                        <SelectItem value="RECEITA_NAO_OPERACIONAL">
                          Dividendos e Lucros (Não Operacional)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meio de Pagamento / Origem</FormLabel>
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
