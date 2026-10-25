import type { Institution } from './types'

/** Catálogo de instituições para o fluxo de conexão. A autorização real depende de um provedor Open Finance. */
export const institutions: Institution[] = [
  { id: 'itau', name: 'Itaú', short: 'IT', color: '#C25E0A', openFinance: true },
  { id: 'nubank', name: 'Nubank', short: 'NU', color: '#820AD1', openFinance: true },
  { id: 'xp', name: 'XP', short: 'XP', color: '#2B2F36', openFinance: true },
  { id: 'bradesco', name: 'Bradesco', short: 'BR', color: '#B0203A', openFinance: true },
  { id: 'santander', name: 'Santander', short: 'SA', color: '#B5281D', openFinance: true },
  { id: 'bb', name: 'Banco do Brasil', short: 'BB', color: '#FCD116', openFinance: true },
  { id: 'caixa', name: 'Caixa', short: 'CX', color: '#005CA9', openFinance: true },
  { id: 'inter', name: 'Inter', short: 'IN', color: '#EA7100', openFinance: true },
  { id: 'c6', name: 'C6 Bank', short: 'C6', color: '#222222', openFinance: true },
  { id: 'btg', name: 'BTG Pactual', short: 'BT', color: '#1A1A1A', openFinance: true },
  { id: 'sicoob', name: 'Sicoob', short: 'SC', color: '#00A859', openFinance: true },
  { id: 'sicredi', name: 'Sicredi', short: 'SI', color: '#3AAA35', openFinance: true },
]

export const institutionByName: Record<string, string> = {
  Itaú: 'itau',
  Nubank: 'nubank',
  XP: 'xp',
  Bradesco: 'bradesco',
  Santander: 'santander',
  'Banco do Brasil': 'bb',
  Caixa: 'caixa',
  Inter: 'inter',
  'C6 Bank': 'c6',
  'BTG Pactual': 'btg',
  Sicoob: 'sicoob',
  Sicredi: 'sicredi',
}

export function institutionOf(id: string) {
  return institutions.find((i) => i.id === id)
}

export function institutionOfBank(bank: string) {
  const id = institutionByName[bank]
  return id ? institutionOf(id) : undefined
}
