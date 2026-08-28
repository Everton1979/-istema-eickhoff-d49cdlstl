import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { MonthlyDataDialog } from '@/components/dashboard/MonthlyDataDialog'
import { StrategicPerformanceReportDialog } from '@/components/dashboard/StrategicPerformanceReportDialog'
import { ExportReportDialog } from '@/components/dashboard/ExportReportDialog'
import { DREDialog } from '@/components/dashboard/DREDialog'
import { OperationalKpis } from '@/components/dashboard/KpiCards'
import { UpcomingCommitments } from '@/components/dashboard/UpcomingCommitments'
import { AccountBalances } from '@/components/dashboard/AccountBalances'
import { PharmacyMetrics } from '@/components/dashboard/PharmacyMetrics'
import { ExpenseDistribution } from '@/components/dashboard/ExpenseDistribution'
import { SystemSalesCards } from '@/components/dashboard/SalesTargetProgress'
import { PricingAssistant } from '@/components/dashboard/PricingAssistant'
import { KumonSimulator } from '@/components/dashboard/KumonSimulator'
import { PerformanceEvolutionChart } from '@/components/dashboard/PerformanceEvolutionChart'
import { PrintableReport } from '@/components/dashboard/PrintableReport'
import { PendingUsersAlert } from '@/components/dashboard/PendingUsersAlert'
import { PlanExpirationBanner } from '@/components/dashboard/PlanExpirationBanner'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  ArrowRightLeft,
  Database,
  FileText,
  BarChart3,
  Presentation,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useFinanceStore } from '@/stores/financeStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { cn } from '@/lib/utils'

export default function Index() {
  const [exportFilters, setExportFilters] = useState<any>(null)
  const { profile, loading, isMaster, isColaborador } = useAuth()
  const navigate = useNavigate()
  const {
    fetchData,
    transactions,
    filteredTransactions,
    loadingData,
    isTransactionSheetOpen,
    setTransactionSheetOpen,
    editingTransaction,
    setEditingTransaction,
  } = useFinanceStore()

  const lancamentosRef = useRef<HTMLElement>(null)
  const dashboardKpisRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Checagem de segurança em tempo real para barrar acessos não aprovados
    if (!loading && profile && profile.status === 'Pendente' && !isMaster) {
      navigate('/pendente', { replace: true })
    } else if (!loading && profile && isColaborador) {
      // Colaborador deve ser redirecionado para a tela de transações
      navigate('/transacoes', { replace: true })
    } else if (profile) {
      // Refresh silently without clearing state to avoid flickering
      fetchData(false)
    }
  }, [profile, loading, isMaster, isColaborador, navigate]) // fetchData is intentionally omitted to avoid loops

  // Revalidação silenciosa ao voltar para a aba
  useEffect(() => {
    const handleFocus = () => {
      if (profile) {
        fetchData(false)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [profile, fetchData])

  if (!loading && profile && profile.status === 'Pendente' && !isMaster) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#f8fafc] animate-fade-in">
        <div className="flex flex-col items-center gap-4 mt-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Redirecionando para aprovação...</p>
        </div>
      </div>
    )
  }

  if (!loading && profile && isColaborador) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#f8fafc] animate-fade-in">
        <div className="flex flex-col items-center gap-4 mt-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Redirecionando para Lançamentos...</p>
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
          <WelcomeBanner
            onAddTransactionClick={() => {
              if (lancamentosRef.current) {
                lancamentosRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
              setEditingTransaction(null)
              setTransactionSheetOpen(true)
            }}
          />

          <div className="bg-yellow-200 border border-yellow-300 text-amber-800 px-4 py-3 rounded-md flex items-start gap-3 shadow-sm text-sm font-bold">
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
          <section
            ref={lancamentosRef}
            className="w-full bg-white p-6 rounded-xl border border-slate-300 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-3">
                <div className="w-3 h-8 bg-blue-600 rounded-sm" />
                Lançamentos
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100/70 transition-colors">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
                  <ArrowRightLeft className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Transações</h3>
                  <p className="text-slate-500 mb-5 mt-1.5 max-w-sm mx-auto text-sm">
                    Registre e gerencie as receitas, despesas, cortesias e investimentos.
                  </p>
                  <div className="flex justify-center">
                    <Link
                      to="/transacoes"
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      Acessar Transações
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100/70 transition-colors">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl shadow-sm">
                  <Database className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Dados do Sistema</h3>
                  <p className="text-slate-500 mb-5 mt-1.5 max-w-sm mx-auto text-sm">
                    Insira os dados mensais do sistema (ex: Fórmula Certa) para análise de
                    performance.
                  </p>
                  <div className="flex justify-center [&>button]:h-11 [&>button]:px-7 [&>button]:text-sm [&>button]:rounded-lg">
                    <MonthlyDataDialog />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Operational KPIs */}
          <section ref={dashboardKpisRef} className="w-full rounded-xl transition-all">
            <OperationalKpis />
          </section>

          {/* Destaque Central: Assistente de Precificação Estratégica */}
          <section className="w-full relative">
            <div className="bg-[#1e3a5f] rounded-t-xl px-5 py-3.5 text-white shadow-sm flex items-center justify-between border-b-2 border-blue-500">
              <h2 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                Assistente de Precificação Estratégica
              </h2>
              <span className="text-xs text-blue-200 hidden sm:block bg-blue-900/60 px-3 py-1 rounded-full border border-blue-400/30 font-medium">
                Markup Dinâmico Ativo
              </span>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-b-xl shadow-sm border border-t-0 border-slate-300">
              <PricingAssistant />
            </div>
          </section>

          {/* Main Analytics - Visão Operacional Empilhada */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-300">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <div className="w-2.5 h-5 bg-emerald-600 rounded-sm" />
                Evolução de Performance
              </h3>
              <div className="w-full">
                <PerformanceEvolutionChart />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-300">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <div className="w-2.5 h-5 bg-blue-600 rounded-sm" />
                Receitas Realizadas
              </h3>
              <AccountBalances />
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-300">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <div className="w-2.5 h-5 bg-purple-600 rounded-sm" />
                Distribuição de Despesas Operacionais
              </h3>
              <ExpenseDistribution />
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-300">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <div className="w-2.5 h-5 bg-rose-600 rounded-sm" />
                Próximos Compromissos
              </h3>
              <UpcomingCommitments />
            </div>
          </div>

          {/* Seção Estratégica (Fechamento) */}
          <section className="w-full bg-slate-100/70 p-6 rounded-xl border border-slate-300 shadow-sm">
            <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-3">
                  <div className="w-3 h-8 bg-slate-700 rounded-sm" />
                  Análise Estratégica
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-700 mt-2.5 ml-6 border-l-3 border-amber-500 pl-3.5 bg-amber-50 py-2 rounded-r-lg max-w-3xl border border-amber-200">
                  <strong className="text-amber-800 font-bold">Observação:</strong> Esta análise
                  somente terá validade e poderá ser analisada depois que{' '}
                  <strong>todos os dados do mês</strong> (transações e dados manipulação) forem
                  lançados.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <SystemSalesCards />
              </div>

              <div>
                <KumonSimulator />
              </div>

              <div>
                <PharmacyMetrics />
              </div>
            </div>
          </section>

          {/* Relatórios Section */}
          <section className="w-full bg-white p-6 rounded-xl border border-slate-300 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-3 mb-6">
              <div className="w-3 h-8 bg-slate-700 rounded-sm" />
              Relatórios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100/70 transition-colors">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
                  <FileText className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Relatório Entradas/Saídas</h3>
                  <p className="text-slate-500 mb-5 mt-1.5 max-w-sm mx-auto text-sm">
                    Gere um documento PDF completo com os dados do período selecionado.
                  </p>
                  <div className="flex justify-center [&>button]:h-11 [&>button]:px-7 [&>button]:text-sm [&>button]:rounded-lg w-full">
                    <ExportReportDialog onExport={setExportFilters} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100/70 transition-colors">
                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shadow-sm">
                  <BarChart3 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Demonstrativo DRE</h3>
                  <p className="text-slate-500 mb-5 mt-1.5 max-w-sm mx-auto text-sm">
                    Visualize o Demonstrativo do Resultado do Exercício.
                  </p>
                  <div className="flex justify-center [&>button]:h-11 [&>button]:px-7 [&>button]:text-sm [&>button]:rounded-lg w-full">
                    <DREDialog />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center hover:bg-slate-100/70 transition-colors">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
                  <Presentation className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Relatório Estratégico Consolidado
                  </h3>
                  <p className="text-slate-500 mb-5 mt-1.5 max-w-sm mx-auto text-sm">
                    Analise a performance consolidada em múltiplos meses fechados.
                  </p>
                  <div className="flex justify-center [&>button]:h-11 [&>button]:px-7 [&>button]:text-sm [&>button]:rounded-lg w-full">
                    <StrategicPerformanceReportDialog />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Sheet
        open={isTransactionSheetOpen}
        onOpenChange={(open) => {
          setTransactionSheetOpen(open)
          if (!open) setEditingTransaction(null)
        }}
      >
        <SheetContent className="overflow-y-auto w-full sm:max-w-md p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle>
              {editingTransaction ? 'Editar Transação' : 'Adicionar Transação'}
            </SheetTitle>
          </SheetHeader>
          <TransactionForm
            onSuccess={() => {
              setTransactionSheetOpen(false)
              setEditingTransaction(null)
            }}
            initialData={editingTransaction}
          />
        </SheetContent>
      </Sheet>

      <PrintableReport exportFilters={exportFilters} />
    </>
  )
}
