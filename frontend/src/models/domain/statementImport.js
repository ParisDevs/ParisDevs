

export const IMPORT_MAX_BYTES = 8 * 1024 * 1024
export const IMPORT_EXTENSIONS = {
  ofx: ['.ofx', '.qfx'],
  csv: ['.csv'],
  pdf: ['.pdf'],
  txt: ['.txt'],
  xml: ['.xml'],
}

const DATE_RE = /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{8})/
const AMOUNT_RE = /-?\d[\d.]*,\d{2}|-?\d+\.\d{2}/

export function formatFromName(name) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.ofx') || lower.endsWith('.qfx')) return 'ofx'
  if (lower.endsWith('.csv')) return 'csv'
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.txt')) return 'txt'
  if (lower.endsWith('.xml')) return 'xml'
  return null
}

export function validateImportFile(file) {
  if (file.size > IMPORT_MAX_BYTES) return 'O arquivo excede 8 MB.'
  if (!formatFromName(file.name)) return 'Formato não aceito. Use OFX, CSV, PDF, TXT ou XML.'
  return null
}

function toIso(raw) {
  const v = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  if (/^\d{8}/.test(v)) return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return ''
}

function toAmount(raw) {
  const v = raw.trim().replace(/\s/g, '')
  if (!v) return NaN
  if (v.includes(',') && v.includes('.')) return Number(v.replace(/\./g, '').replace(',', '.'))
  if (v.includes(',')) return Number(v.replace(',', '.'))
  return Number(v)
}

function missingOf(row) {
  const missing = []
  if (!row.date) missing.push('data')
  if (!row.description.trim()) missing.push('descrição')
  if (!Number.isFinite(row.amount) || row.amount === 0) missing.push('valor')
  return missing
}

function previewRow(partial) {
  const id = partial.id ?? `p-${Math.random().toString(36).slice(2, 9)}`
  const missing = missingOf(partial)
  return { ...partial, id, missing, confidence: partial.confidence ?? (missing.length ? 40 : 90) }
}

function tag(block, name) {
  const re = new RegExp(`<${name}>([^<\\n\\r]+)`, 'i')
  return block.match(re)?.[1]?.trim() ?? ''
}

export function parseOfx(text) {
  const chunks = text.split(/<STMTTRN>/i).slice(1)
  return chunks.map((chunk) => {
    const amount = toAmount(tag(chunk, 'TRNAMT'))
    const posted = tag(chunk, 'DTPOSTED')
    return previewRow({
      date: toIso(posted.slice(0, 8)),
      description: tag(chunk, 'MEMO') || tag(chunk, 'NAME') || 'Movimentação OFX',
      counterparty: tag(chunk, 'NAME'),
      document: tag(chunk, 'CHECKNUM'),
      amount,
      fitId: tag(chunk, 'FITID'),
      confidence: 92,
    })
  })
}

export function parseOfxXml(text) {
  const chunks = [...text.matchAll(/<StmtTrn\b[\s\S]*?<\/StmtTrn>/gi)].map((m) => m[0])
  if (!chunks.length) return parseOfx(text)
  return chunks.map((chunk) => {
    const get = (name) => chunk.match(new RegExp(`<${name}[^>]*>([^<]*)`, 'i'))?.[1]?.trim() ?? ''
    return previewRow({
      date: toIso(get('DtPosted').slice(0, 8) || get('dtposted').slice(0, 8)),
      description: get('Memo') || get('Name') || 'Movimentação OFX XML',
      counterparty: get('Name'),
      document: get('CheckNum'),
      amount: toAmount(get('TrnAmt')),
      fitId: get('FitId'),
      confidence: 90,
    })
  })
}

export function parseBankXml(text) {
  if (/<STMTTRN>|<StmtTrn/i.test(text)) return parseOfxXml(text)
  const nodes = [...text.matchAll(/<(?:transaction|lancamento|movimento)[^>]*>[\s\S]*?<\/(?:transaction|lancamento|movimento)>/gi)].map((m) => m[0])
  if (!nodes.length) return []
  return nodes.map((node) => {
    const get = (name) => node.match(new RegExp(`<${name}[^>]*>([^<]*)`, 'i'))?.[1]?.trim() ?? ''
    const amount = toAmount(get('valor') || get('amount') || get('value'))
    return previewRow({
      date: toIso(get('data') || get('date')),
      description: get('descricao') || get('historico') || get('description') || 'Movimentação XML',
      counterparty: get('contraparte') || get('favorecido') || get('nome'),
      document: get('documento') || get('document'),
      amount,
      fitId: get('id') || get('fitid'),
      confidence: 78,
    })
  })
}

function splitCsvLine(line, sep) {
  const out = []
  let cur = ''
  let q = false
  for (const ch of line) {
    if (ch === '"') {
      q = !q
      continue
    }
    if (ch === sep && !q) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const sep = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ';' : ','
  const header = splitCsvLine(lines[0], sep).map((h) => h.toLowerCase())
  const idx = (names) => header.findIndex((h) => names.some((n) => h.includes(n)))
  const iDate = idx(['data', 'date', 'dt'])
  const iDesc = idx(['descr', 'historico', 'memo', 'lançamento', 'lancamento'])
  const iAmt = idx(['valor', 'amount', 'value'])
  const iParty = idx(['contraparte', 'favorecido', 'nome', 'terceiro'])
  const iDoc = idx(['documento', 'doc', 'nfe', 'id'])
  if (iDate < 0 || iAmt < 0) return []
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line, sep)
    return previewRow({
      date: toIso(cols[iDate] ?? ''),
      description: cols[iDesc] || 'Movimentação CSV',
      counterparty: iParty >= 0 ? cols[iParty] ?? '' : '',
      document: iDoc >= 0 ? cols[iDoc] ?? '' : '',
      amount: toAmount(cols[iAmt] ?? ''),
      fitId: '',
      confidence: 88,
    })
  })
}

export function parseTxt(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const rows = []
  for (const line of lines) {
    const dateMatch = line.match(DATE_RE)
    const amtMatch = line.match(AMOUNT_RE)
    if (!dateMatch || !amtMatch) continue
    const date = toIso(dateMatch[0])
    const amount = toAmount(amtMatch[0])
    const description = line.replace(dateMatch[0], '').replace(amtMatch[0], '').replace(/\s{2,}/g, ' ').trim() || 'Movimentação TXT'
    rows.push(previewRow({ date, description, counterparty: '', document: '', amount, fitId: '', confidence: 70 }))
  }
  return rows
}

export function parsePdfText(text) {
  const compact = text.replace(/\u0000/g, ' ')
  const hasStream = /BT[\s\S]{8,}ET/.test(compact) || DATE_RE.test(compact)
  if (!hasStream) return { rows: [], extracted: false }
  const fromTxt = parseTxt(compact.replace(/[^\x20-\x7E\n\rÀ-ÿ]/g, ' '))
  return { rows: fromTxt.map((r) => ({ ...r, confidence: Math.min(r.confidence, 55) })), extracted: fromTxt.length > 0 }
}

export function parseByFormat(format, text) {
  if (format === 'ofx') {
    const rows = /<\?xml|<OFX>|<ofx>/i.test(text) && /<StmtTrn/i.test(text) ? parseOfxXml(text) : parseOfx(text)
    return rows.length ? { rows } : { rows: [], warning: 'Não encontramos transações OFX neste arquivo.' }
  }
  if (format === 'xml') {
    const rows = parseBankXml(text)
    return rows.length ? { rows } : { rows: [], warning: 'XML reconhecido, mas sem nós de movimentação legíveis.' }
  }
  if (format === 'csv') {
    const rows = parseCsv(text)
    return rows.length ? { rows } : { rows: [], warning: 'CSV sem colunas de data e valor identificáveis.' }
  }
  if (format === 'txt') {
    const rows = parseTxt(text)
    return rows.length ? { rows } : { rows: [], warning: 'Não foi possível ler linhas de extrato neste TXT.' }
  }
  const pdf = parsePdfText(text)
  if (!pdf.extracted) {
    return {
      rows: [],
      warning: 'OCR no navegador não extraiu texto deste PDF. Preencha as movimentações manualmente ou envie OFX/CSV.',
    }
  }
  return { rows: pdf.rows, warning: 'Extração de PDF com confiança limitada. Revise cada campo antes de confirmar.' }
}

export function markDuplicates(rows, existing) {
  return rows.map((row) => {
    const dup = existing.some((t) => {
      if (row.fitId && (t.fitId === row.fitId || t.sourceId === row.fitId)) return true
      return t.date === row.date && t.amount === row.amount && t.description.trim().toLowerCase() === row.description.trim().toLowerCase()
    })
    return dup ? { ...row, possibleDuplicate: true } : row
  })
}
