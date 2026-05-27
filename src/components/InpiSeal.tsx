import { ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'

export function InpiSeal() {
  const { profile } = useAuth()

  // Context mapping for future certificate branches based on app_name
  const isSalao = profile?.app_name === 'salao'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full bg-[#0f172a] text-slate-300 hover:text-white border-t border-slate-800 py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 transition-colors text-[11px] sm:text-xs focus:outline-none shrink-0 z-20 relative">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-medium text-center tracking-wide">
            Software Registrado no INPI - Processo Nº: BR512026003002-1{' '}
            <span className="hidden sm:inline">|</span>
            <span className="sm:hidden"> </span> Titular: Everton Eickhoff
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-800 text-lg">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Certificado de Registro INPI
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-5 py-4">
          <div className="w-full max-w-[300px] bg-slate-50 p-2 border border-slate-200 rounded-lg shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src="https://img.usecurling.com/p/600/800?q=official%20certificate%20document&color=gray"
              alt="Certificado INPI"
              className="w-full h-auto rounded border border-slate-200/50 object-cover aspect-[3/4]"
            />
          </div>

          <div className="w-full space-y-3 text-sm text-slate-700 bg-blue-50/50 p-4 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-blue-100 pb-2">
              <span className="font-semibold text-slate-900">Processo Nº:</span>
              <span className="font-mono text-blue-700 font-medium">BR512026003002-1</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="font-semibold text-slate-900">Titular:</span>
              <span className="text-slate-800">Everton Eickhoff</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
