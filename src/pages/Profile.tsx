import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useAuth } from '@/hooks/use-auth'
import { User, Save, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Profile() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    telefone: '',
    responsavel: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade_estado: '',
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        razao_social: profile.razao_social || '',
        nome_fantasia: profile.nome_fantasia || '',
        cnpj: profile.cnpj || '',
        telefone: profile.telefone || '',
        responsavel: profile.responsavel || '',
        cep: profile.cep || '',
        logradouro: profile.logradouro || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
        cidade_estado: profile.cidade_estado || '',
      })
    }
  }, [profile])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').update(formData).eq('id', profile.id)

      if (error) throw error
      toast.success('Perfil atualizado com sucesso!')

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error
      toast.success('Senha atualizada com sucesso!')
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
      <DashboardHeader />
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#f1f5f9]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Meu Perfil</h1>
              <p className="text-sm text-slate-500">
                Gerencie suas informações cadastrais e segurança da conta.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm border overflow-hidden">
            <Tabs defaultValue="dados" className="w-full">
              <div className="px-6 pt-4 border-b">
                <TabsList className="bg-transparent space-x-4">
                  <TabsTrigger
                    value="dados"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-3"
                  >
                    Dados Cadastrais
                  </TabsTrigger>
                  <TabsTrigger
                    value="seguranca"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-3"
                  >
                    Segurança
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dados" className="p-6 m-0">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <Label>Email (Fixo)</Label>
                      <Input value={profile?.email || ''} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Input value={profile?.status || 'Ativo'} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                      <Label>Nível de Acesso</Label>
                      <Input
                        value={profile?.role || 'Visitante'}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-4 text-slate-800">Dados da Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Razão Social</Label>
                        <Input
                          name="razao_social"
                          value={formData.razao_social}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Nome Fantasia</Label>
                        <Input
                          name="nome_fantasia"
                          value={formData.nome_fantasia}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>CNPJ</Label>
                        <Input name="cnpj" value={formData.cnpj} onChange={handleProfileChange} />
                      </div>
                      <div className="space-y-1">
                        <Label>Nome do Responsável</Label>
                        <Input
                          name="responsavel"
                          value={formData.responsavel}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Telefone / WhatsApp</Label>
                        <Input
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-4 text-slate-800">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>CEP</Label>
                        <Input
                          name="cep"
                          value={formData.cep}
                          onChange={handleProfileChange}
                          maxLength={9}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Logradouro (Rua/Av)</Label>
                        <Input
                          name="logradouro"
                          value={formData.logradouro}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Número</Label>
                        <Input
                          name="numero"
                          value={formData.numero}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Complemento</Label>
                        <Input
                          name="complemento"
                          value={formData.complemento}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Bairro</Label>
                        <Input
                          name="bairro"
                          value={formData.bairro}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Cidade/Estado</Label>
                        <Input
                          name="cidade_estado"
                          value={formData.cidade_estado}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="seguranca" className="p-6 m-0">
                <form onSubmit={handleSavePassword} className="space-y-6 max-w-md">
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-slate-800">Alterar Senha</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Crie uma nova senha para acessar sua conta. Ela deve ter pelo menos 6
                      caracteres.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label>Nova Senha</Label>
                      <Input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Confirmar Nova Senha</Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={loading} variant="secondary" className="gap-2">
                      <Lock className="w-4 h-4" />
                      {loading ? 'Atualizando...' : 'Atualizar Senha'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
