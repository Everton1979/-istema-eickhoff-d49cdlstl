import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SidebarFilters } from '@/components/dashboard/SidebarFilters'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { BreakEvenMonitor } from '@/components/dashboard/BreakEvenMonitor'
import { UpcomingCommitments } from '@/components/dashboard/UpcomingCommitments'
import { AccountBalances } from '@/components/dashboard/AccountBalances'
import { PharmacyMetrics } from '@/components/dashboard/PharmacyMetrics'
import { ExpenseDistribution } from '@/components/dashboard/ExpenseDistribution'
import { SalesTargetProgress } from '@/components/dashboard/SalesTargetProgress'
import { PricingAssistant } from '@/components/dashboard/PricingAssistant'
import { PerformanceEvolutionChart } from '@/components/dashboard/PerformanceEvolutionChart'
import { PrintableReport } from '@/components/dashboard/PrintableReport'
import { StatusDetailPanel } from '@/components/dashboard/StatusDetailPanel'

export default function Index() {
  return (
    <>
      <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in print:hidden">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Filters */}
          <div className="w-[180px] hidden md:block">
            <SidebarFilters />
          </div>

          {/* Main Dashboard Area */}
          <div className="flex-1 bg-[#f1f5f9] p-3 flex flex-col gap-3 overflow-y-auto">
            {/* Top row: KPIs */}
            <KpiCards />

            {/* Second row: Performance Chart (Large & prominent) */}
            <div className="w-full">
              <PerformanceEvolutionChart />
            </div>

            {/* Third row: Pharmacy Metrics */}
            <PharmacyMetrics />

            {/* Fourth row: Main tools and monitors */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[400px]">
              {/* Left Column (Monitors) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="shrink-0">
                  <SalesTargetProgress />
                </div>
                <div className="flex-1 min-h-[200px] h-full">
                  <BreakEvenMonitor />
                </div>
              </div>

              {/* Middle Column (Expenses) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="flex-1 min-h-[200px] h-full">
                  <UpcomingCommitments />
                </div>
                <div className="shrink-0">
                  <ExpenseDistribution />
                </div>
              </div>

              {/* Right Column (Tools & Accounts) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="shrink-0">
                  <PricingAssistant />
                </div>
                <div className="flex-1 min-h-[200px] h-full overflow-hidden">
                  <AccountBalances />
                </div>
              </div>
            </div>

            <StatusDetailPanel />
          </div>
        </div>
      </div>
      <PrintableReport />
    </>
  )
}
