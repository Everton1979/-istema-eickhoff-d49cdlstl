import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { format } from 'date-fns'

export function PrintableReport({ exportFilters }: { exportFilters?: any }) {
  const { filteredTransactions, transactions, filters } = useFinanceStore()

  const reportTransactions = useMemo(() => {
    if (!exportFilters) return filteredTransactions

    let filtered = transactions
    if (exportFilters.startDate) {
      filtered = filtered.filter((t) => t.date.substring(0, 10) >= exportFilters.startDate)
    }
    if (exportFilters.endDate) {
      filtered = filtered.filter((t) => t.date.substring(0, 10) <= exportFilters.endDate)
    }
    if (exportFilters.type !== 'ALL') {
      filtered = filtered.filter((t) => t.type === exportFilters.type)
    }

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [transactions, filteredTransactions, exportFilters])

  const currentYear = exportFilters
    ? exportFilters.startDate
      ? exportFilters.startDate.substring(0, 4)
      : 'Personalizado'
    : filters.years[0] || new Date().getFullYear().toString()
  const currentMonth = exportFilters ? '' : filters.months.length > 0 ? filters.months[0] : ''

  const metrics = useMemo(() => {
    let receitas = 0
    let despesas = 0

    reportTransactions.forEach((tx) => {
      if (tx.status === 'REALIZADO' || exportFilters) {
        if (tx.type === 'INCOME') {
          receitas += tx.amount
        } else {
          despesas += tx.amount
        }
      }
    })

    const lucro = receitas - despesas

    return {
      receitas,
      despesas,
      lucro,
    }
  }, [reportTransactions, exportFilters])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const incomeTxs = reportTransactions.filter((t) => t.type === 'INCOME')
  const expenseTxs = reportTransactions.filter((t) => t.type === 'EXPENSE')

  return (
    <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black font-sans w-full h-full min-h-screen max-w-[210mm] mx-auto overflow-visible">
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-800">
          Relatório Financeiro Gerencial
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          {exportFilters ? (
            <>
              Período:{' '}
              {exportFilters.startDate
                ? exportFilters.startDate.split('-').reverse().join('/')
                : 'Início'}{' '}
              até{' '}
              {exportFilters.endDate
                ? exportFilters.endDate.split('-').reverse().join('/')
                : 'Atual'}{' '}
              | Tipo:{' '}
              {exportFilters.type === 'ALL'
                ? 'Todos'
                : exportFilters.type === 'INCOME'
                  ? 'Receitas'
                  : 'Despesas'}
            </>
          ) : (
            <>
              Período: {currentMonth ? `${currentMonth}/` : 'Ano '} {currentYear}
            </>
          )}{' '}
          | Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </p>

        {exportFilters && (
          <div className="mt-4 flex items-center gap-6 text-sm bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="flex-1">
              <span className="text-slate-500 text-xs block uppercase">Total Entradas</span>
              <span className="text-emerald-600 font-bold">{formatCurrency(metrics.receitas)}</span>
            </div>
            <div className="flex-1">
              <span className="text-slate-500 text-xs block uppercase">Total Despesas</span>
              <span className="text-red-600 font-bold">{formatCurrency(metrics.despesas)}</span>
            </div>
            <div className="flex-1">
              <span className="text-slate-500 text-xs block uppercase">Lucro do Período</span>
              <span className="text-blue-600 font-bold">{formatCurrency(metrics.lucro)}</span>
            </div>
          </div>
        )}
      </div>

      {!exportFilters && (
        <div className="mb-8 max-w-md">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-1 mb-3">
            Resumo Operacional
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Receitas Totais</td>
                <td className="py-2 text-right font-bold text-emerald-600">
                  {formatCurrency(metrics.receitas)}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Despesas Totais</td>
                <td className="py-2 text-right font-bold text-red-600">
                  {formatCurrency(metrics.despesas)}
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="py-2 px-2 font-semibold text-slate-800">Saldo do Período</td>
                <td className="py-2 px-2 text-right font-bold text-slate-800">
                  {formatCurrency(metrics.lucro)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {(!exportFilters || exportFilters.type === 'ALL' || exportFilters.type === 'INCOME') &&
        incomeTxs.length > 0 && (
          <div className="mb-6 page-break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-800 pb-1 mb-3">
              Extrato de Receitas
            </h2>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="py-2 px-2 border border-slate-200">Data</th>
                  <th className="py-2 px-2 border border-slate-200">Descrição</th>
                  <th className="py-2 px-2 border border-slate-200">Status</th>
                  <th className="py-2 px-2 border border-slate-200 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {incomeTxs.map((t) => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="py-1.5 px-2 whitespace-nowrap">
                      {t.date.split('T')[0].split('-').reverse().join('/')}
                    </td>
                    <td className="py-1.5 px-2">
                      {t.description}
                      {t.tags && <span className="text-slate-400 ml-1">[{t.tags}]</span>}
                    </td>
                    <td className="py-1.5 px-2">{t.status}</td>
                    <td className="py-1.5 px-2 text-right font-medium whitespace-nowrap text-emerald-600">
                      + {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {(!exportFilters || exportFilters.type === 'ALL' || exportFilters.type === 'EXPENSE') &&
        expenseTxs.length > 0 && (
          <div className="mb-6 page-break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-800 pb-1 mb-3">
              Extrato de Despesas
            </h2>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="py-2 px-2 border border-slate-200">Data</th>
                  <th className="py-2 px-2 border border-slate-200">Descrição</th>
                  <th className="py-2 px-2 border border-slate-200">Categoria</th>
                  <th className="py-2 px-2 border border-slate-200 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {expenseTxs.map((t) => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="py-1.5 px-2 whitespace-nowrap">
                      {t.date.split('T')[0].split('-').reverse().join('/')}
                    </td>
                    <td className="py-1.5 px-2">
                      {t.description}
                      {t.tags && <span className="text-slate-400 ml-1">[{t.tags}]</span>}
                    </td>
                    <td className="py-1.5 px-2">
                      {t.categoryId === 'FIXA' ? 'Fixa' : 'Variável'}
                      {t.subcategoryId
                        ? ` (${t.subcategoryId === 'materia_prima' ? 'Matéria-prima' : t.subcategoryId === 'embalagens' ? 'Embalagens' : t.subcategoryId === 'medicamentos_drogaria' ? 'Medicamentos' : 'Outros'})`
                        : ''}
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium whitespace-nowrap text-red-600">
                      - {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-500 mt-2 italic">
              * Lista completa das despesas do período selecionado.
            </p>
          </div>
        )}

      <div className="mt-12 text-center text-[10px] text-slate-400 border-t pt-4">
        Controle Financeiro Planilha - Documento Interno
      </div>
    </div>
  )
}
