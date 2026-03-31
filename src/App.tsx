import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinanceProvider } from '@/stores/financeStore'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Index from './pages/Index'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import Glossary from './pages/Glossary'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: string[]
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

  if (allowedRoles) {
    if (!profile) return <Navigate to="/" replace />
    if (!allowedRoles.includes(profile.role)) return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <FinanceProvider>
        <TooltipProvider delayDuration={100}>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
              <Route path="/configuracoes" element={<Navigate to="/usuarios" replace />} />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute allowedRoles={['Administrador']}>
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
)

export default App
