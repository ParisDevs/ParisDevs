import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BankLogo } from '@/components/BankLogo'
import { Banner, Button, Card, Field, Input, PageHeader, Select, Table, Td, Toast } from '@/components/ui'
import { companies } from '@/data/fixtures'
import { useApp } from '@/state/AppContext'

export function CnpjsPage() {
  return (
    <div>
      <PageHeader kicker="Configuração" title="CNPJs" actions={<Link to="/configuracoes/cnpjs/novo"><Button>Adicionar CNPJ</Button></Link>} />
      <Table columns={['Empresa', 'CNPJ', 'Cidade']}>
        {companies.map((c) => <tr key={c.id}><Td><Link to={`/configuracoes/cnpjs/${c.id}`}>{c.name}</Link></Td><Td nowrap>{c.cnpj}</Td><Td>{c.city}</Td></tr>)}
      </Table>
    </div>
  )
}

export function CnpjFormPage() {
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')
  return (
    <div>
      <PageHeader kicker="Configuração" title="CNPJ" />
      <Card className="max-w-xl space-y-4">
        <Field label="Razão social"><Input /></Field>
        <Field label="CNPJ" error={error}><Input onChange={() => setError('')} /></Field>
        <Button onClick={() => {
          setError('CNPJ inválido.')
          setToast('')
        }}>Salvar</Button>
      </Card>
      <Toast message={toast || null} />
    </div>
  )
}

export function BancosPage() {
  const { accounts } = useApp()
  return (
    <div>
      <PageHeader kicker="Configuração" title="Bancos" subtitle="Cadastro resumido. A conexão com o titular fica em Operação → Conexões bancárias." />
      <Table columns={['Banco', 'Contas']}>
        {[...new Set(accounts.map((a) => a.bank))].map((b) => (
          <tr key={b}>
            <Td>
              <span className="flex items-center gap-2.5">
                <BankLogo bank={b} size={28} />
                {b}
              </span>
            </Td>
            <Td>{accounts.filter((a) => a.bank === b).length}</Td>
          </tr>
        ))}
      </Table>
      <div className="mt-4 flex gap-3">
        <Link className="t-label" to="/conexoes">Conexões bancárias</Link>
        <Link className="t-label" to="/configuracoes/contas">Contas bancárias</Link>
        <Link className="t-label" to="/configuracoes/open-finance">Parâmetros Open Finance</Link>
      </div>
    </div>
  )
}

export function ContasBancariasPage() {
  const { accounts } = useApp()
  return (
    <div>
      <PageHeader kicker="Configuração" title="Contas bancárias" subtitle="Contas cadastradas. A autorização Open Finance é feita em Conexões." />
      <Table columns={['Banco', 'Conta', 'CNPJ', 'Saldo', 'Status']}>
        {accounts.map((a) => (
          <tr key={a.id}>
            <Td>
              <span className="flex items-center gap-2.5">
                <BankLogo bank={a.bank} size={28} />
                {a.bank}
              </span>
            </Td>
            <Td>{a.number}</Td>
            <Td>{companies.find((c) => c.id === a.companyId)?.code}</Td>
            <Td className="num">{a.balanceUnavailable || a.connected === false ? 'Indisponível' : a.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Td>
            <Td>{a.connected === false ? 'Desconectada' : a.status === 'ok' ? 'Conectada' : a.status === 'erro' ? 'Erro de conexão' : 'Sincronização atrasada'}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function OpenFinancePage() {
  const { config, saveConfig, recordAudit } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  const [provider, setProvider] = useState(config.openFinance.provider)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Open Finance" subtitle="Configuração técnica do provedor. A autorização das contas é feita em Conexões bancárias." />
      <Banner tone="info" className="mb-4">
        Integração ainda não operacional. Status atual: {config.openFinance.status === 'configurado' ? 'parâmetros locais gravados' : 'não configurado'}.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <Field label="Provedor">
          <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="">Selecionar depois</option>
            <option value="pluggy">Provedor compatível (a definir)</option>
            <option value="proprio">Implementação autorizada própria</option>
          </Select>
        </Field>
        <p className="t-apoio">{config.openFinance.clientIdMasked ? `Client ID mascarado: ${config.openFinance.clientIdMasked}` : 'Nenhuma credencial técnica.'}</p>
        {config.openFinance.lastError ? <Banner tone="error">{config.openFinance.lastError}</Banner> : null}
        <div className="flex gap-2">
          <Button onClick={() => {
            saveConfig({ openFinance: { ...config.openFinance, provider, status: provider ? 'configurado' : 'nao_configurado' } })
            recordAudit({ action: 'Parâmetros Open Finance', entity: 'Integração', before: config.openFinance.provider || 'vazio', after: provider || 'vazio', reason: 'Somente configuração local.' })
            setToast('Parâmetros salvos neste dispositivo.')
          }}>Salvar</Button>
          <Link to="/configuracoes/credenciais"><Button variant="secondary">Credenciais</Button></Link>
          <Link to="/conexoes"><Button variant="secondary">Contas conectadas</Button></Link>
        </div>
      </Card>
      <Toast message={toast} />
    </div>
  )
}
