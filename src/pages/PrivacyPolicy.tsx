import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowLeft,
  Building2,
  Lock,
  Eye,
  Trash2,
  Mail,
  Database,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-[#0f172a] text-white py-6 px-4 sm:px-8 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide block leading-tight">
                $istema Eickhoff
              </span>
              <span className="text-xs text-slate-400">
                Política de Privacidade e Proteção de Dados
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              <Link to="/login" className="flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Voltar ao Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-8">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-3 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Em conformidade com a LGPD (Lei nº
              13.709/2018)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Política de Privacidade e Tratamento de Dados
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Última atualização: 29 de Agosto de 2026 • Versão 1.0
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Sistema disponível em{' '}
              <a
                href="https://app.farmaciaeickhoff.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                https://app.farmaciaeickhoff.com.br
              </a>
            </p>
          </div>

          {/* Highlights Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-md shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">Criptografia e RLS</p>
                <p className="text-slate-600">
                  Isolamento rigoroso por empresa. Seus dados financeiros são sigilosos e
                  inacessíveis a terceiros.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">Finalidade Transparente</p>
                <p className="text-slate-600">
                  Coletamos apenas dados estritamente necessários para viabilizar a gestão
                  financeira do seu negócio.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-md shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">Direito de Exclusão</p>
                <p className="text-slate-600">
                  Você pode solicitar a remoção dos seus dados e encerramento a qualquer momento
                  pelo perfil.
                </p>
              </div>
            </div>
          </div>

          {/* Intro */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Apresentação e Compromisso
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              O <strong>$istema Eickhoff</strong>, operado por Eickhoff Soluções em Gestão e
              Tecnologia Farmacêutica (registro INPI BR512026003002-1), valoriza a privacidade e a
              segurança das informações de seus clientes e usuários. Esta Política de Privacidade
              descreve de forma clara, transparente e acessível como coletamos, tratamos,
              armazenamos, compartilhamos e protegemos os seus dados, em conformidade com a{' '}
              <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong> e
              o <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Dados Coletados e Finalidades do Tratamento
            </h2>
            <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                Por ser uma solução B2B voltada ao controle financeiro de farmácias de manipulação,
                realizamos o tratamento das seguintes categorias de dados:
              </p>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Categoria de Dados</th>
                      <th className="p-3">Exemplos</th>
                      <th className="p-3">Finalidade / Base Legal (LGPD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-white">
                      <td className="p-3 font-semibold text-slate-800">
                        Dados da Empresa (Pessoa Jurídica)
                      </td>
                      <td className="p-3">
                        CNPJ, Razão Social, Nome Fantasia, Endereço comercial (Logradouro, Bairro,
                        CEP, Cidade, Estado), Telefone institucional.
                      </td>
                      <td className="p-3">
                        Execução de contrato e prestação dos serviços do software SaaS (Art. 7º, V
                        da LGPD).
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">
                        Dados do Responsável e Usuários
                      </td>
                      <td className="p-3">
                        Nome completo do responsável, e-mail corporativo de acesso,
                        telefone/WhatsApp de contato, função/perfil de acesso.
                      </td>
                      <td className="p-3">
                        Autenticação segura, comunicação sobre o sistema, suporte ao cliente e
                        consentimento (Art. 7º, I e V da LGPD).
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-semibold text-slate-800">
                        Dados Financeiros e Operacionais
                      </td>
                      <td className="p-3">
                        Lançamentos de receitas e despesas, métricas mensais de fórmulas manipuladas
                        (cápsulas/dermato), faturamento de revenda, metas de vendas.
                      </td>
                      <td className="p-3">
                        Execução do software para exibição do DRE, relatórios de fluxo de caixa,
                        inteligência analítica e precificação (Art. 7º, V da LGPD).
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">
                        Dados de Auditoria e Navegação
                      </td>
                      <td className="p-3">
                        Logs de ações no sistema (criação/edição/exclusão de lançamentos), data/hora
                        de acesso, registros de auditoria interna.
                      </td>
                      <td className="p-3">
                        Segurança da informação, prevenção a fraudes e rastreabilidade (Art. 7º, IX
                        da LGPD e Art. 15 do Marco Civil da Internet).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Segurança da Informação e Armazenamento
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                Adotamos rígidas medidas técnicas e administrativas para proteger os dados pessoais
                e corporativos contra acessos não autorizados, perdas, destruição ou qualquer forma
                de tratamento ilícito:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Criptografia em Trânsito (HTTPS / TLS 1.3):</strong> Toda comunicação
                  entre seu navegador e nossos servidores é criptografada.
                </li>
                <li>
                  <strong>Senhas Criptografadas:</strong> As senhas de acesso são transformadas em
                  hashes seguros via algoritmos criptográficos robustos e não podem ser visualizadas
                  por administradores.
                </li>
                <li>
                  <strong>Row Level Security (RLS):</strong> As tabelas do banco de dados contam com
                  políticas de segurança em nível de linha, impedindo que qualquer usuário visualize
                  informações pertencentes a outra empresa.
                </li>
                <li>
                  <strong>Auditoria Interna:</strong> O sistema mantém trilhas de auditoria das
                  operações para garantir a transparência das ações dos operadores.
                </li>
                <li>
                  <strong>Timeout Automático:</strong> Desconexão automática por inatividade para
                  evitar acessos indevidos em computadores compartilhados da farmácia.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                4
              </span>
              Compartilhamento de Dados com Terceiros
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>
                  O Sistema Eickhoff não vende, não aluga e não comercializa seus dados pessoais ou
                  financeiros em nenhuma hipótese.
                </strong>{' '}
                O compartilhamento restringe-se exclusivamente aos provedores essenciais para o
                funcionamento da plataforma:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Provedores de Infraestrutura e Banco de Dados em Nuvem:</strong> Para
                  hospedagem segura da aplicação e do banco de dados estruturado (Supabase / AWS /
                  Cloudflare).
                </li>
                <li>
                  <strong>Serviços de Validação Cadastral:</strong> Consulta pública automatizada de
                  CEP e CNPJ (BrasilAPI/Receita Federal) com o único objetivo de preencher
                  automaticamente o formulário cadastral.
                </li>
                <li>
                  <strong>Cumprimento Legal:</strong> Mediante ordem judicial fundamentada ou
                  solicitação formal de autoridade pública competente nos termos da legislação
                  brasileira.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                5
              </span>
              Direitos dos Titulares de Dados (Art. 18 da LGPD)
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                Nos termos do artigo 18 da Lei nº 13.709/2018 (LGPD), você, na qualidade de titular
                dos seus dados pessoais, possui os seguintes direitos que podem ser exercidos a
                qualquer momento:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <p className="font-semibold text-slate-800 text-xs">1. Confirmação e Acesso</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saber se tratamos seus dados e solicitar cópia completa das informações
                    cadastradas.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <p className="font-semibold text-slate-800 text-xs">2. Correção de Dados</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Corrigir dados incompletos, inexatos ou desatualizados diretamente pelo painel
                    de perfil.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <p className="font-semibold text-slate-800 text-xs">3. Exclusão e Eliminação</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Solicitar a remoção dos seus dados pessoais e exclusão de sua conta no sistema.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <p className="font-semibold text-slate-800 text-xs">
                    4. Portabilidade e Revogação
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exportar relatórios em PDF/Excel ou revogar o consentimento fornecido.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 bg-blue-50/50 p-5 rounded-lg border border-blue-200">
            <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-blue-600" />
              Como Solicitar a Exclusão dos seus Dados (Direito LGPD)
            </h2>
            <div className="text-sm text-slate-700 space-y-2 leading-relaxed">
              <p>
                Para solicitar a <strong>exclusão definitiva de seus dados</strong> ou o
                encerramento de sua conta no Sistema Eickhoff, você dispõe dos seguintes canais
                diretos:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 font-medium">
                <li>
                  <strong>Painel do Usuário:</strong> Acesse a aba{' '}
                  <em>Meu Perfil &gt; Segurança &gt; Direitos LGPD / Exclusão de Dados</em> dentro
                  do sistema autenticado e clique em <em>Solicitar Exclusão de Dados</em>.
                </li>
                <li>
                  <strong>E-mail Oficial do Encarregado de Dados (DPO):</strong> Envie um e-mail
                  para{' '}
                  <a
                    href="mailto:farmaciaeickhoff@terra.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20Exclus%C3%A3o%20de%20Dados%20-%20LGPD"
                    className="text-blue-700 underline font-semibold"
                  >
                    farmaciaeickhoff@terra.com.br
                  </a>{' '}
                  com o assunto <em>"Solicitação de Exclusão de Dados - LGPD"</em> informando seu
                  e-mail cadastrado e CNPJ da empresa.
                </li>
              </ol>
              <p className="text-xs text-slate-500 pt-1">
                * Sua solicitação será processada e confirmada em até 15 (quinze) dias úteis,
                resguardados os dados estritamente necessários para cumprimento de obrigações
                tributárias e legais nos termos do art. 16 da LGPD.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                7
              </span>
              Encarregado de Proteção de Dados (DPO) e Contato
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                Para exercer seus direitos de titular, tirar dúvidas sobre esta política ou relatar
                qualquer questão de privacidade, entre em contato com o nosso Encarregado de
                Proteção de Dados (DPO):
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-medium text-slate-700">
                <p>
                  <strong>Encarregado (DPO):</strong> Eickhoff Gestão &amp; Tecnologia Farmacêutica
                </p>
                <p>
                  <strong>E-mail de Contato:</strong>{' '}
                  <a
                    href="mailto:farmaciaeickhoff@terra.com.br"
                    className="text-blue-600 hover:underline"
                  >
                    farmaciaeickhoff@terra.com.br
                  </a>
                </p>
                <p>
                  <strong>Endereço Web:</strong>{' '}
                  <a
                    href="https://app.farmaciaeickhoff.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://app.farmaciaeickhoff.com.br
                  </a>
                </p>
                <p>
                  <strong>Registro INPI:</strong> BR512026003002-1
                </p>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transparência e segurança jurídica para o seu negócio farmacêutico.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/termos-de-uso">Ver Termos de Uso</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <Link to="/cadastro">Ir para Cadastro</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="bg-[#0f172a] text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-800">
        <p>© 2026 $istema Eickhoff • Todos os direitos reservados • INPI BR512026003002-1</p>
        <div className="mt-2 flex justify-center gap-4 text-slate-400">
          <Link to="/termos-de-uso" className="hover:text-white underline">
            Termos de Uso
          </Link>
          <span>•</span>
          <Link to="/politica-de-privacidade" className="hover:text-white underline">
            Política de Privacidade
          </Link>
          <span>•</span>
          <Link to="/login" className="hover:text-white underline">
            Acessar Sistema
          </Link>
        </div>
      </footer>
    </div>
  )
}
