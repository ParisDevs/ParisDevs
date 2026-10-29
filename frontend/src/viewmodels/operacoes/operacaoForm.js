import { isoDateToday } from '@/lib/period'

export function toInputDateTime(iso) {
  if (!iso) return `${isoDateToday()}T09:00`
  const value = String(iso)
  if (value.length >= 16) return value.slice(0, 16)
  if (value.length >= 10) return `${value.slice(0, 10)}T09:00`
  return `${isoDateToday()}T09:00`
}

export function toApiDateTime(value) {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

export const EMPTY_OPERACAO_FORM = {
  idContaBancaria: '',
  tipoOperacao: 'RECEBIMENTO',
  valorOperacao: '',
  razaoSocial: '',
  categoria: '',
  dtHora: toInputDateTime(''),
}

export function formFromOperacao(op) {
  return {
    idContaBancaria: op?.accountId ?? '',
    tipoOperacao: op?.tipo || 'RECEBIMENTO',
    valorOperacao: op?.amount ? String(op.amount) : '',
    razaoSocial: op?.razaoSocial ?? '',
    categoria: op?.category ?? '',
    dtHora: toInputDateTime(op?.dtHora),
  }
}

export function validateOperacaoForm(form) {
  const valor = Number(String(form.valorOperacao).replace(',', '.'))
  if (!form.idContaBancaria) return 'Informe a conta bancária.'
  if (form.tipoOperacao !== 'RECEBIMENTO' && form.tipoOperacao !== 'PAGAMENTO') return 'Informe o tipo da operação.'
  if (!Number.isFinite(valor) || valor <= 0) return 'Informe um valor maior que zero.'
  if (!form.razaoSocial.trim()) return 'Informe a razão social.'
  if (!form.categoria.trim()) return 'Informe a categoria.'
  if (!form.dtHora) return 'Informe a data e a hora.'
  return ''
}

export function operacaoPayload(form) {
  return {
    idContaBancaria: Number(form.idContaBancaria),
    tipoOperacao: form.tipoOperacao,
    valorOperacao: Number(String(form.valorOperacao).replace(',', '.')),
    razaoSocial: form.razaoSocial.trim(),
    categoria: form.categoria.trim(),
    dtHora: toApiDateTime(form.dtHora),
  }
}
