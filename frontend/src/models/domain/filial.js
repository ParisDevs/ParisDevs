export function soDigitos(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatCnpj(value) {
  const digits = soDigitos(value).slice(0, 14)
  const p1 = digits.slice(0, 2)
  const p2 = digits.slice(2, 5)
  const p3 = digits.slice(5, 8)
  const p4 = digits.slice(8, 12)
  const p5 = digits.slice(12, 14)
  if (digits.length <= 2) return p1
  if (digits.length <= 5) return `${p1}.${p2}`
  if (digits.length <= 8) return `${p1}.${p2}.${p3}`
  if (digits.length <= 12) return `${p1}.${p2}.${p3}/${p4}`
  return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

export function mapFilial(dto) {
  return {
    id: dto?.idFilial != null ? String(dto.idFilial) : '',
    razaoSocial: String(dto?.razaoSocial ?? '').trim(),
    cnpj: String(dto?.cnpj ?? '').trim(),
    endereco: String(dto?.endereco ?? '').trim(),
    token: String(dto?.token ?? '').trim(),
  }
}

export const EMPTY_FILIAL_FORM = {
  razaoSocial: '',
  cnpj: '',
  endereco: '',
  token: '',
}

export function formFromFilial(filial) {
  return {
    razaoSocial: filial?.razaoSocial ?? '',
    cnpj: formatCnpj(filial?.cnpj ?? ''),
    endereco: filial?.endereco ?? '',
    token: filial?.token ?? '',
  }
}

export function validateFilialForm(form) {
  if (!form.razaoSocial.trim()) return 'Informe a razão social.'
  if (soDigitos(form.cnpj).length !== 14) return 'Informe um CNPJ com 14 dígitos.'
  if (!form.endereco.trim()) return 'Informe o endereço.'
  if (!form.token.trim()) return 'Informe o token.'
  return ''
}

export function filialPayload(form) {
  return {
    razaoSocial: form.razaoSocial.trim(),
    cnpj: soDigitos(form.cnpj),
    endereco: form.endereco.trim(),
    token: form.token.trim(),
  }
}

export function mascararToken(token) {
  return token ? '••••' : '—'
}
