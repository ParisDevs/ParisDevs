/* Formatação em pt-BR. Valor e data aparecem sempre pelo mesmo caminho. */

const moneyFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const numberFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

export const money = (value: number) => moneyFmt.format(value)

export const moneyShort = (value: number) => {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')} mi`
  if (abs >= 1_000) return `R$ ${numberFmt.format(Math.round(value / 1000))} mil`
  return money(value)
}

export const number = (value: number) => numberFmt.format(value)

export const percent = (value: number, digits = 1) =>
  `${value.toFixed(digits).replace('.', ',')}%`

export const signedPercent = (value: number, digits = 1) =>
  `${value > 0 ? '+' : ''}${percent(value, digits)}`

export const date = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export const dateShort = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}`
}

export const dateTime = (iso: string) => {
  const time = iso.slice(11, 16)
  return time ? `${date(iso)} ${time}` : date(iso)
}

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

const MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]

/** '2026-09' -> 'setembro de 2026' */
export const monthLong = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${MONTHS[Number(m) - 1]} de ${y}`
}

/** '2026-09' -> 'set/26' */
export const month = (ym: string) => {
  const [y, m] = ym.split('-')
  return `${MONTHS_SHORT[Number(m) - 1]}/${y.slice(2)}`
}

export const cnpj = (digits: string) => digits

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
