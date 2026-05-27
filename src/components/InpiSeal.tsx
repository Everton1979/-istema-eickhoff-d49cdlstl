import { ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function InpiSeal() {
  return (
    <footer className="w-full bg-[#0f172a] text-slate-300 border-t border-slate-800 py-5 px-4 sm:px-6 shrink-0 z-20 relative print:hidden">
      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5 lg:gap-8">
        {/* INPI Info Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left flex-1">
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20 shrink-0">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 max-w-5xl">
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide uppercase">
              Certificado de registro no INPI (Instituto Nacional de Propriedade Industrial)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
              O Sistema Eickhoff é um software oficialmente registrado e protegido pela lei de
              direitos autorais no Brasil. A certificação garante a legitimidade, segurança jurídica
              e exclusividade da nossa propriedade intelectual, assegurando que você utiliza uma
              solução 100% autêntica e auditada.
            </p>
            <div className="text-[11px] sm:text-xs font-mono text-blue-400/90 mt-1 font-semibold bg-blue-950/40 inline-block px-2.5 py-1 rounded border border-blue-900/50">
              Processo Oficial INPI: BR512026003002-1
            </div>
          </div>
        </div>

        {/* Modal Trigger & Content */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="shrink-0 mt-2 lg:mt-0 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]">
              Visualizar Certificado
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800 text-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Certificado de Registro INPI
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <p className="text-sm text-slate-600 leading-relaxed">
                O Sistema Eickhoff possui registro e proteção de propriedade intelectual homologados
                junto ao Governo Federal do Brasil.
              </p>
              <div className="w-full space-y-4 text-sm text-slate-700 bg-blue-50/60 p-5 rounded-xl border border-blue-100 shadow-sm mt-2">
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-blue-100/80 pb-3 gap-1">
                  <span className="font-semibold text-slate-900">Órgão Regulador:</span>
                  <span className="text-slate-800 sm:text-right">
                    Instituto Nacional da Propriedade Industrial
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-blue-100/80 pb-3 gap-1">
                  <span className="font-semibold text-slate-900">Processo Oficial INPI:</span>
                  <span className="font-mono text-blue-700 font-bold">BR512026003002-1</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-semibold text-slate-900">Titular:</span>
                  <span className="text-slate-800">Everton Eickhoff</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  )
}
