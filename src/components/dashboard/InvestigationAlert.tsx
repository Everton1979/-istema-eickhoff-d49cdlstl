import { ArrowRight, CheckCircle2, Search } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function InvestigationAlert() {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Alert className="bg-blue-50 border-blue-200 shadow-sm animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />
      <Search className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-800 font-bold flex items-center gap-2">
        Relatório de Investigação Concluído
        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
          Novo
        </span>
      </AlertTitle>
      <AlertDescription className="text-blue-700 mt-2 flex flex-col gap-3 relative z-10">
        <p className="text-sm">
          Nossa equipe técnica finalizou a varredura no banco de dados referente à divergência de{' '}
          <strong>R$ 15.325,07</strong>.
        </p>
        <div className="bg-white p-3.5 rounded-lg border border-blue-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
          <div className="flex-1 space-y-1.5">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Causa Encontrada
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identificamos que uma transação no valor exato de <strong>R$ 15.325,07</strong>{' '}
              ("Pagamento Fornecedor - Lote Março") teve seu status alterado de{' '}
              <strong className="text-slate-800">REALIZADO</strong> para{' '}
              <strong className="text-slate-800">PREVISTO</strong> recentemente. Isso fez com que o
              valor saísse da soma das despesas pagas do mês.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[150px]">
            <Button
              size="sm"
              onClick={() => navigate('/auditoria')}
              className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Ver na Auditoria <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-blue-600 hover:bg-blue-50 w-full h-8"
            >
              Ciente, dispensar
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
