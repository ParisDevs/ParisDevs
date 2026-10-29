import { defaultConfig, users } from '@/models/fixtures'


 










const PREFIX = 'pd.'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) )
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* armazenamento indisponível */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* noop */
  }
}

export const persist = { read, write, remove }

export function loadSession() {
  const persistent = read('session', null)
  if (persistent) return persistent
  try {
    const raw = sessionStorage.getItem(PREFIX + 'session')
    return raw === null ? null : (JSON.parse(raw) )
  } catch {
    return null
  }
}

export function saveSession(session, remember = true) {
  if (remember) {
    write('session', session)
    try {
      sessionStorage.removeItem(PREFIX + 'session')
    } catch {
      /* noop */
    }
  } else {
    remove('session')
    try {
      sessionStorage.setItem(PREFIX + 'session', JSON.stringify(session))
    } catch {
      /* noop */
    }
  }
}

export function clearSession() {
  remove('session')
  remove('usuario')
  remove('token')
  try {
    sessionStorage.removeItem(PREFIX + 'session')
    sessionStorage.removeItem(PREFIX + 'usuario')
    sessionStorage.removeItem(PREFIX + 'token')
  } catch {
    /* noop */
  }
}

function readUsuarioStore(storage) {
  try {
    const raw = storage.getItem(PREFIX + 'usuario')
    return raw === null ? null : (JSON.parse(raw) )
  } catch {
    return null
  }
}

export function loadUsuario() {
  const persistent = read('usuario', null)
  if (persistent) return persistent
  if (typeof sessionStorage === 'undefined') return null
  return readUsuarioStore(sessionStorage)
}

function readTokenStore(storage) {
  try {
    return storage.getItem(PREFIX + 'token')
  } catch {
    return null
  }
}

export function loadToken() {
  const persistent = read('token', null)
  if (typeof persistent === 'string' && persistent) return persistent
  if (typeof sessionStorage === 'undefined') return null
  const sessionToken = readTokenStore(sessionStorage)
  return sessionToken || null
}

export function saveToken(token, remember = true) {
  if (remember) {
    write('token', token)
    try {
      sessionStorage.removeItem(PREFIX + 'token')
    } catch {
      /* noop */
    }
  } else {
    remove('token')
    try {
      sessionStorage.setItem(PREFIX + 'token', token)
    } catch {
      /* noop */
    }
  }
}

export function saveUsuario(usuario, remember = true) {
  const raw = JSON.stringify(usuario)
  if (remember) {
    write('usuario', usuario)
    try {
      sessionStorage.removeItem(PREFIX + 'usuario')
    } catch {
      /* noop */
    }
  } else {
    remove('usuario')
    try {
      sessionStorage.setItem(PREFIX + 'usuario', raw)
    } catch {
      /* noop */
    }
  }
}

function roleFromCargo(cargo) {
  const value = String(cargo ?? '').trim().toLowerCase()
  if (value === 'administrador') return 'administrador'
  if (value === 'gerente') return 'gestor'
  if (value === 'auditor') return 'auditor'
  return 'analista'
}

export function sessionFromUsuario(usuario) {
  return {
    userId: String(usuario?.id ?? ''),
    name: usuario?.nome ?? '',
    email: usuario?.email ?? '',
    role: roleFromCargo(usuario?.cargo),
    firstAccess: false,
  }
}

export function sessionFromEmail(email) {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? users[0]
  return sessionFromUsuario({
    id: Number.parseInt(user.id.replace(/\D/g, ''), 10) || 0,
    filial: null,
    nome: user.name,
    cargo: user.role,
    email: user.email,
  })
}

export function demoUsuarioFromEmail(email) {
  const session = sessionFromEmail(email)
  return {
    id: Number.parseInt(session.userId.replace(/\D/g, ''), 10) || 0,
    filial: null,
    nome: session.name,
    cargo: session.role,
    email: session.email,
  }
}

export function loadConfig() {
  const stored = read('config', {})
  return {
    ...defaultConfig,
    ...stored,
    thresholds: { ...defaultConfig.thresholds, ...stored.thresholds },
    financialRules: stored.financialRules ?? defaultConfig.financialRules,
    notifications: {
      ...defaultConfig.notifications,
      ...stored.notifications,
      kinds: { ...defaultConfig.notifications.kinds, ...stored.notifications?.kinds },
    },
    openFinance: { ...defaultConfig.openFinance, ...stored.openFinance },
    aiApi: { ...defaultConfig.aiApi, ...stored.aiApi },
    theme: stored.theme === 'dark' ? 'dark' : 'light',
  }
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

 








export function loadSnapshot() {
  let usuario = loadUsuario()
  let token = loadToken()
  if (!usuario || !token) {
    if (usuario || token) clearSession()
    usuario = null
    token = null
  }
  return {
    usuario,
    token,
    session: usuario ? sessionFromUsuario(usuario) : null,
    scope: read('scope', 'grupo'),
    period: read('period', null),
    config: loadConfig(),
    audit: read('audit', []),
  }
}
