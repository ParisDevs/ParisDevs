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

export function fotoSrc(foto) {
  return String(foto ?? '').trim()
}

export function lerFotoArquivo(file) {
  const maxBytes = 2 * 1024 * 1024
  if (!file) return Promise.reject(new Error('Selecione uma imagem.'))
  if (!String(file.type || '').startsWith('image/')) {
    return Promise.reject(new Error('Envie um arquivo de imagem.'))
  }
  if (file.size > maxBytes) {
    return Promise.reject(new Error('A foto deve ter no máximo 2 MB.'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      const img = new Image()
      img.onload = () => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const min = Math.min(img.width, img.height) || 1
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
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
