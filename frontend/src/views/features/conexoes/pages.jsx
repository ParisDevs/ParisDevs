import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Unplug } from 'lucide-react'
import { BankLogo } from '@/views/components/BankLogo'
import { Badge, Banner, Button, Empty, Field, Input, Modal, PageHeader, Select, Table, Tabs, Td, Toast } from '@/views/ui'
import { listarContasBancarias } from '@/models/api/contaBancariaService'
import { conectarPluggy, criarConexao, listarConexoes, removerConexao, salvarCredencialProvedor, sincronizarConexao } from '@/models/api/conexaoService'
import { dateTime, money } from '@/lib/format'

function mesAtual() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const ultimo = new Date(ano, agora.getMonth() + 1, 0).getDate()
  return { inicio: `${ano}-${mes}-01`, fim: `${ano}-${mes}-${String(ultimo).padStart(2, '0')}` }
}

function nomeBanco(conta) {
  return String(conta?.nomeInstituicao || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function rotuloOrigem(provedor) {
  if (provedor === 'ITAU') return 'Itaú'
  if (provedor === 'XP') return 'XP'
  if (provedor === 'PLUGGY') return 'Open Finance'
  return 'Manual'
}

function selo(status, temConexao) {
  if (!temConexao) return <Badge tone="neutral">Lançamento manual</Badge>
  if (status === 'CONECTADA') return <Badge tone="success">Conectada</Badge>
  if (status === 'ERRO') return <Badge tone="danger">Erro</Badge>
  if (status === 'AGUARDANDO_AUTORIZACAO') return <Badge tone="warning">Aguardando autorização</Badge>
  if (status === 'SINCRONIZANDO') return <Badge tone="warning">Sincronizando</Badge>
  return <Badge tone="neutral">Pronta para sincronizar</Badge>
}

function recorteErro(texto) {
  const valor = String(texto || '').trim()
  if (!valor) return ''
  const frase = valor.split(/(?<=[.!?])\s/)[0]
  return frase.length > 140 ? `${frase.slice(0, 137)}…` : frase
}

function totalPassos(provedor) {
  return provedor === 'PLUGGY' ? 3 : 2
}

export function ConexoesPage() {
  const periodo = useMemo(mesAtual, [])
  const [contas, setContas] = useState([])
  const [conexoes, setConexoes] = useState([])
  const [erroPagina, setErroPagina] = useState('')
  const [erroLinha, setErroLinha] = useState({})
  const [toast, setToast] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)

  const [fluxoAberto, setFluxoAberto] = useState(false)
  const [provedor, setProvedor] = useState('ITAU')
  const [passo, setPasso] = useState(1)
  const [contaId, setContaId] = useState('')
  const [digito, setDigito] = useState('')
  const [tipoConta, setTipoConta] = useState('current_account')
  const [cname, setCname] = useState('')
  const [ips, setIps] = useState('')
  const [avaliacao, setAvaliacao] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [extra, setExtra] = useState('')
  const [guardadas, setGuardadas] = useState({})
  const [comoObter, setComoObter] = useState(false)
  const [erroFluxo, setErroFluxo] = useState('')
  const [conexaoPluggy, setConexaoPluggy] = useState(null)
  const [usuario, setUsuario] = useState('user-ok')
  const [senha, setSenha] = useState('')
  const [mfa, setMfa] = useState('123456')
  const [cpf, setCpf] = useState('')

  const [sincronizarAlvo, setSincronizarAlvo] = useState(null)
  const [inicio, setInicio] = useState(periodo.inicio)
  const [fim, setFim] = useState(periodo.fim)
  const [desconectar, setDesconectar] = useState(null)

  async function carregar() {
    setCarregando(true)
    setErroPagina('')
    try {
      const [listaContas, listaConexoes] = await Promise.all([listarContasBancarias(), listarConexoes()])
      setContas(listaContas)
      setConexoes(listaConexoes)
    } catch (err) {
      setErroPagina(err.message || 'Não foi possível consultar a API')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const porConta = useMemo(() => {
    const mapa = new Map()
    for (const conexao of conexoes) mapa.set(String(conexao.idContaBancaria), conexao)
    return mapa
  }, [conexoes])

  const contasDoProvedor = useMemo(() => {
    return contas.filter((conta) => {
      const nome = nomeBanco(conta)
      if (provedor === 'ITAU') return nome.includes('itau')
      if (provedor === 'XP') return nome.includes('xp')
      return true
    })
  }, [contas, provedor])

  const ligadas = conexoes.length
  const credencialAtiva = Boolean(guardadas[provedor] || conexoes.some((c) => c.provedor === provedor && c.credencialConfigurada))

  function resetarFluxo(origem = 'ITAU') {
    setProvedor(origem)
    setPasso(1)
    setContaId('')
    setDigito('')
    setTipoConta('current_account')
    setCname('')
    setIps('')
    setAvaliacao(false)
    setClientId('')
    setClientSecret('')
    setExtra('')
    setComoObter(false)
    setErroFluxo('')
    setConexaoPluggy(null)
    setUsuario('user-ok')
    setSenha('')
    setMfa('123456')
    setCpf('')
  }

  function abrirFluxo() {
    resetarFluxo('ITAU')
    setFluxoAberto(true)
  }

  function fecharFluxo() {
    setFluxoAberto(false)
    setErroFluxo('')
  }

  function trocarProvedor(id) {
    resetarFluxo(id)
  }

  async function guardarCredencial() {
    if (credencialAtiva && !clientId && !clientSecret) return true
    if (provedor !== 'XP' && (!clientId.trim() || !clientSecret.trim())) {
      setErroFluxo('Informe a credencial desta sessão.')
      return false
    }
    setOcupado(true)
    setErroFluxo('')
    try {
      await salvarCredencialProvedor({ provedor, clientId, clientSecret, extra })
      setGuardadas((atual) => ({ ...atual, [provedor]: true }))
      setClientId('')
      setClientSecret('')
      setExtra('')
      return true
    } catch (err) {
      setErroFluxo(err.message)
      return false
    } finally {
      setOcupado(false)
    }
  }

  async function ligarConta() {
    if (!contaId) {
      setErroFluxo('Escolha a conta.')
      return null
    }
    setOcupado(true)
    setErroFluxo('')
    try {
      const criada = await criarConexao({
        idContaBancaria: Number(contaId),
        provedor,
        ambiente: 'SANDBOX',
        digitoVerificador: digito,
        tipoContaItau: tipoConta,
        cname,
        ips,
        avaliacaoSolicitada: avaliacao,
      })
      await carregar()
      return criada
    } catch (err) {
      setErroFluxo(err.message)
      return null
    } finally {
      setOcupado(false)
    }
  }

  async function avancar() {
    if (passo === 1) {
      const ok = await guardarCredencial()
      if (ok) setPasso(2)
      return
    }
    if (passo === 2) {
      const criada = await ligarConta()
      if (!criada) return
      if (provedor === 'PLUGGY') {
        setConexaoPluggy(criada)
        setPasso(3)
        return
      }
      setFluxoAberto(false)
      setToast(provedor === 'XP'
        ? 'Conta XP registrada. A autorização ainda não libera o extrato.'
        : 'Conta ligada. Sincronize o período na lista.')
      return
    }
    if (passo === 3) {
      await entrarSandbox(conexaoPluggy?.idConexao)
    }
  }

  async function entrarSandbox(id) {
    if (!id) {
      setErroFluxo('Ligue a conta no passo anterior.')
      return
    }
    setOcupado(true)
    setErroFluxo('')
    try {
      await conectarPluggy(id, { usuario, senha, mfa, cpf })
      setSenha('')
      setFluxoAberto(false)
      setToast('Sandbox conectado. Sincronize o período na lista.')
      await carregar()
    } catch (err) {
      setErroFluxo(err.message)
    } finally {
      setOcupado(false)
    }
  }

  async function confirmarSincronizar() {
    if (!sincronizarAlvo) return
    const id = sincronizarAlvo.idConexao
    setOcupado(true)
    setErroLinha((atual) => ({ ...atual, [id]: '' }))
    try {
      const resposta = await sincronizarConexao(id, { inicio, fim })
      setSincronizarAlvo(null)
      if (resposta.status === 'AGUARDANDO_AUTORIZACAO') {
        setToast('A XP ainda aguarda autorização. Nenhum lançamento foi gerado.')
      } else {
        setToast(`Extrato atualizado. Novas: ${resposta.novas}. Atualizadas: ${resposta.atualizadas}.`)
      }
      await carregar()
    } catch (err) {
      setErroLinha((atual) => ({ ...atual, [id]: recorteErro(err.message) }))
      setSincronizarAlvo(null)
    } finally {
      setOcupado(false)
    }
  }

  async function confirmarDesconectar() {
    if (!desconectar) return
    setOcupado(true)
    try {
      await removerConexao(desconectar.idConexao)
      setToast('Conexão removida. Os lançamentos já gravados permanecem.')
      setDesconectar(null)
      await carregar()
    } catch (err) {
      setErroPagina(err.message)
      setDesconectar(null)
    } finally {
      setOcupado(false)
    }
  }

  function abrirSandboxExistente(conexao) {
    resetarFluxo('PLUGGY')
    setConexaoPluggy(conexao)
    setPasso(3)
    setFluxoAberto(true)
  }

  const passos = totalPassos(provedor)
  const tituloPasso = passo === 1 ? 'Credencial' : passo === 2 ? 'Conta' : 'Sandbox'

  return (
    <div>
      <PageHeader
        kicker="Operação"
        title="Conexões bancárias"
        subtitle="Veja quais contas já estão ligadas. Para ligar um banco, use o botão à direita."
        actions={<Button onClick={abrirFluxo} disabled={!contas.length}>Ligar banco</Button>}
      />

      {erroPagina ? <Banner tone="error" className="mb-4">{erroPagina}</Banner> : null}

      {carregando ? <p className="t-body text-texto-secundario">Carregando...</p> : null}

      {!carregando && contas.length === 0 ? (
        <Empty action={<Link to="/configuracoes/contas"><Button>Cadastrar conta</Button></Link>}>
          Nenhuma conta cadastrada. Inclua a conta em Configurações → Contas antes de ligar o banco.
        </Empty>
      ) : null}

      {!carregando && contas.length > 0 ? (
        <>
          {ligadas === 0 ? (
            <Banner tone="info" className="mb-4">
              Nenhuma conta está ligada a um banco. O extrato entra depois de Ligar banco.
            </Banner>
          ) : null}
          <Table
            columns={['Conta', 'Origem', 'Saldo', 'Status', '']}
            footer={<span>{ligadas} ligada{ligadas === 1 ? '' : 's'} ao banco · {contas.length - ligadas} manual{contas.length - ligadas === 1 ? '' : 'is'}</span>}
          >
            {contas.map((conta) => {
              const conexao = porConta.get(String(conta.idContaBancaria))
              const erro = conexao ? (erroLinha[conexao.idConexao] || recorteErro(conexao.ultimoErro)) : ''
              const xpPendente = conexao?.provedor === 'XP'
              return (
                <tr key={conta.idContaBancaria}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <BankLogo bank={conta.nomeInstituicao} size={28} />
                      <span>
                        {conta.nomeInstituicao}
                        <span className="mt-0.5 block t-apoio text-faint">{conta.agencia} / {conta.numeroConta}</span>
                      </span>
                    </div>
                  </Td>
                  <Td>
                    {rotuloOrigem(conexao?.provedor)}
                    {xpPendente ? <span className="mt-0.5 block t-apoio text-faint">A autorização da XP ainda não libera o extrato.</span> : null}
                    {erro ? <span className="mt-1 block t-apoio text-erro">{erro}</span> : null}
                  </Td>
                  <Td className="num">{conta.saldo == null ? '—' : money(conta.saldo)}</Td>
                  <Td>
                    {selo(conexao?.status, Boolean(conexao))}
                    {conexao?.ultimaSincronizacao ? (
                      <span className="mt-1 block t-apoio text-faint">{dateTime(conexao.ultimaSincronizacao)}</span>
                    ) : (
                      <span className="mt-1 block t-apoio text-faint">{conexao ? 'Ainda sem sincronização' : 'Lançamento manual'}</span>
                    )}
                  </Td>
                  <Td>
                    {conexao ? (
                      <div className="flex flex-wrap justify-end gap-1">
                        {conexao.provedor !== 'XP' ? (
                          <Button
                            variant="ghost"
                            className="h-8 px-2"
                            title="Sincronizar"
                            aria-label="Sincronizar"
                            disabled={ocupado}
                            onClick={() => setSincronizarAlvo(conexao)}
                          >
                            <RefreshCw size={14} />
                          </Button>
                        ) : null}
                        {conexao.provedor === 'PLUGGY' && conexao.status !== 'CONECTADA' ? (
                          <Button variant="ghost" className="h-8 px-2" disabled={ocupado} onClick={() => abrirSandboxExistente(conexao)}>
                            Sandbox
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          className="h-8 px-2"
                          title="Desconectar"
                          aria-label="Desconectar"
                          onClick={() => setDesconectar(conexao)}
                        >
                          <Unplug size={14} />
                        </Button>
                      </div>
                    ) : null}
                  </Td>
                </tr>
              )
            })}
          </Table>
        </>
      ) : null}

      <Modal
        wide
        open={fluxoAberto}
        onClose={fecharFluxo}
        title="Ligar banco"
        subtitle={`Passo ${passo} de ${passos} · ${tituloPasso}`}
        footer={
          <>
            {passo > 1 ? <Button variant="secondary" onClick={() => { setErroFluxo(''); setPasso(passo - 1) }} disabled={ocupado}>Voltar</Button> : (
              <Button variant="secondary" onClick={fecharFluxo}>Cancelar</Button>
            )}
            <Button onClick={avancar} disabled={ocupado}>
              {passo === passos ? (provedor === 'PLUGGY' ? 'Conectar sandbox' : 'Ligar conta') : 'Continuar'}
            </Button>
          </>
        }
      >
        <Tabs
          value={provedor}
          onChange={trocarProvedor}
          items={[
            { id: 'ITAU', label: 'Itaú' },
            { id: 'XP', label: 'XP' },
            { id: 'PLUGGY', label: 'Open Finance' },
          ]}
        />

        {erroFluxo ? <Banner tone="error" className="mt-4">{erroFluxo}</Banner> : null}

        {passo === 1 ? (
          <div className="mt-5 space-y-3">
            <p className="t-body text-texto-secundario">
              {provedor === 'ITAU' && 'Cole a credencial do sandbox do Itaú. Ela vai para o servidor e não volta para esta tela.'}
              {provedor === 'XP' && 'Guarde o que a XP já enviou. O extrato só entra depois da autorização.'}
              {provedor === 'PLUGGY' && 'Cole a credencial do aplicativo na Pluggy. Ela vai para o servidor e não volta para esta tela.'}
            </p>
            {credencialAtiva ? <Badge tone="success">Credencial guardada nesta sessão</Badge> : null}
            <Field label="Client ID">
              <Input value={clientId} onChange={(e) => setClientId(e.target.value)} autoComplete="off" />
            </Field>
            <Field label={provedor === 'XP' ? 'Caminho do certificado no servidor' : 'Client secret'}>
              <Input value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} type={provedor === 'XP' ? 'text' : 'password'} autoComplete="off" />
            </Field>
            {provedor === 'XP' ? (
              <Field label="Chave de assinatura">
                <Input value={extra} onChange={(e) => setExtra(e.target.value)} type="password" autoComplete="off" />
              </Field>
            ) : null}
            <button type="button" className="t-label" onClick={() => setComoObter((v) => !v)}>
              {comoObter ? 'Ocultar como obter' : 'Como obter'}
            </button>
            {comoObter ? (
              <p className="t-apoio text-texto-secundario">
                {provedor === 'ITAU' && 'No portal Itaú for Developers, abra o sandbox do extrato e use Criar credenciais. Cole o identificador e o segredo aqui.'}
                {provedor === 'XP' && 'A XP pede certificado digital, nome comum do certificado, IPs dos servidores e um chamado de segurança. A chave de assinatura chega por e-mail depois da aprovação.'}
                {provedor === 'PLUGGY' && 'No painel da Pluggy, abra o aplicativo e copie o identificador e o segredo. No sandbox use user-ok, senha password-ok e MFA 123456.'}
              </p>
            ) : null}
          </div>
        ) : null}

        {passo === 2 ? (
          <div className="mt-5 space-y-3">
            <p className="t-body text-texto-secundario">
              A agência e o número vêm de <Link className="t-label" to="/configuracoes/contas">Configurações → Contas</Link>.
            </p>
            <Field label="Conta">
              <Select value={contaId} onChange={(e) => setContaId(e.target.value)}>
                <option value="">Selecionar</option>
                {contasDoProvedor.map((conta) => (
                  <option key={conta.idContaBancaria} value={conta.idContaBancaria}>
                    {conta.nomeInstituicao} · {conta.agencia} / {conta.numeroConta}
                  </option>
                ))}
              </Select>
            </Field>
            {provedor === 'ITAU' ? (
              <>
                <Field label="Tipo">
                  <Select value={tipoConta} onChange={(e) => setTipoConta(e.target.value)}>
                    <option value="current_account">Conta corrente</option>
                    <option value="savings_account">Poupança</option>
                  </Select>
                </Field>
                <Field label="Dígito, só se o número da conta ainda não o traz">
                  <Input value={digito} onChange={(e) => setDigito(e.target.value)} inputMode="numeric" />
                </Field>
              </>
            ) : null}
            {provedor === 'XP' ? (
              <>
                <Field label="Nome comum do certificado">
                  <Input value={cname} onChange={(e) => setCname(e.target.value)} />
                </Field>
                <Field label="IPs dos servidores">
                  <Input value={ips} onChange={(e) => setIps(e.target.value)} />
                </Field>
                <label className="t-body flex items-center gap-2">
                  <input type="checkbox" checked={avaliacao} onChange={(e) => setAvaliacao(e.target.checked)} />
                  Avaliação de segurança já enviada
                </label>
              </>
            ) : null}
          </div>
        ) : null}

        {passo === 3 ? (
          <div className="mt-5 space-y-3">
            <p className="t-body text-texto-secundario">
              Entre no banco simulado. Estes usuários valem só no sandbox.
            </p>
            <Field label="Usuário">
              <Input value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </Field>
            <Field label="Senha">
              <Input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="password-ok" />
            </Field>
            <Field label="Código de confirmação">
              <Input value={mfa} onChange={(e) => setMfa(e.target.value)} />
            </Field>
            <Field label="CPF, só no fluxo Open Finance do sandbox">
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="761.092.776-73" />
            </Field>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!sincronizarAlvo}
        onClose={() => setSincronizarAlvo(null)}
        title="Sincronizar extrato"
        subtitle={sincronizarAlvo ? `${rotuloOrigem(sincronizarAlvo.provedor)} · ${sincronizarAlvo.agencia} / ${sincronizarAlvo.numeroConta}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSincronizarAlvo(null)}>Cancelar</Button>
            <Button onClick={confirmarSincronizar} disabled={ocupado}>Sincronizar</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="De">
            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Field>
          <Field label="Até">
            <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        title="Desconectar"
        open={!!desconectar}
        onClose={() => setDesconectar(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDesconectar(null)}>Cancelar</Button>
            <Button onClick={confirmarDesconectar} disabled={ocupado}>Desconectar</Button>
          </>
        }
      >
        <p className="t-body text-texto-secundario">A origem ativa sai desta conta. Os lançamentos já gravados permanecem.</p>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}
