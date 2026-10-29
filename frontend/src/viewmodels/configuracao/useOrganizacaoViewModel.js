import { useEffect, useMemo, useState } from 'react'
import { GROUP_NAME } from '@/models/fixtures'
import {
  atualizarFilial,
  cadastrarFilial,
  excluirFilial,
  listarFiliais,
} from '@/models/api/filialService'
import { lookupCep, lookupCnpj } from '@/models/domain/cnpjLookup'
import {
  EMPTY_FILIAL_FORM,
  filialPayload,
  formFromFilial,
  formatCep,
  formatCnpj,
  formatCpf,
  formatTelefone,
  mapFilial,
  soDigitos,
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
  const [formInfo, setFormInfo] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [buscandoCnpj, setBuscandoCnpj] = useState(false)

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
        const hay = `${f.razaoSocial} ${f.nomeFantasia} ${f.cnpj} ${f.endereco} ${f.cidade}`.toLowerCase()
        return hay.includes(search)
      })
      .sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial, 'pt-BR'))
  }, [empresas, search])

  function openCreate() {
    setFormMode('criar')
    setPendingEdit(null)
    setForm({ ...EMPTY_FILIAL_FORM, empresasVinculadas: GROUP_NAME })
    setFormErro('')
    setFormInfo('')
  }

  function openEdit(row) {
    setFormMode('editar')
    setPendingEdit(row)
    setForm(formFromFilial(row))
    setFormErro('')
    setFormInfo('')
  }

  function closeForm() {
    setFormMode(null)
    setPendingEdit(null)
    setFormErro('')
    setFormInfo('')
  }

  function patchForm(field, value) {
    let next = value
    if (field === 'cnpj') next = formatCnpj(value)
    if (field === 'cep') next = formatCep(value)
    if (field === 'responsavelCpf') next = formatCpf(value)
    if (field === 'responsavelTelefone') next = formatTelefone(value)
    setForm((prev) => ({ ...prev, [field]: next }))
    setFormErro('')
    if (field === 'cep' && soDigitos(next).length === 8) {
      consultarCep(next)
    }
    if (field === 'cnpj' && soDigitos(next).length === 14) {
      consultarCnpj(next)
    }
  }

  async function consultarCep(cep = form.cep) {
    setBuscandoCep(true)
    setFormInfo('')
    const resultado = await lookupCep(cep)
    setBuscandoCep(false)
    if (resultado.error) {
      setFormInfo(resultado.error)
      return
    }
    setForm((prev) => ({
      ...prev,
      cep: formatCep(resultado.cep),
      logradouro: resultado.logradouro || prev.logradouro,
      complemento: resultado.complemento || prev.complemento,
      bairro: resultado.bairro || prev.bairro,
      cidade: resultado.cidade || prev.cidade,
      uf: resultado.uf || prev.uf,
      pais: resultado.pais || prev.pais || 'Brasil',
    }))
    setFormInfo('Endereço preenchido pelo CEP.')
  }

  async function consultarCnpj(cnpj = form.cnpj) {
    setBuscandoCnpj(true)
    setFormInfo('')
    const resultado = await lookupCnpj(cnpj)
    setBuscandoCnpj(false)
    if (resultado.error) {
      setForm((prev) => ({ ...prev, situacaoCadastral: 'Não consultada' }))
      setFormInfo(resultado.error)
      return
    }
    setForm((prev) => ({
      ...prev,
      razaoSocial: resultado.razaoSocial || prev.razaoSocial,
      nomeFantasia: resultado.nomeFantasia || prev.nomeFantasia,
      cnaePrincipal: resultado.cnae || prev.cnaePrincipal,
      situacaoCadastral: resultado.situacao || 'Não consultada',
      dataAbertura: resultado.dataAbertura || prev.dataAbertura,
      cep: resultado.cep ? formatCep(resultado.cep) : prev.cep,
      logradouro: resultado.logradouro || prev.logradouro,
      numero: resultado.numero || prev.numero,
      complemento: resultado.complemento || prev.complemento,
      bairro: resultado.bairro || prev.bairro,
      cidade: resultado.cidade || prev.cidade,
      uf: resultado.uf || prev.uf,
      pais: resultado.pais || prev.pais,
    }))
    setFormInfo('Dados cadastrais preenchidos pela consulta pública.')
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
    formInfo,
    patchForm,
    consultarCep,
    consultarCnpj,
    buscandoCep,
    buscandoCnpj,
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
