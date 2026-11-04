// Calendário civil oficial do Brasil (gregoriano):
// o número de dias de um mês depende apenas do mês e do ano (bissexto a cada 4 anos,
// exceto séculos não divisíveis por 400 — regra completa de ano bissexto).
export function getDaysInMonth(month: number | string, year: number | string): number {
  const m = Number(month)
  const y = Number(year)
  if (!Number.isFinite(m) || !Number.isFinite(y) || m < 1 || m > 12) return 31
  return new Date(y, m, 0).getDate()
}

/** Lista de dias (1..N) do mês/ano informados, já com padding de 2 dígitos. */
export function getMonthDayOptions(month: number | string, year: number | string): number[] {
  return Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1)
}

/**
 * Ajusta uma data YYYY-MM-DD para o último dia válido do mês/ano informados,
 * quando o dia informado não existe naquele mês (ex: dia 31 em novembro).
 * Datas dentro do mês são mantidas como estão.
 */
export function clampDateToMonth(
  dateYMD: string,
  month: number | string,
  year: number | string,
): string {
  if (!dateYMD || !/^\d{4}-\d{2}-\d{2}$/.test(dateYMD)) return dateYMD
  const [y, , d] = dateYMD.split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(d)) return dateYMD
  const lastDay = getDaysInMonth(month, year)
  if (d <= lastDay) return dateYMD
  const m = String(Number(month)).padStart(2, '0')
  return `${year}-${m}-${String(lastDay).padStart(2, '0')}`
}
