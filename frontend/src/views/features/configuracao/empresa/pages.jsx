import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BankLogo } from '@/views/components/BankLogo'
import { Badge, Banner, Button, Card, Empty, Field, PageHeader, Select, Table, Td, Toast } from '@/views/ui'
import { configStatusMeta } from '@/models/domain/configuracao'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { useConfiguracaoViewModel } from '@/viewmodels/configuracao/useConfiguracaoViewModel'
import { CardAlso, ConfigCrumbs } from '@/views/features/configuracao/shell'

export function CnpjsPage() {
  const { filiais } = useConfiguracaoViewModel()
  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="CNPJs"
        subtitle="Consulta das empresas cadastradas. O cadastro fica em Organização."
        actions={
          <Link to="/configuracoes/organizacao">
            <Button>Cadastro em Organização</Button>
          </Link>
        }
      />
      <ConfigCrumbs current="CNPJs" />
      <Table
        columns={['Filial', 'CNPJ', 'Endereço']}
        empty={!filiais.length ? <Empty>Nenhuma filial.</Empty> : null}
        footer={filiais.length ? <span>Exibindo {filiais.length} filiais</span> : null}
      >
        {filiais.map((f) => (
          <tr key={f.idFilial}>
            <Td>{f.razaoSocial || '—'}</Td>
            <Td nowrap>{f.cnpj || '—'}</Td>
            <Td>{f.endereco || '—'}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function CnpjFormPage() {
  return (
    <div>
      <PageHeader kicker="Configuração" title="CNPJ" subtitle="Cadastro de CNPJ não está operacional neste slice." />
      <ConfigCrumbs current="CNPJ" />
      <Card className="max-w-xl space-y-4">
        <Banner tone="info">O cadastro de empresas é feito em Organização.</Banner>
        <CardAlso>
          <Link to="/configuracoes/cnpjs">
            <Button variant="secondary">Ver filiais</Button>
          </Link>
          <Link to="/configuracoes/organizacao">
            <Button variant="secondary">Organização</Button>
          </Link>
        </CardAlso>
      </Card>
    </div>
  )
}

export function BancosPage() {
  const { accounts } = useAppViewModel()
  const bancos = [...new Set(accounts.map((a) => a.bank))]
  return (
    <div>
      <PageHeader kicker="Configuração" title="Bancos" subtitle="Cadastro resumido. A conexão com o titular fica em Operação → Conexões bancárias." />
      <ConfigCrumbs current="Bancos" />
      <Table
        columns={['Banco', 'Contas']}
        empty={!bancos.length ? <Empty>Nenhum banco neste cadastro local.</Empty> : null}
      >
        {bancos.map((b) => (
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
      <Card className="mt-4 max-w-xl">
        <CardAlso flush>
          <Link to="/conexoes">
            <Button variant="secondary">Conexões bancárias</Button>
          </Link>
          <Link to="/configuracoes/contas">
            <Button variant="secondary">Contas bancárias</Button>
          </Link>
          <Link to="/configuracoes/open-finance">
            <Button variant="secondary">Open Finance</Button>
          </Link>
        </CardAlso>
      </Card>
    </div>
  )
}

export function ContasBancariasPage() {
  const { accounts } = useAppViewModel()
  return (
    <div>
      <PageHeader kicker="Configuração" title="Contas bancárias" subtitle="Contas do cadastro local. A autorização Open Finance é feita em Conexões." />
      <ConfigCrumbs current="Contas bancárias" />
      <Table
        columns={['Banco', 'Conta', 'Saldo', 'Status']}
        empty={!accounts.length ? <Empty>Nenhuma conta neste cadastro local.</Empty> : null}
      >
        {accounts.map((a) => (
          <tr key={a.id}>
            <Td>
              <span className="flex items-center gap-2.5">
                <BankLogo bank={a.bank} size={28} />
                {a.bank}
              </span>
            </Td>
            <Td>{a.number}</Td>
            <Td className="num">
              {a.balanceUnavailable || a.connected === false
                ? 'Indisponível'
                : a.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Td>
            <Td>
              {a.connected === false
                ? 'Desconectada'
                : a.status === 'ok'
                  ? 'Conectada'
                  : a.status === 'erro'
                    ? 'Erro de conexão'
                    : 'Sincronização atrasada'}
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function OpenFinancePage() {
  const { config, saveConfig, recordAudit } = useAppViewModel()
  const [toast, setToast] = useState(null)
  const [provider, setProvider] = useState(config.openFinance.provider)
  const status = configStatusMeta(config.openFinance.status)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Open Finance" subtitle="Parâmetros locais do provedor. A autorização das contas é feita em Conexões bancárias." />
      <ConfigCrumbs current="Open Finance" />
      <Banner tone="info" className="mb-4">
        Integração ainda não operacional. Os valores ficam só neste dispositivo.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="t-h3">Provedor</h2>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <Field label="Provedor">
          <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="">Selecionar depois</option>
            <option value="pluggy">Provedor compatível (a definir)</option>
            <option value="proprio">Implementação autorizada própria</option>
          </Select>
        </Field>
        <p className="t-apoio">
          {config.openFinance.clientIdMasked
            ? `Client ID mascarado: ${config.openFinance.clientIdMasked}`
            : 'Nenhuma credencial técnica.'}
        </p>
        {config.openFinance.lastError ? <Banner tone="error">{config.openFinance.lastError}</Banner> : null}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              saveConfig({
                openFinance: {
                  ...config.openFinance,
                  provider,
                  status: provider ? 'configurado' : 'nao_configurado',
                },
              })
              recordAudit({
                action: 'Parâmetros Open Finance',
                entity: 'Integração',
                before: config.openFinance.provider || 'vazio',
                after: provider || 'vazio',
                reason: 'Somente configuração local.',
              })
              setToast('Parâmetros salvos neste dispositivo.')
            }}
          >
            Salvar
          </Button>
        </div>
        <CardAlso>
          <Link to="/configuracoes/credenciais">
            <Button variant="secondary">Credenciais</Button>
          </Link>
          <Link to="/conexoes">
            <Button variant="secondary">Contas conectadas</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}
