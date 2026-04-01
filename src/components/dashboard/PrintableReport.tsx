import { useEffect, useState } from 'react'
import { useFinanceStore } from '@/stores/financeStore'

export function PrintableReport({ exportFilters }: { exportFilters: any }) {
  const { transactions } = useFinanceStore()
  const [shouldPrint, setShouldPrint] = useState(false)

  useEffect(() => {
    if (exportFilters) {
      setShouldPrint(true)
      setTimeout(() => {
        window.print()
        setShouldPrint(false)
      }, 500)
    }
  }, [exportFilters])

  if (!shouldPrint || !exportFilters) return null

  const month = exportFilters.month
  const year = exportFilters.year

  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return false
    const d = new Date(t.date)
    return (
      (d.getMonth() + 1).toString().padStart(2, '0') === month &&
      d.getFullYear().toString() === year
    )
  })

  const totalEntradas = filteredTransactions
    .filter((t) => t.type === 'ENTRADA')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalSaidas = filteredTransactions
    .filter((t) => t.type === 'SAIDA')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const lucro = totalEntradas - totalSaidas

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="hidden print:block p-8 bg-white text-black min-h-screen">
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold mb-2">Relatório Financeiro</h1>
        <p className="text-gray-600">
          Período: {month}/{year}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-lg bg-gray-50 text-center">
          <p className="text-sm text-gray-600 uppercase font-bold mb-1">Total Entradas</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
        </div>
        <div className="p-4 border rounded-lg bg-gray-50 text-center">
          <p className="text-sm text-gray-600 uppercase font-bold mb-1">Total Despesas</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
        </div>
        <div className="p-4 border rounded-lg bg-gray-50 text-center">
          <p className="text-sm text-gray-600 uppercase font-bold mb-1">Lucro (Saldo)</p>
          <p className={`text-xl font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(lucro)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Detalhamento de Transações</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-2 px-2">Data</th>
              <th className="text-left py-2 px-2">Descrição</th>
              <th className="text-left py-2 px-2">Categoria</th>
              <th className="text-right py-2 px-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2 px-2">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td className="py-2 px-2">{t.description}</td>
                <td className="py-2 px-2">{t.category}</td>
                <td
                  className={`py-2 px-2 text-right ${t.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {t.type === 'ENTRADA' ? '+' : '-'}
                  {formatCurrency(Number(t.amount))}
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  Nenhuma transação encontrada no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
