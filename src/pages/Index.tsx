import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { MonthlyDataDialog } from '@/components/dashboard/MonthlyDataDialog'
import { ExportReportDialog } from '@/components/dashboard/ExportReportDialog'
import { DREDialog } from '@/components/dashboard/DREDialog'
import { OperationalKpis, StrategicKpis } from '@/components/dashboard/KpiCards'
import { UpcomingCommitments } from '@/components/dashboard/UpcomingCommitments'
import { AccountBalances } from '@/components/dashboard/AccountBalances'
import { PharmacyMetrics } from '@/components/dashboard/PharmacyMetrics'
import { ExpenseDistribution } from '@/components/dashboard/ExpenseDistribution'
import { SalesTargetProgress } from '@/components/dashboard/SalesTargetProgress'
import { PricingAssistant } from '@/components/dashboard/PricingAssistant'
import { KumonSimulator } from '@/components/dashboard/KumonSimulator'
import { PerformanceEvolutionChart } from '@/components/dashboard/PerformanceEvolutionChart'
import { PrintableReport } from '@/components/dashboard/PrintableReport'
import { StatusDetailPanel } from '@/components/dashboard/StatusDetailPanel'
import { PendingUsersAlert } from '@/components/dashboard/PendingUsersAlert'
import { PlanExpirationBanner } from '@/components/dashboard/PlanExpirationBanner'
import { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRightLeft, Database, FileText, BarChart3 } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function Index() {
  const [exportFilters, setExportFilters] = useState<any>(null)
  const { profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Checagem de segurança em tempo real para barrar acessos não aprovados
    if (!loading && profile && profile.status === 'Pendente' && profile.role !== 'Administrador') {
      navigate('/pendente', { replace: true })
    }
  }, [profile, loading, navigate])

  if (!loading && profile && profile.status === 'Pendente' && profile.role !== 'Administrador') {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#f8fafc] animate-fade-in">
        <div className="flex flex-col items-center gap-4 mt-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Redirecionando para aprovação...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden animate-fade-in print:hidden">
        <div className="flex justify-between items-center w-full">
          <div className="flex-1">
            <DashboardHeader />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-8">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start gap-3 shadow-sm text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Aviso de Navegação:</strong> Por favor, deixe sempre no modo inglês e não
              traduza a página. A utilização da tradução automática do navegador pode desconfigurar
              o layout e as funcionalidades do sistema.
            </p>
          </div>

          <PlanExpirationBanner />
          <PendingUsersAlert />

          {/* Lançamentos Section */}
          <section className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-2">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-3 mb-6">
              <div className="w-3 h-8 bg-blue-600 rounded-sm" />
              Lançamentos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100 transition-colors">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-full shadow-inner">
                  <ArrowRightLeft className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Transações</h3>
                  <p className="text-slate-500 mb-6 mt-2 max-w-sm mx-auto">
                    Registre e gerencie as receitas, despesas, cortesias e investimentos.
                  </p>
                  <Link
                    to="/transacoes"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
                  >
                    Acessar Transações
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100 transition-colors">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-full shadow-inner">
                  <Database className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Dados Manipulação</h3>
                  <p className="text-slate-500 mb-6 mt-2 max-w-sm mx-auto">
                    Insira as metas e dados mensais da farmácia para análise de performance.
                  </p>
                  <div className="flex justify-center [&>button]:h-12 [&>button]:px-8 [&>button]:text-base">
                    <MonthlyDataDialog />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Top row: Operational KPIs */}
          <section className="w-full">
            <OperationalKpis />
          </section>

          {/* Destaque Central: Assistente de Precificação Estratégica */}
          <section className="w-full relative">
            <div className="absolute inset-0 bg-blue-600/5 rounded-xl border border-blue-200/50 shadow-inner -z-10 translate-y-2 translate-x-2"></div>
            <div className="bg-[#1e3a5f] rounded-t-xl px-5 py-3 text-white shadow-md flex items-center justify-between border-b-2 border-blue-500">
              <h2 className="font-bold uppercase tracking-widest text-sm flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                Assistente de Precificação Estratégica
              </h2>
              <span className="text-xs text-blue-200 hidden sm:block bg-blue-900/50 px-3 py-1 rounded-full border border-blue-400/30">
                Markup Dinâmico Ativo
              </span>
            </div>
            <div className="bg-white p-2 rounded-b-xl shadow-lg border border-slate-200">
              <PricingAssistant />
            </div>
          </section>

          {/* Main Analytics - Visão Operacional Empilhada */}
          <div className="flex flex-col gap-6 mt-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-emerald-500 rounded-sm" />
                Evolução de Performance
              </h3>
              <div className="w-full">
                <PerformanceEvolutionChart />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-blue-600 rounded-sm" />
                Receitas Realizadas
              </h3>
              <AccountBalances />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-amber-500 rounded-sm" />
                Metas de Vendas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SalesTargetProgress variant="GLOBAL" />
                <SalesTargetProgress variant="MANIPULACAO" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-purple-500 rounded-sm" />
                Distribuição de Despesas Operacionais
              </h3>
              <ExpenseDistribution />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <div className="w-2 h-4 bg-rose-500 rounded-sm" />
                Próximos Compromissos
              </h3>
              <UpcomingCommitments />
            </div>
          </div>

          {/* Seção Estratégica (Fechamento) */}
          <section className="w-full bg-slate-200/50 p-6 rounded-xl border border-slate-300 shadow-sm mt-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-3">
                <div className="w-3 h-6 bg-slate-700 rounded-sm" />
                Análise Estratégica
              </h2>
              <p className="text-sm text-slate-600 mt-2 ml-9 border-l-2 border-amber-400 pl-3 bg-amber-50/70 py-1.5 rounded-r-md">
                <strong className="text-amber-700">Observação:</strong> Esta análise somente terá
                validade e poderá ser analisada depois que <strong>todos os dados do mês</strong>{' '}
                (transações e dados manipulação) forem lançados.
              </p>
            </div>

            <StrategicKpis />

            <div className="mt-6">
              <KumonSimulator />
            </div>

            <div className="mt-6">
              <PharmacyMetrics />
            </div>
          </section>

          <StatusDetailPanel />

          {/* Relatórios Section */}
          <section className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-3 mb-6">
              <div className="w-3 h-8 bg-slate-700 rounded-sm" />
              Relatórios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100 transition-colors">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full shadow-inner">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Exportar Relatório</h3>
                  <p className="text-slate-500 mb-6 mt-2 max-w-sm mx-auto">
                    Gere um documento PDF completo com os dados do período selecionado.
                  </p>
                  <div className="flex justify-center [&>button]:h-12 [&>button]:px-8 [&>button]:text-base">
                    <ExportReportDialog onExport={setExportFilters} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100 transition-colors">
                <div className="p-4 bg-amber-100 text-amber-600 rounded-full shadow-inner">
                  <BarChart3 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Demonstrativo DRE</h3>
                  <p className="text-slate-500 mb-6 mt-2 max-w-sm mx-auto">
                    Visualize o Demonstrativo do Resultado do Exercício com a nova seção de
                    Investimentos.
                  </p>
                  <div className="flex justify-center [&>button]:h-12 [&>button]:px-8 [&>button]:text-base">
                    <DREDialog />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <PrintableReport exportFilters={exportFilters} />
    </>
  )
}
