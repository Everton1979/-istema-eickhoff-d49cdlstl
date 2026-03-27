import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { format } from 'date-fns'

export function PrintableReport() {
  const { filteredTransactions, filters } = useFinanceStore()

  const currentYear = filters.years[0] || new Date().getFullYear().toString()
  const currentMonth = filters.months.length > 0 ? filters.months[0] : ''

  const metrics = useMemo(() => {
    let receitas = 0
    let despesas = 0

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'REALIZADO') {
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
  }, [filteredTransactions])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black font-sans w-full h-full min-h-screen max-w-[210mm] mx-auto overflow-visible">
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-800">
          Relatório Financeiro Gerencial
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Período: {currentMonth ? `${currentMonth}/` : 'Ano '}
          {currentYear} | Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </p>
      </div>

      <div className="mb-8 max-w-md">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-1 mb-3">Resumo Operacional</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-600">Receitas (Realizadas)</td>
              <td className="py-2 text-right font-bold text-emerald-600">
                {formatCurrency(metrics.receitas)}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-600">Despesas Totais (Caixa)</td>
              <td className="py-2 text-right font-bold text-red-600">
                {formatCurrency(metrics.despesas)}
              </td>
            </tr>
            <tr className="bg-slate-50">
              <td className="py-2 px-2 font-semibold text-slate-800">Lucro Operacional (Caixa)</td>
              <td className="py-2 px-2 text-right font-bold text-slate-800">
                {formatCurrency(metrics.lucro)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6 page-break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-800 pb-1 mb-3">
          Extrato de Lançamentos
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
            {filteredTransactions
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((t) => (
                <tr key={t.id} className="border-b border-slate-200">
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    {format(new Date(t.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-1.5 px-2">
                    {t.description}
                    {t.tags && <span className="text-slate-400 ml-1">[{t.tags}]</span>}
                  </td>
                  <td className="py-1.5 px-2">
                    {t.type === 'INCOME'
                      ? 'Receita'
                      : t.categoryId === 'FIXA'
                        ? 'Fixa'
                        : 'Variável'}{' '}
                    {t.type === 'EXPENSE' && t.subcategoryId
                      ? `(${t.subcategoryId === 'materia_prima' ? 'Matéria-prima' : t.subcategoryId === 'embalagens' ? 'Embalagens' : t.subcategoryId === 'medicamentos_drogaria' ? 'Medicamentos (Drogaria)' : 'Outros'})`
                      : ''}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-medium whitespace-nowrap ${
                      t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <p className="text-[10px] text-slate-500 mt-2 italic">
          * Todos os lançamentos do período selecionado estão listados acima.
        </p>
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-400 border-t pt-4">
        Controle Financeiro Planilha - Documento Interno
      </div>
    </div>
  )
}
