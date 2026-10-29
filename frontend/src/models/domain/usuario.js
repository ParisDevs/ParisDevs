export const CARGO_LABELS = {
  ADMINISTRADOR: 'Administrador',
  CONTADOR: 'Contador',
  FINANCEIRO: 'Financeiro',
  GERENTE: 'Gerente',
}

export const CARGOS = Object.keys(CARGO_LABELS)

export function cargoLabel(cargo) {
  return CARGO_LABELS[cargo] || cargo || '—'
}

export function mapUsuario(dto) {
  return {
    id: dto?.id != null ? String(dto.id) : '',
    nome: String(dto?.nome ?? '').trim(),
    email: String(dto?.email ?? '').trim(),
    cargo: dto?.cargo || '',
    filialId: dto?.filial?.idFilial != null ? String(dto.filial.idFilial) : '',
    filialNome: String(dto?.filial?.razaoSocial ?? '').trim(),
  }
}

export function mapFilialOption(dto) {
  return {
    id: dto?.idFilial != null ? String(dto.idFilial) : '',
    nome: String(dto?.razaoSocial ?? '').trim(),
  }
}

export const EMPTY_USUARIO_FORM = {
  nome: '',
  email: '',
  senha: '',
  cargo: 'FINANCEIRO',
  idFilial: '',
}

export function formFromUsuario(user) {
  return {
    nome: user?.nome ?? '',
    email: user?.email ?? '',
    senha: '',
    cargo: user?.cargo || 'FINANCEIRO',
    idFilial: user?.filialId ?? '',
  }
}

export function validateUsuarioForm(form, { requireSenha }) {
  if (!form.nome.trim()) return 'Informe o nome.'
  if (!form.email.trim()) return 'Informe o e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Insira um e-mail válido.'
  if (!form.cargo) return 'Informe o cargo.'
  if (!form.idFilial) return 'Informe a filial.'
  const senha = form.senha.trim()
  if (requireSenha && !senha) return 'Informe a senha.'
  if (senha && (senha.length < 8 || senha.length > 45)) return 'A senha deve ter entre 8 e 45 caracteres.'
  return ''
}

export function usuarioPayload(form, { includeSenha }) {
  const payload = {
    nome: form.nome.trim(),
    email: form.email.trim(),
    cargo: form.cargo,
    idFilial: Number(form.idFilial),
  }
  if (includeSenha) payload.senha = form.senha.trim()
  return payload
}
