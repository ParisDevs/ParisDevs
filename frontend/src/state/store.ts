import { defaultConfig, users } from '@/data/fixtures'
import type { AppConfig, AuditEntry, Session } from '@/domain/types'

const PREFIX = 'pd.'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* armazenamento indisponível */
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* noop */
  }
}

export const persist = { read, write, remove }

export function loadSession(): Session | null {
  const persistent = read<Session | null>('session', null)
  if (persistent) return persistent
  try {
    const raw = sessionStorage.getItem(PREFIX + 'session')
    return raw === null ? null : (JSON.parse(raw) as Session)
  } catch {
    return null
  }
}

export function saveSession(session: Session, remember = true) {
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
  try {
    sessionStorage.removeItem(PREFIX + 'session')
  } catch {
    /* noop */
  }
}

export function sessionFromEmail(email: string): Session {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? users[0]
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    firstAccess: !user.mfa,
  }
}

export function loadConfig(): AppConfig {
  const stored = read<Partial<AppConfig>>('config', {})
  return {
    ...defaultConfig,
    ...stored,
    thresholds: { ...defaultConfig.thresholds, ...stored.thresholds },
    financialRules: stored.financialRules ?? defaultConfig.financialRules,
  }
}

export type AppSnapshot = {
  session: Session | null
  scope: string
  period: string
  config: AppConfig
  audit: AuditEntry[]
}

export function loadSnapshot(): AppSnapshot {
  return {
    session: loadSession(),
    scope: read('scope', 'grupo'),
    period: read('period', '2026-09'),
    config: loadConfig(),
    audit: read('audit', []),
  }
}
