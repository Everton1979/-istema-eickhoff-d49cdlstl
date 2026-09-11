import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useAuth } from '@/hooks/use-auth'
import {
  User,
  Save,
  Lock,
  ShieldCheck,
  Trash2,
  Mail,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useFinanceStore } from '@/stores/financeStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [submittingDeletion, setSubmittingDeletion] = useState(false)
  const [deletionRequested, setDeletionRequested] = useState(false)

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

  const handleRequestDataDeletion = async () => {
    setSubmittingDeletion(true)
    try {
      if (isDemoMode) {
        toast.success('Solicitação de exclusão registrada com sucesso (Modo Demonstração)!')
        setDeletionRequested(true)
        setIsDeleteDialogOpen(false)
        return
      }

      if (profile?.id) {
        // Registra log de auditoria formal da solicitação de exclusão LGPD
        await (supabase.from('audit_logs') as any).insert({
          user_id: profile.id,
          project_id: profile.app_name || profile.id,
          action: 'SOLICITACAO_EXCLUSAO_LGPD',
          entity: 'Perfil e Dados do Usuário',
          entity_id: profile.id,
          details: {
            motivo: deletionReason || 'Solicitação direta do usuário via painel LGPD',
            email: profile.email,
            cnpj: profile.cnpj,
            razao_social: profile.razao_social,
            data_solicitacao: new Date().toISOString(),
          },
        })
      }

      // Prepara link de e-mail pré-preenchido para o DPO / responsável
      const subject = encodeURIComponent(
        `[LGPD] Solicitação de Exclusão de Dados - ${profile?.razao_social || profile?.email || 'Cliente'}`,
      )
      const body = encodeURIComponent(
        `Olá,\n\nEu, na qualidade de titular e representante da empresa ${profile?.razao_social || ''} (CNPJ: ${profile?.cnpj || ''}), cadastrado sob o e-mail ${profile?.email || ''}, solicito formalmente nos termos do Art. 18 da LGPD (Lei nº 13.709/2018) a exclusão dos dados da minha conta no Sistema Eickhoff.\n\nMotivo da solicitação:\n${deletionReason || 'Não informado'}\n\nData da solicitação: ${new Date().toLocaleString('pt-BR')}\n\nAguardo confirmação do processamento.`,
      )
      const mailtoUrl = `mailto:farmaciaeickhoff@terra.com.br?subject=${subject}&body=${body}`

      // Dispara abertura do e-mail
      window.open(mailtoUrl, '_blank')

      setDeletionRequested(true)
      setIsDeleteDialogOpen(false)
      toast.success(
        'Solicitação de exclusão LGPD registrada! Abrimos seu cliente de e-mail para envio ao responsável.',
        { duration: 8000 },
      )
    } catch (err: any) {
      toast.error(
        'Erro ao registrar solicitação de exclusão. Entre em contato por farmaciaeickhoff@terra.com.br',
      )
    } finally {
      setSubmittingDeletion(false)
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
                  <TabsTrigger
                    value="lgpd"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-3"
                  >
                    Privacidade e LGPD
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

              {/* Nova Aba de Privacidade & LGPD */}
              <TabsContent value="lgpd" className="p-6 m-0">
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Gestão de Privacidade e Direitos LGPD
                    </h3>
                    <p className="text-sm text-slate-500">
                      Em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº
                      13.709/2018).
                    </p>
                  </div>

                  {/* Status do Consentimento */}
                  <div className="p-4 bg-slate-50 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Status do Consentimento de Uso
                        </p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Você consentiu com o tratamento dos dados da empresa e do responsável para
                          fins de gestão financeira e prestação dos serviços do software.
                        </p>
                        {profile?.lgpd_consent_at && (
                          <p className="text-xs text-slate-500 mt-2 font-mono">
                            Data do consentimento:{' '}
                            {new Date(profile.lgpd_consent_at).toLocaleString('pt-BR')} (Versão{' '}
                            {profile.lgpd_consent_version || 'v1.0'})
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" /> Ativo &amp; Válido
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-xs">
                      <Link
                        to="/termos-de-uso"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ler Termos de Uso
                      </Link>
                      <Link
                        to="/politica-de-privacidade"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ler Política de Privacidade
                      </Link>
                    </div>
                  </div>

                  {/* Seção de Exclusão de Dados */}
                  <div className="p-5 border border-rose-200 bg-rose-50/40 rounded-lg space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 text-rose-700 rounded-md shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-rose-950">
                          Exclusão de Dados e Encerramento de Conta (Art. 18, VI da LGPD)
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Você tem o direito de solicitar a qualquer momento a exclusão definitiva
                          dos seus dados pessoais e dos lançamentos cadastrados no sistema. Ao
                          confirmar a solicitação, sua conta será encaminhada para o processo de
                          anonimização e exclusão segura por nossa equipe técnica.
                        </p>
                      </div>
                    </div>

                    {deletionRequested ? (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 space-y-1">
                        <p className="font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Solicitação de
                          Exclusão Enviada!
                        </p>
                        <p className="text-emerald-700">
                          Sua solicitação de exclusão foi devidamente registrada em nossa auditoria.
                          Nossa equipe responderá e concluirá o procedimento em até 15 dias úteis,
                          respeitando os prazos legais da LGPD.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                        <p className="text-xs text-slate-500">
                          * Dados fiscais ou decorrentes de obrigação legal serão mantidos pelo
                          prazo regulatório.
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="gap-2 shrink-0 bg-rose-600 hover:bg-rose-700"
                        >
                          <Trash2 className="w-4 h-4" /> Solicitar Exclusão de Dados
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Canal de Contato DPO */}
                  <div className="p-4 bg-slate-50 border rounded-lg text-xs space-y-2 text-slate-600">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" /> Canal de Atendimento do Encarregado
                      de Dados (DPO)
                    </p>
                    <p>
                      Para esclarecer dúvidas sobre seus dados ou exercer qualquer outro direito
                      previsto na LGPD, você também pode entrar em contato diretamente com o
                      responsável pelo e-mail:{' '}
                      <a
                        href="mailto:farmaciaeickhoff@terra.com.br"
                        className="text-blue-600 font-medium underline"
                      >
                        farmaciaeickhoff@terra.com.br
                      </a>
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação de Exclusão de Dados */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Solicitar Exclusão de Dados (LGPD)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-1 leading-relaxed">
              Esta ação iniciará o protocolo de exclusão definitiva e desativação da sua conta e dos
              dados vinculados à empresa <strong>{profile?.razao_social || 'sua empresa'}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 leading-relaxed">
              <strong>Importante:</strong> Após a conclusão da solicitação, seus dados de acesso e
              relatórios financeiros serão permanentemente removidos, não sendo possível
              recuperá-los.
            </div>

            <div className="space-y-1">
              <Label htmlFor="deletionReason" className="text-xs font-medium text-slate-700">
                Motivo da solicitação (opcional)
              </Label>
              <Textarea
                id="deletionReason"
                placeholder="Conte-nos brevemente o motivo do encerramento..."
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                className="text-xs resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={submittingDeletion}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRequestDataDeletion}
              disabled={submittingDeletion}
              className="gap-1.5 bg-rose-600 hover:bg-rose-700"
            >
              {submittingDeletion ? 'Processando...' : 'Confirmar e Enviar Solicitação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
