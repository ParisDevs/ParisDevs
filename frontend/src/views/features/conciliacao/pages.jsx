import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Banner, Button, Card, Drawer, Empty, Field, Kpi, Modal, PageHeader, Select, Table, Td, Textarea, Toast, Kv } from '@/views/ui'
import { reconLabels } from '@/models/fixtures'
import { extractCnpj } from '@/models/domain/banking'
import { lookupCnpj } from '@/models/domain/cnpjLookup'
import { GastosPorCategoriaCard } from '@/views/charts'
import { gastoChartGroup } from '@/models/domain/finance'
import {
  GASTO_GROUP_META,
  buildGastoCategoriaRows,
  buildIaCategoriaRows,
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
import { date, money, percent } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import {
  useConciliacaoDetalheViewModel,
  useConciliacaoViewModel,
} from '@/viewmodels/conciliacao/useConciliacaoViewModel'
import { ReconStatusBadge } from '@/views/features/transactions/components/ReconStatusBadge'

function ReconSectionTitle({ title, subtitle }) {
  return (
    <div className="border-b border-borda px-4 py-3.5">
      <h2 className="text-[15px] font-semibold text-texto">{title}</h2>
      <p className="t-apoio mt-0.5 text-texto-secundario">{subtitle}</p>
    </div>
  )
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

function ConciliacaoIaPorCategoriaTable({ saidas, rows, categorias, classificar, salvandoId }) {
  const [expanded, setExpanded] = useState(null)
  const [toast, setToast] = useState(null)

  const porGrupo = useMemo(() => {
    const map = new Map()
    for (const t of saidas) {
      const g = gastoChartGroup(t.category)
      const list = map.get(g) ?? []
      list.push(t)
      map.set(g, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.date < b.date ? 1 : -1))
    }
    return map
  }, [saidas])

  return (
    <>
      <Table
        columns={['Categoria', 'Lançamentos', 'Valor', 'Participação', 'Conciliados', 'Pendentes', 'Parte IA', 'Confiança média', '']}
        empty={!rows.length ? <Empty>Nenhuma saída no período.</Empty> : undefined}
      >
        {rows.flatMap((row) => {
          const open = expanded === row.id
          const items = porGrupo.get(row.id) ?? []
          return [
            <tr key={row.id} className={cn(open && 'bg-superficie-2')}>
              <Td>
                <Link to={conciliacaoCategoriaHref(row.id)} className="font-medium text-primaria hover:underline">
                  {row.label}
                </Link>
              </Td>
              <Td className="num">{row.count}</Td>
              <Td className="num">{money(-row.amount)}</Td>
              <Td className="num">{percent(row.pct, 0)}</Td>
              <Td className="num">{row.conc}</Td>
              <Td className="num">{row.pend > 0 ? <span className="font-medium text-alerta-texto">{row.pend}</span> : row.pend}</Td>
              <Td>
                {row.ia}/{row.count}
                <span className="t-apoio text-faint"> ({row.iaPct}%)</span>
              </Td>
              <Td className="num">{row.conf}%</Td>
              <Td className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-[13px]"
                  onClick={() => setExpanded(open ? null : row.id)}
                >
                  {open ? 'Fechar' : 'Editar'}
                </Button>
              </Td>
            </tr>,
            open ? (
              <tr key={`${row.id}-edit`}>
                <td colSpan={9} className="border-b border-borda bg-superficie-2 px-4 py-4">
                  <p className="t-label mb-3 text-texto-secundario">Lançamentos · {row.label}</p>
                  <div className="overflow-x-auto rounded-[10px] border border-borda bg-superficie">
                    <table className="w-full min-w-[640px] border-collapse text-left">
                      <thead>
                        <tr>
                          {['Data', 'Descrição', 'Valor', 'Conciliação', 'Categoria'].map((h) => (
                            <th
                              key={h}
                              className="border-b border-borda bg-superficie-2 px-3 py-2 text-[11px] font-semibold tracking-[0.05em] text-faint uppercase"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((t) => (
                          <tr key={t.id}>
                            <td className="t-body whitespace-nowrap border-b border-borda px-3 py-2.5">{date(t.date)}</td>
                            <td className="t-body border-b border-borda px-3 py-2.5">
                              <Link to={`/conciliacao/${t.id}`} className="text-primaria hover:underline">{t.description}</Link>
                            </td>
                            <td className="t-body num border-b border-borda px-3 py-2.5">{money(t.amount)}</td>
                            <td className="border-b border-borda px-3 py-2.5">
                              <ReconStatusBadge recon={t.recon} />
                            </td>
                            <td className="border-b border-borda px-3 py-2.5">
                              <Select
                                className="min-w-[200px] text-[13px]"
                                value={t.category ?? ''}
                                disabled={salvandoId === String(t.id)}
                                aria-label={`Categoria de ${t.description}`}
                                onChange={async (e) => {
                                  const ok = await classificar(t.id, e.target.value)
                                  if (ok) setToast('Categoria atualizada.')
                                }}
                              >
                                {!t.category ? <option value="">Sem categoria</option> : null}
                                {categorias.map((nome) => (
                                  <option key={nome} value={nome}>{nome}</option>
                                ))}
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            ) : null,
          ].filter(Boolean)
        })}
      </Table>
      <Toast message={toast} />
    </>
  )
}

export function ConciliacaoPage() {
  const { saidas, kpis, categorias, classificar, salvandoId, carregando, erro, toast, setToast } = useConciliacaoViewModel()
  const cards = [
    { label: 'Conciliados', n: kpis.conciliado, to: '/conciliacao/pendencias?estado=conciliado' },
    { label: 'Pendentes', n: kpis.pendente, to: '/conciliacao/pendencias?estado=pendente' },
    { label: 'Divergentes', n: kpis.divergencia, to: '/conciliacao/pendencias?estado=divergencia' },
    { label: 'Sugestões', n: kpis.sugestao, to: '/conciliacao/pendencias?estado=sugestao' },
    { label: 'Duplicidades', n: kpis.duplicidade, to: '/conciliacao/pendencias?estado=duplicidade' },
  ]

  const gastosPorCategoria = useMemo(() => buildGastoCategoriaRows(saidas), [saidas])
  const iaPorCategoria = useMemo(() => buildIaCategoriaRows(saidas), [saidas])

  const saidaMercadorias = useMemo(() => {
    const map = new Map()
    for (const t of saidas) {
      const g = gastoChartGroup(t.category)
      const meta = GASTO_GROUP_META[g] ?? GASTO_GROUP_META.outros
      const h = { categoria: meta.label, subcategoria: t.category || '—', subsub: '—' }
      const key = `${h.categoria}|${h.subcategoria}`
      const row = map.get(key) ?? { h, items: [] }
      row.items.push(t)
      map.set(key, row)
    }
    return [...map.values()].sort((a, b) => {
      if (a.h.categoria !== b.h.categoria) return a.h.categoria.localeCompare(b.h.categoria, 'pt-BR')
      return a.h.subcategoria.localeCompare(b.h.subcategoria, 'pt-BR')
    })
  }, [saidas])

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Operação"
        title="Conciliação"
        subtitle="Movimentações de Open Finance, importação e lançamento manual. Categorias são generalistas; valor igual isolado não define correspondência."
      />
      <ConciliacaoStatus carregando={carregando} erro={erro} />
      <div className="grid gap-4 md:grid-cols-5">
        {cards.map((c) => <Link key={c.label} to={c.to}><Kpi label={c.label} value={String(c.n)} /></Link>)}
      </div>

      <GastosPorCategoriaCard
        tip="Saídas agrupadas em categorias financeiras amplas (folha, ocupação, alimentação, tarifas…)."
        rows={gastosPorCategoria}
        categoryHref={conciliacaoCategoriaHref}
      />

      <Card className="overflow-hidden p-0">
        <ReconSectionTitle
          title="Conciliação com IA · por categoria"
          subtitle="Expanda uma categoria para editar conciliação e classificação de cada lançamento."
        />
        <ConciliacaoIaPorCategoriaTable
          saidas={saidas}
          rows={iaPorCategoria}
          categorias={categorias}
          classificar={classificar}
          salvandoId={salvandoId}
        />
      </Card>

      <Card className="overflow-hidden p-0">
        <ReconSectionTitle
          title="Conciliação de saída"
          subtitle="Detalhe do plano de contas da operação. A DRE usa a categoria ampla, não o produto."
        />
        <Table
          columns={['Categoria', 'Subcategoria', 'Sub-subcategoria', 'Lançamentos', 'Conciliados', 'Pendentes', 'Valor']}
          empty={!saidaMercadorias.length ? <Empty>Nenhuma saída de mercadorias neste recorte.</Empty> : undefined}
        >
          {saidaMercadorias.map(({ h, items }) => {
            const conc = items.filter((t) => t.recon === 'conciliado').length
            const pend = items.length - conc
            const total = items.reduce((s, t) => s + t.amount, 0)
            const sample = items.find((t) => t.recon !== 'conciliado') ?? items[0]
            return (
              <tr key={`${h.categoria}-${h.subcategoria}-${h.subsub}`}>
                <Td>{h.categoria}</Td>
                <Td>{h.subcategoria}</Td>
                <Td>{h.subsub}</Td>
                <Td className="num">{items.length}</Td>
                <Td className="num">{conc}</Td>
                <Td className="num">
                  {pend ? (
                    sample ? (
                      <Link to={`/conciliacao/${sample.id}`} className="font-medium text-alerta-texto">{pend}</Link>
                    ) : (
                      pend
                    )
                  ) : (
                    0
                  )}
                </Td>
                <Td className="num">{money(total)}</Td>
              </tr>
            )
          })}
        </Table>
      </Card>
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

  function Crumbs() {
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

  if (folha && leafDef && subDef) {
    const items = saidasGrupo.filter((t) => leafDef.match(t.category))
    const stats = summarizeTransactions(items)
    return (
      <div>
        <PageHeader kicker="Conciliação" title={leafDef.label} subtitle={`${subDef.label} · ${meta.label}`} />
        <ConciliacaoStatus carregando={carregando} erro={erro} />
        <Crumbs />
        <p className="t-apoio mb-4 text-texto-secundario">
          {stats.count} lançamentos · {money(-stats.amount)} · {stats.pend} pendente(s) de conciliação
        </p>
        <Table
          columns={['Data', 'Descrição', 'Valor', 'Conciliação', 'Nota fiscal']}
          empty={!items.length ? <Empty>Nenhum lançamento nesta classificação.</Empty> : undefined}
        >
          {items.map((t) => {
            const doc = documents.find((d) => d.txId === t.id)
            return (
              <tr key={t.id}>
                <Td nowrap>{date(t.date)}</Td>
                <Td><Link to={`/conciliacao/${t.id}`}>{t.description}</Link></Td>
                <Td className="num">{money(t.amount)}</Td>
                <Td><ReconStatusBadge recon={t.recon} /></Td>
                <Td>
                  {doc ? (
                    <Link to={`/documentos/${doc.id}`}>{doc.number}</Link>
                  ) : t.document ? (
                    <Link to={`/documentos?busca=${encodeURIComponent(t.document)}`}>{t.document}</Link>
                  ) : (
                    <Link to={`/conciliacao/${t.id}`} className="text-primaria">Conciliar</Link>
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
        <Crumbs />
        <Table
          columns={['Classificação', 'Lançamentos', 'Valor', 'Conciliados', 'Pendentes']}
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
              <Td className="num">{money(-amount)}</Td>
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
      <PageHeader kicker="Conciliação" title={meta.label} subtitle="Escolha uma subcategoria para ver classificações e notas fiscais." />
      <ConciliacaoStatus carregando={carregando} erro={erro} />
      <Crumbs />
      <Table
        columns={['Subcategoria', 'Lançamentos', 'Valor', 'Conciliados', 'Pendentes']}
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
            <Td className="num">{money(-amount)}</Td>
            <Td className="num">{conc}</Td>
            <Td className="num">{pend > 0 ? <span className="font-medium text-alerta-texto">{pend}</span> : pend}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function ConciliacaoListaPage() {
  const { saidas, carregando, erro } = useConciliacaoViewModel()
  const [params] = useSearchParams()
  const estado = params.get('estado') ?? 'pendente'
  const rows = saidas.filter((t) => t.recon === estado)
  return (
    <div>
      <PageHeader kicker="Conciliação" title="Pendências de conciliação" />
      <ConciliacaoStatus carregando={carregando} erro={erro} />
      <Table columns={['Lançamento', 'Transação bancária', 'Valor', 'Status']} empty={!rows.length ? <Empty>Nenhuma pendência neste período.</Empty> : null} footer={<span>Exibindo {rows.length} pendências</span>}>
        {rows.map((t) => (
          <tr key={t.id}>
            <Td>{t.description}</Td>
            <Td><Link to={`/conciliacao/${t.id}`}>{t.counterparty || t.description}</Link></Td>
            <Td className="num">{money(t.amount)}</Td>
            <Td><ReconStatusBadge recon={t.recon} /></Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export function ConciliacaoDetalhePage() {
  const { id } = useParams()
  const { item: t, categorias, classificar, carregando, erro, toast, setToast } = useConciliacaoDetalheViewModel(id)
  const [manual, setManual] = useState(false)
  const [reason, setReason] = useState('')
  const [categoria, setCategoria] = useState('')
  const [hist, setHist] = useState(false)
  const [cnpjInfo, setCnpjInfo] = useState(null)
  const [cnpjError, setCnpjError] = useState('')
  const [cnpjLoading, setCnpjLoading] = useState(false)

  if (carregando && !t) {
    return (
      <div>
        <PageHeader kicker="Conciliação" title="Par de conciliação" />
        <ConciliacaoStatus carregando erro="" />
      </div>
    )
  }
  if (!t) {
    return (
      <div>
        <PageHeader kicker="Conciliação" title="Par de conciliação" />
        {erro ? <ConciliacaoStatus carregando={false} erro={erro} /> : null}
        <Empty>Nenhuma pendência neste período.</Empty>
      </div>
    )
  }
  const foundCnpj = extractCnpj(`${t.document} ${t.description} ${t.counterparty}`)

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
      <PageHeader kicker="Conciliação" title="Par de conciliação" />
      <ConciliacaoStatus carregando={false} erro={erro} />
      {t.recon === 'pendente' ? <Banner className="mb-4">Categoria desconhecida ou vazia. Classifique o lançamento para conciliá-lo.</Banner> : null}
      <Card className="space-y-4">
        <Kv items={[
          { label: 'Transação', value: t.description },
          { label: 'Contraparte', value: t.counterparty || '—' },
          { label: 'Valor', value: money(t.amount) },
          { label: 'Categoria', value: t.category || 'Sem categoria' },
          { label: 'Status', value: reconLabels[t.recon] ?? t.recon },
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
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => {
            if (t.recon === 'conciliado') {
              setToast('Lançamento já conciliado.')
              return
            }
            setCategoria(t.category || '')
            setManual(true)
          }}>Aceitar</Button>
          <Button variant="secondary" onClick={() => setToast('A conciliação segue a categoria do lançamento.')}>Rejeitar</Button>
          <Button variant="secondary" onClick={() => { setCategoria(t.category || ''); setManual(true) }}>Conciliar manualmente</Button>
          <Button variant="ghost" onClick={() => setHist(true)}>Histórico</Button>
        </div>
      </Card>
      <Modal
        title="Conciliação manual"
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
      <Drawer title="Histórico de conciliação" open={hist} onClose={() => setHist(false)}>
        <p className="t-body">Status atual: {reconLabels[t.recon]}</p>
      </Drawer>
      <Toast message={toast} />
    </div>
  )
}
