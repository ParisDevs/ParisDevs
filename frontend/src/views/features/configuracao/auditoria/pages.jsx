import { useState } from 'react'
import { Drawer, Empty, Input, PageHeader, Table, Td, Kv } from '@/views/ui'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { ConfigCrumbs } from '@/views/features/configuracao/shell'

export function AuditoriaPage() {
  const { audit } = useAppViewModel()
  const [q, setQ] = useState({ user: '', entity: '' })
  const [open, setOpen] = useState(null)
  const rows = audit.filter(
    (a) => (!q.user || a.user.includes(q.user)) && (!q.entity || a.entity.toLowerCase().includes(q.entity.toLowerCase())),
  )
  const item = open !== null ? rows[open] : null
  return (
    <div>
      <PageHeader kicker="Configuração" title="Auditoria" subtitle="Registro de ações neste ambiente. Não substitui trilha fiscal." />
      <ConfigCrumbs current="Auditoria" />
      <Table
        columns={['Quando', 'Quem', 'Entidade', 'O que mudou']}
        empty={!rows.length ? <Empty>Nenhum registro neste filtro.</Empty> : null}
        footer={<span>Exibindo {rows.length} de {audit.length} registros</span>}
        toolbar={
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Usuário" value={q.user} onChange={(e) => setQ({ ...q, user: e.target.value })} aria-label="Filtrar por usuário" />
            <Input placeholder="Entidade" value={q.entity} onChange={(e) => setQ({ ...q, entity: e.target.value })} aria-label="Filtrar por entidade" />
          </div>
        }
      >
        {rows.map((a, i) => (
          <tr key={a.at + i}>
            <Td nowrap>
              <button type="button" className="font-medium text-primaria hover:underline" onClick={() => setOpen(i)}>
                {a.at.replace('T', ' ').slice(0, 16)}
              </button>
            </Td>
            <Td>{a.user}</Td>
            <Td>{a.entity}</Td>
            <Td>{a.action}</Td>
          </tr>
        ))}
      </Table>
      <Drawer title="Detalhe da alteração" open={!!item} onClose={() => setOpen(null)}>
        {item ? (
          <Kv
            items={[
              { label: 'Usuário', value: item.user },
              { label: 'Data e hora', value: item.at.replace('T', ' ') },
              { label: 'Entidade', value: item.entity },
              { label: 'Valor anterior', value: item.before },
              { label: 'Valor novo', value: item.after },
              { label: 'Motivo', value: item.reason || 'Motivo não informado.' },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  )
}
