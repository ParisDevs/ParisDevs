import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Banner, Button, Card, Empty, Field, Input, PageHeader, Select, Toast } from '@/views/ui'
import { configStatusMeta } from '@/models/domain/configuracao'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { CardAlso, CheckRow, ConfigCrumbs } from '@/views/features/configuracao/shell'

export function CredenciaisPage() {
  const { config, saveConfig, recordAudit } = useAppViewModel()
  const [secret, setSecret] = useState(null)
  const [client, setClient] = useState('')
  const [toast, setToast] = useState(null)
  const status = configStatusMeta(config.openFinance.status)
  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="Credenciais Open Finance"
        subtitle="Parâmetros técnicos do provedor. O segredo é mostrado uma vez e gravado só de forma mascarada neste dispositivo."
      />
      <ConfigCrumbs current="Credenciais" />
      <Banner tone="info" className="mb-4">
        Nenhum provedor Open Finance está operacional. Estes campos preparam a integração.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="t-h3">Status</h2>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        {config.openFinance.clientIdMasked ? (
          <p className="t-apoio">Client ID: {config.openFinance.clientIdMasked}</p>
        ) : (
          <Empty>Nenhuma credencial armazenada.</Empty>
        )}
        {secret ? <Banner>Copie o segredo agora. Ele não será exibido de novo. · {secret}</Banner> : null}
        {config.openFinance.lastError ? <Banner tone="error">{config.openFinance.lastError}</Banner> : null}
        <Field label="Client ID do provedor">
          <Input value={client} onChange={(e) => setClient(e.target.value)} autoComplete="off" />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              const raw = 'of_' + Date.now().toString(36)
              setSecret(raw)
              saveConfig({
                openFinance: {
                  ...config.openFinance,
                  provider: 'pendente',
                  status: 'configurado',
                  clientIdMasked: (client || 'client').slice(0, 4) + '••••',
                  lastError: '',
                },
              })
              recordAudit({
                action: 'Credencial Open Finance',
                entity: 'Provedor',
                before: config.openFinance.status,
                after: 'configurado',
                reason: 'Segredo não é auditado.',
              })
              setToast('Credencial mascarada salva neste dispositivo.')
            }}
          >
            Salvar parâmetros
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSecret(null)
              saveConfig({ openFinance: { provider: '', status: 'nao_configurado', clientIdMasked: '', lastError: '' } })
              setToast('Credencial revogada neste dispositivo.')
            }}
          >
            Revogar
          </Button>
        </div>
        <CardAlso>
          <Link to="/configuracoes/open-finance">
            <Button variant="secondary">Open Finance</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function IaConfigPage() {
  const { config, saveConfig, recordAudit } = useAppViewModel()
  const [toast, setToast] = useState(null)
  const [key, setKey] = useState('')
  const status = configStatusMeta(config.aiApi.status)
  return (
    <div>
      <PageHeader
        kicker="Configuração"
        title="API de IA"
        subtitle="Provedor opcional para classificação assistida. A chave nunca é exibida por completo depois de salva."
      />
      <ConfigCrumbs current="API de IA" />
      <Banner tone="info" className="mb-4">
        Classificação automática por modelo generativo ainda não está operacional. Regras e revisão manual continuam valendo.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="t-h3">Provedor</h2>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <Field label="Provedor">
          <Select
            value={config.aiApi.provider}
            onChange={(e) => saveConfig({ aiApi: { ...config.aiApi, provider: e.target.value } })}
          >
            <option value="">Não configurado</option>
            <option value="openai">OpenAI</option>
            <option value="azure">Azure OpenAI</option>
          </Select>
        </Field>
        <Field label="Chave da API">
          <Input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={config.aiApi.keyMasked || 'Cole a chave'}
            autoComplete="off"
          />
        </Field>
        {config.aiApi.keyMasked ? <p className="t-apoio">Chave mascarada: {config.aiApi.keyMasked}</p> : null}
        <h2 className="t-h3 pt-2">Revisão</h2>
        <CheckRow
          checked={!!config.useRules}
          onChange={(e) => saveConfig({ useRules: e.target.checked })}
        >
          Usar regras determinísticas
        </CheckRow>
        <CheckRow
          checked={!!config.useHistory}
          onChange={(e) => saveConfig({ useHistory: e.target.checked })}
        >
          Usar histórico do fornecedor
        </CheckRow>
        <CheckRow
          checked={!!config.requireHuman}
          onChange={(e) => saveConfig({ requireHuman: e.target.checked })}
        >
          Exigir revisão humana abaixo do limite
        </CheckRow>
        <Button
          onClick={() => {
            if (key) {
              saveConfig({
                aiApi: {
                  ...config.aiApi,
                  status: 'configurado',
                  keyMasked: key.slice(0, 3) + '••••' + key.slice(-2),
                  lastError: '',
                },
              })
              recordAudit({
                action: 'Chave de IA atualizada',
                entity: 'API de IA',
                before: config.aiApi.status,
                after: 'configurado',
                reason: 'Valor da chave não é registrado na auditoria.',
              })
              setKey('')
            }
            setToast('Preferências salvas neste dispositivo. A chave, se informada, ficou mascarada.')
          }}
        >
          Salvar
        </Button>
        <CardAlso>
          <Link to="/configuracoes/limites">
            <Button variant="secondary">Limites de confiança</Button>
          </Link>
          <Link to="/regras-classificacao">
            <Button variant="secondary">Regras de classificação</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function LimitesPage() {
  const { config, saveConfig } = useAppViewModel()
  const [auto, setAuto] = useState(config.thresholds.auto)
  const [suggest, setSuggest] = useState(config.thresholds.suggest)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Limites de confiança" subtitle="Limiar abaixo do qual a classificação fica na fila de revisão." />
      <ConfigCrumbs current="Limites de confiança" />
      <Banner tone="info" className="mb-4">
        Estes percentuais ficam neste dispositivo. Não há motor de IA operacional.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <Field label="Classificação automática">
          <Input type="number" value={auto} onChange={(e) => setAuto(Number(e.target.value))} />
        </Field>
        <p className="t-apoio">A partir de {auto}%</p>
        <Field label="Sugestão para aprovação">
          <Input type="number" value={suggest} onChange={(e) => setSuggest(Number(e.target.value))} />
        </Field>
        <p className="t-apoio">De {suggest}% a {auto - 1}%</p>
        <Field label="Revisão obrigatória">
          <Input readOnly value={`Abaixo de ${suggest}%`} />
        </Field>
        {error ? <p className="t-body text-erro">{error}</p> : null}
        <Button
          onClick={() => {
            if (suggest >= auto) {
              setError('As faixas não podem se sobrepor.')
              return
            }
            saveConfig({ thresholds: { auto, suggest } })
            setError('')
            setToast('Preferências salvas neste dispositivo.')
          }}
        >
          Salvar
        </Button>
        <CardAlso>
          <Link to="/configuracoes/ia">
            <Button variant="secondary">API de IA</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function RegrasFinPage() {
  const { config, saveConfig } = useAppViewModel()
  const [limit, setLimit] = useState(String(config.financialRules[0]?.limit ?? ''))
  const [applyTo, setApplyTo] = useState('grupo')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Regras financeiras" subtitle="Critérios de recorte, transferência e conferência. Gravados neste navegador." />
      <ConfigCrumbs current="Regras financeiras" />
      <Banner tone="info" className="mb-4">
        A regra não é aplicada no servidor neste slice.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <h2 className="t-h3">Mercadorias + mão de obra</h2>
        <p className="t-body text-texto-secundario">Percentual máximo da receita.</p>
        <Field label="Contas da fórmula">
          <Input readOnly value="Mercadorias + Mão de obra" />
        </Field>
        <Field label="Limite (%)" error={error}>
          <Input value={limit} onChange={(e) => setLimit(e.target.value)} />
        </Field>
        <Field label="Aplicar a">
          <Select value={applyTo} onChange={(e) => setApplyTo(e.target.value)}>
            <option value="cnpj">CNPJ</option>
            <option value="grupo">Grupo</option>
          </Select>
        </Field>
        <Button
          onClick={() => {
            if (!limit) {
              setError('Informe o limite.')
              return
            }
            saveConfig({
              financialRules: config.financialRules.map((r, i) => (i === 0 ? { ...r, limit: Number(limit) } : r)),
            })
            setError('')
            setToast('Preferências salvas neste dispositivo.')
          }}
        >
          Salvar
        </Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function MoedaPage() {
  const { config, saveConfig } = useAppViewModel()
  const [currency, setCurrency] = useState(config.currency || 'BRL')
  const [timezone, setTimezone] = useState(config.timezone || 'America/Sao_Paulo')
  const [toast, setToast] = useState(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Moeda e fuso" subtitle="Padrão fiscal deste dispositivo." />
      <ConfigCrumbs current="Moeda e fuso" />
      <Banner tone="info" className="mb-4">
        A escolha fica neste navegador. Não altera lançamentos no banco.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <Field label="Moeda">
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="BRL">Real (BRL)</option>
          </Select>
        </Field>
        <Field label="Fuso horário fiscal">
          <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="America/Sao_Paulo">America/Sao_Paulo</option>
          </Select>
        </Field>
        <Button
          onClick={() => {
            saveConfig({ currency, timezone })
            setToast('Preferências salvas neste dispositivo.')
          }}
        >
          Salvar
        </Button>
        <CardAlso>
          <Link to="/configuracoes/organizacao">
            <Button variant="secondary">Organização</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function PlanoPadraoPage() {
  const [segmento, setSegmento] = useState('restaurante')
  const [toast, setToast] = useState(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Plano de contas padrão" subtitle="Atalho local. Não grava plano no Postgres neste slice." />
      <ConfigCrumbs current="Plano de contas padrão" />
      <Banner tone="info" className="mb-4">
        Aplicar só registra a intenção neste dispositivo.
      </Banner>
      <Card className="max-w-xl space-y-4">
        <Field label="Plano por segmento">
          <Select value={segmento} onChange={(e) => setSegmento(e.target.value)}>
            <option value="restaurante">Restaurante</option>
            <option value="distribuicao">Distribuição de alimentos</option>
          </Select>
        </Field>
        <Button onClick={() => setToast('Plano não foi gravado no servidor. Ajuste a árvore em Plano de contas.')}>
          Aplicar
        </Button>
        <CardAlso>
          <Link to="/plano-de-contas">
            <Button variant="secondary">Plano de contas</Button>
          </Link>
        </CardAlso>
      </Card>
      <Toast message={toast} />
    </div>
  )
}
