import { useEffect, useMemo, useState } from 'react'
import { GROUP_NAME } from '@/models/fixtures'
import {
  atualizarFilial,
  cadastrarFilial,
  excluirFilial,
  listarFiliais,
} from '@/models/api/filialService'
import {
  EMPTY_FILIAL_FORM,
  filialPayload,
  formFromFilial,
  formatCnpj,
  mapFilial,
  validateFilialForm,
} from '@/models/domain/filial'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

export function useOrganizacaoViewModel() {
  const { session, recarregarFiliais } = useAppViewModel()
  const admin = session?.role === 'administrador'
  const [q, setQ] = useState('')
  const [empresas, setEmpresas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [formMode, setFormMode] = useState(null)
  const [pendingEdit, setPendingEdit] = useState(null)
  const [form, setForm] = useState(EMPTY_FILIAL_FORM)
  const [formErro, setFormErro] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!admin) {
      setCarregando(false)
      setEmpresas([])
      return undefined
    }
    let ativo = true
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')
        const lista = await listarFiliais()
        if (!ativo) return
        setEmpresas((lista || []).map(mapFilial).filter((f) => f.id))
      } catch {
        if (ativo) {
          setErro('Não foi possível consultar a API')
          setEmpresas([])
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [admin])

  const search = q.trim().toLowerCase()
  const rows = useMemo(() => {
    return empresas
      .filter((f) => {
        if (!search) return true
        const hay = `${f.razaoSocial} ${f.cnpj} ${f.endereco}`.toLowerCase()
        return hay.includes(search)
      })
      .sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR'))
  }, [empresas, search])

  function openCreate() {
    setFormMode('criar')
    setPendingEdit(null)
    setForm(EMPTY_FILIAL_FORM)
    setFormErro('')
  }

  function openEdit(row) {
    setFormMode('editar')
    setPendingEdit(row)
    setForm(formFromFilial(row))
    setFormErro('')
  }

  function closeForm() {
    setFormMode(null)
    setPendingEdit(null)
    setFormErro('')
  }

  function patchForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: field === 'cnpj' ? formatCnpj(value) : value }))
    setFormErro('')
  }

  async function saveForm(e) {
    e?.preventDefault()
    const message = validateFilialForm(form)
    if (message) {
      setFormErro(message)
      return
    }
    if (formMode === 'editar' && !pendingEdit?.id) return
    setSaving(true)
    setFormErro('')
    try {
      const payload = filialPayload(form)
      const dto = formMode === 'criar'
        ? await cadastrarFilial(payload)
        : await atualizarFilial(pendingEdit.id, payload)
      const mapped = mapFilial(dto)
      setEmpresas((prev) => {
        if (formMode === 'criar') return [mapped, ...prev]
        return prev.map((f) => (f.id === mapped.id ? mapped : f))
      })
      if (typeof recarregarFiliais === 'function') await recarregarFiliais()
      setToast('Empresa salva.')
      closeForm()
    } catch (err) {
      setFormErro(err.message || 'Não foi possível salvar a empresa.')
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(row) {
    setPendingDelete(row)
  }

  async function remove() {
    if (!pendingDelete?.id) return
    setSaving(true)
    setErro('')
    try {
      await excluirFilial(pendingDelete.id)
      setEmpresas((prev) => prev.filter((f) => f.id !== String(pendingDelete.id)))
      if (typeof recarregarFiliais === 'function') await recarregarFiliais()
      setToast('Empresa excluída.')
      setPendingDelete(null)
    } catch (err) {
      setErro(err.message || 'Não é possível excluir: há cadastros vinculados.')
      setPendingDelete(null)
    } finally {
      setSaving(false)
    }
  }

  return {
    admin,
    groupName: GROUP_NAME,
    q,
    setQ,
    rows,
    total: empresas.length,
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
    requestDelete,
    saving,
    remove,
    empty: !carregando && !erro && !empresas.length,
    emptyFiltro: !carregando && !erro && Boolean(empresas.length) && !rows.length,
  }
}
