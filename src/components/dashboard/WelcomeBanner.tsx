import { useState, useEffect } from 'react'
import { X, ArrowRightLeft, Database, LayoutDashboard, Sparkles } from 'lucide-react'

interface WelcomeBannerProps {
  onAddTransactionClick: () => void
  onDadosSistemaClick: () => void
  onDashboardClick: () => void
}

const STORAGE_KEY_COUNT = 'onboarding_welcome_banner_count'
const STORAGE_KEY_DISMISSED = 'onboarding_welcome_banner_dismissed'

export function WelcomeBanner({
  onAddTransactionClick,
  onDadosSistemaClick,
  onDashboardClick,
}: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED)
      if (isDismissed === 'true') {
        setIsVisible(false)
        return
      }

      const countStr = localStorage.getItem(STORAGE_KEY_COUNT)
      const count = countStr ? parseInt(countStr, 10) : 0

      if (count < 3) {
        setIsVisible(true)
        localStorage.setItem(STORAGE_KEY_COUNT, (count + 1).toString())
      } else {
        setIsVisible(false)
      }
    } catch (e) {
      console.warn('Erro ao acessar localStorage para banner de onboarding', e)
    }
  }, [])

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, 'true')
    } catch (e) {
      console.warn('Erro ao salvar dismissed no localStorage', e)
    }
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="relative w-full bg-blue-50 border border-blue-200 text-slate-800 rounded-xl p-4 sm:p-5 shadow-sm animate-fade-in transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-8">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-blue-950">
              Bem-vindo ao Sistema Eickhoff! Comece por aqui:
            </h3>
            <p className="text-xs text-blue-700/90 hidden sm:block">
              Siga os passos rápidos abaixo para configurar sua gestão financeira
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={onAddTransactionClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>① Lance sua primeira transação</span>
          </button>

          <button
            type="button"
            onClick={onDadosSistemaClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Database className="w-4 h-4 text-purple-600" />
            <span>② Preencha os Dados do Sistema</span>
          </button>

          <button
            type="button"
            onClick={onDashboardClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>③ Acompanhe seu Dashboard</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fechar banner de boas-vindas"
        className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-blue-100/60 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
