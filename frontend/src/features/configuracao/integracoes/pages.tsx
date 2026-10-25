import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner, Button, Card, Empty, Field, Input, PageHeader, Select, Toast } from '@/components/ui'
import { useApp } from '@/state/AppContext'

export function CredenciaisPage() {
  const { config, saveConfig, recordAudit } = useApp()
  const [secret, setSecret] = useState<string | null>(null)
  const [client, setClient] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Credenciais Open Finance" subtitle="Parâmetros técnicos do provedor. O segredo é mostrado uma vez e gravado só de forma mascarada neste dispositivo." />
      <Banner tone="info" className="mb-4">Nenhum provedor Open Finance está operacional. Estes campos preparam a integração.</Banner>
      <Card className="max-w-xl space-y-4">
        <p className="t-body">Status: {config.openFinance.status === 'configurado' ? 'Configurado (local)' : config.openFinance.status === 'erro' ? 'Erro' : 'Não configurado'}</p>
        {config.openFinance.clientIdMasked ? <p className="t-apoio">Client ID: {config.openFinance.clientIdMasked}</p> : <Empty>Nenhuma credencial armazenada.</Empty>}
        {secret ? <Banner className="mb-2">Copie o segredo agora. Ele não será exibido de novo. · {secret}</Banner> : null}
        {config.openFinance.lastError ? <Banner tone="error">{config.openFinance.lastError}</Banner> : null}
        <Field label="Client ID do provedor"><Input value={client} onChange={(e) => setClient(e.target.value)} autoComplete="off" /></Field>
        <div className="flex gap-2">
          <Button onClick={() => {
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
            recordAudit({ action: 'Credencial Open Finance', entity: 'Provedor', before: config.openFinance.status, after: 'configurado', reason: 'Segredo não é auditado.' })
            setToast('Credencial mascarada salva neste dispositivo.')
          }}>Salvar parâmetros</Button>
          <Button variant="secondary" onClick={() => {
            setSecret(null)
            saveConfig({ openFinance: { provider: '', status: 'nao_configurado', clientIdMasked: '', lastError: '' } })
          }}>Revogar</Button>
        </div>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function IaConfigPage() {
  const { config, saveConfig, recordAudit } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  const [key, setKey] = useState('')
  return (
    <div>
      <PageHeader kicker="Configuração" title="API de IA" subtitle="Provedor opcional para classificação assistida. A chave nunca é exibida por completo depois de salva." />
      <Banner tone="info" className="mb-4">Classificação automática por modelo generativo ainda não está operacional. Regras e revisão manual continuam valendo.</Banner>
      <Card className="max-w-xl space-y-4">
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
          <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder={config.aiApi.keyMasked || 'Cole a chave'} autoComplete="off" />
        </Field>
        <p className="t-apoio">Status: {config.aiApi.status === 'configurado' ? `Configurado · ${config.aiApi.keyMasked}` : 'Não configurado'}</p>
        <label className="t-body flex gap-2"><input type="checkbox" defaultChecked={config.useRules} onChange={(e) => saveConfig({ useRules: e.target.checked })} />Usar regras determinísticas</label>
        <label className="t-body flex gap-2"><input type="checkbox" defaultChecked={config.useHistory} onChange={(e) => saveConfig({ useHistory: e.target.checked })} />Usar histórico do fornecedor</label>
        <label className="t-body flex gap-2"><input type="checkbox" defaultChecked={config.requireHuman} onChange={(e) => saveConfig({ requireHuman: e.target.checked })} />Exigir revisão humana abaixo do limite</label>
        <div className="flex gap-3">
          <Link className="t-label" to="/configuracoes/limites">Limites de confiança</Link>
          <Link className="t-label" to="/regras-classificacao">Regras de classificação</Link>
        </div>
        <Button onClick={() => {
          if (key) {
            saveConfig({
              aiApi: {
                ...config.aiApi,
                status: 'configurado',
                keyMasked: key.slice(0, 3) + '••••' + key.slice(-2),
                lastError: '',
              },
            })
            recordAudit({ action: 'Chave de IA atualizada', entity: 'API de IA', before: config.aiApi.status, after: 'configurado', reason: 'Valor da chave não é registrado na auditoria.' })
            setKey('')
          }
          setToast('Preferências salvas. A chave, se informada, ficou mascarada neste dispositivo.')
        }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function LimitesPage() {
  const { config, saveConfig } = useApp()
  const [auto, setAuto] = useState(config.thresholds.auto)
  const [suggest, setSuggest] = useState(config.thresholds.suggest)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Limites de confiança" subtitle="Limiar abaixo do qual a classificação fica na fila de revisão." />
      <Card className="max-w-xl space-y-4">
        <Field label="Classificação automática"><Input type="number" value={auto} onChange={(e) => setAuto(Number(e.target.value))} /></Field>
        <p className="t-apoio">A partir de {auto}%</p>
        <Field label="Sugestão para aprovação"><Input type="number" value={suggest} onChange={(e) => setSuggest(Number(e.target.value))} /></Field>
        <p className="t-apoio">De {suggest}% a {auto - 1}%</p>
        <Field label="Revisão obrigatória"><Input readOnly value={`Abaixo de ${suggest}%`} /></Field>
        {error ? <p className="t-body text-erro">{error}</p> : null}
        <Button onClick={() => {
          if (suggest >= auto) { setError('As faixas não podem se sobrepor.'); return }
          saveConfig({ thresholds: { auto, suggest } })
          setError('')
          setToast('Preferências da organização salvas.')
        }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function RegrasFinPage() {
  const { config, saveConfig } = useApp()
  const [limit, setLimit] = useState(String(config.financialRules[0]?.limit ?? ''))
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Regras financeiras" subtitle="Critérios de recorte, transferência e conferência." />
      <Card className="max-w-xl space-y-4">
        <p className="t-body">Mercadorias + mão de obra ≤ percentual da receita</p>
        <Field label="Contas da fórmula"><Input readOnly value="Mercadorias + Mão de obra" /></Field>
        <Field label="Limite (%)" error={error}><Input value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
        <Field label="Aplicar a"><Select><option>CNPJ</option><option>Grupo</option></Select></Field>
        <Button onClick={() => {
          if (!limit) { setError('Informe o limite.'); return }
          saveConfig({ financialRules: config.financialRules.map((r, i) => i === 0 ? { ...r, limit: Number(limit) } : r) })
          setToast('Preferências da organização salvas.')
        }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function MoedaPage() {
  const { saveConfig } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Moeda e fuso" />
      <Card className="max-w-xl space-y-4">
        <Field label="Moeda"><Select defaultValue="BRL"><option value="BRL">Real (BRL)</option></Select></Field>
        <Field label="Fuso horário fiscal"><Select defaultValue="America/Sao_Paulo"><option>America/Sao_Paulo</option></Select></Field>
        <Button onClick={() => { saveConfig({ currency: 'BRL', timezone: 'America/Sao_Paulo' }); setToast('Preferências da organização salvas.') }}>Salvar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}

export function PlanoPadraoPage() {
  const [toast, setToast] = useState<string | null>(null)
  return (
    <div>
      <PageHeader kicker="Configuração" title="Plano de contas padrão" />
      <Card className="max-w-xl space-y-4">
        <Field label="Plano por segmento"><Select><option>Restaurante</option><option>Distribuição de alimentos</option></Select></Field>
        <Button onClick={() => setToast('Plano aplicado. Ajuste a árvore em seguida.')}>Aplicar</Button>
      </Card>
      <Toast message={toast} />
    </div>
  )
}
