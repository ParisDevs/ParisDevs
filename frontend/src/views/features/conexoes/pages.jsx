import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search, Unplug } from 'lucide-react'
import { BankLogo } from '@/views/components/BankLogo'
import { Badge, Banner, Button, Card, Empty, Field, Input, Modal, PageHeader, Select, Table, Td, Toast } from '@/views/ui'
import { TODAY, companies } from '@/models/fixtures'
import { institutions, institutionOfBank } from '@/models/domain/institutions'
import { dateTime, money } from '@/lib/format'
import { useAppViewModel } from '@/viewmodels/AppViewModel'


function statusBadge(a) {
  if (a.connected === false) return <Badge tone="neutral">Desconectada</Badge>
  if (a.status === 'ok') return <Badge tone="success">Conectada</Badge>
  if (a.status === 'erro') return <Badge tone="danger">Consentimento expirado</Badge>
  return <Badge tone="warning">Sincronização atrasada</Badge>
}

function Logo({ inst, size = 44 }) {
  return <BankLogo id={inst.id} size={size} />
}

export function ConexoesPage() {
  const { accounts, scope, addAccount, updateAccount, recordAudit, session } = useAppViewModel()
  const [q, setQ] = useState('')
  const [toast, setToast] = useState(null)
  const [step, setStep] = useState(null)
  const [picked, setPicked] = useState(null)
  const [companyId, setCompanyId] = useState(scope === 'grupo' ? 'c1' : scope)
  const [confirmOff, setConfirmOff] = useState(null)

  const scoped = accounts.filter((a) => scope === 'grupo' || a.companyId === scope)
  const catalog = institutions.filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()))

  const byInstitution = useMemo(() => {
    const map = new Map()
    for (const a of scoped) {
      const id = a.institutionId || institutionOfBank(a.bank)?.id || a.bank
      const list = map.get(id) ?? []
      list.push(a)
      map.set(id, list)
    }
    return map
  }, [scoped])

  function startConnect(inst) {
    setPicked(inst)
    setStep('pick')
  }

  function confirmConnect() {
    if (!picked) return
    setStep('consent')
  }

  function finishConnect() {
    if (!picked) return
    const id = `a-${Date.now().toString(36)}`
    addAccount({
      id,
      companyId,
      bank: picked.name,
      agency: '0001',
      number: `${Math.floor(10000 + Math.random() * 89999)}-0`,
      type: 'Conta corrente',
      balance: 0,
      provider: 'Open Finance',
      status: 'ok',
      lastSync: `${TODAY}T08:00:00`,
      consentUntil: '2027-04-25',
      institutionId: picked.id,
      connected: true,
      balanceUnavailable: true,
      note: 'Fluxo simulado. Saldo indisponível até a sincronização autorizada com um provedor Open Finance.',
    })
    setStep(null)
    setPicked(null)
    setToast('Consentimento registrado na demonstração. A conexão real depende de um provedor Open Finance.')
  }

  function sync(a) {
    if (a.connected === false) {
      setToast('Reconecte a instituição antes de sincronizar.')
      return
    }
    updateAccount(a.id, { lastSync: `${TODAY}T08:15:00`, status: 'ok', balanceUnavailable: a.note?.includes('simulado') ? true : false })
    recordAudit({
      action: 'Sincronização bancária',
      entity: `${a.bank} ${a.number}`,
      before: a.lastSync,
      after: `${TODAY}T08:15:00`,
      reason: 'Solicitação manual. Sem provedor Open Finance operacional, a sincronização é simulada.',
    })
    setToast('Sincronização simulada. Nenhum dado novo foi obtido de um banco real.')
  }

  function reconnect(a) {
    updateAccount(a.id, {
      connected: true,
      status: 'ok',
      consentUntil: '2027-04-25',
      lastSync: `${TODAY}T08:20:00`,
      note: 'Consentimento renovado na demonstração. Integração real ainda não configurada.',
    })
    recordAudit({
      action: 'Reconexão Open Finance',
      entity: `${a.bank} ${a.number}`,
      before: a.status,
      after: 'ok',
      reason: 'Renovação de consentimento simulada.',
    })
    setToast('Reconexão simulada. O titular precisará autorizar de novo quando o provedor estiver ativo.')
  }

  function disconnect(a) {
    updateAccount(a.id, { connected: false, status: 'erro', balanceUnavailable: true, note: 'Desconectada pelo usuário. Saldo deixou de ser consolidado.' })
    recordAudit({
      action: 'Instituição desconectada',
      entity: `${a.bank} ${a.number}`,
      before: 'Conectada',
      after: 'Desconectada',
      reason: session?.role === 'administrador' ? 'Ação administrativa' : 'Solicitação do usuário',
    })
    setConfirmOff(null)
    setToast('Instituição desconectada. O saldo desta conta não entra mais no consolidado.')
  }

  return (
    <div>
      <PageHeader
        kicker="Operação"
        title="Instituições bancárias"
        subtitle="Conecte bancos via Open Finance ou acompanhe contas já autorizadas. A autorização neste ambiente é de demonstração — senha bancária não é solicitada."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="t-h2">Instituições disponíveis</h2>
            <label className="relative min-w-[220px] flex-1">
              <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
              <Input className="pl-9" placeholder="Buscar banco" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>
          {!catalog.length ? <Empty>Nenhuma instituição com esse nome.</Empty> : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {catalog.map((inst) => {
                const linked = byInstitution.get(inst.id)?.length ?? 0
                return (
                  <li key={inst.id}>
                    <button
                      type="button"
                      onClick={() => startConnect(inst)}
                      className="flex w-full items-center gap-3 rounded-[10px] border border-borda-forte bg-superficie p-3 text-left hover:border-primaria hover:bg-destaque"
                    >
                      <Logo inst={inst} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{inst.name}</span>
                        <span className="t-apoio text-texto-secundario">{linked ? `${linked} conta(s) ligada(s)` : 'Disponível para autorização'}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div>
          <h2 className="t-h2 mb-4">Contas conectadas</h2>
          {!scoped.length ? (
            <Card>
              <Empty>Nenhuma conta neste recorte. Escolha uma instituição ao lado para autorizar.</Empty>
            </Card>
          ) : (
            <Table
              columns={['Instituição', 'Conta', 'Saldo', 'Sincronização', '']}
              footer={<span>Exibindo {scoped.length} conta(s)</span>}
            >
              {scoped.map((a) => (
                <tr key={a.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <BankLogo bank={a.bank} size={28} />
                      <span>{a.bank}</span>
                    </div>
                  </Td>
                  <Td>
                    {a.number}
                    <span className="mt-0.5 block t-apoio text-faint">{companies.find((c) => c.id === a.companyId)?.fantasy}</span>
                  </Td>
                  <Td className="num">
                    {a.balanceUnavailable || a.connected === false ? 'Indisponível' : money(a.balance)}
                  </Td>
                  <Td>
                    {statusBadge(a)}
                    <span className="mt-1 block t-apoio text-faint">{dateTime(a.lastSync)}</span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" className="h-8 px-2" onClick={() => sync(a)} title="Atualizar">
                        <RefreshCw size={14} />
                      </Button>
                      <Button variant="ghost" className="h-8 px-2" onClick={() => reconnect(a)}>Reconectar</Button>
                      <Button variant="ghost" className="h-8 px-2" onClick={() => setConfirmOff(a)}>
                        <Unplug size={14} />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
          <p className="t-apoio mt-3">
            Histórico técnico e parâmetros do provedor:{' '}
            <Link className="t-label" to="/configuracoes/open-finance">Configurações Open Finance</Link>
          </p>
        </div>
      </div>

      <Modal
        title={step === 'consent' ? 'Consentimento Open Finance' : `Conectar ${picked?.name ?? ''}`}
        open={!!step && !!picked}
        onClose={() => { setStep(null); setPicked(null) }}
        footer={
          step === 'pick' ? (
            <>
              <Button variant="secondary" onClick={() => { setStep(null); setPicked(null) }}>Cancelar</Button>
              <Button onClick={confirmConnect}>Continuar</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setStep('pick')}>Voltar</Button>
              <Button onClick={finishConnect}>Autorizar (demonstração)</Button>
            </>
          )
        }
      >
        {picked ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo inst={picked} />
              <div>
                <p className="font-semibold">{picked.name}</p>
                <p className="t-apoio text-texto-secundario">Open Finance · autorização do titular</p>
              </div>
            </div>
            {step === 'pick' ? (
              <>
                <Field label="Empresa">
                  <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.fantasy}</option>)}
                  </Select>
                </Field>
                <p className="t-body text-texto-secundario">
                  Na operação, o titular autentica no banco e concede consentimento. Paris Devs não vê a senha da instituição.
                </p>
              </>
            ) : (
              <Banner tone="alert">
                Simulação: nenhum redirecionamento ao banco ocorre neste ambiente. Ao confirmar, a conta entra como conectada com saldo indisponível até existir um provedor configurado.
              </Banner>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Desconectar instituição"
        open={!!confirmOff}
        onClose={() => setConfirmOff(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOff(null)}>Cancelar</Button>
            {confirmOff ? <Button onClick={() => disconnect(confirmOff)}>Desconectar</Button> : null}
          </>
        }
      >
        <p className="t-body text-texto-secundario">O saldo desta conta deixa de entrar no consolidado. É possível reconectar depois, com novo consentimento.</p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}
