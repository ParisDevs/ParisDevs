import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { conversarAssistente, statusAssistente } from '@/models/api/assistenteService'
import { buildGastoCategoriaRows, conciliacaoCategoriaHref } from '@/models/domain/reconCategories'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'
import { Banner, Button, Card, Empty, PageHeader, Toast } from '@/views/ui'
import { GastosPorCategoriaCard, PieCard } from '@/views/charts'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { useConciliacaoViewModel } from '@/viewmodels/conciliacao/useConciliacaoViewModel'
import {
  INSTRUCAO_INSIGHTS,
  baixarConciliacao,
  contextoInsights,
  nomeArquivoConciliacao,
  parseInsights,
  resumoConciliacao,
} from '@/views/features/conciliacao/helpers'

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

export function ConciliacaoInsightsPage() {
  const { period, scope, config } = useAppViewModel()
  const { saidas, carregando, erro } = useConciliacaoViewModel()
  const [gerando, setGerando] = useState(false)
  const [bullets, setBullets] = useState([])
  const [erroIa, setErroIa] = useState('')
  const [toast, setToast] = useState('')

  const resumo = useMemo(() => resumoConciliacao(saidas), [saidas])
  const gastos = useMemo(() => buildGastoCategoriaRows(saidas), [saidas])
  const pizza = useMemo(
    () => [
      { name: 'Classificados', value: resumo.valorClassificados, color: '#0E7C56' },
      { name: 'Sem categoria', value: resumo.valorPendentes, color: '#9A6B08' },
    ],
    [resumo],
  )
  const maxPend = resumo.rankingPendentes[0]?.count ?? 0

  function exportar() {
    if (!resumo.itensClassificados.length) return
    const ok = baixarConciliacao(nomeArquivoConciliacao(period, true), resumo.itensClassificados)
    if (ok) setToast('Planilha dos classificados baixada.')
  }

  async function gerar() {
    if (gerando) return
    setGerando(true)
    setErroIa('')
    try {
      const provedor = config.aiApi?.provider || 'openai'
      const status = await statusAssistente(provedor)
      if (!status?.configurado) {
        setBullets([])
        setErroIa('O assistente ainda não tem chave. Salve em Configurações → API de IA.')
        return
      }
      const texto = await conversarAssistente({
        provedor,
        instrucoes: INSTRUCAO_INSIGHTS,
        contexto: contextoInsights({
          period,
          scope,
          resumo,
          categorias: resumo.rankingPendentes,
        }),
        mensagens: [{ papel: 'user', texto: 'Gere insights acionáveis para classificar as saídas deste período.' }],
      })
      const parsed = parseInsights(texto)
      if (!parsed.length) {
        setErroIa('O modelo não devolveu texto.')
        setBullets([])
        return
      }
      setBullets(parsed)
    } catch (e) {
      setBullets([])
      setErroIa(e?.message || 'Não foi possível consultar o assistente.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Operação"
        title="Insights da conciliação"
        subtitle="Gráficos do período atual e leitura do assistente só com os totais já calculados nesta tela."
        actions={
          <>
            <Button variant="secondary" onClick={exportar} disabled={!resumo.itensClassificados.length}>
              Baixar XLSX
            </Button>
            <Button onClick={gerar} disabled={gerando || !resumo.total}>
              {gerando ? 'Gerando…' : bullets.length ? 'Gerar de novo' : 'Gerar insights'}
            </Button>
          </>
        }
      />

      <nav className="flex flex-wrap items-center gap-1 text-[13px] text-texto-secundario" aria-label="Navegação">
        <Link to="/conciliacao" className="font-medium text-primaria hover:underline">Conciliação</Link>
        <ChevronRight size={14} className="text-faint" aria-hidden />
        <span className="font-medium text-texto">Insights</span>
      </nav>

      <ConciliacaoStatus carregando={carregando} erro={erro} />

      {!carregando && !resumo.total ? (
        <Empty
          action={
            <>
              <Link to="/extratos"><Button variant="secondary">Extratos</Button></Link>
              <Link to="/operacoes"><Button>Operações</Button></Link>
            </>
          }
        >
          Não há saídas neste período para gerar gráfico ou insight.
        </Empty>
      ) : null}

      {resumo.total ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <GastosPorCategoriaCard
              compact
              title="Composição das saídas"
              tip="Mesmo recorte da conciliação. Clique numa categoria para abrir o detalhe."
              rows={gastos}
              categoryHref={conciliacaoCategoriaHref}
            />
            <div className="space-y-4">
              <PieCard
                title="Classificados vs sem categoria"
                tip="Valor das saídas do período. Quantidade ao lado."
                data={pizza}
              />
              <Card className="grid grid-cols-2 gap-3 p-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.06em] text-texto-secundario uppercase">Quantidade</p>
                  <p className="mt-1 text-[13px] text-texto">
                    {resumo.classificados} classificados · {resumo.pendentes} sem categoria
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.06em] text-texto-secundario uppercase">Valor</p>
                  <p className="mt-1 text-[13px] text-texto">
                    {money(resumo.valorClassificados)} · {money(resumo.valorPendentes)}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-borda px-4 py-3.5">
              <h2 className="text-[15px] font-semibold text-texto">Categorias com mais itens sem categoria</h2>
              <p className="t-apoio mt-0.5 text-texto-secundario">Ordem pela quantidade ainda não classificada.</p>
            </div>
            {!resumo.rankingPendentes.length ? (
              <p className="t-body px-4 py-6 text-texto-secundario">Nenhuma saída sem categoria neste período.</p>
            ) : (
              <ul className="divide-y divide-borda">
                {resumo.rankingPendentes.map((row) => (
                  <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <Link to={conciliacaoCategoriaHref(row.id)} className="text-[13px] font-medium text-primaria hover:underline">
                        {row.label}
                      </Link>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-superficie-2">
                        <div
                          className="h-full rounded-full bg-alerta-texto/70"
                          style={{ width: `${maxPend ? Math.max(8, (row.count / maxPend) * 100) : 8}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-texto">{row.count}</p>
                      <p className="t-apoio text-faint">{money(row.amount)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-borda px-4 py-3.5">
              <div>
                <h2 className="text-[15px] font-semibold text-texto">Insights da IA</h2>
                <p className="t-apoio mt-0.5 text-texto-secundario">
                  O modelo só lê totais desta tela. Sem chave, nada é inventado.
                </p>
              </div>
              <Button onClick={gerar} disabled={gerando || !resumo.total} className="h-9">
                {gerando ? 'Gerando…' : bullets.length ? 'Gerar de novo' : 'Gerar insights'}
              </Button>
            </div>
            <div className="px-4 py-4">
              {erroIa ? (
                <Banner tone="error">
                  {erroIa}{' '}
                  {erroIa.includes('chave') ? (
                    <Link to="/configuracoes/ia" className="font-medium underline">Abrir API de IA</Link>
                  ) : null}
                </Banner>
              ) : null}
              {gerando ? (
                <p className="t-body text-texto-secundario">Consultando o assistente…</p>
              ) : null}
              {!gerando && !erroIa && !bullets.length ? (
                <p className="t-body text-texto-secundario">Gere os insights para ver a leitura do período.</p>
              ) : null}
              {bullets.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {bullets.map((item, i) => (
                    <li
                      key={`${i}-${item.slice(0, 24)}`}
                      className={cn('rounded-[10px] border border-borda bg-superficie-2 px-3 py-2.5 text-[13px] leading-relaxed text-texto')}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Card>
        </>
      ) : null}

      <Toast message={toast} />
    </div>
  )
}
