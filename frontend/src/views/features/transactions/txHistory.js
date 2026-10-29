import { accounts, mechanismLabels, reconLabels } from '@/models/fixtures'
import { accountLabel, categoryLabel } from '@/models/domain/finance'


export function txHistory(t, audit) {
  const acc = accounts.find((a) => a.id === t.accountId)
  const imported = {
    at: `${t.date}T06:12:00`,
    user: 'Sistema',
    action: 'Importação do extrato',
    entity: `Lançamento ${t.id}`,
    before: '—',
    after: `${accountLabel(t.accountId)} · ${t.description}`,
    reason: acc?.provider ? `Origem ${acc.provider}` : '',
  }
  const classified = t.category
    ? {
        at: `${t.date}T08:30:00`,
        user: t.mechanism === 'manual' ? 'Gabriela Veríssimo' : 'Sistema',
        action: 'Classificação',
        entity: `Lançamento ${t.id}`,
        before: 'Sem classificação',
        after: `${categoryLabel(t.category)} · ${mechanismLabels[t.mechanism]} (${t.confidence}%)`,
        reason: '',
      }
    : null
  const recon =
    t.recon !== 'pendente'
      ? {
          at: `${t.date}T09:15:00`,
          user: t.recon === 'sugestao' || t.recon === 'divergencia' || t.recon === 'duplicidade' ? 'Sistema' : 'Gabriela Veríssimo',
          action: 'Conciliação',
          entity: `Lançamento ${t.id}`,
          before: 'Pendente',
          after: reconLabels[t.recon],
          reason: '',
        }
      : null
  const extra = audit.filter((a) => a.entity.includes(t.id))
  return [imported, classified, recon, ...extra]
    .filter((row) => Boolean(row))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
}
