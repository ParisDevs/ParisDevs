import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  MessageSquarePlus,
  MoreVertical,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Smile,
  Trash2,
  Users,
} from 'lucide-react'
import { Button, Empty, Field, Input, Modal, Textarea, Toast } from '@/views/ui'
import { UserAvatar } from '@/views/components/UserAvatar'
import { cargoLabel, fotoSrc } from '@/models/domain/usuario'
import { cn } from '@/lib/cn'
import { useEquipeViewModel } from '@/viewmodels/equipe/useEquipeViewModel'
import {
  agruparMensagens,
  diasDoMes,
  horaCurta,
  horaRelogio,
  preview,
  rotuloMes,
} from '@/views/features/equipe/helpers'

function podePublicar(usuario) {
  const cargo = usuario?.cargo
  return cargo === 'ADMINISTRADOR' || cargo === 'GERENTE'
}

function TipoBadge({ tipo }) {
  if (tipo !== 'RECADO' && tipo !== 'GRUPO') return null
  return (
    <span className="inline-flex h-[18px] items-center rounded-full bg-secundaria px-1.5 text-[10px] font-medium text-primaria">
      {tipo === 'RECADO' ? 'Recado' : 'Grupo'}
    </span>
  )
}

function IconButton({ className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full text-faint hover:bg-superficie-2 hover:text-texto-secundario',
        className,
      )}
      {...props}
    />
  )
}

function CheckToggle({ marcado, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
        marcado ? 'border-primaria bg-primaria text-white' : 'border-borda-forte bg-superficie text-transparent hover:border-primaria/60',
      )}
    >
      <Check size={11} strokeWidth={3} />
    </button>
  )
}

function AcoesEditarApagar({ onEditar, onApagar }) {
  return (
    <span className="flex shrink-0 items-center">
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-faint hover:bg-superficie hover:text-primaria"
        onClick={onEditar}
        aria-label="Editar"
        title="Editar"
      >
        <Pencil size={12} />
      </button>
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-faint hover:bg-superficie hover:text-erro"
        onClick={onApagar}
        aria-label="Apagar"
        title="Apagar"
      >
        <Trash2 size={12} />
      </button>
    </span>
  )
}

export function EquipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const vm = useEquipeViewModel(id)
  const [busca, setBusca] = useState('')
  const [painel, setPainel] = useState('conversa')
  const [dmAberto, setDmAberto] = useState(false)
  const [grupoAberto, setGrupoAberto] = useState(false)
  const [eventoAberto, setEventoAberto] = useState(false)
  const [dia, setDia] = useState(null)
  const [rascunho, setRascunho] = useState('')
  const [itemNovo, setItemNovo] = useState('')
  const [grupoTitulo, setGrupoTitulo] = useState('')
  const [grupoIds, setGrupoIds] = useState([])
  const [eventoTitulo, setEventoTitulo] = useState('')
  const [eventoHora, setEventoHora] = useState('')
  const [eventoNotas, setEventoNotas] = useState('')
  const [eventoEditando, setEventoEditando] = useState(null)
  const [editandoMsgId, setEditandoMsgId] = useState(null)
  const [edicaoMsg, setEdicaoMsg] = useState('')
  const [editandoItemId, setEditandoItemId] = useState(null)
  const [edicaoItem, setEdicaoItem] = useState('')
  const threadRef = useRef(null)
  const qtdMsgs = useRef(0)

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const pin = []
    const resto = []
    for (const c of vm.conversas) {
      if (q && !String(c.tituloExibicao || '').toLowerCase().includes(q)) continue
      if (c.tipo === 'RECADO') pin.push(c)
      else resto.push(c)
    }
    return [...pin, ...resto]
  }, [vm.conversas, busca])

  const grupos = useMemo(() => agruparMensagens(vm.mensagens), [vm.mensagens])
  const calendario = useMemo(() => diasDoMes(vm.periodo.ano, vm.periodo.mes), [vm.periodo])
  const eventosDoDia = useMemo(
    () => vm.eventos.filter((e) => e.data === dia),
    [vm.eventos, dia],
  )
  const diasComEvento = useMemo(() => new Set(vm.eventos.map((e) => e.data)), [vm.eventos])

  useEffect(() => {
    qtdMsgs.current = -1
  }, [vm.ativaId])

  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    if (vm.mensagens.length === qtdMsgs.current) return
    qtdMsgs.current = vm.mensagens.length
    el.scrollTop = el.scrollHeight
  }, [vm.mensagens, vm.ativaId])

  function selecionar(conversa) {
    navigate(`/equipe/${conversa.id}`)
    vm.abrir(conversa.id)
    setPainel('conversa')
  }

  async function enviar(e) {
    e?.preventDefault()
    const texto = rascunho
    setRascunho('')
    await vm.enviar(texto)
  }

  async function confirmarDm(usuarioId) {
    const conversa = await vm.novaDireta(usuarioId)
    setDmAberto(false)
    navigate(`/equipe/${conversa.id}`)
  }

  async function confirmarGrupo() {
    if (!grupoTitulo.trim() || !grupoIds.length) return
    const conversa = await vm.novoGrupo(grupoTitulo.trim(), grupoIds)
    setGrupoAberto(false)
    setGrupoTitulo('')
    setGrupoIds([])
    navigate(`/equipe/${conversa.id}`)
  }

  function abrirNovoEvento() {
    setEventoEditando(null)
    setEventoTitulo('')
    setEventoHora('')
    setEventoNotas('')
    setEventoAberto(true)
  }

  function abrirEditarEvento(ev) {
    setEventoEditando(ev)
    setEventoTitulo(ev.titulo || '')
    setEventoHora(ev.horaInicio ? String(ev.horaInicio).slice(0, 5) : '')
    setEventoNotas(ev.notas || '')
    setEventoAberto(true)
  }

  async function confirmarEvento() {
    if (!eventoTitulo.trim()) return
    if (eventoEditando) {
      await vm.atualizarEvento(eventoEditando.id, {
        titulo: eventoTitulo.trim(),
        data: dia || eventoEditando.data,
        horaInicio: eventoHora || '',
        notas: eventoNotas || '',
      })
    } else {
      if (!dia) return
      await vm.criarEvento({
        titulo: eventoTitulo.trim(),
        data: dia,
        horaInicio: eventoHora || null,
        notas: eventoNotas || null,
      })
    }
    setEventoAberto(false)
    setEventoEditando(null)
    setEventoTitulo('')
    setEventoHora('')
    setEventoNotas('')
  }

  async function salvarMensagem(e, mensagemId) {
    e?.preventDefault()
    const texto = edicaoMsg.trim()
    if (!texto) return
    await vm.editarMensagem(mensagemId, texto)
    setEditandoMsgId(null)
    setEdicaoMsg('')
  }

  async function salvarItem(e, itemId) {
    e?.preventDefault()
    const texto = edicaoItem.trim()
    if (!texto) return
    await vm.editarItem(itemId, texto)
    setEditandoItemId(null)
    setEdicaoItem('')
  }

  async function adicionarItem(e) {
    e?.preventDefault()
    const texto = itemNovo.trim()
    if (!texto) return
    setItemNovo('')
    await vm.adicionarItem(texto)
  }

  const recadoBloqueado = vm.ativa?.tipo === 'RECADO' && !vm.ativa?.podeEscrever && !podePublicar(vm.usuario)

  const listaColuna = (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[16px] border border-borda bg-superficie">
      <div className="shrink-0 space-y-2.5 px-3 pt-3 pb-2">
        <label className="relative block">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            className="h-9 w-full rounded-full border border-borda bg-superficie py-0 pr-3 pl-9 text-[13px] text-texto outline-none placeholder:text-faint focus:border-borda-forte"
            placeholder="Buscar conversa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar conversa"
          />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-primaria px-2 text-[12px] font-medium whitespace-nowrap text-white hover:bg-primaria-escura"
            onClick={() => setDmAberto(true)}
          >
            <MessageSquarePlus size={13} strokeWidth={2} />
            Nova conversa
          </button>
          <button
            type="button"
            className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-primaria px-2 text-[12px] font-medium whitespace-nowrap text-white hover:bg-primaria-escura"
            onClick={() => setGrupoAberto(true)}
          >
            <Users size={13} strokeWidth={2} />
            Novo grupo
          </button>
          <Button type="button" variant="ghost" className="h-8 px-2 text-[12px] xl:hidden" onClick={() => setPainel('dia')}>
            Meu dia
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
        {!lista.length ? (
          <Empty>Nenhuma conversa. Comece por um colega.</Empty>
        ) : (
          <ul>
            {lista.map((c) => {
              const ativa = Number(c.id) === Number(vm.ativaId)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selecionar(c)}
                    className={cn(
                      'relative flex w-full items-start gap-2.5 rounded-[12px] px-2.5 py-2.5 text-left hover:bg-superficie-2',
                      ativa && 'bg-secundaria hover:bg-secundaria',
                    )}
                  >
                    {ativa ? <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-primaria" /> : null}
                    <UserAvatar src={fotoSrc(c.foto)} name={c.tituloExibicao} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-texto">{c.tituloExibicao}</span>
                        <TipoBadge tipo={c.tipo} />
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-texto-secundario">{preview(c.ultimaMensagem)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[11px] text-faint">{horaCurta(c.ultimaEm)}</span>
                      {c.naoLidas > 0 ? (
                        <span className="mt-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primaria px-1 text-[10px] font-semibold text-white">
                          {c.naoLidas}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )

  const thread = (
    <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-borda bg-superficie">
      {vm.ativa ? (
        <>
          <div className="flex shrink-0 items-center gap-2.5 px-4 py-3">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-texto-secundario hover:bg-superficie-2 xl:hidden"
              onClick={() => navigate('/equipe')}
              aria-label="Voltar às conversas"
            >
              <ChevronLeft size={16} />
            </button>
            <UserAvatar src={fotoSrc(vm.ativa.foto)} name={vm.ativa.tituloExibicao} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-texto">{vm.ativa.tituloExibicao}</p>
              <p className="truncate text-[12px] text-texto-secundario">
                {vm.ativa.tipo === 'RECADO'
                  ? 'Avisos da empresa. Só gestão publica.'
                  : vm.ativa.tipo === 'GRUPO'
                    ? `${vm.ativa.membros} pessoas`
                    : [cargoLabel(vm.ativa.cargo), vm.ativa.filial].filter(Boolean).join(' · ') || 'Conversa direta'}
              </p>
            </div>
            <Button type="button" variant="ghost" className="h-8 px-2 text-[12px] xl:hidden" onClick={() => setPainel('dia')}>
              Meu dia
            </Button>
            <IconButton className="max-xl:hidden" aria-label="Mais opções" title="Mais opções">
              <MoreVertical size={16} />
            </IconButton>
          </div>
          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-36">
            {!vm.mensagens.length ? (
              <p className="t-body py-8 text-center text-texto-secundario">Ainda não há mensagens neste espaço.</p>
            ) : (
              grupos.map((grupo) => (
                <div key={grupo.dia} className="mb-4">
                  <p className="mx-auto mb-3 w-fit rounded-full bg-secundaria px-3 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-primaria uppercase">
                    {grupo.label}
                  </p>
                  <ul className="space-y-2.5">
                    {grupo.items.map((m) => (
                      <li key={m.id} className="flex items-start gap-2.5">
                        <UserAvatar src={fotoSrc(m.autorFoto)} name={m.autorNome} size={32} />
                        <div className="min-w-0 flex-1 rounded-[18px] bg-[#e7f1ed] px-4 py-3">
                          <p className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-texto">{m.autorNome}</span>
                            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-faint">
                              {horaRelogio(m.criadoEm) || horaCurta(m.criadoEm)}
                              {m.editada ? <span>editada</span> : null}
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primaria text-white" title="Enviada" aria-label="Enviada">
                                <Check size={9} strokeWidth={3} />
                              </span>
                            </span>
                            {m.podeEditar || m.propria ? (
                              <AcoesEditarApagar
                                onEditar={() => {
                                  setEditandoMsgId(m.id)
                                  setEdicaoMsg(m.texto)
                                }}
                                onApagar={() => vm.removerMensagem(m.id)}
                              />
                            ) : null}
                          </p>
                          {editandoMsgId === m.id ? (
                            <form onSubmit={(e) => salvarMensagem(e, m.id)} className="mt-2">
                              <textarea
                                className="min-h-[64px] w-full resize-none rounded-[10px] border border-borda bg-superficie px-2.5 py-2 text-[13px] text-texto outline-none"
                                value={edicaoMsg}
                                onChange={(e) => setEdicaoMsg(e.target.value)}
                                autoFocus
                              />
                              <div className="mt-1.5 flex justify-end gap-1.5">
                                <Button type="button" variant="ghost" className="h-7 px-2 text-[12px]" onClick={() => setEditandoMsgId(null)}>Cancelar</Button>
                                <Button type="submit" className="h-7 px-3 text-[12px]" disabled={!edicaoMsg.trim()}>Guardar</Button>
                              </div>
                            </form>
                          ) : (
                            <p className="mt-1 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-texto">{m.texto}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
          <form onSubmit={enviar} className="absolute inset-x-3 bottom-3 z-10">
            {recadoBloqueado ? (
              <p className="t-apoio rounded-[20px] border border-borda bg-superficie px-4 py-3 text-texto-secundario shadow-[0_8px_24px_rgba(13,31,27,0.08)]">
                Só administrador ou gerente publica recado.
              </p>
            ) : (
              <div className="flex min-h-[112px] flex-col rounded-[20px] border border-borda bg-superficie px-4 pt-3 pb-2.5 shadow-[0_8px_24px_rgba(13,31,27,0.08)]">
                <textarea
                  className="min-h-[48px] w-full flex-1 resize-none border-0 bg-transparent py-1 text-[13.5px] text-texto outline-none placeholder:text-faint"
                  rows={2}
                  placeholder="Escreva uma mensagem"
                  value={rascunho}
                  disabled={vm.enviando || !vm.ativa?.podeEscrever}
                  onChange={(e) => setRascunho(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      enviar()
                    }
                  }}
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center">
                    <IconButton aria-hidden tabIndex={-1} className="pointer-events-none">
                      <Paperclip size={16} />
                    </IconButton>
                    <IconButton aria-hidden tabIndex={-1} className="pointer-events-none">
                      <Smile size={16} />
                    </IconButton>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primaria px-3.5 text-[12px] font-medium text-white hover:bg-primaria-escura disabled:opacity-40"
                    disabled={vm.enviando || !rascunho.trim() || !vm.ativa?.podeEscrever}
                  >
                    Enviar
                    <Send size={13} />
                  </button>
                </div>
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty>Escolha uma conversa à esquerda.</Empty>
        </div>
      )}
    </section>
  )

  const calendarioCard = (
    <div className="shrink-0 rounded-[16px] border border-borda bg-superficie px-3.5 py-3">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-secundaria text-primaria">
          <CalendarDays size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-texto">Meu dia</p>
          <p className="text-[12px] text-texto-secundario">Lembretes e anotações só seus.</p>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-faint hover:bg-superficie-2" onClick={() => vm.mudarMes(-1)} aria-label="Mês anterior">
          <ChevronLeft size={14} />
        </button>
        <p className="text-[12.5px] font-semibold text-primaria">{rotuloMes(vm.periodo.ano, vm.periodo.mes)}</p>
        <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-faint hover:bg-superficie-2" onClick={() => vm.mudarMes(1)} aria-label="Próximo mês">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {calendario.weekdays.map((w, i) => (
          <span key={`${w}-${i}`} className="text-[10px] font-semibold tracking-[0.06em] text-faint">{w}</span>
        ))}
        {calendario.celulas.map((cel, i) => (
          <button
            key={cel ? cel.iso : `vazio-${i}`}
            type="button"
            disabled={!cel}
            onClick={() => setDia(cel.iso)}
            className={cn(
              'relative h-8 rounded-[6px] text-[12px]',
              cel ? 'hover:bg-superficie-2' : 'opacity-0',
              dia === cel?.iso && 'bg-primaria text-white hover:bg-primaria',
            )}
          >
            {cel?.dia}
            {cel && diasComEvento.has(cel.iso) ? (
              <span className={cn('absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full', dia === cel.iso ? 'bg-ouro' : 'bg-primaria')} />
            ) : null}
          </button>
        ))}
      </div>
      {dia ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-texto">Lembretes do dia</p>
            <Button type="button" variant="ghost" className="h-7 px-2 text-[12px]" onClick={abrirNovoEvento}>
              <Plus size={12} /> Novo
            </Button>
          </div>
          {!eventosDoDia.length ? (
            <p className="text-[12px] text-faint">Nenhum lembrete neste dia.</p>
          ) : (
            <ul className="space-y-1.5">
              {eventosDoDia.map((ev) => (
                <li key={ev.id} className="flex items-start gap-2 rounded-[8px] border border-borda px-2 py-1.5">
                  <CheckToggle
                    marcado={!!ev.feito}
                    onClick={() => vm.toggleEvento(ev)}
                    label={ev.feito ? 'Desmarcar lembrete' : 'Concluir lembrete'}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[12.5px] font-medium text-texto', ev.feito && 'text-texto-secundario line-through')}>{ev.titulo}</span>
                    <span className="text-[11px] text-faint">{ev.horaInicio ? String(ev.horaInicio).slice(0, 5) : 'Dia inteiro'}</span>
                  </span>
                  <AcoesEditarApagar onEditar={() => abrirEditarEvento(ev)} onApagar={() => vm.removerEvento(ev.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-faint">
          <CalendarDays size={12} className="text-primaria/70" />
          Clique em um dia para ver ou criar lembrete.
        </p>
      )}
    </div>
  )

  const checklistCard = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-borda bg-superficie px-3.5 py-3">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primaria text-white">
          <CircleCheck size={12} strokeWidth={2.4} />
        </span>
        <p className="text-[14px] font-semibold text-texto">Checklist</p>
      </div>
      <form onSubmit={adicionarItem} className="mb-2 flex items-center gap-2">
        <input
          className="h-9 min-w-0 flex-1 rounded-full border border-borda bg-superficie px-3 text-[13px] text-texto outline-none placeholder:text-faint focus:border-borda-forte"
          placeholder="Adicionar item"
          value={itemNovo}
          onChange={(e) => setItemNovo(e.target.value)}
        />
        <button
          type="submit"
          disabled={!itemNovo.trim()}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-borda-forte bg-superficie text-faint hover:bg-superficie-2 hover:text-texto disabled:opacity-40"
          aria-label="Adicionar item"
        >
          <Plus size={14} />
        </button>
      </form>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!vm.itens.length ? (
          <p className="text-[12px] text-faint">Nada anotado.</p>
        ) : (
          <ul className="space-y-1">
            {vm.itens.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-[8px] px-1 py-1 hover:bg-superficie-2">
                <CheckToggle
                  marcado={item.feito}
                  onClick={() => vm.toggleItem(item)}
                  label={item.feito ? 'Desmarcar item' : 'Concluir item'}
                />
                {editandoItemId === item.id ? (
                  <form onSubmit={(e) => salvarItem(e, item.id)} className="flex min-w-0 flex-1 items-center gap-1">
                    <input
                      className="h-7 min-w-0 flex-1 rounded-[8px] border border-borda px-2 text-[13px] outline-none"
                      value={edicaoItem}
                      onChange={(e) => setEdicaoItem(e.target.value)}
                      autoFocus
                    />
                    <Button type="submit" className="h-7 px-2 text-[11px]" disabled={!edicaoItem.trim()}>Ok</Button>
                  </form>
                ) : (
                  <span className={cn('min-w-0 flex-1 text-[13px]', item.feito && 'text-texto-secundario line-through')}>{item.texto}</span>
                )}
                <AcoesEditarApagar
                  onEditar={() => {
                    setEditandoItemId(item.id)
                    setEdicaoItem(item.texto)
                  }}
                  onApagar={() => vm.removerItem(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const trilho = (
    <aside className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      {calendarioCard}
      {checklistCard}
    </aside>
  )

  return (
    <div className="flex h-[calc(100svh-64px-2.5rem)] flex-col md:h-[calc(100svh-64px-4rem)]">
      <header className="mb-3 shrink-0">
        <h1 className="text-[28px] font-semibold tracking-tight text-primaria">Equipe</h1>
        <p className="mt-0.5 text-[13px] text-texto-secundario">Conversas, recados, lembretes e anotações da sua conta.</p>
      </header>
      {vm.erro ? <p className="mb-2 shrink-0 text-[13px] text-erro">{vm.erro}</p> : null}
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div className={cn('flex h-full min-h-0 w-full xl:w-[268px] xl:shrink-0', vm.ativaId || painel === 'dia' ? 'max-xl:hidden' : '', 'xl:flex')}>
          {listaColuna}
        </div>
        <div className={cn('flex h-full min-h-0 min-w-0 flex-1', !vm.ativaId || painel === 'dia' ? 'max-xl:hidden' : '', 'xl:flex')}>
          {thread}
        </div>
        <div className={cn('h-full min-h-0 w-full xl:w-[280px] xl:shrink-0', painel === 'dia' ? 'flex' : 'hidden xl:flex')}>
          {painel === 'dia' ? (
            <div className="flex h-full min-h-0 w-full flex-col">
              <div className="mb-2 flex shrink-0 items-center gap-2 xl:hidden">
                <Button type="button" variant="ghost" className="h-8 px-2" onClick={() => setPainel('conversa')}>
                  Voltar
                </Button>
                <span className="text-[13px] font-semibold">Meu dia</span>
              </div>
              <div className="min-h-0 flex-1">{trilho}</div>
            </div>
          ) : (
            trilho
          )}
        </div>
      </div>

      <Modal
        title="Nova conversa"
        open={dmAberto}
        onClose={() => setDmAberto(false)}
        subtitle="Escolha um colega cadastrado."
      >
        {!vm.colegas.length ? (
          <Empty>Não há outros usuários cadastrados.</Empty>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {vm.colegas.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-[8px] px-2 py-2 text-left hover:bg-superficie-2"
                  onClick={() => confirmarDm(u.id)}
                >
                  <UserAvatar src={fotoSrc(u.foto)} name={u.nome} size={32} />
                  <span>
                    <span className="block text-[13px] font-medium text-texto">{u.nome}</span>
                    <span className="text-[12px] text-texto-secundario">{cargoLabel(u.cargo)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        title="Novo grupo"
        open={grupoAberto}
        onClose={() => setGrupoAberto(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setGrupoAberto(false)}>Cancelar</Button>
            <Button onClick={confirmarGrupo} disabled={!grupoTitulo.trim() || !grupoIds.length}>Criar grupo</Button>
          </>
        )}
      >
        <Field label="Nome">
          <Input value={grupoTitulo} onChange={(e) => setGrupoTitulo(e.target.value)} placeholder="Ex.: Financeiro da semana" />
        </Field>
        <p className="t-label mt-4 mb-2 text-texto-secundario">Colegas</p>
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {vm.colegas.map((u) => {
            const marcado = grupoIds.includes(u.id)
            return (
              <li key={u.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 hover:bg-superficie-2">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => setGrupoIds((prev) => (marcado ? prev.filter((id) => id !== u.id) : [...prev, u.id]))}
                  />
                  <UserAvatar src={fotoSrc(u.foto)} name={u.nome} size={24} />
                  <span className="text-[13px]">{u.nome}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </Modal>

      <Modal
        title={eventoEditando ? 'Editar lembrete' : 'Novo lembrete'}
        open={eventoAberto}
        onClose={() => { setEventoAberto(false); setEventoEditando(null) }}
        footer={(
          <>
            <Button variant="secondary" onClick={() => { setEventoAberto(false); setEventoEditando(null) }}>Cancelar</Button>
            <Button onClick={confirmarEvento} disabled={!eventoTitulo.trim() || (!eventoEditando && !dia)}>Guardar</Button>
          </>
        )}
      >
        <Field label="Título">
          <Input value={eventoTitulo} onChange={(e) => setEventoTitulo(e.target.value)} />
        </Field>
        <div className="mt-3">
          <Field label="Hora (opcional)">
            <Input type="time" value={eventoHora} onChange={(e) => setEventoHora(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Notas (opcional)">
            <Textarea className="min-h-20" value={eventoNotas} onChange={(e) => setEventoNotas(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Toast message={vm.toast} />
    </div>
  )
}
