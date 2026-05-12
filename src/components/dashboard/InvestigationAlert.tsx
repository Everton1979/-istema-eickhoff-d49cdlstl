import { CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function InvestigationAlert() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Alert className="bg-emerald-50 border-emerald-200 shadow-sm animate-fade-in relative overflow-hidden mb-6">
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      <AlertTitle className="text-emerald-800 font-bold flex items-center gap-2">
        Divergência Resolvida
      </AlertTitle>
      <AlertDescription className="text-emerald-700 mt-2 flex flex-col gap-3 relative z-10">
        <p className="text-sm">
          As três transações que somavam <strong>R$ 15.325,07</strong> foram revertidas com sucesso
          para o status <strong>REALIZADO</strong>. O seu saldo operacional já reflete a correção.
        </p>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDismissed(true)}
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-100 h-8"
          >
            Dispensar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
