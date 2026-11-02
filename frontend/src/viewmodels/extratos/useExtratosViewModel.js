import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listarContasBancarias } from '@/models/api/contaBancariaService'
import { buscarOperacaoPorId, excluirOperacao, listarOperacoes } from '@/models/api/operacaoService'
import { mapConta, mapOperacao, scopedAccounts } from '@/models/domain/dashboardBanking'
import { periodRange } from '@/lib/period'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

function mapear(contasDto, opsDto) {
  const contas = (contasDto || []).map(mapConta).filter((a) => a.id)
  const byId = Object.fromEntries(contas.map((a) => [a.id, a]))
  const operacoes = (opsDto || []).map((dto) => mapOperacao(dto, byId)).filter((t) => t.id)
  return { contas, operacoes }
}

export function useExtratosViewModel() {
  const { scope, period } = useAppViewModel()
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [bank, setBank] = useState('')
  const [accountId, setAccountId] = useState('')
  const [contas, setContas] = useState([])
  const [operacoes, setOperacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBank('')
    setAccountId('')
  }, [scope, period])

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')
        const [contasDto, opsDto] = await Promise.all([listarContasBancarias(), listarOperacoes()])
        if (!ativo) return
        const mapped = mapear(contasDto, opsDto)
        setContas(mapped.contas)
        setOperacoes(mapped.operacoes)
      } catch {
        if (ativo) {
          setErro('Não foi possível consultar a API')
          setContas([])
          setOperacoes([])
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [period, scope])

  const allScoped = scopedAccounts(contas, scope)
  const banks = [...new Set(allScoped.map((a) => a.bank).filter(Boolean))]
  const scopedIds = new Set(allScoped.map((a) => a.id))
  let inicio = ''
  let fim = ''
  try {
    const range = periodRange(period)
    inicio = range.inicio
    fim = range.fim
  } catch {
    inicio = `${period}-01`
    fim = `${period}-28`
  }

  const search = q.trim().toLowerCase()
  const rows = useMemo(() => {
    return operacoes
      .filter((t) => scopedIds.has(t.accountId))
      .filter((t) => t.date >= inicio && t.date < fim)
      .filter((t) => !tipo || t.tipo === tipo)
      .filter((t) => !bank || t.instituicao === bank)
      .filter((t) => !accountId || t.accountId === accountId)
      .filter((t) => {
        if (!search) return true
        const hay = `${t.razaoSocial} ${t.category} ${t.instituicao} ${t.numeroConta}`.toLowerCase()
        return hay.includes(search)
      })
      .sort((a, b) => String(b.dtHora || b.date).localeCompare(String(a.dtHora || a.date)))
  }, [operacoes, scopedIds, inicio, fim, tipo, bank, accountId, search])

  const contasFiltro = allScoped.filter((a) => !bank || a.bank === bank)
  const noPeriodo = operacoes.some((t) => scopedIds.has(t.accountId) && t.date >= inicio && t.date < fim)

  async function remove() {
    if (!pendingDelete?.id) return
    setSaving(true)
    setErro('')
    try {
      await excluirOperacao(pendingDelete.id)
      setOperacoes((prev) => prev.filter((t) => t.id !== String(pendingDelete.id)))
      setToast('Lançamento excluído. O saldo e o dashboard deixam de incluir este valor.')
      setPendingDelete(null)
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir o lançamento.')
      setPendingDelete(null)
    } finally {
      setSaving(false)
    }
  }

  return {
    q,
    setQ,
    tipo,
    setTipo,
    bank,
    setBank,
    accountId,
    setAccountId,
    banks,
    contasFiltro,
    rows,
    carregando,
    erro,
    toast,
    pendingDelete,
    setPendingDelete,
    saving,
    remove,
    empty: !carregando && !erro && !rows.length,
    emptyRecorte: !carregando && !erro && !noPeriodo,
  }
}

export function useExtratoDetalheViewModel() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { scope } = useAppViewModel()
  const [operacao, setOperacao] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')
        const [dto, contasDto] = await Promise.all([buscarOperacaoPorId(id), listarContasBancarias()])
        if (!ativo) return
        const contas = (contasDto || []).map(mapConta).filter((a) => a.id)
        const byId = Object.fromEntries(contas.map((a) => [a.id, a]))
        const mapped = mapOperacao(dto, byId)
        if (scope !== 'grupo' && Number(byId[mapped.accountId]?.companyId) !== Number(scope)) {
          setOperacao(null)
          return
        }
        setOperacao(mapped.id ? mapped : null)
      } catch (err) {
        if (ativo) {
          setOperacao(null)
          setErro(err.message || 'Não foi possível consultar o lançamento.')
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [id, scope])

  async function remove() {
    setSaving(true)
    setErro('')
    try {
      await excluirOperacao(id)
      setToast('Lançamento excluído.')
      setConfirmDelete(false)
      setTimeout(() => navigate('/extratos'), 400)
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir o lançamento.')
      setConfirmDelete(false)
    } finally {
      setSaving(false)
    }
  }

  return {
    operacao,
    carregando,
    erro,
    toast,
    confirmDelete,
    setConfirmDelete,
    saving,
    remove,
    missing: !carregando && !operacao,
  }
}
