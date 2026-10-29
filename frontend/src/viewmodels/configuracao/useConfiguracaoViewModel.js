import { Building2, Landmark, Lock, Scale, ScrollText, Shield, SlidersHorizontal, Sparkles, User, Users } from 'lucide-react'
import { GROUP_NAME } from '@/models/fixtures'
import { cargoLabel } from '@/models/domain/usuario'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

const CONTA = [
  { to: '/configuracoes/perfil', title: 'Meu perfil', description: 'Nome, e-mail, cargo e filial da sessão.', Icon: User },
  { to: '/configuracoes/preferencias', title: 'Preferências', description: 'Tema e alertas deste navegador.', Icon: SlidersHorizontal },
  { to: '/configuracoes/seguranca', title: 'Segurança', description: 'Senha, MFA de demonstração e sessão local.', Icon: Shield },
]

const ACESSO = [
  { to: '/configuracoes/usuarios', title: 'Cadastro de usuários', description: 'Acessos da organização no banco.', Icon: Users },
  { to: '/configuracoes/permissoes', title: 'Permissões', description: 'Matriz ilustrativa por cargo. Não é gravada.', Icon: Lock },
]

const ORGANIZACAO = [
  { to: '/configuracoes/organizacao', title: 'Organização', description: 'Cadastro das empresas do grupo. O seletor da topbar usa esta lista.', Icon: Building2 },
]

const INTEGRACOES = [
  { to: '/configuracoes/open-finance', title: 'Open Finance', description: 'Parâmetros locais. Integração ainda não operacional.', Icon: Landmark },
  { to: '/configuracoes/ia', title: 'API de IA', description: 'Chave mascarada neste dispositivo. Sem motor real.', Icon: Sparkles },
]

const CONFORMIDADE = [
  { to: '/configuracoes/regras', title: 'Regras financeiras', description: 'Limites de recorte salvos neste navegador.', Icon: Scale },
  { to: '/configuracoes/auditoria', title: 'Auditoria', description: 'Registro local de ações neste ambiente.', Icon: ScrollText },
]

export function useConfiguracaoViewModel() {
  const { session, usuario, filiais, logout } = useAppViewModel()
  const admin = session?.role === 'administrador'
  const nome = usuario?.nome ?? session?.name ?? ''
  const email = usuario?.email ?? session?.email ?? ''
  const foto = usuario?.foto ?? ''
  const cargo = usuario?.cargo ?? ''
  const filialNome = usuario?.filial?.razaoSocial ?? ''

  const sections = [
    { id: 'conta', title: 'Conta', items: CONTA },
    admin ? { id: 'acesso', title: 'Acesso', items: ACESSO } : null,
    admin ? { id: 'organizacao', title: 'Organização', items: ORGANIZACAO } : null,
    admin ? { id: 'integracoes', title: 'Integrações', items: INTEGRACOES } : null,
    admin ? { id: 'conformidade', title: 'Conformidade', items: CONFORMIDADE } : null,
  ].filter(Boolean)

  function encerrarSessao() {
    logout()
    window.location.assign('/login?motivo=logout')
  }

  return {
    admin,
    nome,
    email,
    foto,
    cargo,
    cargoNome: cargoLabel(cargo),
    filialNome,
    filiais: filiais ?? [],
    groupName: GROUP_NAME,
    sections,
    encerrarSessao,
  }
}
