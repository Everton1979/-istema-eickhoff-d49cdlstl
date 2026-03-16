import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SidebarFilters } from '@/components/dashboard/SidebarFilters'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { TopCategoriesChart } from '@/components/dashboard/TopCategoriesChart'
import { ProfitabilityChart } from '@/components/dashboard/ProfitabilityChart'
import { AccountBalances } from '@/components/dashboard/AccountBalances'

export default function Index() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-md shadow-md border overflow-hidden animate-fade-in">
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Filters */}
        <div className="w-[180px] hidden md:block">
          <SidebarFilters />
        </div>

        {/* Main Dashboard Area */}
        <div className="flex-1 bg-[#f1f5f9] p-2 flex flex-col gap-2 overflow-y-auto">
          <KpiCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-[500px]">
            {/* Left large column */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <div className="flex-1 min-h-[250px]">
                <CashFlowChart />
              </div>
              <div className="flex-1 min-h-[200px]">
                <ProfitabilityChart />
              </div>
            </div>

            {/* Right smaller column */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2 h-[160px]">
                <TopCategoriesChart type="INCOME" title="Top 5 - Entradas" color="#10b981" />
                <TopCategoriesChart type="EXPENSE" title="Top 5 - Saídas" color="#ef4444" />
              </div>
              <div className="flex-1 min-h-[150px]">
                <AccountBalances />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
