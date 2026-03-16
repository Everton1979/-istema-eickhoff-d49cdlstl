import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useFinanceStore } from '@/stores/financeStore'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function CapCarChart() {
  const { filteredTransactions } = useFinanceStore()

  const data = useMemo(() => {
    let aReceber = 0
    let aPagar = 0
    let aReceberAtrasado = 0
    let aPagarAtrasado = 0

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'PREVISTO') {
        if (tx.type === 'INCOME') aReceber += tx.amount
        else aPagar += tx.amount
      } else if (tx.status === 'VENCIDO') {
        if (tx.type === 'INCOME') aReceberAtrasado += tx.amount
        else aPagarAtrasado += tx.amount
      }
    })

    return [
      {
        name: 'CAP/CAR',
        'A receber': aReceber,
        CAR_Atrasado: aReceberAtrasado,
        'A pagar': aPagar,
        CAP_Atrasado: aPagarAtrasado,
      },
    ]
  }, [filteredTransactions])

  const config = {
    'A receber': { color: '#38bdf8' },
    CAR_Atrasado: { color: '#0284c7' },
    'A pagar': { color: '#f87171' },
    CAP_Atrasado: { color: '#b91c1c' },
  }

  return (
    <div className="bg-white p-2 rounded-sm border shadow-sm flex flex-col h-full">
      <h3 className="text-xs font-bold text-center text-gray-600 mb-2">CAP/CAR - Hoje</h3>
      <ChartContainer config={config} className="h-full min-h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            stackOffset="expand"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" hide />
            <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'transparent' }} />
            <Legend wrapperStyle={{ fontSize: '9px' }} iconType="circle" />
            <Bar dataKey="A receber" stackId="a" fill="var(--color-A receber)" />
            <Bar dataKey="CAR_Atrasado" stackId="a" fill="var(--color-CAR_Atrasado)" />
            <Bar dataKey="A pagar" stackId="b" fill="var(--color-A pagar)" />
            <Bar dataKey="CAP_Atrasado" stackId="b" fill="var(--color-CAP_Atrasado)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
