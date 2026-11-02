import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Badge, Banner, Button, Card, Empty, Field, Input, Modal, PageHeader, Select, Table, Td, Textarea, Toast, Kv } from '@/views/ui'
import { extractCnpj } from '@/models/domain/banking'
import { lookupCnpj } from '@/models/domain/cnpjLookup'
import { origemProtegida } from '@/models/domain/dashboardBanking'
import { GastosPorCategoriaCard } from '@/views/charts'
import {
  GASTO_GROUP_META,
  buildGastoCategoriaRows,
  conciliacaoCategoriaHref,
  conciliacaoFolhaHref,
  conciliacaoSubHref,
  findLeaf,
  findSub,
  getLeavesForSub,
  getSubsForGroup,
  isGastoGroupId,
  summarizeTransactions,
  txInGastoGroup,
} from '@/models/domain/reconCategories'
import { date, money } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import {
  useConciliacaoDetalheViewModel,
  useConciliacaoViewModel,
} from '@/viewmodels/conciliacao/useConciliacaoViewModel'
import {
  baixarConciliacao,
  filtrarSaidas,
  nomeArquivoConciliacao,
  rotuloSituacao,
} from '@/views/features/conciliacao/helpers'

export { ConciliacaoInsightsPage } from '@/views/features/conciliacao/insightsPage'

function SituacaoBadge({ recon }) {
  const classificado = recon === 'conciliado'
  return <Badge tone={classificado ? 'success' : 'warning'}>{rotuloSituacao(recon)}</Badge>
}

function ConciliacaoStatus({ carregando, erro }) {
  if (carregando) {
    return (
      <Banner tone="info" className="mb-4">
        Carregando conciliação…
      </Banner>
    )
  }
  if (erro) {
    return (
      <Banner tone="error" className="mb-4">
        {erro}
      </Banner>
    )
  }
  return null
}

function StatusItem({ label, value, hint, to, alert }) {
  const inner = (
    <div className="flex min-h-[72px] min-w-[148px] flex-col justify-center bg-superficie px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.06em] text-texto-secundario uppercase">{label}</p>
      <p className={cn('mt-1 truncate text-[22px] font-semibold leading-none tabular-nums', alert ? 'text-alerta-texto' : 'text-texto')}>
        {value}
      </p>
      <p className="mt-1 truncate text-[12px] text-faint">{hint || '\u00a0'}</p>
    </div>
  )
  if (!to) return inner
  return (
    <Link to={to} className="min-w-[148px] flex-1">
      {inner}
    </Link>
  )
}

function StatusFaixa({ kpis }) {
  return (
    <div className="flex gap-px overflow-x-auto rounded-[10px] border border-borda bg-borda">
      <StatusItem
        label="Classificados"
        value={String(kpis.conciliado)}
        hint={money(kpis.valorClassificado)}
        to="/conciliacao/pendencias?estado=conciliado"
      />
      <StatusItem
        label="Sem categoria"
        value={String(kpis.pendente)}
        hint={money(kpis.valorPendente)}
        to="/conciliacao/pendencias?estado=pendente"
        alert={kpis.pendente > 0}
      />
      <StatusItem
        label="Saídas no período"
        value={String(kpis.total)}
        hint="Recorte do menu"
      />
      <StatusItem
        label="Valor sem categoria"
        value={money(kpis.valorPendente)}
        hint={kpis.pendente ? `${kpis.pendente} a classificar` : 'Tudo classificado'}
        alert={kpis.valorPendente > 0}
      />
    </div>
  )
}

function CategoriaCrumbs({ groupId, meta, sub, subDef, folha, leafDef }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-[13px] text-texto-secundario" aria-label="Navegação">
      <Link to="/conciliacao" className="font-medium text-primaria hover:underline">Conciliação</Link>
      <ChevronRight size={14} className="text-faint" aria-hidden />
      {sub && subDef ? (
        <Link to={conciliacaoCategoriaHref(groupId)} className="font-medium text-primaria hover:underline">{meta.label}</Link>
      ) : (
        <span className="font-medium text-texto">{meta.label}</span>
      )}
      {sub && subDef ? (
        <>
          <ChevronRight size={14} className="text-faint" aria-hidden />
          {folha && leafDef ? (
            <Link to={conciliacaoSubHref(groupId, sub)} className="font-medium text-primaria hover:underline">{subDef.label}</Link>
          ) : (
            <span className="font-medium text-texto">{subDef.label}</span>
          )}
        </>
      ) : null}
      {folha && leafDef ? (
        <>
          <ChevronRight size={14} className="text-faint" aria-hidden />
          <span className="font-medium text-texto">{leafDef.label}</span>
        </>
      ) : null}
    </nav>
  )
}

function TabelaTrabalho({
  saidas,
  categorias,
  classificar,
  salvandoId,
  period,
  onToast,
  estadoInicial = 'todos',
  mostrarSituacao = true,
}) {
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState(estadoInicial)
  const rows = useMemo(
    () => filtrarSaidas(saidas, { busca, situacao }),
    [saidas, busca, situacao],
  )

  function exportar() {
    if (!rows.length) return
    const classificados = situacao === 'conciliado' || (situacao === 'todos' && rows.every((t) => t.recon === 'conciliado'))
    const ok = baixarConciliacao(nomeArquivoConciliacao(period, classificados), rows)
    if (ok) onToast('Planilha baixada.')
  }

  return (
    <Table
      columns={['Data', 'Descrição', 'Valor', 'Categoria', 'Situação']}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="min-w-[200px] flex-1"
            placeholder="Buscar descrição, contraparte ou categoria"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {mostrarSituacao ? (
            <Select value={situacao} onChange={(e) => setSituacao(e.target.value)} className="w-[180px]">
              <option value="todos">Todas</option>
              <option value="conciliado">Classificados</option>
              <option value="pendente">Sem categoria</option>
            </Select>
          ) : null}
          <Button type="button" variant="secondary" disabled={!rows.length} onClick={exportar}>
            Baixar XLSX
          </Button>
        </div>
      }
      empty={!rows.length ? <Empty>Nenhuma saída neste filtro.</Empty> : undefined}
      footer={<span>{rows.length} de {saidas.length} saídas</span>}
    >
      {rows.map((t) => {
        const protegida = origemProtegida(t.origem)
        return (
          <tr key={t.id}>
            <Td nowrap>{date(t.date)}</Td>
            <Td>
              <Link to={`/conciliacao/${t.id}`} className="font-medium text-primaria hover:underline">
                {t.description || t.counterparty || '—'}
              </Link>
              {t.instituicao ? (
                <span className="mt-0.5 block t-apoio text-faint">{t.instituicao}{t.numeroConta ? ` · ${t.numeroConta}` : ''}</span>
              ) : null}
            </Td>
            <Td className="num">{money(t.amount)}</Td>
            <Td>
              <Select
                className="min-w-[180px] text-[13px]"
                value={t.category ?? ''}
                disabled={protegida || salvandoId === String(t.id)}
                aria-label={`Categoria de ${t.description || t.id}`}
                onChange={async (e) => {
                  const ok = await classificar(t.id, e.target.value)
                  if (ok) onToast('Categoria atualizada.')
                }}
              >
                {!t.category ? <option value="">Sem categoria</option> : null}
                {categorias.map((nome) => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
              </Select>
              {protegida ? (
                <span className="mt-0.5 block t-apoio text-faint">Lançamento do banco — não edita aqui.</span>
              ) : null}
            </Td>
            <Td><SituacaoBadge recon={t.recon} /></Td>
          </tr>
        )
      })}
    </Table>
  )
}

export function ConciliacaoPage() {
  const { period } = useAppViewModel()
  const { saidas, kpis, categorias, classificar, salvandoId, carregando, erro, toast, setToast } = useConciliacaoViewModel()
  const gastosPorCategoria = useMemo(() => buildGastoCategoriaRows(saidas), [saidas])
  const classificados = useMemo(() => saidas.filter((t) => t.recon === 'conciliado'), [saidas])

  function exportarClassificados() {
    if (!classificados.length) return
    const ok = baixarConciliacao(nomeArquivoConciliacao(period, true), classificados)
    if (ok) setToast('Planilha dos classificados baixada.')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Operação"
        title="Conciliação"
        subtitle="Classifique as saídas do período. Com categoria conhecida o item entra como classificado; sem categoria fica pendente."
        actions={
          <>
            <Link to="/conciliacao/insights">
              <Button>Insights</Button>
            </Link>
            <Button variant="secondary" onClick={exportarClassificados} disabled={!classificados.length}>
              Baixar XLSX
            </Button>
            <Link to="/conciliacao/pendencias?estado=pendente">
              <Button variant="secondary">Ver pendentes</Button>
            </Link>
          </>
        }
      />
      <ConciliacaoStatus carregando={carregando} erro={erro} />

      {!carregando && kpis.total === 0 ? (
        <Empty
          action={
            <>
              <Link to="/extratos"><Button variant="secondary">Extratos</Button></Link>
              <Link to="/operacoes"><Button>Operações</Button></Link>
            </>
          }
        >
          Não há saídas neste período. Importe o extrato ou lance a operação para classificar.
        </Empty>
      ) : null}

      {kpis.total > 0 ? (
        <>
          <StatusFaixa kpis={kpis} />
          {kpis.pendente > 0 && kpis.conciliado === 0 ? (
            <Banner tone="alert">
              {kpis.pendente} saída{kpis.pendente === 1 ? '' : 's'} sem categoria.{' '}
              <Link to="/conciliacao/pendencias?estado=pendente" className="font-medium underline">Abrir lista</Link>
              {' · '}
              <Link to="/conciliacao/insights" className="font-medium underline">Ver insights</Link>
            </Banner>
          ) : null}
          {kpis.pendente > 0 && kpis.conciliado > 0 ? (
            <p className="text-[13px] text-texto-secundario">
              {kpis.pendente} ainda sem categoria.{' '}
              <Link to="/conciliacao/insights" className="font-medium text-primaria hover:underline">Insights</Link>
            </p>
          ) : null}

          <GastosPorCategoriaCard
            compact
            tip="Saídas agrupadas em categorias financeiras amplas. O detalhe fica na tabela abaixo."
            rows={gastosPorCategoria}
            categoryHref={conciliacaoCategoriaHref}
          />

          <div>
            <h2 className="mb-1 text-[15px] font-semibold text-texto">Saídas do período</h2>
            <p className="t-apoio mb-3 text-texto-secundario">
              Escolha a categoria para classificar. Lançamentos de banco sincronizado não aceitam edição.
            </p>
            <TabelaTrabalho
              saidas={saidas}
              categorias={categorias}
              classificar={classificar}
              salvandoId={salvandoId}
              period={period}
              onToast={setToast}
            />
          </div>
        </>
      ) : null}
      <Toast message={toast} />
    </div>
  )
}

export function ConciliacaoCategoriaDrillPage() {
  const { grupo, sub, folha } = useParams()
  const { saidas, carregando, erro } = useConciliacaoViewModel()
  const { documents } = useAppViewModel()
  const groupId = grupo ?? ''

  const saidasGrupo = useMemo(
    () => saidas.filter((t) => txInGastoGroup(t, groupId)),
    [saidas, groupId],
  )

  const subDef = sub ? findSub(groupId, sub) : undefined
  const leafDef = sub && folha ? findLeaf(groupId, sub, folha) : undefined

  if (!isGastoGroupId(groupId)) return <Empty>Categoria não encontrada.</Empty>
  if (sub && !subDef) return <Empty>Subcategoria não encontrada.</Empty>
  if (folha && sub && !leafDef) return <Empty>Classificação não encontrada.</Empty>

  const meta = GASTO_GROUP_META[groupId]
  const crumbs = (
    <CategoriaCrumbs
      groupId={groupId}
      meta={meta}
      sub={sub}
      subDef={subDef}
      folha={folha}
      leafDef={leafDef}
    />
  )

  if (folha && leafDef && subDef) {
    const items = saidasGrupo.filter((t) => leafDef.match(t.category))
    const stats = summarizeTransactions(items)
    return (
      <div>
        <PageHeader kicker="Conciliação" title={leafDef.label} subtitle={`${subDef.label} · ${meta.label}`} />
        <ConciliacaoStatus carregando={carregando} erro={erro} />
        {crumbs}
        <p className="t-apoio mb-4 text-texto-secundario">
          {stats.count} lançamentos · {money(stats.amount)} · {stats.pend} sem categoria
        </p>
        <Table
          columns={['Data', 'Descrição', 'Valor', 'Situação', 'Referência']}
          empty={!items.length ? <Empty>Nenhum lançamento nesta classificação.</Empty> : undefined}
        >
          {items.map((t) => {
            const doc = documents.find((d) => d.txId === t.id)
            return (
              <tr key={t.id}>
                <Td nowrap>{date(t.date)}</Td>
                <Td><Link to={`/conciliacao/${t.id}`}>{t.description}</Link></Td>
                <Td className="num">{money(t.amount)}</Td>
                <Td><SituacaoBadge recon={t.recon} /></Td>
                <Td>
                  {doc ? (
                    <span>{doc.number}</span>
                  ) : t.document ? (
                    <span>{t.document}</span>
                  ) : (
                    <Link to={`/conciliacao/${t.id}`} className="text-primaria">Classificar</Link>
                  )}
                </Td>
              </tr>
            )
          })}
        </Table>
      </div>
    )
  }

  if (sub && subDef) {
    const leaves = getLeavesForSub(groupId, sub)
    const rows = leaves
      .map((leaf) => {
        const items = saidasGrupo.filter((t) => leaf.match(t.category))
        return { leaf, ...summarizeTransactions(items) }
      })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.amount - a.amount)

    return (
      <div>
        <PageHeader kicker="Conciliação" title={subDef.label} subtitle={meta.label} />
        <ConciliacaoStatus carregando={carregando} erro={erro} />
        {crumbs}
        <Table
          columns={['Classificação', 'Lançamentos', 'Valor', 'Classificados', 'Sem categoria']}
          empty={!rows.length ? <Empty>Nenhum lançamento nesta subcategoria.</Empty> : undefined}
        >
          {rows.map(({ leaf, count, amount, conc, pend }) => (
            <tr key={leaf.slug}>
              <Td>
                <Link to={conciliacaoFolhaHref(groupId, sub, leaf.slug)} className="font-medium text-primaria hover:underline">
                  {leaf.label}
                </Link>
              </Td>
              <Td className="num">{count}</Td>
              <Td className="num">{money(amount)}</Td>
              <Td className="num">{conc}</Td>
              <Td className="num">{pend > 0 ? <span className="font-medium text-alerta-texto">{pend}</span> : pend}</Td>
            </tr>
          ))}
        </Table>
      </div>
    )
  }

  const subs = getSubsForGroup(groupId)
  const rows = subs
    .map((s) => {
      const items = saidasGrupo.filter((t) => s.match(t.category))
      return { sub: s, ...summarizeTransactions(items) }
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div>
      <PageHeader kicker="Conciliação" title={meta.label} subtitle="Escolha uma subcategoria para ver os lançamentos." />
      <ConciliacaoStatus carregando={carregando} erro={erro} />
      {crumbs}
      <Table
        columns={['Subcategoria', 'Lançamentos', 'Valor', 'Classificados', 'Sem categoria']}
        empty={!rows.length ? <Empty>Nenhuma saída nesta categoria.</Empty> : undefined}
      >
        {rows.map(({ sub: s, count, amount, conc, pend }) => (
          <tr key={s.slug}>
            <Td>
              <Link to={conciliacaoSubHref(groupId, s.slug)} className="font-medium text-primaria hover:underline">
                {s.label}
              </Link>
            </Td>
            <Td className="num">{count}</Td>
            <Td className="num">{money(amount)}</Td>
            <Td className="num">{conc}</Td>
            <Td className="num">{pend > 0 ? <span className="font-medium text-alerta-texto">{pend}</span> : pend}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function ConciliacaoListaPage() {
  const { period } = useAppViewModel()
  const { saidas, categorias, classificar, salvandoId, carregando, erro, toast, setToast } = useConciliacaoViewModel()
  const [params] = useSearchParams()
  const estado = params.get('estado') === 'conciliado' ? 'conciliado' : 'pendente'
  const titulo = estado === 'conciliado' ? 'Classificados' : 'Sem categoria'
  const filtradas = useMemo(() => filtrarSaidas(saidas, { situacao: estado }), [saidas, estado])

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Conciliação"
        title={titulo}
        subtitle={estado === 'conciliado'
          ? 'Saídas do período com categoria conhecida.'
          : 'Saídas do período ainda sem categoria. Classifique para entrar na DRE com o grupo certo.'}
        actions={
          <Link to="/conciliacao">
            <Button variant="secondary">Voltar</Button>
          </Link>
        }
      />
      <ConciliacaoStatus carregando={carregando} erro={erro} />
      <TabelaTrabalho
        saidas={filtradas}
        categorias={categorias}
        classificar={classificar}
        salvandoId={salvandoId}
        period={period}
        onToast={setToast}
        estadoInicial={estado}
        mostrarSituacao={false}
      />
      <Toast message={toast} />
    </div>
  )
}

export function ConciliacaoDetalhePage() {
  const { id } = useParams()
  const { item: t, categorias, classificar, carregando, erro, toast } = useConciliacaoDetalheViewModel(id)
  const [manual, setManual] = useState(false)
  const [reason, setReason] = useState('')
  const [categoria, setCategoria] = useState('')
  const [cnpjInfo, setCnpjInfo] = useState(null)
  const [cnpjError, setCnpjError] = useState('')
  const [cnpjLoading, setCnpjLoading] = useState(false)

  if (carregando && !t) {
    return (
      <div>
        <PageHeader kicker="Conciliação" title="Classificar lançamento" />
        <ConciliacaoStatus carregando erro="" />
      </div>
    )
  }
  if (!t) {
    return (
      <div>
        <PageHeader kicker="Conciliação" title="Classificar lançamento" />
        {erro ? <ConciliacaoStatus carregando={false} erro={erro} /> : null}
        <Empty>Lançamento não encontrado neste período.</Empty>
      </div>
    )
  }
  const foundCnpj = extractCnpj(`${t.document} ${t.description} ${t.counterparty}`)
  const protegida = origemProtegida(t.origem)

  async function consultCnpj() {
    if (!foundCnpj) return
    setCnpjLoading(true)
    setCnpjError('')
    const result = await lookupCnpj(foundCnpj)
    setCnpjLoading(false)
    if ('error' in result) {
      setCnpjInfo(null)
      setCnpjError(result.error)
      return
    }
    setCnpjInfo(result)
  }

  async function confirmarCategoria() {
    const escolhida = categoria || t.category
    if (!escolhida) return
    const ok = await classificar(t.id, escolhida)
    if (ok) setManual(false)
  }

  return (
    <div>
      <PageHeader
        kicker="Conciliação"
        title="Classificar lançamento"
        actions={
          <Link to="/conciliacao">
            <Button variant="secondary">Voltar</Button>
          </Link>
        }
      />
      <ConciliacaoStatus carregando={false} erro={erro} />
      {t.recon !== 'conciliado' && !protegida ? (
        <Banner className="mb-4">Sem categoria conhecida. Escolha uma para classificar este lançamento.</Banner>
      ) : null}
      {protegida ? (
        <Banner tone="info" className="mb-4">
          Este lançamento veio do banco. A categoria não pode ser editada por aqui.
        </Banner>
      ) : null}
      <Card className="space-y-4">
        <Kv items={[
          { label: 'Transação', value: t.description },
          { label: 'Contraparte', value: t.counterparty || '—' },
          { label: 'Valor', value: money(t.amount) },
          { label: 'Categoria', value: t.category || 'Sem categoria' },
          { label: 'Situação', value: rotuloSituacao(t.recon) },
        ]} />
        {foundCnpj ? (
          <div className="space-y-2">
            <Button variant="secondary" onClick={consultCnpj} disabled={cnpjLoading}>
              {cnpjLoading ? 'Consultando CNPJ…' : `Consultar CNPJ ${foundCnpj}`}
            </Button>
            {cnpjError ? <p className="t-body text-erro">{cnpjError}</p> : null}
            {cnpjInfo ? (
              <Banner tone="info">
                {cnpjInfo.razaoSocial} · {cnpjInfo.nomeFantasia} · {cnpjInfo.cnae}. A atividade econômica não classifica a transação sozinha — revise a categoria.
              </Banner>
            ) : null}
          </div>
        ) : null}
        {protegida ? null : (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setCategoria(t.category || ''); setManual(true) }}>
              {t.recon === 'conciliado' ? 'Alterar categoria' : 'Classificar'}
            </Button>
          </div>
        )}
      </Card>
      <Modal
        title="Classificar lançamento"
        open={manual}
        onClose={() => setManual(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setManual(false)}>Cancelar</Button>
            <Button onClick={confirmarCategoria} disabled={!categoria && !t.category}>Confirmar</Button>
          </>
        )}
      >
        <Field label="Categoria">
          <Select value={categoria || t.category || ''} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Selecione a categoria</option>
            {categorias.map((nome) => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
          </Select>
        </Field>
        <Field label="Motivo">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Modal>
      <Toast message={toast} />
    </div>
  )
}
