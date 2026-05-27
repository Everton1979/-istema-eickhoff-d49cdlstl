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
    <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg text-slate-700 hover:text-blue-600 hover:bg-slate-50 hover:border-blue-200 px-3 py-2 rounded-full transition-all duration-300 group text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline-block tracking-tight">
              Software Registrado no INPI
            </span>
            <span className="sm:hidden tracking-tight">Registrado INPI</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-800 text-lg">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Certificado de Registro
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-5 py-4">
            <div className="w-full max-w-[280px] bg-slate-50 p-2 border border-slate-200 rounded-lg shadow-sm relative overflow-hidden group">
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
    </div>
  )
}
