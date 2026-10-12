export interface StrategicPeriodMetric {
  period: string
  rawPeriod: string
  entradas: number
  despesas: number
  lucroLiquido: number
  markup: number
  ticket: number
  valuation: number
  custoFixoCapsulas: number
  custoFixoDermato: number
  pisoSegurancaCapsulas: number
  pisoSegurancaDermato: number
  ebitda: number
  totalSystemSales?: number
  rawMaterialCosts?: number
  ordersCount?: number
  numCaps?: number
  numDerm?: number
  cfaCapsulas?: number
  cfaDermato?: number
  netExpense?: number
  propCaps?: number
  propDerm?: number
}

export type StrategicMetricKey =
  | 'entradas'
  | 'despesas'
  | 'lucroLiquido'
  | 'markup'
  | 'ticket'
  | 'valuation'
  | 'custoFixoCapsulas'
  | 'custoFixoDermato'
  | 'pisoSegurancaCapsulas'
  | 'pisoSegurancaDermato'
  | 'ebitda'

export interface StrategicAverages {
  entradas: number
  despesas: number
  lucroLiquido: number
  markup: number
  ticket: number
  valuation: number
  custoFixoCapsulas: number
  custoFixoDermato: number
  pisoSegurancaCapsulas: number
  pisoSegurancaDermato: number
  ebitda: number
  totalSystemSales?: number
  rawMaterialCosts?: number
  ordersCount?: number
}

export interface StrategicSectionConfig {
  title: string
  key: StrategicMetricKey
  fmt: (v: number) => string
  color: string
}

const escapeHtml = (str: string) =>
  (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

/**
 * Gera o SVG de um gráfico de barras estático para impressão limpa e nítida em qualquer motor de impressão / PDF.
 */
function renderBarChartSvg(
  data: StrategicPeriodMetric[],
  key: StrategicMetricKey,
  color: string,
  fmt: (v: number) => string,
): string {
  if (!data || data.length === 0) return ''

  const width = 800
  const height = 180
  const padLeft = 70
  const padRight = 30
  const padTop = 25
  const padBottom = 35

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  const values = data.map((d) => (d[key] as number) || 0)
  const minVal = Math.min(0, ...values)
  const maxVal = Math.max(0, ...values)

  // Range vertical com folga
  const rangeSpan = maxVal - minVal || 1
  const niceMax = maxVal + rangeSpan * 0.15
  const niceMin = minVal < 0 ? minVal - rangeSpan * 0.15 : 0
  const totalSpan = niceMax - niceMin || 1

  const getY = (val: number) => padTop + chartH - ((val - niceMin) / totalSpan) * chartH
  const zeroY = getY(0)

  // 4 linhas de grade horizontais
  const gridSteps = 4
  let gridLinesHtml = ''
  for (let i = 0; i <= gridSteps; i++) {
    const v = niceMin + (totalSpan / gridSteps) * i
    const yPos = getY(v)
    const formattedY =
      key === 'markup'
        ? `${v.toFixed(1)}x`
        : Math.abs(v) >= 1000
          ? `${(v / 1000).toFixed(0)}k`
          : v.toFixed(0)

    gridLinesHtml += `
      <line x1="${padLeft}" y1="${yPos.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${yPos.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${(padLeft - 8).toFixed(1)}" y="${(yPos + 3.5).toFixed(1)}" font-family="Arial, sans-serif" font-size="9" fill="#94a3b8" text-anchor="end">${escapeHtml(formattedY)}</text>
    `
  }

  // Linha zero sólida
  const zeroLineHtml = `<line x1="${padLeft}" y1="${zeroY.toFixed(1)}" x2="${(width - padRight).toFixed(1)}" y2="${zeroY.toFixed(1)}" stroke="#cbd5e1" stroke-width="1.5" />`

  const n = data.length
  const slotW = chartW / n
  const barW = Math.min(46, Math.max(16, slotW * 0.55))

  let barsHtml = ''
  data.forEach((d, idx) => {
    const val = (d[key] as number) || 0
    const cx = padLeft + idx * slotW + slotW / 2
    const bx = cx - barW / 2
    const yVal = getY(val)
    const barTop = Math.min(zeroY, yVal)
    const barHeight = Math.max(2, Math.abs(zeroY - yVal))
    const formattedLabel = fmt(val)

    barsHtml += `
      <g>
        <rect x="${bx.toFixed(1)}" y="${barTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="3" fill="${color}" stroke="#0f172a" stroke-opacity="0.1" stroke-width="0.5" />
        <text x="${cx.toFixed(1)}" y="${(barTop - 6).toFixed(1)}" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#1e293b" text-anchor="middle">${escapeHtml(formattedLabel)}</text>
        <text x="${cx.toFixed(1)}" y="${(height - padBottom + 16).toFixed(1)}" font-family="Arial, sans-serif" font-size="9.5" font-weight="600" fill="#475569" text-anchor="middle">${escapeHtml(d.period)}</text>
      </g>
    `
  })

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; max-height: 200px; display: block; overflow: visible;">
      ${gridLinesHtml}
      ${zeroLineHtml}
      ${barsHtml}
    </svg>
  `
}

export function buildStrategicReportHtml({
  periodLabel,
  periodsData,
  averages,
  sections,
}: {
  periodLabel: string
  periodsData: StrategicPeriodMetric[]
  averages: StrategicAverages
  sections: StrategicSectionConfig[]
}): string {
  const sectionsHtml = sections
    .map((sec) => {
      const avgVal = averages ? averages[sec.key] : 0
      const formattedAvg = sec.fmt(avgVal)
      const chartSvg = renderBarChartSvg(periodsData, sec.key, sec.color, sec.fmt)

      const headerCells = periodsData
        .map(
          (p) => `
            <th class="cell-month">${escapeHtml(p.period)}</th>
          `,
        )
        .join('')

      const valueCells = periodsData
        .map((p) => {
          const val = (p[sec.key] as number) || 0
          return `
            <td class="cell-val">${escapeHtml(sec.fmt(val))}</td>
          `
        })
        .join('')

      return `
        <div class="report-section-card">
          <div class="section-card-header">
            <div class="section-card-title">
              <span class="color-dot" style="background-color: ${sec.color};"></span>
              <h3>${escapeHtml(sec.title.toUpperCase())}</h3>
            </div>
            <div class="section-card-avg">
              MÉDIA DO PERÍODO: <strong>${escapeHtml(formattedAvg)}</strong>
            </div>
          </div>
          
          <div class="section-chart-container">
            ${chartSvg}
          </div>

          <div class="table-wrap">
            <table class="section-table">
              <thead>
                <tr>
                  <th class="cell-indicator">INDICADOR</th>
                  ${headerCells}
                  <th class="cell-avg">MÉDIA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="cell-indicator-name">${escapeHtml(sec.title)}</td>
                  ${valueCells}
                  <td class="cell-avg-val">${escapeHtml(formattedAvg)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>RELATÓRIO ESTRATÉGICO CONSOLIDADO - SISTEMA EICKHOFF</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 10mm 14mm 10mm;
      @top-center {
        content: "SISTEMA EICKHOFF • RELATÓRIO ESTRATÉGICO CONSOLIDADO • PERÍODO: ${escapeHtml(periodLabel.toUpperCase())}";
        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        font-weight: bold;
        color: #64748b;
        text-transform: uppercase;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 4px;
        margin-bottom: 6px;
      }
      @bottom-left {
        content: "DOCUMENTO GERADO PELO SISTEMA EICKHOFF";
        font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 7.5pt;
        color: #94a3b8;
        text-transform: uppercase;
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

    /* Layout em tabela mestra para repetição consistente de cabeçalho e rodapé em todos os navegadores */
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

    /* Cabeçalho do documento */
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
      color: #1e293b;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      text-transform: uppercase;
    }

    /* Rodapé do documento */
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

    /* Faixa de título da primeira página */
    .section-title-box {
      background: #1e293b;
      color: #ffffff;
      padding: 9px 12px;
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

    .section-title-box .badge-white {
      background: rgba(255, 255, 255, 0.2);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .info-strip {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .info-strip strong {
      text-transform: uppercase;
      color: #0f172a;
    }

    /* Cards de cada indicador com proteção contra quebra interna */
    .report-section-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;
      margin-bottom: 16px;
      overflow: hidden;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .section-card-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      break-after: avoid;
      page-break-after: avoid;
    }

    .section-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      display: inline-block;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }

    .section-card-title h3 {
      margin: 0;
      font-size: 9.5pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    .section-card-avg {
      font-size: 8.5pt;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }

    .section-card-avg strong {
      color: #0f172a;
      font-weight: 900;
    }

    .section-chart-container {
      padding: 10px 14px 6px 14px;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    table.section-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }

    table.section-table th,
    table.section-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    table.section-table thead th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.3px;
    }

    table.section-table th.cell-indicator,
    table.section-table td.cell-indicator-name {
      text-align: left;
      font-weight: 800;
      color: #1e293b;
      width: 180px;
      text-transform: uppercase;
    }

    table.section-table th.cell-month,
    table.section-table td.cell-val {
      text-align: right;
      white-space: nowrap;
      min-width: 75px;
    }

    table.section-table td.cell-val {
      font-weight: 600;
      color: #1e293b;
    }

    table.section-table th.cell-avg,
    table.section-table td.cell-avg-val {
      text-align: right;
      white-space: nowrap;
      background: #f8fafc;
      font-weight: 900;
      color: #0f172a;
      border-left: 1px solid #e2e8f0;
      min-width: 90px;
    }
  </style>
</head>
<body>
  <table class="master-layout">
    <thead class="master-header">
      <tr>
        <td class="master-header-cell">
          <div class="doc-running-header">
            <div class="doc-brand">SISTEMA EICKHOFF • GESTÃO ESTRATÉGICA</div>
            <div class="doc-period-tag">PERÍODO: ${escapeHtml(periodLabel.toUpperCase())}</div>
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
            <h1>RELATÓRIO ESTRATÉGICO CONSOLIDADO</h1>
            <span class="badge-white">ANÁLISE COMPARATIVA MENSAL</span>
          </div>

          <div class="info-strip">
            <div>
              <strong>PERÍODO SELECIONADO:</strong> ${escapeHtml(periodLabel.toUpperCase())}
            </div>
            <div>
              <strong>MESES CONSOLIDADOS:</strong> ${periodsData.length} MESES
            </div>
          </div>

          ${sectionsHtml}
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`
}

/**
 * Dispara a impressão no iframe oculto isolado, replicando com perfeição a UX de ExportReportDialog.
 */
export function printStrategicReportHtml(htmlContent: string) {
  const printFrameId = '__eickhoff_strategic_print_iframe__'
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
  frameDoc.write(htmlContent)
  frameDoc.close()

  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus()
      iframe?.contentWindow?.print()
    } catch (err) {
      console.error('Erro ao acionar impressão via iframe:', err)
      window.print()
    }
  }, 400)
}
