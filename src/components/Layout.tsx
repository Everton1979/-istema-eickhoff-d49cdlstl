import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { InpiSeal } from './InpiSeal'
import { AdminNotificationBadge } from './AdminNotificationBadge'

import { ArrowRightLeft } from 'lucide-react'

export default function Layout({
  isDemo = false,
  children,
}: {
  isDemo?: boolean
  children?: React.ReactNode
}) {
  const { profile, isColaborador, canManageUsers } = useAuth()
  const location = useLocation()
  const isDemoEffective = isDemo || location.pathname.startsWith('/demo')

  const companyName = isDemoEffective
    ? 'Farmácia Magistral Modelo (Demo)'
    : profile?.company_name || 'Controle Financeiro'
  const companyInitials = companyName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Topbar Navigation */}
      <header className="h-16 bg-[#0f172a] text-white flex items-center px-4 md:px-6 shrink-0 shadow-md z-20 justify-between sticky top-0">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white shadow-sm uppercase">
              {companyInitials}
            </div>
            <span className="font-bold text-lg tracking-wide hidden sm:block">
              $istema Eickhoff
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {isDemoEffective ? (
              <Link
                to="/demo"
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium bg-blue-600 text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Painel Geral</span>
              </Link>
            ) : !isColaborador ? (
              <Link
                to="/dashboard"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                  location.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Painel Geral</span>
              </Link>
            ) : (
              <Link
                to="/transacoes"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                  location.pathname === '/transacoes'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                )}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Lançamentos</span>
              </Link>
            )}
            {!isDemoEffective && canManageUsers && <AdminNotificationBadge />}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-slate-50">{children ?? <Outlet />}</main>

      {/* Footer / Floating Elements */}
      <InpiSeal />
    </div>
  )
}
