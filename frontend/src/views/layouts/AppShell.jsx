import {
  ArrowLeftRight,
  Bell,
  Building2,
  BarChart3,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  History,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  PieChart,
  Plug,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Scale,
  Settings,
  Store,
  TrendingUp,
  Search,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AiChatbot } from '@/views/components/AiChatbot'
import { BrandMark } from '@/views/components/BrandMark'
import { GROUP_NAME, companies } from '@/models/fixtures'
import { monthLong } from '@/lib/format'
import { fotoSrc } from '@/models/domain/usuario'
import { UserAvatar } from '@/views/components/UserAvatar'
import { cn } from '@/lib/cn'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { Button, Input, Modal } from '../ui'

const SETTINGS = [
  { to: '/configuracoes/perfil', label: 'Meu perfil' },
  { to: '/configuracoes/preferencias', label: 'Preferências' },
  { to: '/configuracoes/seguranca', label: 'Segurança' },
  { to: '/configuracoes/usuarios', label: 'Cadastro de usuários', admin: true },
  { to: '/configuracoes/permissoes', label: 'Permissões', admin: true },
  { to: '/configuracoes/organizacao', label: 'Organização', admin: true },
  { to: '/configuracoes/open-finance', label: 'Open Finance', admin: true },
  { to: '/configuracoes/ia', label: 'API de IA', admin: true },
  { to: '/configuracoes/regras', label: 'Regras financeiras', admin: true },
  { to: '/configuracoes/auditoria', label: 'Auditoria', admin: true },
]

function TopbarSelect({
  className,
  children,
  icon,
  ...props
}) {
  return (
    <label className={cn('relative inline-flex shrink-0 items-center', className)}>
      {icon ? <span className="pointer-events-none absolute top-1/2 left-3 z-[1] -translate-y-1/2 text-faint">{icon}</span> : null}
      <select
        className={cn(
          'h-9 w-full min-w-0 appearance-none rounded-[8px] border border-borda-forte bg-superficie py-0 pr-9 text-[13px] leading-9 text-texto outline-none',
          icon ? 'pl-9' : 'pl-3.5',
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-faint" />
    </label>
  )
}








const OPERACAO_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/operacoes', label: 'Operações', icon: ArrowLeftRight },
  { to: '/conexoes', label: 'Conexões bancárias', icon: Plug },
  { to: '/extratos', label: 'Extratos', icon: Landmark },
  { to: '/conciliacao', label: 'Conciliação', icon: Scale },
  { to: '/documentos', label: 'Documentos', icon: FileText, count: 'documentos' },
  // { to: '/contas-a-pagar', label: 'Contas a pagar', icon: ArrowUpRight },
  // { to: '/contas-a-receber', label: 'Contas a receber', icon: ArrowDownLeft },
]

const ANALISE_PRIMARY = { to: '/dre', label: 'Relatórios', icon: PieChart }
const ANALISE_MORE = [
  { to: '/dre/historico', label: 'Histórico DRE', icon: History },
  { to: '/fluxo-de-caixa', label: 'Fluxo de caixa', icon: TrendingUp },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/alertas', label: 'Alertas', icon: Bell },
]
const ANALISE_ITEMS = [ANALISE_PRIMARY, ...ANALISE_MORE]

const MODULES = [
  { to: '/configuracoes/usuarios', label: 'Cadastro de usuários', icon: Users },
  { to: '/configuracoes/organizacao', label: 'Cadastro de empresa', icon: Building2 },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

function navSectionActive(items, pathname) {
  return items.some((item) => (item.to === '/dashboard' ? pathname === '/dashboard' : pathname === item.to || pathname.startsWith(`${item.to}/`)))
}

export function AppShell() {
  const { session, usuario, scope, period, periodMonths, filiais: filiaisApi, setScope, setPeriod, logout, documents, txFilter, setTxFilter } = useAppViewModel()
  const displayName = usuario?.nome ?? session?.name ?? ''
  const navigate = useNavigate()
  const location = useLocation()
  const onExtratos = location.pathname.startsWith('/extratos')
  const admin = session?.role === 'administrador'
  const settingsItems = SETTINGS.filter((item) => !item.admin || admin)
  const settingsActive = settingsItems.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
  const [confOpen, setConfOpen] = useState(true)
  const [analiseOpen, setAnaliseOpen] = useState(() => navSectionActive(ANALISE_MORE, location.pathname))
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const [modulesMenu, setModulesMenu] = useState(false)
  const modulesMenuRef = useRef(null)
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

  const empresa = scope === 'grupo' || filiaisApi.some((f) => String(f.idFilial) === String(scope)) ? String(scope) : 'grupo'
  const filiais = filiaisApi.filter((f) => empresa === 'grupo' || String(f.idFilial) === empresa)

  function onEmpresa(id) {
    setScope(id)
    if (id === 'grupo') setBranch('todas')
    else if (branch !== 'todas' && branch !== id) setBranch('todas')
  }

  function onFilial(id) {
    setBranch(id)
    if (id === 'todas') setScope(empresa === 'grupo' ? 'grupo' : empresa)
    else setScope(id)
  }

  useEffect(() => {
    if (scope === 'grupo') setBranch('todas')
    else if (branch !== 'todas' && branch !== scope) setBranch(scope)
  }, [scope, branch])

  useEffect(() => {
    if (navSectionActive(ANALISE_MORE, location.pathname)) setAnaliseOpen(true)
    if (location.pathname.startsWith('/configuracoes')) setConfOpen(true)
  }, [location.pathname])

  useEffect(() => {
    function onDocClick(e) {
      if (!userMenuRef.current?.contains(e.target)) setUserMenu(false)
      if (!modulesMenuRef.current?.contains(e.target)) setModulesMenu(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function confirmLogout() {
    logout()
    window.location.assign('/login?motivo=logout')
  }

  const docPending = useMemo(
    () => documents.filter((d) => d.status === 'pendente' || d.status === 'inconsistente').length,
    [documents],
  )

  function renderNavLinks(items) {
    return items.map((item) => {
      const Icon = item.icon
      const n = item.count === 'documentos' ? docPending : 0
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard'}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-2.5 rounded-[8px] px-2.5 py-[8px] text-[13px] font-medium transition-colors',
              isActive ? 'bg-white/[0.09] text-white' : 'text-white/62 hover:bg-white/[0.05] hover:text-white',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? <span className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-ouro" /> : null}
              <Icon size={15} strokeWidth={1.7} className={isActive ? 'text-ouro' : 'text-white/42'} />
              <span className="flex-1 tracking-[-0.01em]">{item.label}</span>
              {n > 0 ? (
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ouro/20 px-1 text-[10px] font-semibold text-ouro">{n}</span>
              ) : null}
            </>
          )}
        </NavLink>
      )
    })
  }

  function renderNavDropdown(
    label,
    open,
    onToggle,
    active,
    items,
  ) {
    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'mb-1.5 flex w-full items-center gap-2 px-2.5 text-left text-[10.5px] font-semibold tracking-[0.14em] uppercase',
            active || open ? 'text-white/40' : 'text-white/28 hover:text-white/40',
          )}
          aria-expanded={open}
        >
          <span className="flex-1">{label}</span>
          {open ? <ChevronDown size={11} className="text-white/28" /> : <ChevronRight size={11} className="text-white/28" />}
        </button>
        <div className="flex flex-col gap-px">{renderNavLinks(items)}</div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-fundo lg:flex">
      {open ? <div className="fixed inset-0 z-30 bg-[#062921]/50 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-svh max-h-svh w-[248px] min-h-0 flex-col overflow-hidden bg-menu text-white transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? '' : 'lg:sticky lg:top-0 lg:translate-x-0'}`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(201,176,122,0.1),transparent_70%)]" />

        <div className="relative flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-4">
          <NavLink to="/dashboard" className="min-w-0 no-underline">
            <BrandMark />
            <span className="mt-0.5 block text-[10px] font-medium tracking-[0.14em] text-white/32 uppercase">Gestão financeira</span>
          </NavLink>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-white/40 hover:bg-white/[0.06] hover:text-white"
            onClick={() => {
              setOpen(false)
              if (window.matchMedia('(min-width: 1024px)').matches) hideSidebar()
            }}
            aria-label="Ocultar menu"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <nav className="nav-scroll relative flex flex-1 flex-col gap-6 px-3 py-5">
          <div>
            <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold tracking-[0.14em] text-white/32 uppercase">Operação</p>
            <div className="flex flex-col gap-px">{renderNavLinks(OPERACAO_ITEMS)}</div>
          </div>
          {renderNavDropdown(
            'Análise',
            analiseOpen,
            () => setAnaliseOpen((v) => !v),
            navSectionActive(ANALISE_ITEMS, location.pathname),
            analiseOpen ? ANALISE_ITEMS : [ANALISE_PRIMARY],
          )}
          {renderNavDropdown(
            'Configuração',
            confOpen,
            () => setConfOpen((v) => !v),
            settingsActive || location.pathname.startsWith('/configuracoes'),
            confOpen
              ? [
                  // { to: '/plano-de-contas', label: 'Plano de contas', icon: BookOpen },
                  { to: '/configuracoes', label: 'Configurações', icon: Settings },
                ]
              : [],
          )}
        </nav>

        <div className="relative shrink-0 border-t border-white/[0.07] px-3 pt-3 pb-4">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-2.5 py-2">
            <span className="inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white">
              <img
                src="/brand/paris6-bistro.png"
                alt="Paris 6 Bistrô"
                className="h-full w-full object-cover"
                style={{ transform: 'scale(1.35)', objectPosition: '50% 46%' }}
              />
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-[12.5px] font-semibold text-white/90">{GROUP_NAME}</strong>
              <p className="truncate text-[11px] text-white/38">{companies.length} empresas · Corporativo</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-1.5 flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-white/40 hover:bg-white/[0.05] hover:text-white"
            onClick={() => setConfirmLeave(true)}
          >
            <LogOut size={15} strokeWidth={1.7} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-fundo">
        <header className="sticky top-0 z-20 border-b border-borda/80 bg-superficie/90 backdrop-blur-md">
          <div className="flex h-[64px] items-center gap-3 px-4 lg:px-7">
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
                  <TopbarSelect value={empresa} onChange={(e) => onEmpresa(e.target.value)} className="min-w-[13.75rem]" aria-label="Empresa" icon={<Building2 size={14} />}>
                    <option value="grupo">Todas as empresas</option>
                    {filiaisApi.map((f) => (
                      <option key={f.idFilial} value={String(f.idFilial)}>
                        {f.razaoSocial}
                      </option>
                    ))}
                  </TopbarSelect>
                  <TopbarSelect value={branch} onChange={(e) => onFilial(e.target.value)} className="min-w-[13.75rem]" aria-label="Filial" icon={<Store size={14} />}>
                    <option value="todas">Todas as filiais</option>
                    {filiais.map((f) => (
                      <option key={f.idFilial} value={String(f.idFilial)}>
                        {f.razaoSocial}
                      </option>
                    ))}
                  </TopbarSelect>
                  <TopbarSelect value={period} onChange={(e) => setPeriod(e.target.value)} className="min-w-[12.5rem]" aria-label="Período" icon={<CalendarRange size={14} />}>
                    {(periodMonths || []).map((m) => (
                      <option key={m} value={m}>
                        {monthLong(m)}
                      </option>
                    ))}
                  </TopbarSelect>
                </>
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <div className="relative" ref={modulesMenuRef}>
                <button
                  type="button"
                  className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2"
                  onClick={() => setModulesMenu((v) => !v)}
                  title="Módulos"
                  aria-label="Módulos"
                  aria-expanded={modulesMenu}
                  aria-haspopup="menu"
                >
                  <LayoutGrid size={16} />
                </button>
                {modulesMenu ? (
                  <div
                    role="menu"
                    className="absolute top-[calc(100%+8px)] right-0 z-30 min-w-[220px] rounded-[12px] border border-borda bg-superficie py-1 shadow-[0_8px_24px_rgba(13,31,27,0.12)]"
                  >
                    {MODULES.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.to}
                          type="button"
                          role="menuitem"
                          className="t-body flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-superficie-2"
                          onClick={() => {
                            setModulesMenu(false)
                            navigate(item.to)
                          }}
                        >
                          <Icon size={15} strokeWidth={1.7} className="text-texto-secundario" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
              <button type="button" className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2" onClick={() => navigate('/alertas')} aria-label="Notificações">
                <Bell size={16} />
              </button>
              <button type="button" className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2" title="Central de ajuda" aria-label="Ajuda">
                <CircleHelp size={16} />
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full py-1 pr-1.5 pl-1 hover:bg-superficie-2"
                  onClick={() => setUserMenu((v) => !v)}
                  aria-expanded={userMenu}
                  aria-haspopup="menu"
                >
                  <UserAvatar src={fotoSrc(usuario?.foto)} name={displayName} size={28} />
                  <span className="hidden text-[13px] font-medium sm:block">{displayName.split(' ')[0]}</span>
                </button>
                {userMenu ? (
                  <div role="menu" className="absolute top-[calc(100%+8px)] right-0 z-30 min-w-[180px] rounded-[12px] border border-borda bg-superficie py-1 shadow-[0_8px_24px_rgba(13,31,27,0.12)]">
                    <button type="button" role="menuitem" className="t-body flex w-full px-3 py-2 text-left hover:bg-superficie-2" onClick={() => { setUserMenu(false); navigate('/configuracoes/perfil') }}>
                      Meu perfil
                    </button>
                    <button type="button" role="menuitem" className="t-body flex w-full items-center gap-2 px-3 py-2 text-left text-texto-secundario hover:bg-superficie-2" onClick={() => { setUserMenu(false); setConfirmLeave(true) }}>
                      <LogOut size={14} />
                      Sair
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>

      <AiChatbot />

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
