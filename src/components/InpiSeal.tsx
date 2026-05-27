import { ShieldCheck } from 'lucide-react'

export function InpiSeal() {
  return (
    <footer className="w-full bg-[#0f172a] text-slate-300 border-t border-slate-800 py-6 px-4 sm:px-6 shrink-0 z-20 relative print:hidden mt-auto">
      <div className="max-w-screen-2xl mx-auto flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left max-w-4xl">
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20 shrink-0">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide uppercase">
              Certificado de registro no INPI (Instituto Nacional de Propriedade Industrial)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
              O Sistema Eickhoff é um software oficialmente registrado e protegido pela lei de
              direitos autorais no Brasil. A certificação garante a legitimidade, segurança jurídica
              e exclusividade da nossa propriedade intelectual, assegurando que você utiliza uma
              solução 100% autêntica e auditada.
            </p>
            <div className="text-[11px] sm:text-xs font-mono text-blue-400/90 mt-2 font-semibold bg-blue-950/40 inline-block px-2.5 py-1 rounded border border-blue-900/50">
              Processo Oficial INPI: BR512026003002-1
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
