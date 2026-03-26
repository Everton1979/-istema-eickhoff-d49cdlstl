import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ReceiptText, Users, BookOpen, Menu, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { HelpModal } from '@/components/HelpModal'

export default function Layout() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()

  const allNavItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      allowed: ['Administrador', 'Colaborador', 'Visitante'],
    },
    {
      name: 'Transações',
      path: '/transacoes',
      icon: ReceiptText,
      allowed: ['Administrador', 'Colaborador', 'Visitante'],
    },
    {
      name: 'Glossário',
      path: '/glossario',
      icon: BookOpen,
      allowed: ['Administrador', 'Colaborador', 'Visitante'],
    },
    {
      name: 'Usuários',
      path: '/usuarios',
      icon: Users,
      allowed: ['Administrador'],
    },
  ]

  const navItems = allNavItems.filter((item) => profile && item.allowed.includes(profile.role))

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isPrimary = item.name === 'Dashboard' || item.name === 'Transações'
        const isActive = location.pathname === item.path

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
              isActive
                ? 'text-white border-b-2 border-green-500 font-bold'
                : 'text-blue-100 hover:text-white',
              isPrimary && !isActive ? 'font-bold' : 'font-medium',
              isPrimary && 'text-blue-50',
            )}
          >
            <item.icon className={cn('w-4 h-4', isPrimary && 'text-green-400')} />
            {item.name}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-30">
        <div className="w-full px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center text-primary text-xs">
                CF
              </div>
              Controle Financeiro 5.4
            </div>
          </div>

          <nav className="hidden md:flex h-full items-center">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-blue-100">{user?.email}</span>
              <span className="text-[10px] uppercase text-blue-300 font-semibold">
                {profile?.role}
              </span>
            </div>
            <HelpModal />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-white hover:bg-primary/80"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[240px] bg-primary text-white border-none pt-10"
              >
                <div className="flex flex-col gap-4">
                  <div className="mb-4 pb-4 border-b border-blue-800">
                    <span className="block text-sm font-medium text-blue-100">{user?.email}</span>
                    <span className="block text-[10px] uppercase text-blue-300 font-semibold mt-1">
                      {profile?.role}
                    </span>
                  </div>
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 md:px-6 py-4 flex flex-col gap-4 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
