import { useState } from 'react'
import { Button, Card, Field, Input, Modal, PageHeader, Select, Table, Td, Toast } from '@/components/ui'
import { chartOfAccounts, classificationRules, companies, costCenters } from '@/data/fixtures'
import { categoryLabel } from '@/domain/finance'

export function PlanoPage() {
  const [open, setOpen] = useState<'nova' | 'editar' | 'sub' | 'import' | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const roots = chartOfAccounts.filter((c) => !c.parent)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Plano de contas" actions={<div className="flex gap-2"><Button onClick={() => setOpen('nova')}>Nova categoria</Button><Button variant="secondary" onClick={() => setOpen('import')}>Importar</Button></div>} />
      {roots.map((root) => (
        <Card key={root.code} className="mb-4">
          <h2 className="t-h2 mb-3">{root.name}</h2>
          {chartOfAccounts.filter((c) => c.parent === root.code).map((c) => (
            <div key={c.code} className="border-b border-borda py-2">
              <button type="button" className="t-body" onClick={() => setOpen('editar')}>{c.name}</button>
              <div className="ml-4">
                {chartOfAccounts.filter((s) => s.parent === c.code).map((s) => (
                  <p key={s.code} className="t-apoio py-1">{s.name}</p>
                ))}
              </div>
            </div>
          ))}
        </Card>
      ))}
      <Modal title="Nova categoria" open={open === 'nova'} onClose={() => setOpen(null)} footer={<><Button variant="secondary" onClick={() => setOpen(null)}>Cancelar</Button><Button onClick={() => { setToast('Categoria salva.'); setOpen(null) }}>Salvar</Button></>}>
        <div className="space-y-4"><Field label="Nome"><Input /></Field><Field label="Grupo"><Select><option>Receita</option><option>Custo</option><option>Despesa operacional</option><option>Despesa financeira</option></Select></Field></div>
      </Modal>
      <Modal title="Editar categoria" open={open === 'editar'} onClose={() => setOpen(null)} footer={<Button onClick={() => setOpen(null)}>Salvar</Button>}>
        <Field label="Nome"><Input defaultValue="Vendas" /></Field>
        <Button variant="ghost" className="mt-3" onClick={() => setOpen('sub')}>Nova subcategoria</Button>
      </Modal>
      <Modal title="Nova subcategoria" open={open === 'sub'} onClose={() => setOpen(null)} footer={<Button onClick={() => setOpen(null)}>Salvar</Button>}>
        <Field label="Nome"><Input /></Field>
      </Modal>
      <Modal title="Importar plano de contas" open={open === 'import'} onClose={() => setOpen(null)} footer={<Button onClick={() => { setToast('Plano importado.'); setOpen(null) }}>Importar</Button>}>
        <Field label="Arquivo"><Input type="file" /></Field>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}

export function CentrosPage() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Centros de custo" actions={<Button onClick={() => setOpen(true)}>Novo centro de custo</Button>} />
      <Table columns={['Nome', 'Tipo', 'Empresa']}>
        {costCenters.map((c) => <tr key={c.id}><Td>{c.name}</Td><Td>{c.type}</Td><Td>{companies.find((x) => x.id === c.companyId)?.fantasy ?? 'Grupo'}</Td></tr>)}
      </Table>
      <Modal title="Novo centro de custo" open={open} onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Salvar</Button>}>
        <Field label="Nome"><Input /></Field>
      </Modal>
    </div>
  )
}

export function RegrasClassPage() {
  return (
    <div>
      <PageHeader kicker="Configuração" title="Regras de classificação" subtitle="Critérios aplicados às movimentações do extrato." />
      <Table columns={['Campo', 'Operador', 'Valor', 'Categoria', 'Acertos']}>
        {classificationRules.map((r) => <tr key={r.id}><Td>{r.field}</Td><Td>{r.operator}</Td><Td>{r.value}</Td><Td>{categoryLabel(r.category)}</Td><Td>{r.hits}</Td></tr>)}
      </Table>
    </div>
  )
}
