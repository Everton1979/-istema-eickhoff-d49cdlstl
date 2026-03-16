import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ReceiptText, Settings, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transações', path: '/transacoes', icon: ReceiptText },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ]

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-white',
            location.pathname === item.path
              ? 'text-white border-b-2 border-green-500'
              : 'text-blue-100',
          )}
        >
          <item.icon className="w-4 h-4" />
          {item.name}
        </Link>
      ))}
    </>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center text-primary text-xs">
                CF
              </div>
              Controle Financeiro 5.3
            </div>
          </div>

          <nav className="hidden md:flex h-full items-center">
            <NavLinks />
          </nav>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] bg-primary text-white border-none pt-10">
              <div className="flex flex-col gap-4">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col gap-4 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
