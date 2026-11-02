import { useCallback, useEffect, useMemo, useState } from 'react'
import { listarUsuarios } from '@/models/api/usuarioService'
import {
  atualizarEventoEquipe,
  atualizarItemChecklistEquipe,
  abrirDiretaEquipe,
  criarEventoEquipe,
  criarGrupoEquipe,
  criarItemChecklistEquipe,
  editarMensagemEquipe,
  enviarMensagemEquipe,
  listarChecklistEquipe,
  listarConversasEquipe,
  listarEventosEquipe,
  listarMensagensEquipe,
  marcarLeituraEquipe,
  removerEventoEquipe,
  removerItemChecklistEquipe,
  removerMensagemEquipe,
} from '@/models/api/equipeService'
import { emitirNaoLidas, mesAtual } from '@/views/features/equipe/helpers'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

export function useEquipeViewModel(conversaInicial) {
  const { usuario } = useAppViewModel()
  const [conversas, setConversas] = useState([])
  const [colegas, setColegas] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [ativaId, setAtivaId] = useState(conversaInicial ? Number(conversaInicial) : null)
  const [eventos, setEventos] = useState([])
  const [itens, setItens] = useState([])
  const [periodo, setPeriodo] = useState(mesAtual)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')

  const ativa = useMemo(
    () => conversas.find((c) => Number(c.id) === Number(ativaId)) ?? null,
    [conversas, ativaId],
  )

  const colegasOutros = useMemo(
    () => colegas.filter((c) => Number(c.id) !== Number(usuario?.id)),
    [colegas, usuario],
  )

  const recarregarLista = useCallback(async () => {
    const lista = await listarConversasEquipe()
    setConversas(lista)
    const total = lista.reduce((s, c) => s + (Number(c.naoLidas) || 0), 0)
    emitirNaoLidas(total)
    return lista
  }, [])

  const recarregarTrilho = useCallback(async (ano, mes) => {
    const [ev, ck] = await Promise.all([listarEventosEquipe(ano, mes), listarChecklistEquipe()])
    setEventos(ev)
    setItens(ck)
  }, [])

  const abrir = useCallback(async (id) => {
    if (!id) return
    setAtivaId(Number(id))
    try {
      await marcarLeituraEquipe(id)
    } catch {
      /* leitura é best-effort */
    }
    const msgs = await listarMensagensEquipe(id)
    setMensagens(msgs)
    const lista = await recarregarLista()
    return lista
  }, [recarregarLista])

  useEffect(() => {
    if (!usuario) {
      setConversas([])
      setCarregando(false)
      return undefined
    }
    let cancel = false
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')
        const [lista, pessoas] = await Promise.all([recarregarLista(), listarUsuarios()])
        if (cancel) return
        setColegas(Array.isArray(pessoas) ? pessoas : [])
        await recarregarTrilho(periodo.ano, periodo.mes)
        if (cancel) return
        const alvo = conversaInicial
          ? lista.find((c) => Number(c.id) === Number(conversaInicial))
          : lista[0]
        if (alvo) await abrir(alvo.id)
        else setMensagens([])
      } catch (e) {
        if (!cancel) setErro(e?.message || 'Não foi possível carregar a equipe.')
      } finally {
        if (!cancel) setCarregando(false)
      }
    }
    carregar()
    return () => {
      cancel = true
    }
    // carga inicial da sessão; troca de conversa é feita por abrir()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  useEffect(() => {
    if (!conversaInicial || Number(conversaInicial) === Number(ativaId)) return
    abrir(conversaInicial)
  }, [conversaInicial, ativaId, abrir])

  useEffect(() => {
    if (!usuario) return undefined

    async function poll() {
      if (document.hidden) return
      try {
        await recarregarLista()
        if (ativaId) {
          const msgs = await listarMensagensEquipe(ativaId)
          setMensagens(msgs)
        }
      } catch {
        /* poll silencioso */
      }
    }

    const id = setInterval(poll, 4000)
    document.addEventListener('visibilitychange', poll)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', poll)
    }
  }, [usuario, ativaId, recarregarLista])

  async function enviar(texto) {
    if (!ativaId || enviando) return
    const limpo = String(texto || '').trim()
    if (!limpo) return
    try {
      setEnviando(true)
      setErro('')
      const msg = await enviarMensagemEquipe(ativaId, limpo)
      setMensagens((prev) => [...prev, msg])
      await recarregarLista()
    } catch (e) {
      setToast(e?.message || 'Não foi possível enviar.')
    } finally {
      setEnviando(false)
    }
  }

  async function editarMensagem(mensagemId, texto) {
    if (!ativaId) return
    const limpo = String(texto || '').trim()
    if (!limpo) return
    try {
      const msg = await editarMensagemEquipe(ativaId, mensagemId, limpo)
      setMensagens((prev) => prev.map((m) => (m.id === msg.id ? msg : m)))
      await recarregarLista()
    } catch (e) {
      setToast(e?.message || 'Não foi possível editar a mensagem.')
      throw e
    }
  }

  async function removerMensagem(mensagemId) {
    if (!ativaId) return
    try {
      await removerMensagemEquipe(ativaId, mensagemId)
      setMensagens((prev) => prev.filter((m) => m.id !== mensagemId))
      await recarregarLista()
    } catch (e) {
      setToast(e?.message || 'Não foi possível apagar a mensagem.')
    }
  }

  async function novaDireta(usuarioId) {
    const conversa = await abrirDiretaEquipe(usuarioId)
    await recarregarLista()
    await abrir(conversa.id)
    return conversa
  }

  async function novoGrupo(titulo, usuarioIds) {
    const conversa = await criarGrupoEquipe(titulo, usuarioIds)
    await recarregarLista()
    await abrir(conversa.id)
    return conversa
  }

  async function mudarMes(delta) {
    const cursor = new Date(periodo.ano, periodo.mes - 1 + delta, 1)
    const next = { ano: cursor.getFullYear(), mes: cursor.getMonth() + 1 }
    setPeriodo(next)
    await recarregarTrilho(next.ano, next.mes)
  }

  async function criarEvento(payload) {
    await criarEventoEquipe(payload)
    await recarregarTrilho(periodo.ano, periodo.mes)
    setToast('Lembrete guardado.')
  }

  async function atualizarEvento(id, payload) {
    try {
      const next = await atualizarEventoEquipe(id, payload)
      setEventos((prev) => prev.map((e) => (e.id === next.id ? next : e)))
      setToast('Lembrete atualizado.')
    } catch (e) {
      setToast(e?.message || 'Não foi possível atualizar o lembrete.')
      throw e
    }
  }

  async function toggleEvento(evento) {
    try {
      const next = await atualizarEventoEquipe(evento.id, { feito: !evento.feito })
      setEventos((prev) => prev.map((e) => (e.id === next.id ? next : e)))
    } catch (e) {
      setToast(e?.message || 'Não foi possível atualizar o lembrete.')
    }
  }

  async function removerEvento(id) {
    await removerEventoEquipe(id)
    await recarregarTrilho(periodo.ano, periodo.mes)
  }

  async function adicionarItem(texto) {
    const item = await criarItemChecklistEquipe(texto)
    setItens((prev) => [...prev, item])
  }

  async function toggleItem(item) {
    const next = await atualizarItemChecklistEquipe(item.id, { feito: !item.feito })
    setItens((prev) => prev.map((i) => (i.id === next.id ? next : i)))
  }

  async function editarItem(id, texto) {
    try {
      const next = await atualizarItemChecklistEquipe(id, { texto })
      setItens((prev) => prev.map((i) => (i.id === next.id ? next : i)))
    } catch (e) {
      setToast(e?.message || 'Não foi possível editar o item.')
      throw e
    }
  }

  async function removerItem(id) {
    await removerItemChecklistEquipe(id)
    setItens((prev) => prev.filter((i) => i.id !== id))
  }

  return {
    usuario,
    conversas,
    colegas: colegasOutros,
    mensagens,
    ativa,
    ativaId,
    eventos,
    itens,
    periodo,
    carregando,
    enviando,
    erro,
    toast,
    setToast,
    abrir,
    enviar,
    editarMensagem,
    removerMensagem,
    novaDireta,
    novoGrupo,
    mudarMes,
    criarEvento,
    atualizarEvento,
    toggleEvento,
    removerEvento,
    adicionarItem,
    toggleItem,
    editarItem,
    removerItem,
  }
}
