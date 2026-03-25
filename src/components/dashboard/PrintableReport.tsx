import { useFinanceStore } from '@/stores/financeStore'
import { useMemo } from 'react'
import { format } from 'date-fns'

export function PrintableReport() {
  const { filteredTransactions, filteredMonthlyMetrics, filters } = useFinanceStore()

  const currentYear = filters.years[0] || new Date().getFullYear().toString()
  const currentMonth = filters.months.length > 0 ? filters.months[0] : ''

  const metrics = useMemo(() => {
    let receitas = 0
    let despesas = 0
    let varExpOperacional = 0
    let custosVariaveis = 0
    let fixas = 0

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'REALIZADO') {
        if (tx.type === 'INCOME') {
          receitas += tx.amount
        } else {
          despesas += tx.amount
          if (tx.categoryId === 'FIXA') fixas += tx.amount
          if (tx.categoryId === 'VARIAVEL') {
            custosVariaveis += tx.amount
            if (
              tx.subcategoryId !== 'materia_prima' &&
              tx.subcategoryId !== 'embalagens' &&
              tx.subcategoryId !== 'medicamentos_drogaria'
            ) {
              varExpOperacional += tx.amount
            }
          }
        }
      }
    })

    const totalSales = filteredMonthlyMetrics.reduce((sum, m) => sum + m.total_system_sales, 0)
    const target = filteredMonthlyMetrics.reduce((sum, m) => sum + m.sales_target, 0)
    const rawMaterial = filteredMonthlyMetrics.reduce((sum, m) => sum + m.raw_material_costs, 0)
    const orders = filteredMonthlyMetrics.reduce((sum, m) => sum + m.orders_count, 0)

    const lucro = receitas - despesas
    const ticket = orders > 0 ? totalSales / orders : 0

    const divisor =
      totalSales > 0 ? (totalSales - (fixas + varExpOperacional + rawMaterial)) / totalSales : 0
    const markup = divisor > 0 ? 1 / divisor : 1

    return {
      receitas,
      despesas,
      lucro,
      totalSales,
      target,
      rawMaterial,
      ticket,
      markup,
      fixas,
      custosVariaveis,
    }
  }, [filteredTransactions, filteredMonthlyMetrics])

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

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800 border-b pb-1 mb-3">
            Resumo Operacional
          </h2>
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
                <td className="py-2 px-2 font-semibold text-slate-800">
                  Lucro Operacional (Caixa)
                </td>
                <td className="py-2 px-2 text-right font-bold text-slate-800">
                  {formatCurrency(metrics.lucro)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 border-b pb-1 mb-3">
            Métricas da Farmácia (Fechamento)
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Vendas do Sistema</td>
                <td className="py-2 text-right font-bold">{formatCurrency(metrics.totalSales)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Meta de Vendas</td>
                <td className="py-2 text-right font-bold text-slate-800">
                  {formatCurrency(metrics.target)}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Ticket Médio</td>
                <td className="py-2 text-right font-bold text-blue-600">
                  {formatCurrency(metrics.ticket)}
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="py-2 px-2 font-semibold text-slate-800">Markup (Multiplicador)</td>
                <td className="py-2 px-2 text-right font-bold text-purple-600">
                  {metrics.markup.toFixed(2)}x
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 page-break-inside-avoid">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-800 pb-1 mb-3">
          Extrato de Despesas (Top 30)
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
              .filter((t) => t.type === 'EXPENSE')
              .slice(0, 30)
              .map((t) => (
                <tr key={t.id} className="border-b border-slate-200">
                  <td className="py-1.5 px-2">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                  <td className="py-1.5 px-2">
                    {t.description}
                    {t.tags && <span className="text-slate-400 ml-1">[{t.tags}]</span>}
                  </td>
                  <td className="py-1.5 px-2">
                    {t.categoryId === 'FIXA' ? 'Fixa' : 'Variável'}{' '}
                    {t.subcategoryId
                      ? `(${t.subcategoryId === 'materia_prima' ? 'Matéria-prima' : t.subcategoryId === 'embalagens' ? 'Embalagens' : t.subcategoryId === 'medicamentos_drogaria' ? 'Medicamentos (Drogaria)' : 'Outros'})`
                      : ''}
                  </td>
                  <td className="py-1.5 px-2 text-right text-red-600 font-medium">
                    {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {filteredTransactions.filter((t) => t.type === 'EXPENSE').length > 30 && (
          <p className="text-[10px] text-slate-500 mt-2 italic">
            * Listando apenas as 30 despesas mais recentes no período selecionado.
          </p>
        )}
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-400 border-t pt-4">
        Controle Financeiro Planilha - Documento Interno
      </div>
    </div>
  )
}
