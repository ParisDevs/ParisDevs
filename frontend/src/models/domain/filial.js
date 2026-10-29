import { GROUP_NAME } from '@/models/fixtures'

export const REGIMES_TRIBUTARIOS = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI',
]

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export const PLANOS_CONTAS = ['Plano gerencial padrão']
export const EXERCICIOS_FISCAIS = ['Janeiro a dezembro']
export const FUSOS = ['America/Sao_Paulo']

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

export function formatCep(value) {
  const digits = soDigitos(value).slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function formatCpf(value) {
  const digits = soDigitos(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatTelefone(value) {
  const digits = soDigitos(value).slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function composeEndereco(form) {
  const rua = [form.logradouro, form.numero].filter(Boolean).join(', ')
  const extra = form.complemento ? ` ${form.complemento}` : ''
  const cidade = [form.bairro, form.cidade].filter(Boolean).join(', ')
  const uf = form.uf ? `/${form.uf}` : ''
  const cep = form.cep ? ` CEP ${form.cep}` : ''
  return `${rua}${extra}${cidade ? ` - ${cidade}` : ''}${uf}${cep}`.replace(/\s+/g, ' ').trim()
}

export function gerarToken(nome) {
  const slug = String(nome || 'empresa')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24)
  return `tok_${slug || 'empresa'}`
}

function text(value) {
  return String(value ?? '').trim()
}

export function mapFilial(dto) {
  return {
    id: dto?.idFilial != null ? String(dto.idFilial) : '',
    razaoSocial: text(dto?.razaoSocial),
    nomeFantasia: text(dto?.nomeFantasia),
    cnpj: text(dto?.cnpj),
    inscricaoEstadual: text(dto?.inscricaoEstadual),
    inscricaoMunicipal: text(dto?.inscricaoMunicipal),
    regimeTributario: text(dto?.regimeTributario),
    cnaePrincipal: text(dto?.cnaePrincipal),
    dataAbertura: text(dto?.dataAbertura),
    situacaoCadastral: text(dto?.situacaoCadastral),
    endereco: text(dto?.endereco),
    token: text(dto?.token),
    cep: text(dto?.cep),
    logradouro: text(dto?.logradouro),
    numero: text(dto?.numero),
    complemento: text(dto?.complemento),
    bairro: text(dto?.bairro),
    cidade: text(dto?.cidade),
    uf: text(dto?.uf),
    pais: text(dto?.pais),
    responsavelNome: text(dto?.responsavelNome),
    responsavelCpf: text(dto?.responsavelCpf),
    responsavelEmail: text(dto?.responsavelEmail),
    responsavelTelefone: text(dto?.responsavelTelefone),
    responsavelCargo: text(dto?.responsavelCargo),
    moedaPadrao: text(dto?.moedaPadrao),
    fusoHorario: text(dto?.fusoHorario),
    planoContas: text(dto?.planoContas),
    dataInicioOperacao: text(dto?.dataInicioOperacao),
    centroCustoPadrao: text(dto?.centroCustoPadrao),
    exercicioFiscal: text(dto?.exercicioFiscal),
    empresasVinculadas: text(dto?.empresasVinculadas),
  }
}

export const EMPTY_FILIAL_FORM = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  regimeTributario: 'Simples Nacional',
  cnaePrincipal: '',
  dataAbertura: '',
  situacaoCadastral: 'Não consultada',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: 'SP',
  pais: 'Brasil',
  responsavelNome: '',
  responsavelCpf: '',
  responsavelEmail: '',
  responsavelTelefone: '',
  responsavelCargo: '',
  moedaPadrao: 'BRL',
  fusoHorario: 'America/Sao_Paulo',
  planoContas: 'Plano gerencial padrão',
  dataInicioOperacao: '',
  centroCustoPadrao: '',
  exercicioFiscal: 'Janeiro a dezembro',
  empresasVinculadas: GROUP_NAME,
  token: '',
}

export function formFromFilial(filial) {
  return {
    ...EMPTY_FILIAL_FORM,
    razaoSocial: filial?.razaoSocial ?? '',
    nomeFantasia: filial?.nomeFantasia ?? '',
    cnpj: formatCnpj(filial?.cnpj ?? ''),
    inscricaoEstadual: filial?.inscricaoEstadual ?? '',
    inscricaoMunicipal: filial?.inscricaoMunicipal ?? '',
    regimeTributario: filial?.regimeTributario || 'Simples Nacional',
    cnaePrincipal: filial?.cnaePrincipal ?? '',
    dataAbertura: filial?.dataAbertura ?? '',
    situacaoCadastral: filial?.situacaoCadastral || 'Não consultada',
    cep: formatCep(filial?.cep ?? ''),
    logradouro: filial?.logradouro ?? '',
    numero: filial?.numero ?? '',
    complemento: filial?.complemento ?? '',
    bairro: filial?.bairro ?? '',
    cidade: filial?.cidade ?? '',
    uf: filial?.uf || 'SP',
    pais: filial?.pais || 'Brasil',
    responsavelNome: filial?.responsavelNome ?? '',
    responsavelCpf: formatCpf(filial?.responsavelCpf ?? ''),
    responsavelEmail: filial?.responsavelEmail ?? '',
    responsavelTelefone: formatTelefone(filial?.responsavelTelefone ?? ''),
    responsavelCargo: filial?.responsavelCargo ?? '',
    moedaPadrao: filial?.moedaPadrao || 'BRL',
    fusoHorario: filial?.fusoHorario || 'America/Sao_Paulo',
    planoContas: filial?.planoContas || 'Plano gerencial padrão',
    dataInicioOperacao: filial?.dataInicioOperacao ?? '',
    centroCustoPadrao: filial?.centroCustoPadrao ?? '',
    exercicioFiscal: filial?.exercicioFiscal || 'Janeiro a dezembro',
    empresasVinculadas: filial?.empresasVinculadas || GROUP_NAME,
    token: filial?.token ?? '',
  }
}

export function validateFilialForm(form) {
  if (!text(form.razaoSocial)) return 'Informe a razão social.'
  if (!text(form.nomeFantasia)) return 'Informe o nome fantasia.'
  if (soDigitos(form.cnpj).length !== 14) return 'Informe um CNPJ com 14 dígitos.'
  if (!text(form.regimeTributario)) return 'Informe o regime tributário.'
  if (soDigitos(form.cep).length !== 8) return 'Informe um CEP com 8 dígitos.'
  if (!text(form.logradouro)) return 'Informe o logradouro.'
  if (!text(form.numero)) return 'Informe o número.'
  if (!text(form.bairro)) return 'Informe o bairro.'
  if (!text(form.cidade)) return 'Informe a cidade.'
  if (!text(form.uf)) return 'Informe o estado (UF).'
  if (!text(form.pais)) return 'Informe o país.'
  if (!text(form.responsavelNome)) return 'Informe o nome do responsável.'
  if (soDigitos(form.responsavelCpf).length !== 11) return 'Informe um CPF com 11 dígitos.'
  if (!text(form.responsavelEmail) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.responsavelEmail)) {
    return 'Informe um e-mail corporativo válido.'
  }
  if (soDigitos(form.responsavelTelefone).length < 10) return 'Informe o telefone do responsável.'
  if (!text(form.responsavelCargo)) return 'Informe o cargo do responsável.'
  if (!text(form.moedaPadrao)) return 'Informe a moeda padrão.'
  if (!text(form.fusoHorario)) return 'Informe o fuso horário.'
  if (!text(form.planoContas)) return 'Informe o plano de contas.'
  if (!text(form.dataInicioOperacao)) return 'Informe a data de início da operação.'
  if (!text(form.exercicioFiscal)) return 'Informe o exercício fiscal.'
  return ''
}

export function filialPayload(form) {
  const token = text(form.token) || gerarToken(form.nomeFantasia || form.razaoSocial)
  return {
    razaoSocial: text(form.razaoSocial),
    nomeFantasia: text(form.nomeFantasia),
    cnpj: soDigitos(form.cnpj),
    inscricaoEstadual: text(form.inscricaoEstadual),
    inscricaoMunicipal: text(form.inscricaoMunicipal),
    regimeTributario: text(form.regimeTributario),
    cnaePrincipal: text(form.cnaePrincipal),
    dataAbertura: text(form.dataAbertura),
    situacaoCadastral: text(form.situacaoCadastral) || 'Não consultada',
    endereco: composeEndereco(form),
    token,
    cep: soDigitos(form.cep),
    logradouro: text(form.logradouro),
    numero: text(form.numero),
    complemento: text(form.complemento),
    bairro: text(form.bairro),
    cidade: text(form.cidade),
    uf: text(form.uf),
    pais: text(form.pais),
    responsavelNome: text(form.responsavelNome),
    responsavelCpf: soDigitos(form.responsavelCpf),
    responsavelEmail: text(form.responsavelEmail),
    responsavelTelefone: soDigitos(form.responsavelTelefone),
    responsavelCargo: text(form.responsavelCargo),
    moedaPadrao: text(form.moedaPadrao),
    fusoHorario: text(form.fusoHorario),
    planoContas: text(form.planoContas),
    dataInicioOperacao: text(form.dataInicioOperacao),
    centroCustoPadrao: text(form.centroCustoPadrao),
    exercicioFiscal: text(form.exercicioFiscal),
    empresasVinculadas: text(form.empresasVinculadas) || GROUP_NAME,
  }
}

export function mascararToken(token) {
  return token ? '••••' : '—'
}
