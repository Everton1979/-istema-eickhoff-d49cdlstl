import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { MonthlyDataDialog } from '@/components/dashboard/MonthlyDataDialog'
import { OperationalKpis, StrategicKpis } from '@/components/dashboard/KpiCards'
import { UpcomingCommitments } from '@/components/dashboard/UpcomingCommitments'
import { AccountBalances } from '@/components/dashboard/AccountBalances'
import { PharmacyMetrics } from '@/components/dashboard/PharmacyMetrics'
import { ExpenseDistribution } from '@/components/dashboard/ExpenseDistribution'
import { SalesTargetProgress } from '@/components/dashboard/SalesTargetProgress'
import { PricingAssistant } from '@/components/dashboard/PricingAssistant'
import { PerformanceEvolutionChart } from '@/components/dashboard/PerformanceEvolutionChart'
import { PrintableReport } from '@/components/dashboard/PrintableReport'
import { StatusDetailPanel } from '@/components/dashboard/StatusDetailPanel'
import { PendingUsersAlert } from '@/components/dashboard/PendingUsersAlert'
import { AdminActivityReport } from '@/components/dashboard/AdminActivityReport'
import { useState } from 'react'

export default function Index() {
  const [exportFilters, setExportFilters] = useState<any>(null)

  return (
    <>
      <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden animate-fade-in print:hidden">
        <div className="flex justify-between items-center w-full">
          <div className="flex-1">
            <DashboardHeader onExport={setExportFilters} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-8">
          <PendingUsersAlert />
          <AdminActivityReport />

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
                Motor de Markup Dinâmico Ativo
              </span>
            </div>
            <div className="bg-white p-2 rounded-b-xl shadow-lg border border-slate-200">
              <PricingAssistant />
            </div>
          </section>

          {/* Main Analytics Grid - Visão Operacional */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-2">
            {/* Gráficos Principais */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <div className="w-2 h-4 bg-emerald-500 rounded-sm" />
                  Evolução de Performance
                </h3>
                <div className="flex-1 w-full min-h-[300px]">
                  <PerformanceEvolutionChart />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <div className="w-2 h-4 bg-amber-500 rounded-sm" />
                    Meta de Vendas
                  </h3>
                  <SalesTargetProgress />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <div className="w-2 h-4 bg-purple-500 rounded-sm" />
                    Distribuição de Despesas Operacionais
                  </h3>
                  <ExpenseDistribution />
                </div>
              </div>
            </div>

            {/* Painel Lateral Operacional */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 min-h-[250px] flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <div className="w-2 h-4 bg-blue-600 rounded-sm" />
                  Saldos em Contas
                </h3>
                <div className="flex-1 overflow-hidden">
                  <AccountBalances />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 min-h-[250px] flex flex-col flex-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <div className="w-2 h-4 bg-rose-500 rounded-sm" />
                  Próximos Compromissos
                </h3>
                <div className="flex-1 overflow-hidden">
                  <UpcomingCommitments />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Estratégica (Fechamento) */}
          <section className="w-full bg-slate-200/50 p-6 rounded-xl border border-slate-300 shadow-sm mt-4">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-3">
              <div className="w-3 h-6 bg-slate-700 rounded-sm" />
              Análise Estratégica (Fechamento Mensal)
            </h2>

            <StrategicKpis />

            <div className="mt-6">
              <PharmacyMetrics />
            </div>
          </section>

          <StatusDetailPanel />
        </div>
      </div>
      <PrintableReport exportFilters={exportFilters} />
    </>
  )
}
