import { CARGOS } from '@/models/domain/usuario'

export const PERMISSION_MODULES = [
  'Dashboard',
  'Conexões bancárias',
  'Extratos',
  'Conciliação',
  'Central de IA',
  'Fluxo de caixa',
  'DRE',
  'Plano de contas',
  'Documentos',
  'Configurações',
  'Auditoria',
]

const PERMISSION_BY_CARGO = {
  ADMINISTRADOR: ['edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'view'],
  FINANCEIRO: ['view', 'view', 'edit', 'edit', 'view', 'view', 'view', 'view', 'edit', 'none', 'none'],
  GERENTE: ['view', 'view', 'view', 'view', 'view', 'edit', 'view', 'view', 'view', 'none', 'none'],
  CONTADOR: ['view', 'view', 'view', 'view', 'none', 'view', 'view', 'view', 'view', 'none', 'view'],
}

export const PERMISSION_CARGOS = CARGOS.filter((cargo) => PERMISSION_BY_CARGO[cargo])

export function permissionLevel(cargo, moduleIndex) {
  return PERMISSION_BY_CARGO[cargo]?.[moduleIndex] ?? 'none'
}

export function permissionLabel(level) {
  if (level === 'edit') return 'Editar'
  if (level === 'view') return 'Ver'
  return '—'
}

export function configStatusMeta(status) {
  if (status === 'configurado') return { tone: 'success', label: 'Configurado' }
  if (status === 'erro') return { tone: 'danger', label: 'Erro' }
  return { tone: 'neutral', label: 'Não configurado' }
}
