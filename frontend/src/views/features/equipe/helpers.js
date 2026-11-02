import { date } from '@/lib/format'

const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export function horaRelogio(iso) {
  const raw = String(iso || '')
  const time = raw.slice(11, 16)
  return /^\d{2}:\d{2}$/.test(time) ? time : ''
}

export function horaCurta(iso) {
  if (!iso) return ''
  const raw = String(iso)
  const day = raw.slice(0, 10)
  const time = horaRelogio(raw)
  const hoje = new Date()
  const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
  if (day === hojeIso) return time || 'agora'
  const ontem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1)
  const ontemIso = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`
  if (day === ontemIso) return time || 'ontem'
  return time ? `${date(day)} ${time}` : date(day)
}

export function rotuloDia(iso) {
  const day = String(iso || '').slice(0, 10)
  const hoje = new Date()
  const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
  if (day === hojeIso) return 'Hoje'
  const ontem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1)
  const ontemIso = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`
  if (day === ontemIso) return 'Ontem'
  return date(day)
}

export function agruparMensagens(mensagens) {
  const grupos = []
  let atual = null
  for (const msg of mensagens) {
    const dia = String(msg.criadoEm || '').slice(0, 10)
    if (!atual || atual.dia !== dia) {
      atual = { dia, label: rotuloDia(msg.criadoEm), items: [] }
      grupos.push(atual)
    }
    atual.items.push(msg)
  }
  return grupos
}

export function preview(texto) {
  const limpo = String(texto || '').replace(/\s+/g, ' ').trim()
  if (!limpo) return 'Sem mensagens'
  return limpo.length > 48 ? `${limpo.slice(0, 45)}…` : limpo
}

export function diasDoMes(ano, mes) {
  const primeiro = new Date(ano, mes - 1, 1)
  const desloc = (primeiro.getDay() + 6) % 7
  const total = new Date(ano, mes, 0).getDate()
  const celulas = []
  for (let i = 0; i < desloc; i += 1) celulas.push(null)
  for (let d = 1; d <= total; d += 1) {
    const iso = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    celulas.push({ dia: d, iso })
  }
  return { celulas, weekdays: WEEKDAYS }
}

export function mesAtual() {
  const agora = new Date()
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 }
}

export function rotuloMes(ano, mes) {
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  const nome = nomes[mes - 1] ?? ''
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`
}

export function emitirNaoLidas(total) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('equipe:nao-lidas', { detail: Number(total) || 0 }))
}
