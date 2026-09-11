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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useFinanceStore, PAYMENT_METHODS } from '@/stores/financeStore'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useDraft } from '@/hooks/use-draft'
import { useEffect, useState, useMemo, forwardRef, useRef, useCallback } from 'react'
import { Transaction } from '@/types/finance'
import {
  Tag as TagIcon,
  Lightbulb,
  PlusCircle,
  Loader2,
  Search,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useExpenseAutoCategorize, normalizeDescription } from '@/hooks/use-expense-auto-categorize'

// Opções de Categorias e Subcategorias com ordenação alfabética e labels em MAIÚSCULAS
const EXPENSE_CATEGORIES = [
  { value: 'INVESTIMENTO', label: 'EQUIPAMENTOS E INVESTIMENTOS' },
  { value: 'FIXA', label: 'FIXA' },
  { value: 'VARIAVEL', label: 'VARIÁVEL' },
].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))

const INCOME_CATEGORIES = [
  { value: 'RECEITA_OPERACIONAL', label: 'VENDAS/SERVIÇOS (OPERACIONAL)' },
  { value: 'RECEITA_NAO_OPERACIONAL', label: 'DIVIDENDOS E LUCROS (NÃO OPERACIONAL)' },
]

const FIXED_SUBCATEGORIES = [
  {
    value: 'brindes_presentes',
    label: 'BRINDES E PRESENTES: BRINDES PARA CLIENTES, PRESENTES DE FIM DE ANO',
  },
  { value: 'educacao_treinamentos', label: 'EDUCAÇÃO E TREINAMENTOS (CURSOS/CONGRESSOS)' },
  { value: 'financeiro', label: 'FINANCEIRO: TAXAS BANCÁRIAS E TARIFAS' },
  { value: 'juros_multas', label: 'FINANCEIRO: JUROS, MULTAS E ENCARGOS' },
  { value: 'infraestrutura', label: 'INFRAESTRUTURA: ALUGUEL, IPTU E MANUTENÇÃO' },
  {
    value: 'limpeza_conservacao',
    label: 'LIMPEZA E CONSERVAÇÃO: PRODUTOS DE LIMPEZA, SERVIÇO TERCEIRIZADO',
  },
  { value: 'manutencao_equipamentos', label: 'MANUTENÇÃO DE EQUIPAMENTOS' },
  {
    value: 'marketing',
    label: 'MARKETING E SOCIAL: DIVULGAÇÃO, REDES SOCIAIS, PATROCÍNIO E DOAÇÃO',
  },
  {
    value: 'operacional_administrativo',
    label: 'OPERACIONAL E ADMIN.: MATERIAL DE MERCADO, PAPELARIA, INFORMÁTICA, LANCHE, ESCRITÓRIO',
  },
  { value: 'outros', label: 'OUTROS' },
  { value: 'pessoal', label: 'PESSOAL: SALÁRIOS, ENCARGOS (FGTS/INSS) E BENEFÍCIOS' },
  { value: 'prolabore', label: 'PRÓ-LABORE: RETIRADA DOS SÓCIOS' },
  { value: 'seguros', label: 'SEGUROS: SEGURO PREDIAL, PESSOAL, LABORAL E CIVIL' },
  {
    value: 'servicos_profissionais',
    label:
      'SERVIÇOS PROF. E CONFORMIDADE: CONTABILIDADE, RESÍDUOS, QUALIDADE, CONSELHO, SEGURANÇA LABORAL',
  },
  {
    value: 'softwares_assinaturas',
    label: 'SOFTWARES E ASSINATURAS: MENSALIDADES, RELÓGIO PONTO, SOTECH',
  },
  { value: 'utilidades', label: 'UTILIDADES: ENERGIA, ÁGUA E INTERNET/TELEFONE' },
].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))

const VARIABLE_SUBCATEGORIES = [
  { value: 'comissoes', label: 'COMISSÕES: COMISSÕES SOBRE VENDAS' },
  {
    value: 'devolucoes_perdas',
    label: 'DEVOLUÇÕES E PERDAS: PERDAS POR VENCIMENTO, QUEBRAS, DEVOLUÇÕES',
  },
  { value: 'embalagens', label: 'EMBALAGENS: FRASCOS, POTES, RÓTULOS E CAIXAS' },
  { value: 'fidelidade_promocao', label: 'FIDELIDADE E PROMOÇÃO: PROGRAMA DE FIDELIDADE' },
  { value: 'impostos', label: 'IMPOSTOS: SIMPLES NACIONAL, ICMS E TRIBUTOS' },
  { value: 'logistica', label: 'LOGÍSTICA: FRETES E ENTREGAS' },
  {
    value: 'marketing_variavel',
    label: 'MARKETING VARIÁVEL: CAMPANHAS SAZONAIS (DIA DAS MÃES, BLACK FRIDAY, ETC.)',
  },
  {
    value: 'materiais_consumo',
    label: 'MATERIAIS DE CONSUMO: LUVAS, MÁSCARAS E DESCARTÁVEIS QUE VARIAM COM ATENDIMENTOS',
  },
  { value: 'materia_prima', label: 'MATÉRIA-PRIMA: INSUMOS E ATIVOS' },
  { value: 'medicamentos_drogaria', label: 'MEDICAMENTOS DROGARIA: PRODUTOS PARA REVENDA' },
  { value: 'outros', label: 'OUTROS' },
  { value: 'taxas_cartao', label: 'TAXAS DE CARTÃO: COMISSÕES E ANTECIPAÇÕES' },
].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))

const INVESTMENT_SUBCATEGORIES = [
  { value: 'equipamentos', label: 'EQUIPAMENTOS E MÁQUINAS' },
  { value: 'mobiliario', label: 'MOBILIÁRIO E INSTALAÇÕES' },
  { value: 'obras_reformas', label: 'OBRAS E REFORMAS' },
  { value: 'outros_investimentos', label: 'OUTROS INVESTIMENTOS' },
  { value: 'tecnologia', label: 'TECNOLOGIA (COMPUTADORES, ETC)' },
].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))

const SORTED_PAYMENT_METHODS = [...PAYMENT_METHODS]
  .map((pm) => ({
    id: pm.id,
    name: pm.name.toUpperCase(),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

const formSchema = z
  .object({
    date: z
      .string()
      .min(1, 'A data é obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),
    description: z.string().optional(),
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
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
  prefillDescription?: string
  prefillAmount?: number
  prefillCategoryId?: string
  prefillSubcategoryId?: string
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

export function TransactionForm({
  onSuccess,
  initialData,
  prefillDate,
  prefillDescription,
  prefillAmount,
  prefillCategoryId,
  prefillSubcategoryId,
}: TransactionFormProps) {
  const { transactions, addTransaction, updateTransaction } = useFinanceStore()
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Custom categories and payment methods state
  const [customCategories, setCustomCategories] = useState<
    { id: string; name: string; type: string }[]
  >([])
  const [customPaymentMethods, setCustomPaymentMethods] = useState<{ id: string; name: string }[]>(
    [],
  )
  const [loadingCustomData, setLoadingCustomData] = useState(false)

  // Dialog state for adding new subcategory / payment method
  const [newSubcategoryDialogOpen, setNewSubcategoryDialogOpen] = useState(false)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [savingSubcategory, setSavingSubcategory] = useState(false)

  const [newPaymentMethodDialogOpen, setNewPaymentMethodDialogOpen] = useState(false)
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('')
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false)

  // Search query states for subcategory and payment method dropdowns
  const [subcategorySearch, setSubcategorySearch] = useState('')
  const [paymentMethodSearch, setPaymentMethodSearch] = useState('')

  const projectId = profile?.app_name || user?.id

  // Fetch custom categories and payment methods from DB
  const loadCustomOptions = useCallback(async () => {
    if (!user) {
      setCustomCategories([])
      setCustomPaymentMethods([])
      return
    }
    setLoadingCustomData(true)
    try {
      let catQuery = supabase.from('user_categories').select('id, name, type')
      let pmQuery = supabase.from('user_payment_methods').select('id, name')

      if (projectId) {
        catQuery = catQuery.eq('project_id', projectId)
        pmQuery = pmQuery.eq('project_id', projectId)
      } else {
        catQuery = catQuery.eq('user_id', user.id)
        pmQuery = pmQuery.eq('user_id', user.id)
      }

      const [catRes, pmRes] = await Promise.all([catQuery, pmQuery])

      if (!catRes.error && catRes.data) {
        setCustomCategories(
          catRes.data.map((c) => ({
            id: c.id,
            name: (c.name || '').toUpperCase(),
            type: c.type || 'fixed',
          })),
        )
      }

      if (!pmRes.error && pmRes.data) {
        setCustomPaymentMethods(
          pmRes.data.map((p) => ({
            id: p.id,
            name: (p.name || '').toUpperCase(),
          })),
        )
      }
    } catch (err) {
      console.error('Erro ao carregar categorias/meios customizados:', err)
      // Fallback: keeps standard lists
    } finally {
      setLoadingCustomData(false)
    }
  }, [user, projectId])

  useEffect(() => {
    loadCustomOptions()
  }, [loadCustomOptions])

  const defaultEmptyValues = useMemo(
    () => ({
      date: prefillDate || new Date().toISOString().split('T')[0],
      description: prefillDescription ? prefillDescription.toUpperCase() : '',
      amount: (prefillAmount !== undefined ? prefillAmount : '') as unknown as number,
      type: 'EXPENSE' as const,
      status: 'REALIZADO' as const,
      categoryId: prefillCategoryId || '',
      subcategoryId: prefillSubcategoryId || '',
      paymentMethodId: '',
      accountId: 'conta_principal',
      tags: '',
    }),
    [prefillDate, prefillDescription, prefillAmount, prefillCategoryId, prefillSubcategoryId],
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
    : prefillDescription
      ? defaultEmptyValues
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
  const description = form.watch('description')
  const subcategoryId = form.watch('subcategoryId')
  const amount = form.watch('amount')
  const [prevType, setPrevType] = useState(initialData?.type || form.getValues('type'))
  const [prevCategoryId, setPrevCategoryId] = useState<string>(
    initialData?.categoryId || form.getValues('categoryId') || '',
  )

  // Auto-categorização inteligente de despesas
  const autoSuggestion = useExpenseAutoCategorize(transactions, description, type, initialData?.id)

  // Histórico de descrições únicas de despesas com categoria e subcategoria mais frequentes (para autocomplete inteligente)
  const expenseDescriptionsMap = useMemo(() => {
    if (type !== 'EXPENSE') return new Map<string, { categoryId: string; subcategoryId: string }>()
    // Mapa: descNormalizada -> { rawDesc, count, categoryId, subcategoryId }
    const stats = new Map<
      string,
      {
        rawDesc: string
        pairs: Map<
          string,
          { categoryId: string; subcategoryId: string; count: number; latestDate: number }
        >
      }
    >()

    for (const tx of transactions) {
      if (tx.type !== 'EXPENSE' || !tx.description || tx.description.trim().length < 2) continue
      const norm = normalizeDescription(tx.description)
      if (!norm) continue

      let entry = stats.get(norm)
      if (!entry) {
        entry = { rawDesc: tx.description.trim().toUpperCase(), pairs: new Map() }
        stats.set(norm, entry)
      }

      if (tx.categoryId && tx.subcategoryId) {
        const pairKey = `${tx.categoryId}:::${tx.subcategoryId}`
        const dateTs = new Date(tx.date).getTime()
        const p = entry.pairs.get(pairKey)
        if (p) {
          p.count += 1
          if (dateTs > p.latestDate) p.latestDate = dateTs
        } else {
          entry.pairs.set(pairKey, {
            categoryId: tx.categoryId,
            subcategoryId: tx.subcategoryId,
            count: 1,
            latestDate: dateTs,
          })
        }
      }
    }

    const result = new Map<string, { categoryId: string; subcategoryId: string }>()
    for (const [norm, data] of stats.entries()) {
      let bestPair: {
        categoryId: string
        subcategoryId: string
        count: number
        latestDate: number
      } | null = null
      for (const pair of data.pairs.values()) {
        if (!bestPair) {
          bestPair = pair
        } else if (pair.count > bestPair.count) {
          bestPair = pair
        } else if (pair.count === bestPair.count && pair.latestDate > bestPair.latestDate) {
          bestPair = pair
        }
      }
      if (bestPair) {
        result.set(data.rawDesc, {
          categoryId: bestPair.categoryId,
          subcategoryId: bestPair.subcategoryId,
        })
      }
    }
    return result
  }, [transactions, type])

  // Histórico de descrições únicas de despesas para sugestão rápida (autocomplete)
  const expenseDescriptionsHistory = useMemo(() => {
    if (type !== 'EXPENSE') return []
    const set = new Set<string>()
    for (const tx of transactions) {
      if (tx.type === 'EXPENSE' && tx.description && tx.description.trim().length >= 2) {
        set.add(tx.description.trim().toUpperCase())
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [transactions, type])

  // Função disparada ao alterar a descrição (pela digitação ou ao selecionar sugestão do histórico)
  const handleDescriptionChange = (newVal: string) => {
    const upperVal = newVal.toUpperCase()
    form.setValue('description', upperVal, { shouldValidate: true })

    // Se for despesa e o valor digitado/selecionado corresponder exatamente a um item com categoria/subcategoria do histórico
    if (type === 'EXPENSE' && upperVal.trim().length >= 2) {
      const known = expenseDescriptionsMap.get(upperVal.trim())
      if (known) {
        form.setValue('categoryId', known.categoryId, { shouldValidate: true })
        form.setValue('subcategoryId', known.subcategoryId, { shouldValidate: true })
        setAppliedSuggestionDesc(normalizeDescription(upperVal))
        setIsSuggestionApplied(true)
      }
    }
  }

  // Detecção de despesa fora do padrão:
  // - Aplica SOMENTE a despesas FIXAS e recorrentes
  // - Valor ≥ 50% acima da média histórica
  // - Mínimo de 2 lançamentos anteriores com a mesma descrição
  const expenseOutlierAlert = useMemo(() => {
    if (type !== 'EXPENSE') return null
    if (categoryId !== 'FIXA') return null
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) return null

    const normDesc = normalizeDescription(description)
    if (!normDesc || normDesc.length < 2) return null

    // Busca todas as despesas anteriores com a mesma descrição (excluindo a atual em caso de edição)
    const matching = transactions.filter((tx) => {
      if (initialData?.id && tx.id === initialData.id) return false
      if (tx.type !== 'EXPENSE') return false
      return normalizeDescription(tx.description) === normDesc
    })

    if (matching.length < 2) return null

    const totalAmount = matching.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0)
    const avgAmount = totalAmount / matching.length

    if (avgAmount <= 0) return null

    // Limiar: valor atual ≥ 1.5x a média (50% acima)
    const percentAbove = ((numAmount - avgAmount) / avgAmount) * 100

    if (percentAbove >= 50) {
      return {
        avgAmount,
        percentAbove: Math.round(percentAbove),
        count: matching.length,
      }
    }

    return null
  }, [type, categoryId, amount, description, transactions, initialData?.id])

  // Guarda qual descrição acionou a auto-sugestão mais recente aplicada
  const [appliedSuggestionDesc, setAppliedSuggestionDesc] = useState<string | null>(null)
  // Flag que indica se a sugestão aplicada ainda está ativa (não sobrescrita pelo usuário para algo diferente)
  const [isSuggestionApplied, setIsSuggestionApplied] = useState(false)

  // Efeito para sugerir e pré-preencher automaticamente quando houver 2+ lançamentos prévios (a partir do 3º)
  useEffect(() => {
    if (type !== 'EXPENSE') {
      setIsSuggestionApplied(false)
      setAppliedSuggestionDesc(null)
      return
    }

    if (autoSuggestion) {
      const currentNormDesc = normalizeDescription(description)
      const currentCat = form.getValues('categoryId')
      const currentSub = form.getValues('subcategoryId')

      // Em modo de edição de transação já salva, se a categoria já está definida e o usuário ainda não mudou a descrição,
      // preservamos o valor existente
      if (initialData && appliedSuggestionDesc === null) {
        setAppliedSuggestionDesc(currentNormDesc)
        if (
          currentCat === autoSuggestion.categoryId &&
          currentSub === autoSuggestion.subcategoryId
        ) {
          setIsSuggestionApplied(true)
        }
        return
      }

      if (appliedSuggestionDesc !== currentNormDesc) {
        // Se mudou a descrição para uma repetida com 2+ ocorrências prévias (3º+ lançamento),
        // pré-preenche automaticamente com a categoria e subcategoria mais usadas
        form.setValue('categoryId', autoSuggestion.categoryId, { shouldValidate: true })
        form.setValue('subcategoryId', autoSuggestion.subcategoryId, { shouldValidate: true })
        setAppliedSuggestionDesc(currentNormDesc)
        setIsSuggestionApplied(true)
      } else {
        // Mantém status de sugestão ativa se os valores atuais conferem com a sugestão
        if (
          currentCat === autoSuggestion.categoryId &&
          currentSub === autoSuggestion.subcategoryId
        ) {
          setIsSuggestionApplied(true)
        }
      }
    } else {
      setIsSuggestionApplied(false)
      setAppliedSuggestionDesc(null)
    }
  }, [autoSuggestion, description, type, form, appliedSuggestionDesc, initialData])

  // Desativa indicador de sugestão quando usuário manualmente alterar categoria ou subcategoria para algo diferente
  useEffect(() => {
    if (autoSuggestion && isSuggestionApplied) {
      if (
        categoryId !== autoSuggestion.categoryId ||
        subcategoryId !== autoSuggestion.subcategoryId
      ) {
        setIsSuggestionApplied(false)
      }
    }
  }, [categoryId, subcategoryId, autoSuggestion, isSuggestionApplied])

  // Merged subcategory options based on active category
  const activeSubcategories = useMemo(() => {
    let list: { value: string; label: string }[] = []
    if (categoryId === 'FIXA') {
      const customFixed = customCategories
        .filter((c) => c.type === 'fixed')
        .map((c) => ({ value: c.name, label: c.name }))
      list = [...FIXED_SUBCATEGORIES, ...customFixed].sort((a, b) =>
        a.label.localeCompare(b.label, 'pt-BR'),
      )
    } else if (categoryId === 'VARIAVEL') {
      const customVariable = customCategories
        .filter((c) => c.type === 'variable')
        .map((c) => ({ value: c.name, label: c.name }))
      list = [...VARIABLE_SUBCATEGORIES, ...customVariable].sort((a, b) =>
        a.label.localeCompare(b.label, 'pt-BR'),
      )
    } else if (categoryId === 'INVESTIMENTO') {
      list = [...INVESTMENT_SUBCATEGORIES].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
    }
    return list
  }, [categoryId, customCategories])

  const filteredSubcategories = useMemo(() => {
    if (!subcategorySearch.trim()) return activeSubcategories
    const term = subcategorySearch.toLowerCase().trim()
    return activeSubcategories.filter((sub) => sub.label.toLowerCase().includes(term))
  }, [activeSubcategories, subcategorySearch])

  // Merged payment methods list
  const activePaymentMethods = useMemo(() => {
    const customList = customPaymentMethods.map((p) => ({
      id: p.name,
      name: p.name,
    }))
    return [...SORTED_PAYMENT_METHODS, ...customList].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    )
  }, [customPaymentMethods])

  const filteredPaymentMethods = useMemo(() => {
    if (!paymentMethodSearch.trim()) return activePaymentMethods
    const term = paymentMethodSearch.toLowerCase().trim()
    return activePaymentMethods.filter((pm) => pm.name.toLowerCase().includes(term))
  }, [activePaymentMethods, paymentMethodSearch])

  // Handler for adding a new subcategory
  const handleSaveSubcategory = async () => {
    const trimmed = newSubcategoryName.trim().toUpperCase()
    if (!trimmed) {
      toast({
        title: 'Atenção',
        description: 'Digite o nome da subcategoria.',
        variant: 'destructive',
      })
      return
    }
    if (!user) {
      // No modo demo, salva apenas em memória local
      setCustomCategories((prev) => [
        ...prev,
        {
          id: `demo_cat_${Date.now()}`,
          name: trimmed,
          type: categoryId === 'VARIAVEL' ? 'variable' : 'fixed',
        },
      ])
      toast({ title: 'Sucesso', description: 'Subcategoria adicionada no modo demonstração!' })
      form.setValue('subcategoryId', trimmed)
      setNewSubcategoryDialogOpen(false)
      setNewSubcategoryName('')
      return
    }

    setSavingSubcategory(true)
    try {
      const subType = categoryId === 'VARIAVEL' ? 'variable' : 'fixed'
      const { data, error } = await supabase
        .from('user_categories')
        .insert({
          user_id: user.id,
          project_id: projectId || null,
          name: trimmed,
          type: subType,
        })
        .select()
        .single()

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Subcategoria criada com sucesso!' })
      await loadCustomOptions()
      form.setValue('subcategoryId', trimmed)
      setNewSubcategoryDialogOpen(false)
      setNewSubcategoryName('')
    } catch (err: any) {
      console.error('Erro ao salvar subcategoria:', err)
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível salvar a subcategoria.',
        variant: 'destructive',
      })
    } finally {
      setSavingSubcategory(false)
    }
  }

  // Handler for adding a new payment method
  const handleSavePaymentMethod = async () => {
    const trimmed = newPaymentMethodName.trim().toUpperCase()
    if (!trimmed) {
      toast({
        title: 'Atenção',
        description: 'Digite o nome do meio de pagamento.',
        variant: 'destructive',
      })
      return
    }
    if (!user) {
      // No modo demo, salva apenas em memória local
      setCustomPaymentMethods((prev) => [...prev, { id: `demo_pm_${Date.now()}`, name: trimmed }])
      toast({ title: 'Sucesso', description: 'Meio de pagamento adicionado no modo demonstração!' })
      form.setValue('paymentMethodId', trimmed)
      setNewPaymentMethodDialogOpen(false)
      setNewPaymentMethodName('')
      return
    }

    setSavingPaymentMethod(true)
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user.id,
          project_id: projectId || null,
          name: trimmed,
        })
        .select()
        .single()

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Meio de pagamento criado com sucesso!' })
      await loadCustomOptions()
      form.setValue('paymentMethodId', trimmed)
      setNewPaymentMethodDialogOpen(false)
      setNewPaymentMethodName('')
    } catch (err: any) {
      console.error('Erro ao salvar meio de pagamento:', err)
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível salvar o meio de pagamento.',
        variant: 'destructive',
      })
    } finally {
      setSavingPaymentMethod(false)
    }
  }

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
      // Se a alteração de categoria veio de uma sugestão automática ou já tem uma subcategoria válida,
      // não limpamos a subcategoria caso ela pertença à sugestão ativa
      if (!autoSuggestion || !isSuggestionApplied || categoryId !== autoSuggestion.categoryId) {
        form.setValue('subcategoryId', '')
      }
      setSubcategorySearch('')
      setPrevCategoryId(categoryId || '')
    }
  }, [categoryId, form, prevCategoryId, autoSuggestion, isSuggestionApplied])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      let finalDescription = values.description?.trim().toUpperCase() || ''

      if (values.type === 'INCOME') {
        const selectedPm = activePaymentMethods.find((p) => p.id === values.paymentMethodId)
        const pmName = selectedPm ? selectedPm.name : values.paymentMethodId || ''
        const newAutoDesc = pmName ? `RECEITA - ${pmName.toUpperCase()}` : 'RECEITA'

        if (initialData?.id && initialData.type === 'INCOME') {
          const descUpper = initialData.description.toUpperCase()
          const wasAutoGenerated =
            activePaymentMethods.some((pm) => descUpper === `RECEITA - ${pm.name.toUpperCase()}`) ||
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
                  <>
                    <Input
                      list={type === 'EXPENSE' ? 'expense-descriptions-list' : undefined}
                      placeholder={
                        type === 'CORTESIA' || type === 'PARTNER_WITHDRAWAL'
                          ? 'EX: DR. JOÃO SILVA / AMOSTRA OU JOÃO (SÓCIO)'
                          : type === 'INVESTIMENTO'
                            ? 'EX: COMPRA DE EQUIPAMENTO / REFORMA'
                            : 'EX: CONTA DE LUZ / COMPRA DE INSUMO'
                      }
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        if (type === 'EXPENSE') {
                          handleDescriptionChange(e.target.value)
                        } else {
                          field.onChange(e.target.value.toUpperCase())
                        }
                      }}
                      className="h-12 sm:h-10 text-base sm:text-sm"
                    />
                    {type === 'EXPENSE' && expenseDescriptionsHistory.length > 0 && (
                      <datalist id="expense-descriptions-list">
                        {expenseDescriptionsHistory.map((item) => (
                          <option key={item} value={item} />
                        ))}
                      </datalist>
                    )}
                  </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 gap-4 transition-all duration-300 min-h-[80px]">
          {type === 'EXPENSE' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              {/* Detecção de Despesa Fora do Padrão (Fixa / Recorrente com valor ≥ 50% da média histórica) */}
              {expenseOutlierAlert && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-lg p-3 text-amber-900 dark:text-amber-100 text-xs animate-in fade-in slide-in-from-top-1 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold tracking-wide uppercase text-amber-950 dark:text-amber-200">
                          DESPESA FORA DO PADRÃO
                        </span>
                        <Badge
                          variant="outline"
                          className="border-amber-400 bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-bold tracking-wider uppercase px-1.5 py-0"
                        >
                          +{expenseOutlierAlert.percentAbove}% ACIMA DA MÉDIA
                        </Badge>
                      </div>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                        Essa despesa está{' '}
                        <strong>
                          {expenseOutlierAlert.percentAbove}% acima da média histórica
                        </strong>{' '}
                        (R${' '}
                        {expenseOutlierAlert.avgAmount.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        com base em {expenseOutlierAlert.count} lançamentos anteriores). O
                        lançamento é permitido normalmente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notificação / Badge de Sugestão Automática Inteligente */}
              {autoSuggestion && isSuggestionApplied && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg p-3 text-emerald-900 dark:text-emerald-100 text-xs animate-in fade-in slide-in-from-top-1 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold tracking-wide uppercase text-emerald-950 dark:text-emerald-200">
                            SUGESTÃO AUTOMÁTICA
                          </span>
                          <Badge
                            variant="outline"
                            className="border-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold tracking-wider uppercase px-1.5 py-0"
                          >
                            {autoSuggestion.count}º+ LANÇAMENTO
                          </Badge>
                        </div>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                          CATEGORIA E SUBCATEGORIA PRÉ-PREENCHIDAS COM BASE NO HISTÓRICO MAIS
                          RECENTE. VOCÊ PODE ALTERAR SE DESEJAR.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsSuggestionApplied(false)
                          form.setValue('categoryId', '')
                          form.setValue('subcategoryId', '')
                        }}
                        className="h-7 px-2 text-[11px] text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 uppercase"
                      >
                        ALTERAR
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>
                        Categoria <span className="text-red-500">*</span>
                      </FormLabel>
                      {autoSuggestion &&
                        isSuggestionApplied &&
                        field.value === autoSuggestion.categoryId && (
                          <Badge
                            variant="outline"
                            className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            SUGESTÃO AUTOMÁTICA
                          </Badge>
                        )}
                    </div>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
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
                      <div className="flex items-center justify-between">
                        <FormLabel>
                          Subcategoria <span className="text-red-500">*</span>
                        </FormLabel>
                        {autoSuggestion &&
                          isSuggestionApplied &&
                          field.value === autoSuggestion.subcategoryId && (
                            <Badge
                              variant="outline"
                              className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              SUGESTÃO AUTOMÁTICA
                            </Badge>
                          )}
                      </div>
                      <Select
                        onValueChange={(val) => {
                          if (val === '__NEW_SUBCATEGORY__') {
                            setNewSubcategoryName('')
                            setNewSubcategoryDialogOpen(true)
                          } else {
                            field.onChange(val)
                          }
                        }}
                        onOpenChange={(open) => {
                          if (!open) {
                            setSubcategorySearch('')
                          }
                        }}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                            <SelectValue
                              placeholder={
                                loadingCustomData
                                  ? 'Carregando subcategorias...'
                                  : 'Selecione a classificação...'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[420px]">
                          <div
                            className="sticky top-0 z-10 bg-popover p-1 border-b mb-1"
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <div className="relative flex items-center">
                              <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                              <Input
                                placeholder="Buscar subcategoria..."
                                value={subcategorySearch}
                                onChange={(e) => setSubcategorySearch(e.target.value)}
                                className="h-8 pl-8 text-xs w-full bg-background focus-visible:ring-1"
                              />
                            </div>
                          </div>
                          {loadingCustomData && (
                            <div className="flex items-center justify-center p-2 text-xs text-muted-foreground gap-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando...
                            </div>
                          )}
                          {filteredSubcategories.map((sub) => (
                            <SelectItem key={sub.value} value={sub.value}>
                              {sub.label}
                            </SelectItem>
                          ))}
                          {filteredSubcategories.length === 0 && !loadingCustomData && (
                            <div className="py-3 text-center text-xs text-muted-foreground">
                              Nenhuma subcategoria encontrada
                            </div>
                          )}
                          {(categoryId === 'FIXA' || categoryId === 'VARIAVEL') && (
                            <SelectItem
                              value="__NEW_SUBCATEGORY__"
                              className="font-bold text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer border-t mt-1 pt-2"
                            >
                              <span className="flex items-center gap-1.5">
                                <PlusCircle className="w-4 h-4 text-emerald-600" />+ Nova
                                subcategoria
                              </span>
                            </SelectItem>
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
                        {INCOME_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
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
                    <Select
                      onValueChange={(val) => {
                        if (val === '__NEW_PAYMENT_METHOD__') {
                          setNewPaymentMethodName('')
                          setNewPaymentMethodDialogOpen(true)
                        } else {
                          field.onChange(val)
                        }
                      }}
                      onOpenChange={(open) => {
                        if (!open) {
                          setPaymentMethodSearch('')
                        }
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue
                            placeholder={
                              loadingCustomData
                                ? 'Carregando meios...'
                                : 'Selecione o meio de pagamento...'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[420px]">
                        <div
                          className="sticky top-0 z-10 bg-popover p-1 border-b mb-1"
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <div className="relative flex items-center">
                            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                              placeholder="Buscar meio / origem..."
                              value={paymentMethodSearch}
                              onChange={(e) => setPaymentMethodSearch(e.target.value)}
                              className="h-8 pl-8 text-xs w-full bg-background focus-visible:ring-1"
                            />
                          </div>
                        </div>
                        {loadingCustomData && (
                          <div className="flex items-center justify-center p-2 text-xs text-muted-foreground gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando...
                          </div>
                        )}
                        {filteredPaymentMethods.map((pm) => (
                          <SelectItem key={pm.id} value={pm.id}>
                            {pm.name}
                          </SelectItem>
                        ))}
                        {filteredPaymentMethods.length === 0 && !loadingCustomData && (
                          <div className="py-3 text-center text-xs text-muted-foreground">
                            Nenhum meio encontrado
                          </div>
                        )}
                        <SelectItem
                          value="__NEW_PAYMENT_METHOD__"
                          className="font-bold text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer border-t mt-1 pt-2"
                        >
                          <span className="flex items-center gap-1.5">
                            <PlusCircle className="w-4 h-4 text-emerald-600" />+ Novo meio
                          </span>
                        </SelectItem>
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

      {/* Dialog para Criar Nova Subcategoria */}
      <Dialog
        open={newSubcategoryDialogOpen}
        onOpenChange={(open) => {
          if (!savingSubcategory) setNewSubcategoryDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              + Nova Subcategoria ({categoryId === 'FIXA' ? 'Despesa Fixa' : 'Despesa Variável'})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Digite o nome da nova subcategoria. Ela será salva em maiúsculas e estará disponível
              para seus lançamentos.
            </p>
            <Input
              autoFocus
              placeholder="NOME DA SUBCATEGORIA"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSaveSubcategory()
                }
              }}
              disabled={savingSubcategory}
            />
          </div>
          <DialogFooter className="flex-row justify-end gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewSubcategoryDialogOpen(false)}
              disabled={savingSubcategory}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSaveSubcategory}
              disabled={savingSubcategory || !newSubcategoryName.trim()}
            >
              {savingSubcategory ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                'Salvar Subcategoria'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Criar Novo Meio de Pagamento */}
      <Dialog
        open={newPaymentMethodDialogOpen}
        onOpenChange={(open) => {
          if (!savingPaymentMethod) setNewPaymentMethodDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              + Novo Meio de Pagamento / Origem
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Digite o nome do novo meio de pagamento/origem de receita. Ele será salvo em
              maiúsculas.
            </p>
            <Input
              autoFocus
              placeholder="EX: IFOOD, CONVÊNIO, MERCADO PAGO"
              value={newPaymentMethodName}
              onChange={(e) => setNewPaymentMethodName(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSavePaymentMethod()
                }
              }}
              disabled={savingPaymentMethod}
            />
          </div>
          <DialogFooter className="flex-row justify-end gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewPaymentMethodDialogOpen(false)}
              disabled={savingPaymentMethod}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSavePaymentMethod}
              disabled={savingPaymentMethod || !newPaymentMethodName.trim()}
            >
              {savingPaymentMethod ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                'Salvar Meio'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
