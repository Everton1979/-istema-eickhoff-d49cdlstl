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
  const { isDemoMode } = useFinanceStore()
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
    currentPassword: '',
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
    } else if (isDemoMode) {
      setFormData({
        razao_social: 'Farmácia Magistral Modelo LTDA (Demo)',
        nome_fantasia: 'Farmácia Magistral Modelo',
        cnpj: '00.000.000/0001-91',
        telefone: '(51) 99999-9999',
        responsavel: 'Farmacêutico Responsável',
        cep: '90000-000',
        logradouro: 'Avenida Principal Modelo',
        numero: '1000',
        complemento: 'Sala 101',
        bairro: 'Centro',
        cidade_estado: 'Porto Alegre / RS',
      })
    }
  }, [profile, isDemoMode])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemoMode) {
      toast.success('Perfil atualizado com sucesso (Modo Demonstração)!')
      return
    }
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
    if (isDemoMode) {
      toast.success('Senha atualizada com sucesso (Modo Demonstração)!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      return
    }
    if (!passwordData.currentPassword) {
      toast.error('Por favor, informe sua senha atual.')
      return
    }
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
      // Verifica a senha atual fazendo login novamente
      if (profile?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: passwordData.currentPassword,
        })

        if (signInError) {
          throw new Error('Senha atual incorreta.')
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error
      toast.success('Senha atualizada com sucesso!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  const UserActivities = () => {
    const [logs, setLogs] = useState<any[]>([])
    const [loadingLogs, setLoadingLogs] = useState(true)

    useEffect(() => {
      const fetchLogs = async () => {
        if (!profile?.id) {
          if (isDemoMode) {
            setLogs([
              {
                id: 'demo-log-1',
                action: 'CRIAR',
                entity: 'Transação',
                created_at: new Date().toISOString(),
              },
              {
                id: 'demo-log-2',
                action: 'ATUALIZAR',
                entity: 'Métrica Mensal',
                created_at: new Date(Date.now() - 3600000).toISOString(),
              },
            ])
          }
          setLoadingLogs(false)
          return
        }
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20)
        if (data) setLogs(data)
        setLoadingLogs(false)
      }
      fetchLogs()
    }, [])

    if (loadingLogs)
      return <div className="p-4 text-center text-slate-500">Carregando atividades...</div>
    if (logs.length === 0)
      return (
        <div className="p-4 text-center text-slate-500">Nenhuma atividade registrada ainda.</div>
      )

    return (
      <div className="divide-y">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {log.action === 'CRIAR'
                  ? 'Criou'
                  : log.action === 'ATUALIZAR'
                    ? 'Atualizou'
                    : log.action === 'EXCLUIR'
                      ? 'Excluiu'
                      : log.action}{' '}
                {log.entity.toLowerCase()}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(log.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                log.action === 'CRIAR'
                  ? 'bg-emerald-100 text-emerald-700'
                  : log.action === 'ATUALIZAR'
                    ? 'bg-blue-100 text-blue-700'
                    : log.action === 'EXCLUIR'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-700'
              }`}
            >
              {log.action}
            </span>
          </div>
        ))}
      </div>
    )
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
                  <TabsTrigger
                    value="atividades"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-3"
                  >
                    Atividades
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dados" className="p-6 m-0">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <Label>Email (Fixo)</Label>
                      <Input
                        value={profile?.email || (isDemoMode ? 'demo@sistemaeickhoff.com.br' : '')}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Input
                        value={
                          profile?.status || (isDemoMode ? 'Modo Demonstração (Ativo)' : 'Ativo')
                        }
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Nível de Acesso</Label>
                      <Input
                        value={
                          profile?.role ||
                          (isDemoMode ? 'Administrador / Proprietário (Demo)' : 'Usuário')
                        }
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
                      <Label>Senha Atual</Label>
                      <Input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
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

              <TabsContent value="atividades" className="p-6 m-0">
                <div className="space-y-4 max-w-3xl">
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-slate-800">
                      Histórico de Atividades
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Acompanhe as últimas ações realizadas por você no sistema.
                    </p>
                  </div>

                  <div className="border rounded-md overflow-hidden shadow-sm">
                    <UserActivities />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
