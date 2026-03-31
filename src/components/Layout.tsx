import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Receipt, Users, BookOpen, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { MonthlyClosingDialog } from '@/components/dashboard/MonthlyClosingDialog'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Topbar Navigation */}
      <header className="h-16 bg-[#0f172a] text-white flex items-center px-4 md:px-6 shrink-0 shadow-md z-20 justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white shadow-sm">
              FE
            </div>
            <span className="font-bold text-lg tracking-wide hidden sm:block">
              Farmácia Eickhoff
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
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
              Dashboard
            </Link>

            <Link
              to="/transacoes"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                location.pathname === '/transacoes'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )}
            >
              <Receipt className="w-4 h-4" />
              Transações
            </Link>

            {/* Destaque para Fechamento Mensal ao lado direito de Transações */}
            {profile?.role === 'Administrador' && (
              <div className="ml-2 flex items-center">
                <MonthlyClosingDialog />
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <nav className="flex items-center gap-1 md:gap-2">
            <Link
              to="/glossario"
              className={cn(
                'p-2 rounded-md transition-colors flex items-center gap-2',
                location.pathname === '/glossario'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-white/10',
              )}
              title="Glossário"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:block">Glossário</span>
            </Link>

            {profile?.role === 'Administrador' && (
              <Link
                to="/usuarios"
                className={cn(
                  'p-2 rounded-md transition-colors flex items-center gap-2',
                  location.pathname === '/usuarios'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/10',
                )}
                title="Usuários"
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:block">Usuários</span>
              </Link>
            )}

            <button
              onClick={() => signOut()}
              className="p-2 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors flex items-center gap-2 ml-2"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:block">Sair</span>
            </button>
          </nav>

          {/* Mobile menu fallback for essential links */}
          <div className="flex md:hidden items-center gap-2 ml-2 border-l border-white/10 pl-4">
            <Link to="/dashboard" className="p-2 text-slate-300 hover:text-white">
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <Link to="/transacoes" className="p-2 text-slate-300 hover:text-white">
              <Receipt className="w-5 h-5" />
            </Link>
            {profile?.role === 'Administrador' && (
              <div className="scale-75 origin-left">
                <MonthlyClosingDialog />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}
