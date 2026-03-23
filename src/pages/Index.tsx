import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SidebarFilters } from '@/components/dashboard/SidebarFilters'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { ProfitabilityChart } from '@/components/dashboard/ProfitabilityChart'
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
          <div className="flex-1 bg-[#f1f5f9] p-2 flex flex-col gap-2 overflow-y-auto">
            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <KpiCards />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-auto min-h-[90px]">
                  <SalesTargetProgress />
                  <PricingAssistant />
                </div>
              </div>
              <div className="xl:w-[250px] shrink-0">
                <ExpenseDistribution />
              </div>
            </div>

            <PharmacyMetrics />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-[400px]">
              {/* Left large column */}
              <div className="lg:col-span-2 flex flex-col gap-2">
                <div className="flex-1 min-h-[220px]">
                  <PerformanceEvolutionChart />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 min-h-[200px]">
                  <CashFlowChart />
                  <ProfitabilityChart />
                </div>
              </div>

              {/* Right smaller column */}
              <div className="flex flex-col gap-2">
                <div className="flex-1 min-h-[200px] h-full">
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
