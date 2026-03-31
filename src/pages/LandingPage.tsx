import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  Activity,
  TrendingUp,
  Calculator,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando...</div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">FarmaLucro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden sm:block"
            >
              Entrar
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                Testar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Lançamento Oficial
          </div>
          <h1
            className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Transforme os números da sua farmácia em{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              lucro garantido
            </span>
          </h1>
          <p
            className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            Um sistema financeiro focado no mercado farmacêutico. Tenha clareza total sobre o seu
            ponto de equilíbrio, fluxo de caixa e margens de lucro reais.
          </p>
          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <Link to="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20"
              >
                Comece Agora Mesmo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="#recursos">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Conhecer a Plataforma
              </Button>
            </Link>
          </div>

          <div
            className="mt-16 relative max-w-5xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent z-10 h-full w-full bottom-0 top-auto"></div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                alt="Dashboard Preview"
                className="w-full h-[400px] object-cover object-top opacity-90"
              />
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
            </div>
          </div>
        </section>

        <section id="recursos" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900">
                Tudo que uma farmácia precisa para crescer
              </h2>
              <p className="mt-4 text-slate-600 text-lg">
                Substitua planilhas confusas por um painel inteligente que trabalha por você.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Assistente de Precificação
                </h3>
                <p className="text-slate-600">
                  Nosso motor inteligente calcula exatamente por quanto você deve vender para
                  atingir sua meta de lucro, considerando todos os custos fixos e variáveis.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Ponto de Equilíbrio</h3>
                <p className="text-slate-600">
                  Saiba exatamente quanto precisa faturar no mês para não ter prejuízo. Acompanhe a
                  meta diariamente de forma visual e clara.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Privacidade Garantida</h3>
                <p className="text-slate-600">
                  Dados criptografados e isolados. Apenas você e sua equipe têm acesso às
                  informações financeiras da sua farmácia, com total segurança.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto para assumir o controle?</h2>
            <p className="text-xl text-slate-300 mb-10">
              Junte-se a outras farmácias que já abandonaram as planilhas e profissionalizaram sua
              gestão financeira.
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl max-w-lg mx-auto mb-10 text-left">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">Acesso completo ao Dashboard de KPIs</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">Assistente de Precificação Estratégica</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">Gestão de Transações e Fluxo de Caixa</span>
                </li>
              </ul>
            </div>
            <Link to="/register">
              <Button
                size="lg"
                className="text-lg h-14 px-8 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
              >
                Criar Minha Conta Grátis
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-800">FarmaLucro</span>
          </div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} FarmaLucro. Sistema Financeiro para Farmácias.
          </p>
        </div>
      </footer>
    </div>
  )
}
