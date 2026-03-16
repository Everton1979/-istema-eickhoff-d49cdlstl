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

export function isHoliday(date: Date): boolean {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  // Fixed Brazilian National Holidays
  const fixedHolidays = [
    [1, 0], // 01/01 - Confraternização Universal
    [21, 3], // 21/04 - Tiradentes
    [1, 4], // 01/05 - Dia do Trabalho
    [7, 8], // 07/09 - Independência
    [12, 9], // 12/10 - Nossa Sra Aparecida
    [2, 10], // 02/11 - Finados
    [15, 10], // 15/11 - Proclamação da República
    [25, 11], // 25/12 - Natal
  ]

  if (fixedHolidays.some((h) => h[0] === day && h[1] === month)) {
    return true
  }

  // Floating holidays
  const easter = getEaster(year)

  const carnaval = new Date(easter)
  carnaval.setDate(easter.getDate() - 47)

  const sextaSanta = new Date(easter)
  sextaSanta.setDate(easter.getDate() - 2)

  const corpusChristi = new Date(easter)
  corpusChristi.setDate(easter.getDate() + 60)

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth()

  return (
    isSameDate(date, carnaval) || isSameDate(date, sextaSanta) || isSameDate(date, corpusChristi)
  )
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
