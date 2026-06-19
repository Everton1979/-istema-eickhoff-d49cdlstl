import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const isValidCnpj = (val: string) => {
  const cnpj = val.replace(/\D/g, '')
  if (cnpj.length !== 14) return false

  if (/^(\d)\1+$/.test(cnpj)) return false

  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  const digits = cnpj.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  size = size + 1
  numbers = cnpj.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

const registerSchema = z
  .object({
    cnpj: z
      .string()
      .min(1, 'Este campo é obrigatório')
      .transform((val) => val.replace(/\D/g, ''))
      .refine((val) => isValidCnpj(val), 'CNPJ inválido'),
    razaoSocial: z.string().min(1, 'Este campo é obrigatório'),
    nomeFantasia: z.string().min(1, 'Este campo é obrigatório'),
    appName: z.string().min(1, 'Este campo é obrigatório'),
    cep: z.string().min(1, 'Este campo é obrigatório'),
    logradouro: z.string().min(1, 'Este campo é obrigatório'),
    numero: z.string().min(1, 'Este campo é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Este campo é obrigatório'),
    cidade: z.string().min(1, 'Este campo é obrigatório'),
    estado: z.string().min(1, 'Este campo é obrigatório'),
    telefone: z.string().min(1, 'Este campo é obrigatório'),
    responsavel: z.string().min(1, 'Este campo é obrigatório'),
    email: z
      .string()
      .min(1, 'Este campo é obrigatório')
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'E-mail em formato inválido'),
    confirmEmail: z.string().min(1, 'Este campo é obrigatório'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Este campo é obrigatório'),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Os e-mails não coincidem',
    path: ['confirmEmail'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false)
  const [lastFetchedCnpj, setLastFetchedCnpj] = useState('')
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [lastFetchedCep, setLastFetchedCep] = useState('')

  const { signUp, user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      appName: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      telefone: '',
      responsavel: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
    },
  })

  const cnpjValue = form.watch('cnpj')
  const cepValue = form.watch('cep')
  const emailValue = form.watch('email')
  const confirmEmailValue = form.watch('confirmEmail')

  useEffect(() => {
    const fetchCepData = async (digits: string) => {
      setIsFetchingCep(true)
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${digits}`)
        if (!response.ok) {
          throw new Error('CEP não encontrado')
        }
        const data = await response.json()

        form.setValue('logradouro', data.street || '', { shouldValidate: true })
        form.setValue('bairro', data.neighborhood || '', { shouldValidate: true })
        form.setValue('cidade', data.city || '', { shouldValidate: true })
        form.setValue('estado', data.state || '', { shouldValidate: true })

        toast.success('Endereço carregado com sucesso!')
      } catch (error) {
        toast.error('Não foi possível buscar os dados do CEP. Preencha manualmente.')
      } finally {
        setIsFetchingCep(false)
      }
    }

    const digits = cepValue.replace(/\D/g, '')
    if (digits.length === 8 && digits !== lastFetchedCep) {
      setLastFetchedCep(digits)
      fetchCepData(digits)
    }
  }, [cepValue, lastFetchedCep, form])

  useEffect(() => {
    const fetchCnpjData = async (digits: string) => {
      setIsFetchingCnpj(true)
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
        if (!response.ok) {
          throw new Error('CNPJ não encontrado')
        }
        const data = await response.json()

        form.setValue('razaoSocial', data.razao_social || '', { shouldValidate: true })
        form.setValue('nomeFantasia', data.nome_fantasia || data.razao_social || '', {
          shouldValidate: true,
        })
        form.setValue('appName', data.nome_fantasia || data.razao_social || '', {
          shouldValidate: true,
        })
        form.setValue('cep', data.cep ? data.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2') : '', {
          shouldValidate: true,
        })
        form.setValue('logradouro', data.logradouro || '', { shouldValidate: true })
        form.setValue('numero', data.numero || '', { shouldValidate: true })
        form.setValue('complemento', data.complemento || '', { shouldValidate: true })
        form.setValue('bairro', data.bairro || '', { shouldValidate: true })
        form.setValue('cidade', data.municipio || '', { shouldValidate: true })
        form.setValue('estado', data.uf || '', { shouldValidate: true })

        if (data.ddd_telefone_1) {
          form.setValue('telefone', data.ddd_telefone_1, { shouldValidate: true })
        }

        toast.success('Dados da empresa carregados com sucesso!')
      } catch (error) {
        toast.error('Não foi possível buscar os dados do CNPJ. Preencha manualmente.')
      } finally {
        setIsFetchingCnpj(false)
      }
    }

    const digits = cnpjValue.replace(/\D/g, '')
    if (digits.length === 14 && digits !== lastFetchedCnpj) {
      if (isValidCnpj(digits)) {
        setLastFetchedCnpj(digits)
        fetchCnpjData(digits)
      }
    }
  }, [cnpjValue, lastFetchedCnpj, form])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>
    )
  }

  if (user) {
    if (profile?.status === 'Ativo' || profile?.role === 'Administrador') {
      return <Navigate to="/dashboard" replace />
    }
    if (profile?.status === 'Pendente' || profile?.status === 'Bloqueado') {
      return <Navigate to="/pendente" replace />
    }
  }

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true)

    const metadata = {
      app_name: data.appName,
      cnpj: data.cnpj,
      razao_social: data.razaoSocial,
      nome_fantasia: data.nomeFantasia,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade_estado: `${data.cidade} - ${data.estado}`,
      telefone: data.telefone,
      responsavel: data.responsavel,
    }

    const { error } = await signUp(data.email, data.password, metadata)

    setLoading(false)
    if (error) {
      toast.error(error.message || 'Erro ao criar conta.')
    } else {
      toast.success('Solicitação enviada com sucesso! Seu acesso está aguardando aprovação.', {
        duration: 10000,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#1e3a8a] rounded-md flex items-center justify-center text-white">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Cadastro de Empresa</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Preencha os dados abaixo para solicitar acesso ao sistema.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      CNPJ <span className="text-red-500">*</span>
                      {isFetchingCnpj && (
                        <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Buscando dados...
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        {...field}
                        className={
                          form.formState.errors.cnpj
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                        }
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length > 14) value = value.slice(0, 14)

                          value = value.replace(/^(\d{2})(\d)/, '$1.$2')
                          value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                          value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
                          value = value.replace(/(\d{4})(\d)/, '$1-$2')

                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="razaoSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Razão Social <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nomeFantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nome Fantasia <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Nome do Aplicativo <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Como o sistema será chamado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      CEP <span className="text-red-500">*</span>
                      {isFetchingCep && (
                        <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="postal-code"
                        maxLength={9}
                        placeholder="00000-000"
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length > 8) value = value.slice(0, 8)
                          value = value.replace(/^(\d{5})(\d)/, '$1-$2')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logradouro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Logradouro (Rua/Av) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="street-address" placeholder="Rua Exemplo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="address-line1" placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-line2" placeholder="(opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Bairro <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level3" placeholder="Centro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cidade <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" placeholder="Ex: São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Estado <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Telefone / WhatsApp <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length > 11) value = value.slice(0, 11)
                          if (value.length > 10) {
                            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
                          } else if (value.length > 6) {
                            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
                          } else if (value.length > 2) {
                            value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
                          }
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <FormField
                  control={form.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nome do Responsável <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email de Acesso <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirme seu e-mail <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Confirme seu e-mail"
                        onPaste={(e) => {
                          e.preventDefault()
                          toast.error('Por favor, digite seu e-mail manualmente para evitar erros.')
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Senha <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          className="pr-10"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirmar Senha <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="pr-10"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 mt-6"
              disabled={
                loading ||
                isFetchingCnpj ||
                isFetchingCep ||
                !emailValue ||
                emailValue !== confirmEmailValue
              }
            >
              {loading ? 'Aguarde...' : 'Solicitar Acesso'}
            </Button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Já possui uma conta? </span>
              <Link to="/login" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
                Fazer Login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
