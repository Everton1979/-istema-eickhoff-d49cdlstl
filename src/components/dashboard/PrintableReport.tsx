import { useEffect, useState } from 'react'
import { useFinanceStore } from '@/stores/financeStore'

export function PrintableReport({ exportFilters }: { exportFilters: any }) {
  const { transactions } = useFinanceStore()
  const [shouldPrint, setShouldPrint] = useState(false)
  const [exportTransactions, setExportTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!exportFilters) return

    const filtered = transactions.filter((t) => {
      let txDateStr = ''
      if (t.date.includes('T')) {
        const d = new Date(t.date)
        txDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      } else {
        txDateStr = t.date
      }

      if (exportFilters.startDate && txDateStr < exportFilters.startDate) return false
      if (exportFilters.endDate && txDateStr > exportFilters.endDate) return false
      if (exportFilters.type && exportFilters.type !== 'ALL' && t.type !== exportFilters.type)
        return false

      if (t.type === 'PARTNER_WITHDRAWAL') return false

      return true
    })

    setExportTransactions(filtered)

    if (exportFilters.format === 'excel') {
      const totalEntradas = filtered
        .filter((t) => t.type === 'INCOME' && t.status === 'REALIZADO')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const totalSaidas = filtered
        .filter((t) => t.type === 'EXPENSE' && t.status === 'REALIZADO')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const totalInvestimentos = filtered
        .filter((t) => t.type === 'INVESTIMENTO' && t.status === 'REALIZADO')
        .reduce((acc, t) => acc + Number(t.amount), 0)

      const lucro = totalEntradas - totalSaidas - totalInvestimentos

      const typeLabel =
        exportFilters.type === 'ALL'
          ? 'Todos os Lançamentos'
          : exportFilters.type === 'INCOME'
            ? 'Apenas Receitas'
            : 'Apenas Despesas'
      const periodLabel = `${(exportFilters.startDate || '').split('-').reverse().join('/')} até ${(exportFilters.endDate || '').split('-').reverse().join('/')}`

      const kpiRows = [
        ['Resumo Financeiro', 'Valor'],
        ['Período', periodLabel],
        ['Filtro de Tipo', typeLabel],
        [],
        ['Total Entradas', totalEntradas.toFixed(2).replace('.', ',')],
        ['Total Despesas Operacionais', totalSaidas.toFixed(2).replace('.', ',')],
        ['Investimentos', totalInvestimentos.toFixed(2).replace('.', ',')],
        ['Saldo Final (Caixa)', lucro.toFixed(2).replace('.', ',')],
        [],
        ['Detalhamento de Transações'],
      ]

      const headers = ['Data', 'Descrição', 'Observações', 'Categoria', 'Tipo', 'Valor']
      const rows = filtered.map((t) => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.tags || '').replace(/"/g, '""')}"`,
        `"${((t.category as any) || (t as any).categoryId || '').replace(/"/g, '""')}"`,
        t.type === 'INCOME' ? 'ENTRADA' : t.type === 'INVESTIMENTO' ? 'INVESTIMENTO' : 'SAIDA',
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
        `relatorio_financeiro_${exportFilters.startDate}_a_${exportFilters.endDate}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    if (exportFilters.format === 'pdf') {
      setShouldPrint(true)
    }
  }, [exportFilters, transactions])

  if (!shouldPrint || !exportFilters || exportFilters.format !== 'pdf') return null

  const totalEntradas = exportTransactions
    .filter((t) => t.type === 'INCOME' && t.status === 'REALIZADO')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalSaidas = exportTransactions
    .filter((t) => t.type === 'EXPENSE' && t.status === 'REALIZADO')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalInvestimentos = exportTransactions
    .filter((t) => t.type === 'INVESTIMENTO' && t.status === 'REALIZADO')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const lucro = totalEntradas - totalSaidas - totalInvestimentos

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const typeLabel =
    exportFilters.type === 'ALL'
      ? 'Todos os Lançamentos'
      : exportFilters.type === 'INCOME'
        ? 'Apenas Receitas'
        : 'Apenas Despesas'
  const periodLabel = `${(exportFilters.startDate || '').split('-').reverse().join('/')} até ${(exportFilters.endDate || '').split('-').reverse().join('/')}`

  const handlePrintLegacy = () => {
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    const rowsHtml = exportTransactions
      .map((t) => {
        const typeBadgeClass =
          t.type === 'INCOME'
            ? 'badge-income'
            : t.type === 'INVESTIMENTO'
              ? 'badge-invest'
              : 'badge-expense'
        const typeLabel =
          t.type === 'INCOME' ? 'Receita' : t.type === 'INVESTIMENTO' ? 'Investimento' : 'Despesa'
        const valueClass = t.type === 'INCOME' ? 'text-income' : 'text-expense'
        const catName = (t.category as any) || (t as any).categoryId || '-'

        return `
          <tr>
            <td class="nowrap">${new Date(t.date).toLocaleDateString('pt-BR')}</td>
            <td class="bold">${escapeHtml(t.description || '-')}</td>
            <td class="text-muted">${escapeHtml(t.tags || '-')}</td>
            <td class="text-muted">${escapeHtml(catName)}</td>
            <td><span class="badge ${typeBadgeClass}">${typeLabel}</span></td>
            <td class="amount ${valueClass}">${t.type === 'INCOME' ? '+' : '-'}${formatCurrency(Number(t.amount))}</td>
          </tr>
        `
      })
      .join('')

    const printHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>RELATÓRIO FINANCEIRO - SISTEMA EICKHOFF</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 10mm 14mm 10mm;
      @top-center {
        content: "SISTEMA EICKHOFF • RELATÓRIO FINANCEIRO • PERÍODO: ${periodLabel.toUpperCase()}";
        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #64748b;
        text-transform: uppercase;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 4px;
        margin-bottom: 6px;
      }
      @bottom-right {
        content: "PÁGINA " counter(page) " DE " counter(pages);
        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #475569;
        text-transform: uppercase;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #0f172a;
      font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9.5pt;
      line-height: 1.35;
    }

    table.master-layout {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }

    thead.master-header {
      display: table-header-group;
    }

    tfoot.master-footer {
      display: table-footer-group;
    }

    tbody.master-body {
      display: table-row-group;
    }

    .master-header-cell {
      padding: 0 0 10px 0;
      border: none;
    }

    .master-footer-cell {
      padding: 8px 0 0 0;
      border: none;
    }

    .master-content-cell {
      padding: 0;
      border: none;
    }

    .doc-running-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .doc-brand {
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #0f172a;
      text-transform: uppercase;
    }

    .doc-period-tag {
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      text-transform: uppercase;
    }

    .doc-running-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 6px;
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
    }

    .page-number-native::after {
      content: "PÁGINA " counter(page);
      font-weight: 700;
      color: #334155;
    }

    .section-title-box {
      background: #1e293b;
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      break-after: avoid;
      page-break-after: avoid;
    }

    .section-title-box h1 {
      margin: 0;
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .card-kpi {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: left;
    }

    .card-kpi .kpi-label {
      font-size: 7pt;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 3px;
    }

    .card-kpi .kpi-value {
      font-size: 11pt;
      font-weight: 900;
      letter-spacing: -0.2px;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }

    table.data-table thead {
      display: table-header-group;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    table.data-table thead th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      padding: 6px 6px;
      border-bottom: 1.5px solid #cbd5e1;
      border-top: 1px solid #cbd5e1;
      text-align: left;
      font-size: 7.5pt;
      letter-spacing: 0.3px;
    }

    table.data-table thead th.amount {
      text-align: right;
    }

    table.data-table tbody tr {
      break-inside: avoid;
      page-break-inside: avoid;
      border-bottom: 1px solid #e2e8f0;
    }

    table.data-table tbody tr:nth-child(even) {
      background: #fbfcfe;
    }

    table.data-table td {
      padding: 5px 6px;
      vertical-align: middle;
      color: #1e293b;
    }

    table.data-table td.amount {
      text-align: right;
      font-weight: 700;
      white-space: nowrap;
    }

    .nowrap { white-space: nowrap; }
    .bold { font-weight: 700; }
    .text-muted { color: #64748b; font-size: 7.5pt; }
    .text-income { color: #15803d; }
    .text-expense { color: #b91c1c; }
    .text-invest { color: #4338ca; }

    .badge {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .badge-income { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .badge-expense { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .badge-invest { background: #e0e7ff; color: #4338ca; border: 1px solid #a5b4fc; }
  </style>
</head>
<body>
  <table class="master-layout">
    <thead class="master-header">
      <tr>
        <td class="master-header-cell">
          <div class="doc-running-header">
            <div class="doc-brand">SISTEMA EICKHOFF • GESTÃO FINANCEIRA</div>
            <div class="doc-period-tag">PERÍODO: ${periodLabel.toUpperCase()}</div>
          </div>
        </td>
      </tr>
    </thead>
    <tfoot class="master-footer">
      <tr>
        <td class="master-footer-cell">
          <div class="doc-running-footer">
            <div>SISTEMA EICKHOFF • DOCUMENTO CONFIDENCIAL</div>
            <div class="page-number-native"></div>
          </div>
        </td>
      </tr>
    </tfoot>
    <tbody class="master-body">
      <tr>
        <td class="master-content-cell">
          <div class="section-title-box">
            <h1>RELATÓRIO FINANCEIRO DE ENTRADAS E SAÍDAS</h1>
            <span style="background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 4px; font-size: 8pt; font-weight: 700;">
              ${typeLabel.toUpperCase()}
            </span>
          </div>

          <div class="summary-grid">
            <div class="card-kpi">
              <div class="kpi-label">TOTAL RECEITAS</div>
              <div class="kpi-value text-income">${formatCurrency(totalEntradas)}</div>
            </div>
            <div class="card-kpi">
              <div class="kpi-label">DESPESAS OPERACIONAIS</div>
              <div class="kpi-value text-expense">${formatCurrency(totalSaidas)}</div>
            </div>
            <div class="card-kpi">
              <div class="kpi-label">INVESTIMENTOS</div>
              <div class="kpi-value text-invest">${formatCurrency(totalInvestimentos)}</div>
            </div>
            <div class="card-kpi">
              <div class="kpi-label">SALDO FINAL (CAIXA)</div>
              <div class="kpi-value ${lucro >= 0 ? 'text-income' : 'text-expense'}">${formatCurrency(lucro)}</div>
            </div>
          </div>

          <div style="margin-top: 6px;">
            <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
              <span>DETALHAMENTO DE LANÇAMENTOS DO PERÍODO</span>
              <span class="text-muted">${exportTransactions.length} REGISTROS (DO PRIMEIRO AO ÚLTIMO DIA)</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 75px;">DATA</th>
                  <th>DESCRIÇÃO</th>
                  <th style="width: 120px;">OBSERVAÇÕES</th>
                  <th style="width: 110px;">CATEGORIA</th>
                  <th style="width: 80px;">TIPO</th>
                  <th class="amount" style="width: 90px;">VALOR</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`

    const printFrameId = '__eickhoff_print_iframe_legacy__'
    let iframe = document.getElementById(printFrameId) as HTMLIFrameElement | null
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = printFrameId
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)
    }

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument
    if (!frameDoc || !iframe.contentWindow) {
      window.print()
      return
    }

    frameDoc.open()
    frameDoc.write(printHtml)
    frameDoc.close()

    setTimeout(() => {
      try {
        iframe?.contentWindow?.focus()
        iframe?.contentWindow?.print()
      } catch (err) {
        console.error('Erro ao imprimir:', err)
        window.print()
      }
    }, 400)
  }

  return (
    <>
      <style>{`
      @media print {
        html, body {
          overflow: visible !important;
          height: auto !important;
        }
        body * { visibility: hidden; }
        .printable-area, .printable-area * { visibility: visible; }
        .printable-area {
          position: static !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
      }
    `}</style>
      <div className="fixed inset-0 z-50 bg-white text-black overflow-auto p-8 print:p-0">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h2 className="text-xl font-bold">Visualização do Relatório</h2>
          <div className="flex gap-2">
            <button onClick={() => setShouldPrint(false)} className="px-4 py-2 border rounded-md">
              Fechar
            </button>
            <button
              onClick={handlePrintLegacy}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold shadow-sm uppercase text-xs"
            >
              Salvar PDF / Imprimir
            </button>
          </div>
        </div>

        <div className="printable-area max-w-4xl mx-auto">
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-2xl font-bold mb-2">Relatório Financeiro</h1>
            <p className="text-gray-600 font-medium">Período: {periodLabel}</p>
            <p className="text-gray-600">Filtro Aplicado: {typeLabel}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 border rounded-lg bg-gray-50 text-center">
              <p className="text-xs sm:text-sm text-gray-600 uppercase font-bold mb-1">Entradas</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">
                {formatCurrency(totalEntradas)}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 text-center">
              <p className="text-xs sm:text-sm text-gray-600 uppercase font-bold mb-1">
                Despesas Operacionais
              </p>
              <p className="text-lg sm:text-xl font-bold text-red-600">
                {formatCurrency(totalSaidas)}
              </p>
            </div>
            {totalInvestimentos > 0 ? (
              <div className="p-4 border rounded-lg bg-gray-50 text-center">
                <p className="text-xs sm:text-sm text-gray-600 uppercase font-bold mb-1">
                  Investimentos
                </p>
                <p className="text-lg sm:text-xl font-bold text-orange-600">
                  {formatCurrency(totalInvestimentos)}
                </p>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-gray-50 text-center opacity-50">
                <p className="text-xs sm:text-sm text-gray-600 uppercase font-bold mb-1">
                  Investimentos
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-500">R$ 0,00</p>
              </div>
            )}
            <div className="p-4 border rounded-lg bg-gray-50 text-center">
              <p className="text-xs sm:text-sm text-gray-600 uppercase font-bold mb-1">
                Saldo Final
              </p>
              <p
                className={`text-lg sm:text-xl font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}
              >
                {formatCurrency(lucro)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">
              Detalhamento de Transações ({exportTransactions.length})
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-2">Data</th>
                  <th className="text-left py-2 px-2">Descrição</th>
                  <th className="text-left py-2 px-2">Observações</th>
                  <th className="text-left py-2 px-2">Categoria</th>
                  <th className="text-right py-2 px-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {exportTransactions.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-2 px-2">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2 px-2">{t.description}</td>
                    <td className="py-2 px-2">{t.tags || '-'}</td>
                    <td className="py-2 px-2">{(t.category as any) || (t as any).categoryId}</td>
                    <td
                      className={`py-2 px-2 text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {t.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(Number(t.amount))}
                    </td>
                  </tr>
                ))}
                {exportTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Nenhuma transação encontrada no período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
