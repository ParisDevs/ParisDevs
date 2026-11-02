export function razaoDaLinha(row) {
  const base = String(row?.counterparty || row?.description || 'Extrato').trim() || 'Extrato'
  const doc = String(row?.document || '').trim()
  return doc ? `${base} · ${doc}` : base
}

export function categoriaDaLinha(row) {
  const texto = `${row?.description || ''} ${row?.counterparty || ''}`.toLowerCase()
  return texto.includes('transfer') ? 'Transferência' : 'Extrato'
}

export function operacaoDaLinha(row, accountId) {
  const amount = Number(row.amount)
  return {
    idContaBancaria: Number(accountId),
    tipoOperacao: amount < 0 ? 'PAGAMENTO' : 'RECEBIMENTO',
    valorOperacao: Math.round(Math.abs(amount) * 100) / 100,
    razaoSocial: razaoDaLinha(row),
    categoria: categoriaDaLinha(row),
    dtHora: `${row.date}T12:00:00`,
  }
}

function cents(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return null
  return Math.round(Math.abs(number) * 100)
}

export function linhaJaExistente(row, operacoes, accountId) {
  const razao = razaoDaLinha(row).toLowerCase()
  const valor = cents(row.amount)
  const tipo = Number(row.amount) < 0 ? 'PAGAMENTO' : 'RECEBIMENTO'
  return (operacoes || []).some((op) =>
    op.accountId === String(accountId)
    && op.date === row.date
    && op.tipo === tipo
    && cents(op.amount) === valor
    && String(op.razaoSocial || '').trim().toLowerCase() === razao,
  )
}
