import {
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Scale,
  Settings,
  TrendingUp,
  Search,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState, type SelectHTMLAttributes } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { GROUP_NAME, MONTHS, companies } from '@/data/fixtures'
import { initials, monthLong } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useApp } from '@/state/AppContext'
import { Button, Input, Modal } from '../ui'

const SETTINGS = [
  { to: '/configuracoes/perfil', label: 'Meu perfil' },
  { to: '/configuracoes/seguranca', label: 'Segurança' },
  { to: '/configuracoes/usuarios', label: 'Cadastro de usuários', admin: true },
  { to: '/configuracoes/permissoes', label: 'Permissões', admin: true },
  { to: '/configuracoes/organizacao', label: 'Organização', admin: true },
  { to: '/configuracoes/bancos', label: 'Bancos', admin: true },
  { to: '/configuracoes/open-finance', label: 'Conexão com APIs', admin: true },
  { to: '/configuracoes/erp', label: 'Integrações ERP', admin: true },
  { to: '/configuracoes/credenciais', label: 'Integrações / API keys', admin: true },
  { to: '/alertas', label: 'Notificações' },
  { to: '/configuracoes/ia', label: 'Classificação', admin: true },
  { to: '/configuracoes/regras', label: 'Regras financeiras', admin: true },
  { to: '/configuracoes/auditoria', label: 'Auditoria', admin: true },
]

function TopbarSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cn('relative inline-flex shrink-0 items-center', className)}>
      <select
        className="h-9 w-full min-w-0 appearance-none rounded-[8px] border border-borda-forte bg-superficie py-0 pr-9 pl-3.5 text-[13px] leading-9 text-texto outline-none"
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-faint" />
    </label>
  )
}

type NavLinkItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  count?: 'documentos'
}

const OPERACAO_ITEMS: NavLinkItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documentos', label: 'Documentos', icon: FileText, count: 'documentos' },
  { to: '/extratos', label: 'Extratos', icon: Landmark },
  { to: '/conciliacao', label: 'Conciliação', icon: Scale },
  { to: '/contas-a-pagar', label: 'Contas a pagar', icon: Wallet },
  { to: '/contas-a-receber', label: 'Contas a receber', icon: Wallet },
]

const ANALISE_ITEMS: NavLinkItem[] = [
  { to: '/dre', label: 'DRE', icon: Building2 },
  { to: '/fluxo-de-caixa', label: 'Fluxo de caixa', icon: TrendingUp },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/alertas', label: 'Alertas', icon: Bell },
]

function navSectionActive(items: NavLinkItem[], pathname: string) {
  return items.some((item) => (item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`)))
}

export function AppShell() {
  const { session, scope, period, setScope, setPeriod, logout, documents, txFilter, setTxFilter } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const onExtratos = location.pathname.startsWith('/extratos')
  const admin = session?.role === 'administrador'
  const settingsItems = SETTINGS.filter((item) => !item.admin || admin)
  const settingsActive = settingsItems.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
  const [confOpen, setConfOpen] = useState(() => location.pathname.startsWith('/configuracoes') || location.pathname === '/alertas')
  const [operacaoOpen, setOperacaoOpen] = useState(() => navSectionActive(OPERACAO_ITEMS, location.pathname))
  const [analiseOpen, setAnaliseOpen] = useState(() => navSectionActive(ANALISE_ITEMS, location.pathname))
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('pd.sidebar') === 'off'
    } catch {
      return false
    }
  })
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [branch, setBranch] = useState(scope === 'grupo' ? 'todas' : scope)

  function hideSidebar() {
    setOpen(false)
    setCollapsed(true)
    try {
      localStorage.setItem('pd.sidebar', 'off')
    } catch {
      /* noop */
    }
  }

  function showSidebar() {
    setOpen(true)
    setCollapsed(false)
    try {
      localStorage.setItem('pd.sidebar', 'on')
    } catch {
      /* noop */
    }
  }

  const empresa = scope === 'grupo' || companies.some((c) => c.id === scope) ? scope : 'grupo'
  const filiais = companies.filter((c) => c.unit && (empresa === 'grupo' || c.id === empresa))

  function onEmpresa(id: string) {
    setScope(id)
    if (id === 'grupo') setBranch('todas')
    else if (branch !== 'todas' && branch !== id) setBranch('todas')
  }

  function onFilial(id: string) {
    setBranch(id)
    if (id === 'todas') setScope(empresa === 'grupo' ? 'grupo' : empresa)
    else setScope(id)
  }

  useEffect(() => {
    if (scope === 'grupo') setBranch('todas')
    else if (branch !== 'todas' && branch !== scope) setBranch(scope)
  }, [scope, branch])

  useEffect(() => {
    if (navSectionActive(OPERACAO_ITEMS, location.pathname)) setOperacaoOpen(true)
    if (navSectionActive(ANALISE_ITEMS, location.pathname)) setAnaliseOpen(true)
  }, [location.pathname])

  function confirmLogout() {
    logout()
    window.location.assign('/login?motivo=logout')
  }

  const docPending = useMemo(
    () => documents.filter((d) => d.status === 'pendente' || d.status === 'inconsistente').length,
    [documents],
  )

  function renderNavLinks(items: NavLinkItem[]) {
    return items.map((item) => {
      const Icon = item.icon
      const n = item.count === 'documentos' ? docPending : 0
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-[11px] rounded-[6px] px-2.5 py-2 text-[13.5px] font-medium ${isActive ? 'bg-destaque font-semibold text-primaria' : 'text-texto-secundario hover:bg-superficie-2 hover:text-texto'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={14} className={isActive ? 'text-primaria' : 'text-faint'} />
              <span className="flex-1">{item.label}</span>
              {n > 0 ? (
                <span className="rounded-full bg-alerta px-1.5 py-px text-[11px] font-semibold text-alerta-texto">{n}</span>
              ) : null}
            </>
          )}
        </NavLink>
      )
    })
  }

  function renderNavDropdown(
    label: string,
    open: boolean,
    onToggle: () => void,
    active: boolean,
    items: NavLinkItem[],
  ) {
    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          className={`mb-0.5 flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[11px] font-semibold tracking-[0.06em] uppercase ${active || open ? 'text-texto' : 'text-faint hover:bg-superficie-2 hover:text-texto-secundario'}`}
          aria-expanded={open}
        >
          <span className="flex-1">{label}</span>
          {open ? <ChevronDown size={12} className="text-faint" /> : <ChevronRight size={12} className="text-faint" />}
        </button>
        {open ? <div className="flex flex-col gap-0.5">{renderNavLinks(items)}</div> : null}
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-fundo lg:flex">
      {open ? <div className="fixed inset-0 z-30 bg-[#0A1A17]/35 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[236px] flex-col border-r border-borda bg-superficie transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? '' : 'lg:sticky lg:top-0 lg:h-svh lg:translate-x-0'}`}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2.5 border-b border-borda px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primaria text-[13px] font-bold tracking-tight text-white">
              P
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Paris Devs <span className="font-normal text-faint">Finance</span>
            </span>
          </div>
          <button
            type="button"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2"
            onClick={() => {
              setOpen(false)
              if (window.matchMedia('(min-width: 1024px)').matches) hideSidebar()
            }}
            aria-label="Ocultar menu"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-[22px] overflow-y-auto px-3 py-[18px]">
          {renderNavDropdown(
            'Operação',
            operacaoOpen,
            () => setOperacaoOpen((v) => !v),
            navSectionActive(OPERACAO_ITEMS, location.pathname),
            OPERACAO_ITEMS,
          )}
          {renderNavDropdown(
            'Análise',
            analiseOpen,
            () => setAnaliseOpen((v) => !v),
            navSectionActive(ANALISE_ITEMS, location.pathname),
            ANALISE_ITEMS,
          )}
          <div>
            <p className="mb-2 px-2.5 text-[11px] font-semibold tracking-[0.06em] text-faint uppercase">Configuração</p>
            <div className="flex flex-col gap-0.5">
              <NavLink
                to="/plano-de-contas"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-[11px] rounded-[6px] px-2.5 py-2 text-[13.5px] font-medium ${isActive ? 'bg-destaque font-semibold text-primaria' : 'text-texto-secundario hover:bg-superficie-2 hover:text-texto'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <BookOpen size={14} className={isActive ? 'text-primaria' : 'text-faint'} />
                    <span className="flex-1">Plano de contas</span>
                  </>
                )}
              </NavLink>
              <div>
                <button
                  type="button"
                  onClick={() => setConfOpen((v) => !v)}
                  className={`flex w-full items-center gap-[11px] rounded-[6px] px-2.5 py-2 text-[13.5px] font-medium ${settingsActive || confOpen ? 'text-texto' : 'text-texto-secundario hover:bg-superficie-2 hover:text-texto'}`}
                >
                  <Settings size={14} className={settingsActive ? 'text-primaria' : 'text-faint'} />
                  <span className="flex-1 text-left">Configurações</span>
                  {confOpen ? <ChevronDown size={12} className="text-faint" /> : <ChevronRight size={12} className="text-faint" />}
                </button>
                {confOpen ? (
                  <div className="mt-0.5 ml-4 flex flex-col gap-px border-l border-borda pl-2">
                    {settingsItems.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `rounded-[6px] px-2 py-1.5 text-[12.5px] font-medium ${isActive ? 'bg-destaque font-semibold text-primaria' : 'text-texto-secundario hover:bg-superficie-2 hover:text-texto'}`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-borda px-3 py-3.5">
          <button
            type="button"
            onClick={() => setConfirmLeave(true)}
            className="mb-3 flex w-full items-center gap-[11px] rounded-[6px] px-2.5 py-2 text-[13.5px] font-medium text-texto-secundario hover:bg-superficie-2 hover:text-texto"
          >
            <LogOut size={14} className="text-faint" />
            Sair
          </button>
          <div className="px-2.5 text-[11.5px] text-faint">
            <strong className="mb-0.5 block text-[12.5px] font-semibold text-[#243330]">{GROUP_NAME}</strong>
            {companies.length} empresas · plano Corporativo
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-borda bg-superficie">
          <div className="flex h-[60px] items-center gap-3 px-4 lg:px-7">
            <button
              type="button"
              className={`inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2 ${collapsed ? '' : 'lg:hidden'}`}
              onClick={showSidebar}
              aria-label="Mostrar menu"
            >
              <PanelLeft size={16} />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
              {onExtratos ? (
                <label className="relative w-full max-w-xl">
                  <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
                  <Input
                    className="h-9 w-full py-0 pl-9 text-[13px] leading-9"
                    placeholder="Buscar lançamento"
                    value={txFilter.search}
                    onChange={(e) => setTxFilter({ search: e.target.value })}
                    aria-label="Buscar lançamento"
                  />
                </label>
              ) : (
                <>
                  <TopbarSelect value={empresa} onChange={(e) => onEmpresa(e.target.value)} className="min-w-[13.75rem]" aria-label="Empresa">
                    <option value="grupo">Todas as empresas</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fantasy}
                      </option>
                    ))}
                  </TopbarSelect>
                  <TopbarSelect value={branch} onChange={(e) => onFilial(e.target.value)} className="min-w-[13.75rem]" aria-label="Filial">
                    <option value="todas">Todas as filiais</option>
                    {filiais.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.unit}
                      </option>
                    ))}
                  </TopbarSelect>
                  <TopbarSelect value={period} onChange={(e) => setPeriod(e.target.value)} className="min-w-[12.5rem]" aria-label="Período">
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {monthLong(m)}
                      </option>
                    ))}
                  </TopbarSelect>
                </>
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <button type="button" className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2" title="Central de ajuda" aria-label="Ajuda">
                <CircleHelp size={16} />
              </button>
              <button type="button" className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2" onClick={() => navigate('/alertas')} aria-label="Notificações">
                <Bell size={16} />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-borda py-1 pr-2.5 pl-1 hover:bg-superficie-2"
                onClick={() => navigate('/configuracoes/perfil')}
              >
                <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-primaria text-[10.5px] font-bold text-white">
                  {initials(session?.name ?? '')}
                </span>
                <span className="hidden text-[12.5px] font-medium sm:block">{session?.name.split(' ')[0]}</span>
                <ChevronDown size={9} className="text-faint" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] flex-1 p-5 md:p-7">
          <Outlet />
        </main>
      </div>

      <Modal
        title="Sair do sistema"
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmLeave(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmLogout}>Sair</Button>
          </>
        }
      >
        <p className="t-body text-texto-secundario">Deseja encerrar a sessão? Você precisará entrar novamente para continuar.</p>
      </Modal>
    </div>
  )
}
