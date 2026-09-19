export function getEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

export interface HolidayInfo {
  name: string
}

export function getHolidayInfo(date: Date): HolidayInfo | null {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  // Feriados Nacionais Fixos do Brasil
  const fixedHolidays: { day: number; month: number; name: string }[] = [
    { day: 1, month: 0, name: 'CONFRATERNIZAÇÃO UNIVERSAL' }, // 01/01
    { day: 21, month: 3, name: 'TIRADENTES' }, // 21/04
    { day: 1, month: 4, name: 'DIA DO TRABALHO' }, // 01/05
    { day: 7, month: 8, name: 'INDEPENDÊNCIA DO BRASIL' }, // 07/09
    { day: 12, month: 9, name: 'NOSSA SENHORA APARECIDA' }, // 12/10
    { day: 2, month: 10, name: 'FINADOS' }, // 02/11
    { day: 15, month: 10, name: 'PROCLAMAÇÃO DA REPÚBLICA' }, // 15/11
    { day: 25, month: 11, name: 'NATAL' }, // 25/12
  ]

  const fixed = fixedHolidays.find((h) => h.day === day && h.month === month)
  if (fixed) {
    return { name: fixed.name }
  }

  // Feriados Nacionais Móveis (baseados no algoritmo de Páscoa)
  const easter = getEaster(year)

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth()

  // Carnaval (Terça-feira de Carnaval: Páscoa - 47 dias)
  const carnaval = new Date(easter)
  carnaval.setDate(easter.getDate() - 47)
  if (isSameDate(date, carnaval)) {
    return { name: 'CARNAVAL' }
  }

  // Sexta-feira Santa / Paixão de Cristo (Páscoa - 2 dias)
  const sextaSanta = new Date(easter)
  sextaSanta.setDate(easter.getDate() - 2)
  if (isSameDate(date, sextaSanta)) {
    return { name: 'SEXTA-FEIRA SANTA (PAIXÃO DE CRISTO)' }
  }

  // Corpus Christi (Páscoa + 60 dias)
  const corpusChristi = new Date(easter)
  corpusChristi.setDate(easter.getDate() + 60)
  if (isSameDate(date, corpusChristi)) {
    return { name: 'CORPUS CHRISTI' }
  }

  return null
}

export function isHoliday(date: Date): boolean {
  return getHolidayInfo(date) !== null
}

export interface NonWorkingDayCheck {
  isNonWorking: boolean
  isWeekend: boolean
  isHoliday: boolean
  reason?: string
  nextWorkingDate?: string // YYYY-MM-DD
  nextWorkingDateFormatted?: string // DD/MM/YYYY
  currentDateFormatted?: string // DD/MM/YYYY
}

export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDateToYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDateToBR(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

export function getNextWorkingDay(dateStr: string): { ymd: string; formatted: string } {
  const current = parseLocalDate(dateStr)
  if (!current) return { ymd: dateStr, formatted: dateStr }

  const next = new Date(current)
  // Avança até o próximo dia útil (não sábado, não domingo e não feriado nacional)
  do {
    next.setDate(next.getDate() + 1)
  } while (next.getDay() === 0 || next.getDay() === 6 || isHoliday(next))

  return {
    ymd: formatDateToYMD(next),
    formatted: formatDateToBR(next),
  }
}

export function checkNonWorkingDay(dateStr: string): NonWorkingDayCheck {
  const date = parseLocalDate(dateStr)
  if (!date) {
    return { isNonWorking: false, isWeekend: false, isHoliday: false }
  }

  const dayOfWeek = date.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const holidayInfo = getHolidayInfo(date)
  const isHol = !!holidayInfo

  if (!isWeekend && !isHol) {
    return { isNonWorking: false, isWeekend: false, isHoliday: false }
  }

  let reason = ''
  if (isHol && holidayInfo) {
    reason = `FERIADO NACIONAL (${holidayInfo.name})`
  } else if (dayOfWeek === 6) {
    reason = 'SÁBADO'
  } else if (dayOfWeek === 0) {
    reason = 'DOMINGO'
  }

  const nextWorking = getNextWorkingDay(dateStr)

  return {
    isNonWorking: true,
    isWeekend,
    isHoliday: isHol,
    reason,
    nextWorkingDate: nextWorking.ymd,
    nextWorkingDateFormatted: nextWorking.formatted,
    currentDateFormatted: formatDateToBR(date),
  }
}

export function getWorkingDays(year: number, month: number): number {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  let count = 0

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // 0 is Sunday
    if (d.getDay() !== 0 && !isHoliday(d)) {
      count++
    }
  }

  return count
}
