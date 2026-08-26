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
import { useDraft } from '@/hooks/use-draft'
import { useEffect, useState, useMemo, forwardRef, useRef } from 'react'
import { Transaction } from '@/types/finance'
import { Tag as TagIcon, Lightbulb } from 'lucide-react'

const formSchema = z
  .object({
    date: z
      .string()
      .min(1, 'A data é obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),
    description: z.string().optional(),
    amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
    type: z.enum(['INCOME', 'EXPENSE', 'CORTESIA', 'PARTNER_WITHDRAWAL', 'INVESTIMENTO']),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
    paymentMethodId: z.string().optional(),
    accountId: z.string().optional(),
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
    if (
      data.type === 'CORTESIA' ||
      data.type === 'PARTNER_WITHDRAWAL' ||
      data.type === 'INVESTIMENTO'
    ) {
      if (!data.description || data.description.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            data.type === 'INVESTIMENTO'
              ? 'Descrição é obrigatória'
              : 'Destinatário/Motivo é obrigatório',
          path: ['description'],
        })
      }
    }
  })

interface TransactionFormProps {
  onSuccess: () => void
  initialData?: Transaction | null
  prefillDate?: string
}

const CurrencyFieldInput = forwardRef<HTMLInputElement, any>(
  ({ field, className, placeholder, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(() => {
      if (field.value !== undefined && field.value !== '') {
        return Number(field.value).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      }
      return ''
    })
    const isFocused = useRef(false)

    useEffect(() => {
      if (!isFocused.current) {
        if (field.value !== undefined && field.value !== '') {
          setLocalValue(
            Number(field.value).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          )
        } else {
          setLocalValue('')
        }
      }
    }, [field.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '')
      if (!val) {
        setLocalValue('')
        field.onChange(undefined)
        return
      }
      const num = parseInt(val, 10) / 100
      const formatted = num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      setLocalValue(formatted)
      field.onChange(num)
    }

    const handleBlur = () => {
      isFocused.current = false
      if (field.onBlur) field.onBlur()
    }

    const handleFocus = () => {
      isFocused.current = true
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={className}
        placeholder={placeholder}
      />
    )
  },
)

export function TransactionForm({ onSuccess, initialData, prefillDate }: TransactionFormProps) {
  const { transactions, addTransaction, updateTransaction } = useFinanceStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const defaultEmptyValues = useMemo(
    () => ({
      date: prefillDate || new Date().toISOString().split('T')[0],
      description: '',
      amount: '' as unknown as number,
      type: 'EXPENSE' as const,
      status: 'REALIZADO' as const,
      categoryId: '',
      subcategoryId: '',
      paymentMethodId: '',
      accountId: 'conta_principal',
      tags: '',
    }),
    [],
  )

  const { draft, saveDraft, clearDraft } = useDraft<any>(
    'transaction-form-draft',
    defaultEmptyValues,
  )

  const defaultValues = initialData
    ? {
        date: initialData.date.includes('T')
          ? initialData.date.split('T')[0]
          : initialData.date.substring(0, 10),
        description: initialData.description?.toUpperCase(),
        amount: initialData.amount,
        type: initialData.type,
        status: initialData.status,
        categoryId:
          initialData.categoryId || (initialData.type === 'INCOME' ? 'RECEITA_OPERACIONAL' : ''),
        subcategoryId: initialData.subcategoryId || '',
        paymentMethodId: initialData.paymentMethodId || '',
        accountId: initialData.accountId || 'conta_principal',
        tags: initialData.tags ? initialData.tags.toUpperCase() : '',
      }
    : {
        ...draft,
        tags: draft?.tags ? draft.tags.toUpperCase() : '',
        date: prefillDate || draft.date || new Date().toISOString().split('T')[0],
      }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (!initialData) {
        saveDraft(value)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, initialData, saveDraft])

  const type = form.watch('type')
  const categoryId = form.watch('categoryId')
  const [prevType, setPrevType] = useState(initialData?.type || form.getValues('type'))
  const [prevCategoryId, setPrevCategoryId] = useState(
    initialData?.categoryId || form.getValues('categoryId'),
  )

  useEffect(() => {
    if (type !== prevType) {
      if (type === 'INCOME') {
        form.setValue('categoryId', 'RECEITA_OPERACIONAL')
        form.setValue('subcategoryId', '')
        if (form.getValues('status') === 'VENCIDO') {
          form.setValue('status', 'REALIZADO')
        }
      } else if (type === 'CORTESIA' || type === 'PARTNER_WITHDRAWAL' || type === 'INVESTIMENTO') {
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      let finalDescription = values.description?.trim().toUpperCase() || ''

      if (values.type === 'INCOME') {
        const allMethods = PAYMENT_METHODS
        const pmName = allMethods.find((p) => p.id === values.paymentMethodId)?.name || ''
        const newAutoDesc = pmName ? `RECEITA - ${pmName.toUpperCase()}` : 'RECEITA'

        if (initialData?.id && initialData.type === 'INCOME') {
          const descUpper = initialData.description.toUpperCase()
          const wasAutoGenerated =
            allMethods.some((pm) => descUpper === `RECEITA - ${pm.name.toUpperCase()}`) ||
            descUpper === 'RECEITA'
          if (wasAutoGenerated) {
            finalDescription = newAutoDesc
          } else {
            finalDescription = descUpper
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
        accountId: values.accountId || 'conta_principal',
        paymentMethodId: values.type === 'INCOME' ? values.paymentMethodId || '' : '',
        tags: values.tags?.trim().toUpperCase() || '',
      }

      if (initialData) {
        await updateTransaction(initialData.id, payload as any)
        toast({ title: 'Sucesso', description: 'Transação atualizada com sucesso!' })
        form.reset()
      } else {
        await addTransaction(payload as any)
        toast({ title: 'Sucesso', description: 'Transação salva com sucesso!' })
        clearDraft()
        form.reset({
          ...defaultEmptyValues,
          date: prefillDate || new Date().toISOString().split('T')[0],
        })
      }
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
                <FormLabel>
                  Tipo <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger autoFocus className="h-12 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="PARTNER_WITHDRAWAL">Retirada de sócios</SelectItem>
                    <SelectItem value="CORTESIA">Cortesias</SelectItem>
                    <SelectItem value="INVESTIMENTO">Investimentos</SelectItem>
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
                <FormLabel>
                  Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="REALIZADO">Realizado</SelectItem>
                    <SelectItem value="PREVISTO">Previsto</SelectItem>
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
              <FormLabel>
                Data <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  required
                  {...field}
                  className="h-12 sm:h-10 text-base sm:text-sm block w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(type === 'EXPENSE' ||
          type === 'CORTESIA' ||
          type === 'PARTNER_WITHDRAWAL' ||
          type === 'INVESTIMENTO') && (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                <FormLabel>
                  {type === 'CORTESIA' || type === 'PARTNER_WITHDRAWAL'
                    ? 'Destinatário/Motivo'
                    : 'Descrição'}{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      type === 'CORTESIA' || type === 'PARTNER_WITHDRAWAL'
                        ? 'EX: DR. JOÃO SILVA / AMOSTRA OU JOÃO (SÓCIO)'
                        : type === 'INVESTIMENTO'
                          ? 'EX: COMPRA DE EQUIPAMENTO / REFORMA'
                          : 'EX: CONTA DE LUZ / COMPRA DE INSUMO'
                    }
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    className="h-12 sm:h-10 text-base sm:text-sm"
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
              <FormLabel>
                Valor (R$) <span className="text-red-500">*</span>
              </FormLabel>
              {type === 'CORTESIA' && (
                <p className="text-[11px] text-slate-500 font-medium mb-1.5 -mt-1 leading-tight">
                  * Preencher com o valor do custo da matéria prima + embalagem da fórmula.
                </p>
              )}
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 sm:top-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    R$
                  </span>
                  <CurrencyFieldInput
                    field={field}
                    required
                    className="pl-9 h-12 sm:h-10 text-base sm:text-sm"
                    placeholder="0,00"
                  />
                </div>
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
                    <FormLabel>
                      Categoria <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXA">Fixa</SelectItem>
                        <SelectItem value="VARIAVEL">Variável</SelectItem>
                        <SelectItem value="INVESTIMENTO">Equipamentos e Investimentos</SelectItem>
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
                      <FormLabel>
                        Subcategoria <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
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
                              <SelectItem value="manutencao_equipamentos">
                                Manutenção de Equipamentos
                              </SelectItem>
                              <SelectItem value="educacao_treinamentos">
                                Educação e Treinamentos (Cursos/Congressos)
                              </SelectItem>
                              <SelectItem value="limpeza_conservacao">
                                Limpeza e Conservação: Produtos de limpeza, serviço terceirizado
                              </SelectItem>
                              <SelectItem value="brindes_presentes">
                                Brindes e Presentes: Brindes para clientes, presentes de fim de ano
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
                              <SelectItem value="marketing_variavel">
                                Marketing Variável: Campanhas sazonais (Dia das Mães, Black Friday,
                                etc.)
                              </SelectItem>
                              <SelectItem value="comissoes">
                                Comissões: Comissões sobre vendas
                              </SelectItem>
                              <SelectItem value="materiais_consumo">
                                Materiais de Consumo: Luvas, máscaras e descartáveis que variam com
                                atendimentos
                              </SelectItem>
                              <SelectItem value="devolucoes_perdas">
                                Devoluções e Perdas: Perdas por vencimento, quebras, devoluções
                              </SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </>
                          )}
                          {categoryId === 'INVESTIMENTO' && (
                            <>
                              <SelectItem value="equipamentos">Equipamentos e Máquinas</SelectItem>
                              <SelectItem value="obras_reformas">Obras e Reformas</SelectItem>
                              <SelectItem value="mobiliario">Mobiliário e Instalações</SelectItem>
                              <SelectItem value="tecnologia">
                                Tecnologia (Computadores, etc)
                              </SelectItem>
                              <SelectItem value="outros_investimentos">
                                Outros Investimentos
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {type === 'INCOME' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Categoria da Receita <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
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
                    <FormLabel>
                      Meio de Pagamento / Origem <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
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
                    <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1.5 leading-tight">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                      Registre apenas os valores que entraram efetivamente no caixa no dia.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5" /> Observações (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Adicionar observação..."
                      className="h-12 sm:h-10 text-base sm:text-sm"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-tight">
                    Ex. Número da nota fiscal, Número do boleto, Referente a [Mês]
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-6 h-12 sm:h-10 text-base sm:text-sm font-semibold"
          disabled={loading}
        >
          {loading ? 'Salvando...' : initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
        </Button>
      </form>
    </Form>
  )
}
