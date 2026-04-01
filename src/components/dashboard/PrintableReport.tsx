import { useEffect, useState } from 'react'
import { useFinanceStore } from '@/stores/financeStore'

export function PrintableReport({ exportFilters }: { exportFilters: any }) {
  const { filteredTransactions, filters } = useFinanceStore()
  const [shouldPrint, setShouldPrint] = useState(false)

  useEffect(() => {
    if (!exportFilters) return

    if (exportFilters.format === 'excel') {
      const totalEntradas = filteredTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const totalSaidas = filteredTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const lucro = totalEntradas - totalSaidas

      const typeLabel =
        filters.type === 'ALL'
          ? 'Todos os Lançamentos'
          : filters.type === 'INCOME'
            ? 'Apenas Receitas'
            : 'Apenas Despesas'
      const periodLabel = `${(filters.startDate || '').split('-').reverse().join('/')} até ${(filters.endDate || '').split('-').reverse().join('/')}`

      const kpiRows = [
        ['Resumo Financeiro', 'Valor'],
        ['Período', periodLabel],
        ['Filtro de Tipo', typeLabel],
        [],
        ['Total Entradas', totalEntradas.toFixed(2).replace('.', ',')],
        ['Total Despesas', totalSaidas.toFixed(2).replace('.', ',')],
        ['Lucro (Saldo)', lucro.toFixed(2).replace('.', ',')],
        [],
        ['Detalhamento de Transações'],
      ]

      const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']
      const rows = filteredTransactions.map((t) => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${((t.category as any) || (t as any).categoryId || '').replace(/"/g, '""')}"`,
        t.type === 'INCOME' ? 'ENTRADA' : 'SAIDA',
        Number(t.amount).toFixed(2).replace('.', ','),
      ])

      const csvContent = [
        ...kpiRows.map((row) => row.join(';')),
        headers.join(';'),
        ...rows.map((row) => row.join(';')),
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `relatorio_financeiro_${filters.startDate}_a_${filters.endDate}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    if (exportFilters.format === 'pdf') {
      setShouldPrint(true)
      setTimeout(() => {
        window.print()
        setShouldPrint(false)
      }, 500)
    }
  }, [exportFilters, filteredTransactions, filters])

  if (!shouldPrint || !exportFilters || exportFilters.format !== 'pdf') return null

  const totalEntradas = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalSaidas = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const lucro = totalEntradas - totalSaidas

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const typeLabel =
    filters.type === 'ALL'
      ? 'Todos os Lançamentos'
      : filters.type === 'INCOME'
        ? 'Apenas Receitas'
        : 'Apenas Despesas'
  const periodLabel = `${(filters.startDate || '').split('-').reverse().join('/')} até ${(filters.endDate || '').split('-').reverse().join('/')}`

  return (
    <div className="hidden print:block p-8 bg-white text-black min-h-screen">
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-2xl font-bold mb-2">Relatório Financeiro</h1>
        <p className="text-gray-600 font-medium">Período: {periodLabel}</p>
        <p className="text-gray-600">Filtro Aplicado: {typeLabel}</p>
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
        <h2 className="text-lg font-bold mb-4 border-b pb-2">
          Detalhamento de Transações ({filteredTransactions.length})
        </h2>
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
                <td className="py-2 px-2">{(t.category as any) || (t as any).categoryId}</td>
                <td
                  className={`py-2 px-2 text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(Number(t.amount))}
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  Nenhuma transação encontrada no período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
