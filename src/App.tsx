import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinanceProvider } from '@/stores/financeStore'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { ThemeProvider } from '@/components/ThemeProvider'
import Index from './pages/Index'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import Glossary from './pages/Glossary'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import PendingApproval from './pages/PendingApproval'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import BlockedAccess from './pages/BlockedAccess'

const ProtectedRoute = ({
  children,
  allowedRoles,
  requireActive = true,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
  requireActive?: boolean
}) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireActive && !profile) {
    return <Navigate to="/pendente" replace />
  }

  if (allowedRoles) {
    if (!profile) return <Navigate to="/" replace />
    if (!allowedRoles.includes(profile.role)) return <Navigate to="/" replace />
  }

  // Master / Super Admin tem acesso total
  if (profile?.role === 'Master' || profile?.is_super_admin) {
    return <>{children}</>
  }

  if (requireActive) {
    if (profile?.status === 'Pendente') {
      return <Navigate to="/pendente" replace />
    }

    if (profile?.status === 'Bloqueado') {
      return <Navigate to="/bloqueado" replace />
    }

    if (profile?.plan_end_date) {
      const endDate = new Date(profile.plan_end_date)
      if (new Date() > endDate) {
        return <Navigate to="/bloqueado" replace />
      }
    }
  }

  return <>{children}</>
}

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="app-theme">
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AuthProvider>
        <FinanceProvider>
          <TooltipProvider delayDuration={100}>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/esqueci-a-senha" element={<ForgotPassword />} />
              <Route path="/nova-senha" element={<ResetPassword />} />
              <Route path="/pendente" element={<PendingApproval />} />
              <Route
                path="/bloqueado"
                element={
                  <ProtectedRoute requireActive={false}>
                    <BlockedAccess />
                  </ProtectedRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Index />} />
                <Route path="/transacoes" element={<Transactions />} />
                <Route path="/glossario" element={<Glossary />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/configuracoes" element={<Navigate to="/usuarios" replace />} />
                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
