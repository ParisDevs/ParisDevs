import { useEffect, useMemo, useState } from 'react'
import { listarContasBancarias } from '@/models/api/contaBancariaService'
import { atualizarOperacao, cadastrarOperacao, excluirOperacao, listarOperacoes } from '@/models/api/operacaoService'
import { mapConta, mapOperacao, scopedAccounts } from '@/models/domain/dashboardBanking'
import { periodRange } from '@/lib/period'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { EMPTY_OPERACAO_FORM, formFromOperacao, operacaoPayload, toInputDateTime, validateOperacaoForm } from './operacaoForm'

export function useOperacoesViewModel() {
  const { scope, period } = useAppViewModel()
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [bank, setBank] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categoria, setCategoria] = useState('')
  const [contas, setContas] = useState([])
  const [operacoes, setOperacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingEdit, setPendingEdit] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_OPERACAO_FORM)
  const [editErro, setEditErro] = useState('')
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
        const mappedContas = (contasDto || []).map(mapConta).filter((a) => a.id)
        const byId = Object.fromEntries(mappedContas.map((a) => [a.id, a]))
        setContas(mappedContas)
        setOperacoes((opsDto || []).map((dto) => mapOperacao(dto, byId)).filter((t) => t.id))
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
  }, [])

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

  const categorias = [...new Set(operacoes.map((t) => t.category).filter(Boolean))].sort()
  const search = q.trim().toLowerCase()

  const rows = useMemo(() => {
    return operacoes
      .filter((t) => scopedIds.has(t.accountId))
      .filter((t) => t.date >= inicio && t.date < fim)
      .filter((t) => !tipo || t.tipo === tipo)
      .filter((t) => !bank || t.instituicao === bank)
      .filter((t) => !accountId || t.accountId === accountId)
      .filter((t) => !categoria || t.category === categoria)
      .filter((t) => {
        if (!search) return true
        const hay = `${t.razaoSocial} ${t.category}`.toLowerCase()
        return hay.includes(search)
      })
      .sort((a, b) => String(b.dtHora || b.date).localeCompare(String(a.dtHora || a.date)))
  }, [operacoes, scopedIds, inicio, fim, tipo, bank, accountId, categoria, search])

  const contasFiltro = allScoped.filter((a) => !bank || a.bank === bank)
  const empty = !carregando && !erro && !rows.length
  const emptyRecorte = !carregando && !erro && !operacoes.some((t) => scopedIds.has(t.accountId) && t.date >= inicio && t.date < fim)

  function openCreate() {
    setFormMode('criar')
    setPendingEdit(null)
    setEditForm({
      ...EMPTY_OPERACAO_FORM,
      idContaBancaria: allScoped[0]?.id ?? '',
      dtHora: toInputDateTime(''),
    })
    setEditErro('')
  }

  function openEdit(row) {
    setFormMode('editar')
    setPendingEdit(row)
    setEditForm(formFromOperacao(row))
    setEditErro('')
  }

  function closeForm() {
    setFormMode(null)
    setPendingEdit(null)
    setEditErro('')
  }

  function patchEdit(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
    setEditErro('')
  }

  async function saveForm(e) {
    e?.preventDefault()
    const message = validateOperacaoForm(editForm)
    if (message) {
      setEditErro(message)
      return
    }
    if (formMode === 'editar' && !pendingEdit?.id) return
    setSaving(true)
    setEditErro('')
    try {
      const dto = formMode === 'criar'
        ? await cadastrarOperacao(operacaoPayload(editForm))
        : await atualizarOperacao(pendingEdit.id, operacaoPayload(editForm))
      const byId = Object.fromEntries(contas.map((a) => [a.id, a]))
      const mapped = mapOperacao(dto, byId)
      setOperacoes((prev) => {
        if (formMode === 'criar') return [mapped, ...prev]
        return prev.map((t) => (t.id === mapped.id ? mapped : t))
      })
      setToast('Operação salva.')
      closeForm()
    } catch (err) {
      setEditErro(err.message || 'Não foi possível salvar a operação.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!pendingDelete?.id) return
    setSaving(true)
    setErro('')
    try {
      await excluirOperacao(pendingDelete.id)
      setOperacoes((prev) => prev.filter((t) => t.id !== String(pendingDelete.id)))
      setToast('Operação excluída.')
      setPendingDelete(null)
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir a operação.')
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
    categoria,
    setCategoria,
    banks,
    contasFiltro,
    categorias,
    rows,
    carregando,
    erro,
    empty,
    emptyRecorte,
    toast,
    pendingDelete,
    setPendingDelete,
    formMode,
    openCreate,
    openEdit,
    closeForm,
    editForm,
    patchEdit,
    editErro,
    contasEdicao: (() => {
      const currentId = editForm.idContaBancaria
      if (currentId && !allScoped.some((a) => a.id === currentId)) {
        const extra = contas.find((a) => a.id === currentId)
        if (extra) return [extra, ...allScoped]
      }
      return allScoped
    })(),
    saving,
    saveForm,
    remove,
  }
}
