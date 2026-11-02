import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, X } from 'lucide-react'
import { useAppViewModel, useScopedTx } from '@/viewmodels/AppViewModel'
import { reconPending } from '@/models/domain/banking'
import { classStatus } from '@/models/domain/finance'
import { conversarAssistente, statusAssistente } from '@/models/api/assistenteService'
import { buscarKpisDashboard } from '@/models/api/dashboardService'
import { periodRange } from '@/lib/period'



function nomeProvedor(provedor) {
  if (provedor === 'claude') return 'Claude'
  if (provedor === 'gemini') return 'Gemini'
  return 'OpenAI'
}

const HELLO = {
  from: 'bot',
  text: 'Olá. Sou o assistente da Paris Devs. Posso localizar saldo, conciliação, DRE e a fila de classificação.',
}

function replyOf(q, ctx) {
  const t = q.toLowerCase()
  if (t.includes('saldo') || t.includes('caixa')) {
    return { from: 'bot', text: 'O saldo consolidado está no dashboard, só com contas conectadas e com dados.', to: '/dashboard', toLabel: 'Abrir dashboard' }
  }
  if (t.includes('dre') || t.includes('resultado') || t.includes('lucro')) {
    return { from: 'bot', text: 'A DRE gerencial usa só lançamentos classificados e exclui transferência interna.', to: '/dre', toLabel: 'Abrir DRE' }
  }
  if (t.includes('concili')) {
    return {
      from: 'bot',
      text: ctx.pending ? `Há ${ctx.pending} pendência(s) de conciliação neste recorte.` : 'Não há pendência de conciliação neste recorte.',
      to: '/conciliacao',
      toLabel: 'Abrir conciliação',
    }
  }
  if (t.includes('classific') || t.includes('fila') || t.includes('ia')) {
    return {
      from: 'bot',
      text: ctx.review ? `Há ${ctx.review} item(ns) aguardando revisão humana.` : 'Nenhuma classificação aguardando revisão neste recorte.',
      to: '/ia/fila',
      toLabel: 'Abrir fila da IA',
    }
  }
  if (t.includes('banco') || t.includes('conex') || t.includes('open finance')) {
    return { from: 'bot', text: 'As conexões dependem da autorização do titular no Open Finance.', to: '/conexoes', toLabel: 'Abrir conexões' }
  }
  // if (t.includes('pagar') || t.includes('receber') || t.includes('agenda')) {
  //   return { from: 'bot', text: 'Contas a pagar e a receber ficam na operação, com vencimento e status.', to: '/contas-a-pagar', toLabel: 'Abrir contas a pagar' }
  // }
  if (t.includes('olá') || t.includes('oi') || t.includes('ola') || t.includes('ajuda')) {
    return { from: 'bot', text: `Olá${ctx.name ? `, ${ctx.name}` : ''}. Pergunte por saldo, DRE, conciliação ou classificação.` }
  }
  return { from: 'bot', text: 'Não encontrei isso. Tente saldo, DRE, conciliação, classificação ou conexões.' }
}

export function AiChatbot() {
  const { session, scope, config, period } = useAppViewModel()
  const tx = useScopedTx()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [msgs, setMsgs] = useState([HELLO])
  const [enviando, setEnviando] = useState(false)
  const endRef = useRef(null)
  const first = session?.name?.split(' ')[0] ?? ''

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, open, enviando])

  async function contextoAtual() {
    const partes = [
      `Usuário: ${first || 'não identificado'}.`,
      `Escopo: ${scope === 'grupo' ? 'grupo' : `filial ${scope}`}.`,
      `Período: ${period}.`,
    ]
    try {
      const { inicio, fim } = periodRange(period)
      const idFilial = scope === 'grupo' ? undefined : Number(scope)
      const kpis = await buscarKpisDashboard(inicio, fim, idFilial)
      partes.push(`Saldo consolidado: ${kpis.saldoConsolidado}.`)
      partes.push(`Entradas do período: ${kpis.entradas}.`)
      partes.push(`Saídas do período: ${kpis.saidas}.`)
      partes.push(`Resultado do período: ${kpis.resultado}.`)
    } catch {
      partes.push('Os indicadores do dashboard não puderam ser lidos agora.')
    }
    return partes.join(' ')
  }

  async function send(value = text) {
    const q = value.trim()
    if (!q || enviando) return
    const user = { from: 'user', text: q }
    const historico = [...msgs, user].slice(-12).map((m) => ({
      papel: m.from === 'user' ? 'user' : 'assistant',
      texto: m.text,
    }))
    setMsgs((m) => [...m, user])
    setText('')
    setEnviando(true)
    try {
      const provedor = config.aiApi?.provider || 'openai'
      const status = await statusAssistente(provedor)
      if (!status?.configurado) {
        const pending = reconPending(tx, scope).count
        const review = tx.filter((t) => {
          const s = classStatus(t, config)
          return s === 'sugerida' || s === 'revisao' || s === 'nao_classificada'
        }).length
        const local = replyOf(q, { pending, review, name: first })
        setMsgs((m) => [...m, {
          ...local,
          text: `${local.text} Para o modelo responder, salve a chave em Configurações → API de IA.`,
        }])
        return
      }
      const texto = await conversarAssistente({
        provedor,
        instrucoes: config.aiApi?.instrucoes || '',
        contexto: await contextoAtual(),
        mensagens: historico,
      })
      setMsgs((m) => [...m, { from: 'bot', text: texto || 'O modelo não devolveu texto.' }])
    } catch (err) {
      setMsgs((m) => [...m, { from: 'bot', text: err.message || 'Não foi possível consultar o assistente.' }])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <section className="pointer-events-auto flex h-[min(440px,calc(100svh-7.5rem))] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[16px] border border-borda bg-superficie shadow-[0_16px_48px_rgba(13,31,27,0.18)]">
          <header className="flex items-center gap-2.5 bg-menu px-4 py-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ouro/20 text-ouro">
              <Sparkles size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">Assistente</p>
              <p className="text-[11px] text-white/55">{enviando ? `Consultando ${nomeProvedor(config.aiApi?.provider)}` : `IA da Paris Devs · ${nomeProvedor(config.aiApi?.provider)}`}</p>
            </div>
            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10" aria-label="Fechar assistente" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </header>
          <div className="flex-1 space-y-2.5 overflow-y-auto bg-fundo p-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={m.from === 'user' ? 'max-w-[85%] rounded-[12px] rounded-br-[4px] bg-primaria px-3 py-2 text-[13px] text-white' : 'max-w-[85%] rounded-[12px] rounded-bl-[4px] border border-borda bg-superficie px-3 py-2 text-[13px] text-texto'}>
                  <p>{m.text}</p>
                  {m.to ? (
                    <Link className="mt-1.5 block text-[12px] font-medium" to={m.to} onClick={() => setOpen(false)}>
                      {m.toLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
            {enviando ? <p className="t-apoio text-texto-secundario">Consultando...</p> : null}
            <div ref={endRef} />
          </div>
          <form
            className="flex gap-2 border-t border-borda bg-superficie p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <input
              className="h-9 min-w-0 flex-1 rounded-[8px] border border-borda-forte bg-superficie px-3 text-[13px] outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pergunte sobre o financeiro"
              aria-label="Mensagem para o assistente"
              disabled={enviando}
            />
            <button type="submit" disabled={enviando} className="h-9 rounded-[8px] bg-primaria px-3 text-[13px] font-medium text-white hover:bg-primaria-escura disabled:opacity-60">
              Enviar
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-menu text-ouro shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:bg-menu-hover"
        aria-label={open ? 'Fechar assistente de IA' : 'Abrir assistente de IA'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>
    </div>
  )
}
