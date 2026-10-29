import { useEffect, useMemo, useState } from 'react'
import { listarFiliais } from '@/models/api/filialService'
import {
  atualizarContaBancaria,
  cadastrarContaBancaria,
  excluirContaBancaria,
  listarContasBancarias,
} from '@/models/api/contaBancariaService'
import {
  EMPTY_CONTA_FORM,
  contaPayload,
  formFromConta,
  validateContaForm,
} from '@/models/domain/contaBancaria'
import { inScope, mapConta } from '@/models/domain/dashboardBanking'
import { mapFilialOption } from '@/models/domain/usuario'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

export function useContasBancariasViewModel() {
  const { scope } = useAppViewModel()
  const [q, setQ] = useState('')
  const [contas, setContas] = useState([])
  const [filiais, setFiliais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [formMode, setFormMode] = useState(null)
  const [pendingEdit, setPendingEdit] = useState(null)
  const [form, setForm] = useState(EMPTY_CONTA_FORM)
  const [formErro, setFormErro] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')
        const [contasDto, filiaisDto] = await Promise.all([listarContasBancarias(), listarFiliais()])
        if (!ativo) return
        setContas((contasDto || []).map(mapConta).filter((a) => a.id))
        setFiliais((filiaisDto || []).map(mapFilialOption).filter((f) => f.id))
      } catch {
        if (ativo) {
          setErro('Não foi possível consultar a API')
          setContas([])
          setFiliais([])
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

  const search = q.trim().toLowerCase()
  const noRecorte = useMemo(
    () => contas.filter((a) => inScope(a.companyId, scope)),
    [contas, scope],
  )

  const rows = useMemo(() => {
    return noRecorte
      .filter((a) => {
        if (!search) return true
        const hay = `${a.bank} ${a.number} ${a.nomeTitular} ${a.filialNome}`.toLowerCase()
        return hay.includes(search)
      })
      .sort((a, b) => `${a.bank} ${a.number}`.localeCompare(`${b.bank} ${b.number}`, 'pt-BR'))
  }, [noRecorte, search])

  const bancos = useMemo(() => {
    const map = new Map()
    for (const a of noRecorte) {
      const nome = a.bank || 'Instituição'
      map.set(nome, (map.get(nome) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([bank, count]) => ({ bank, count }))
      .sort((a, b) => a.bank.localeCompare(b.bank, 'pt-BR'))
  }, [noRecorte])

  const kpis = {
    total: noRecorte.length,
    ativas: noRecorte.filter((a) => a.ativo).length,
    inativas: noRecorte.filter((a) => !a.ativo).length,
  }

  function openCreate() {
    const filialPadrao = scope !== 'grupo' && filiais.some((f) => f.id === String(scope))
      ? String(scope)
      : filiais[0]?.id ?? ''
    setFormMode('criar')
    setPendingEdit(null)
    setForm({ ...EMPTY_CONTA_FORM, fkFilial: filialPadrao })
    setFormErro('')
  }

  function openEdit(row) {
    setFormMode('editar')
    setPendingEdit(row)
    setForm(formFromConta(row))
    setFormErro('')
  }

  function closeForm() {
    setFormMode(null)
    setPendingEdit(null)
    setFormErro('')
  }

  function patchForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormErro('')
  }

  async function saveForm(e) {
    e?.preventDefault()
    const message = validateContaForm(form)
    if (message) {
      setFormErro(message)
      return
    }
    if (formMode === 'editar' && !pendingEdit?.id) return
    setSaving(true)
    setFormErro('')
    try {
      const payload = contaPayload(form)
      const dto = formMode === 'criar'
        ? await cadastrarContaBancaria(payload)
        : await atualizarContaBancaria(pendingEdit.id, payload)
      const mapped = mapConta(dto)
      setContas((prev) => {
        if (formMode === 'criar') return [...prev, mapped]
        return prev.map((a) => (a.id === mapped.id ? mapped : a))
      })
      setToast('Conta bancária salva.')
      closeForm()
    } catch (err) {
      setFormErro(err.message || 'Não foi possível salvar a conta bancária.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!pendingDelete?.id) return
    setSaving(true)
    setErro('')
    try {
      await excluirContaBancaria(pendingDelete.id)
      setContas((prev) => prev.filter((a) => a.id !== String(pendingDelete.id)))
      setToast('Conta bancária excluída.')
      setPendingDelete(null)
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir a conta bancária.')
      setPendingDelete(null)
    } finally {
      setSaving(false)
    }
  }

  return {
    q,
    setQ,
    filiais,
    rows,
    bancos,
    kpis,
    carregando,
    erro,
    toast,
    formMode,
    form,
    formErro,
    patchForm,
    openCreate,
    openEdit,
    closeForm,
    saveForm,
    pendingDelete,
    setPendingDelete,
    saving,
    remove,
    empty: !carregando && !erro && !noRecorte.length,
    emptyFiltro: !carregando && !erro && Boolean(noRecorte.length) && !rows.length,
  }
}
