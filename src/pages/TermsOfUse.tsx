import { Link } from 'react-router-dom'
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Lock,
  Scale,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsOfUse() {
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
              <span className="text-xs text-slate-400">Termos e Condições de Uso</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-3 border border-blue-200">
              <Scale className="w-3.5 h-3.5" /> Contrato de Licença de Uso SaaS B2B
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Termos de Uso do $istema Eickhoff
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Última atualização: 29 de Agosto de 2026 • Versão 1.0 (Conformidade com a LGPD — Lei
              nº 13.709/2018)
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Disponível em{' '}
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

          {/* Intro Notice */}
          <div className="p-4 bg-slate-50 border-l-4 border-blue-600 rounded-r-md text-sm text-slate-700 leading-relaxed space-y-2">
            <p className="font-semibold text-slate-900">
              Por favor, leia atentamente estes Termos de Uso antes de acessar ou utilizar o Sistema
              Eickhoff.
            </p>
            <p>
              Ao efetuar o cadastro, solicitar acesso ou utilizar qualquer funcionalidade do
              sistema, a pessoa jurídica cliente (farmácia de manipulação/drogaria/empresa) e seus
              respectivos usuários autorizados declaram estar plenamente cientes e de acordo com
              todas as disposições aqui estabelecidas.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Definições e Objeto
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>1.1. O Sistema:</strong> O <strong>$istema Eickhoff</strong> é uma
                plataforma de software como serviço (SaaS — Software as a Service) focada em gestão
                financeira, inteligência analítica, DRE gerencial, acompanhamento de metas, controle
                de contas e precificação especificamente dimensionada para{' '}
                <strong>farmácias de manipulação</strong> e estabelecimentos do setor farmacêutico.
              </p>
              <p>
                <strong>1.2. Licenciante / Provedor:</strong> Eickhoff Soluções em Gestão e
                Tecnologia Farmacêutica, detentora dos direitos de propriedade intelectual sobre o
                software devidamente registrado perante o INPI (Processo Oficial nº
                BR512026003002-1).
              </p>
              <p>
                <strong>1.3. Cliente / Licenciado:</strong> A pessoa jurídica legalmente constituída
                que adquire ou utiliza a licença de uso do software para gestão interna de seu
                negócio.
              </p>
              <p>
                <strong>1.4. Usuário:</strong> Toda pessoa física (proprietário, administrador,
                gerente ou colaborador) designada pelo Cliente para operar o sistema mediante login
                e senha individualizados.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Cadastro, Elegibilidade e Responsabilidade pelas Credenciais
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>2.1. Veracidade dos Dados:</strong> Para utilizar o sistema, o Cliente
                deverá fornecer informações completas, verídicas e atualizadas da empresa,
                incluindo: CNPJ, Razão Social, Nome Fantasia, Endereço Completo, Telefone/WhatsApp,
                Nome do Responsável e E-mail corporativo válido.
              </p>
              <p>
                <strong>2.2. Aprovação de Acesso:</strong> O cadastro inicial gera uma solicitação
                de acesso submetida à aprovação dos administradores da plataforma. O Sistema
                Eickhoff se reserva o direito de validar os dados cadastrais antes da liberação do
                ambiente.
              </p>
              <p>
                <strong>2.3. Sigilo de Credenciais:</strong> Cada usuário é estritamente responsável
                por manter a confidencialidade de sua senha de acesso. O compartilhamento indevido
                de senhas é expressamente desaconselhado e qualquer ação realizada sob determinada
                credencial será de responsabilidade do respectivo usuário/empresa.
              </p>
              <p>
                <strong>2.4. Perfis de Acesso:</strong> O sistema disponibiliza diferentes níveis de
                permissão (ex: Proprietário, Gerente, Colaborador). O Cliente é o único responsável
                pela correta atribuição de papéis aos seus colaboradores.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Propriedade Intelectual e Proteção INPI
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>3.1. Titularidade:</strong> Todo o código-fonte, arquitetura, design de
                interface, algoritmos de cálculo financeiro, relatórios, logomarca e identidade
                visual do $istema Eickhoff são de exclusiva propriedade do Licenciante, protegidos
                pela Lei de Direitos Autorais (Lei nº 9.610/1998) e pela Lei de Software (Lei nº
                9.609/1998).
              </p>
              <p>
                <strong>3.2. Registro Oficial:</strong> O software possui registro devidamente
                protocolado junto ao{' '}
                <strong>INPI — Instituto Nacional da Propriedade Industrial</strong> sob o processo{' '}
                <strong>BR512026003002-1</strong>.
              </p>
              <p>
                <strong>3.3. Restrições de Uso:</strong> É terminantemente proibido ao Cliente ou
                qualquer terceiro: (i) realizar engenharia reversa, descompilar ou desmontar o
                sistema; (ii) sublicenciar, vender, alugar ou ceder a terceiros sem prévia
                autorização por escrito; (iii) criar soluções derivadas concorrentes copiando a
                estrutura e fluxos do software.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                4
              </span>
              Titularidade e Sigilo dos Dados Financeiros do Cliente
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>4.1. Propriedade dos Dados do Negócio:</strong> Todos os lançamentos
                financeiros, receitas, despesas, faturamento de fórmulas magistrais
                (cápsulas/dermato/revenda), comissões, extratos de contas e metas inseridos no
                sistema são de <strong>propriedade exclusiva do Cliente</strong>.
              </p>
              <p>
                <strong>4.2. Isolamento Lógico (Multi-tenant):</strong> O sistema adota rigorosos
                mecanismos de isolamento de dados com políticas RLS (Row Level Security) e
                criptografia em trânsito e em repouso, garantindo que os dados de uma farmácia
                jamais sejam visualizados por outra.
              </p>
              <p>
                <strong>4.3. Sigilo Absoluto:</strong> O Sistema Eickhoff não comercializa, não
                divulga e não compartilha dados financeiros, estratégicos ou operacionais das
                farmácias clientes com terceiros.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                5
              </span>
              Conformidade com a LGPD (Lei nº 13.709/2018)
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>5.1. Compromisso com a Privacidade:</strong> O tratamento de dados pessoais
                de representantes, administradores e operadores do sistema segue integralmente os
                princípios da{' '}
                <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong>
                : finalidade, adequação, necessidade, livre acesso, qualidade dos dados,
                transparência, segurança, prevenção, não discriminação e responsabilização.
              </p>
              <p>
                <strong>5.2. Papéis na LGPD:</strong> Nas relações estabelecidas:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  O Cliente atua como <strong>Controlador</strong> dos dados de seus próprios
                  colaboradores inseridos na plataforma.
                </li>
                <li>
                  O Sistema Eickhoff atua como <strong>Operador</strong> no processamento da
                  infraestrutura e como <strong>Controlador</strong> exclusivo dos dados cadastrais
                  cadastrados para fins de faturamento, autenticação e comunicação do serviço.
                </li>
              </ul>
              <p>
                <strong>5.3. Política de Privacidade:</strong> As práticas completas de coleta,
                armazenamento, proteção e direitos dos titulares encontram-se detalhadas em nossa{' '}
                <Link
                  to="/politica-de-privacidade"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Política de Privacidade
                </Link>
                , que constitui parte integrante e inseparável destes Termos.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                6
              </span>
              Direito de Exclusão de Dados e Cancelamento
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>6.1. Solicitação de Exclusão:</strong> Em estrito cumprimento ao artigo 18
                da LGPD, o titular dos dados e o representante legal da empresa podem solicitar a
                qualquer momento a exclusão de seus dados pessoais e/ou encerramento da conta
                diretamente pela seção de perfil do sistema ou pelo e-mail do Encarregado de Dados
                (DPO).
              </p>
              <p>
                <strong>6.2. Retenção Legal:</strong> Dados estritamente necessários para o
                cumprimento de obrigações fiscais, tributárias, contábeis ou ordens judiciais serão
                mantidos pelo prazo prescricional previsto em lei (art. 16 da LGPD), findo o qual
                serão descartados de forma definitiva e segura.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                7
              </span>
              Disponibilidade, Suporte e Limitações
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>7.1. Disponibilidade (SLA):</strong> O Sistema Eickhoff envida seus melhores
                esforços técnicos para assegurar alta disponibilidade da plataforma (24 horas por
                dia, 7 dias por semana), ressalvadas manutenções programadas, falhas decorrentes de
                instabilidades na internet pública ou eventos de força maior.
              </p>
              <p>
                <strong>7.2. Ferramenta de Apoio Gerencial:</strong> O software constitui uma
                ferramenta auxiliar de gestão, controle e inteligência gerencial. O Sistema Eickhoff
                não presta assessoria contábil ou fiscal formal; as decisões comerciais e
                financeiras tomadas pela empresa com base nos números do sistema são de
                responsabilidade do próprio gestor.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                8
              </span>
              Alterações dos Termos
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>8.1. Atualizações Periódicas:</strong> Estes termos poderão ser atualizados
                para refletir melhorias do produto, adequações legislativas ou mudanças
                operacionais. A versão mais recente estará sempre disponível nesta página pública.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                9
              </span>
              Foro e Legislação Aplicável
            </h2>
            <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>9.1. Legislação Brasileira:</strong> Estes Termos são regidos e
                interpretados segundo as leis da República Federativa do Brasil, em especial o Marco
                Civil da Internet (Lei nº 12.965/2014) e a LGPD (Lei nº 13.709/2018).
              </p>
              <p>
                <strong>9.2. Canal de Contato:</strong> Para dúvidas relativas aos presentes Termos
                de Uso, entre em contato através do e-mail oficial:{' '}
                <a
                  href="mailto:farmaciaeickhoff@terra.com.br"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  farmaciaeickhoff@terra.com.br
                </a>
                .
              </p>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ambiente seguro, auditado e em total conformidade com a LGPD.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/politica-de-privacidade">Ver Política de Privacidade</Link>
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
