import { useState, useEffect } from 'react'
import { X, Sparkles, PlusCircle } from 'lucide-react'

interface WelcomeBannerProps {
  onAddTransactionClick: () => void
}

const STORAGE_KEY_COUNT = 'onboarding_welcome_banner_count'
const STORAGE_KEY_DISMISSED = 'onboarding_welcome_banner_dismissed'

export function WelcomeBanner({ onAddTransactionClick }: WelcomeBannerProps) {
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
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-7 text-white shadow-lg border border-blue-400/30 animate-fade-in transition-all">
      {/* Elementos visuais de fundo decorativos */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-10 h-32 w-32 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pr-8">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30 text-white">
            <Sparkles className="h-7 w-7 text-yellow-300 drop-shadow animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-blue-100 tracking-wide uppercase mb-1">
              Guia de Início
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Bem-vindo ao Sistema Eickhoff!
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5 max-w-xl leading-relaxed">
              Dê o primeiro passo na sua gestão financeira registrando suas receitas e despesas.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
          <button
            type="button"
            onClick={onAddTransactionClick}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm sm:text-base shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>Lance sua primeira transação</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fechar permanentemente o banner de boas-vindas"
        title="Fechar permanentemente"
        className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
