export function isoDateToday(from = new Date()) {
  const y = from.getFullYear()
  const m = String(from.getMonth() + 1).padStart(2, '0')
  const d = String(from.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function currentMonth(from = new Date()) {
  return `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}`
}

export function lastTwelveMonths(from = new Date()) {
  const months = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  for (let i = 0; i < 12; i += 1) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    months.unshift(`${y}-${m}`)
    cursor.setMonth(cursor.getMonth() - 1)
  }
  return months
}

export function periodRange(period) {
  const [ano, mes] = String(period || '').split('-').map(Number)
  if (!ano || !mes || mes < 1 || mes > 12) {
    throw new Error('O período deve estar no formato YYYY-MM.')
  }
  const inicio = `${period}-01`
  const proximo = new Date(ano, mes, 1)
  const fim = [
    proximo.getFullYear(),
    String(proximo.getMonth() + 1).padStart(2, '0'),
    '01',
  ].join('-')
  return { inicio, fim }
}

export function previousMonth(period, months) {
  const idx = months.indexOf(period)
  if (idx > 0) return months[idx - 1]
  const [ano, mes] = String(period || '').split('-').map(Number)
  if (!ano || !mes) return period
  const d = new Date(ano, mes - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
