import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Building2, Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidadeEstado: '',
    telefone: '',
    responsavel: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const { signUp, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const metadata = {
      app_name: 'farmacia',
      cnpj: formData.cnpj,
      razao_social: formData.razaoSocial,
      nome_fantasia: formData.nomeFantasia,
      cep: formData.cep,
      logradouro: formData.logradouro,
      numero: formData.numero,
      complemento: formData.complemento,
      bairro: formData.bairro,
      cidade_estado: formData.cidadeEstado,
      telefone: formData.telefone,
      responsavel: formData.responsavel,
    }

    const { error } = await signUp(formData.email, formData.password, metadata)

    setLoading(false)
    if (error) {
      toast.error(error.message || 'Erro ao criar conta.')
    } else {
      toast.success(
        'Cadastro realizado com sucesso! Siga as instruções na tela para concluir seu acesso.',
        { duration: 10000 },
      )
      navigate('/pendente')
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Razão Social</Label>
              <Input
                required
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label>Nome Fantasia</Label>
              <Input
                required
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label>CNPJ</Label>
              <Input required name="cnpj" value={formData.cnpj} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label>Telefone / WhatsApp</Label>
              <Input required name="telefone" value={formData.telefone} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label>CEP</Label>
              <Input
                required
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                autoComplete="postal-code"
                maxLength={9}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-1">
              <Label>Logradouro (Rua/Av)</Label>
              <Input
                required
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                autoComplete="street-address"
                placeholder="Rua Exemplo"
              />
            </div>
            <div className="space-y-1">
              <Label>Número</Label>
              <Input
                required
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                autoComplete="address-line1"
                placeholder="123"
              />
            </div>
            <div className="space-y-1">
              <Label>Complemento</Label>
              <Input
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                autoComplete="address-line2"
                placeholder="Apto 101 (opcional)"
              />
            </div>
            <div className="space-y-1">
              <Label>Bairro</Label>
              <Input
                required
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                autoComplete="address-level3"
                placeholder="Centro"
              />
            </div>
            <div className="space-y-1">
              <Label>Cidade/Estado</Label>
              <Input
                required
                name="cidadeEstado"
                value={formData.cidadeEstado}
                onChange={handleChange}
                autoComplete="address-level2"
                placeholder="Ex: São Paulo / SP"
              />
            </div>
            <div className="space-y-1 md:col-span-2 border-t pt-4 mt-2">
              <Label>Nome do Responsável</Label>
              <Input
                required
                name="responsavel"
                value={formData.responsavel}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Email de Acesso</Label>
              <Input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label>Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 mt-6"
            disabled={loading}
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
      </div>
    </div>
  )
}
