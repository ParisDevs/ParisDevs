import { useEffect, useMemo, useState } from 'react'
import { listarFiliais } from '@/models/api/filialService'
import {
  atualizarUsuario,
  cadastrarUsuario,
  excluirUsuario,
  listarUsuarios,
} from '@/models/api/usuarioService'
import {
  EMPTY_USUARIO_FORM,
  formFromUsuario,
  mapFilialOption,
  mapUsuario,
  usuarioPayload,
  validateUsuarioForm,
} from '@/models/domain/usuario'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

export function useUsuariosViewModel() {
  const { usuario: sessaoUsuario } = useAppViewModel()
  const sessionId = sessaoUsuario?.id != null ? String(sessaoUsuario.id) : ''
  const [q, setQ] = useState('')
  const [cargo, setCargo] = useState('')
  const [filialId, setFilialId] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [filiais, setFiliais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [formMode, setFormMode] = useState(null)
  const [pendingEdit, setPendingEdit] = useState(null)
  const [form, setForm] = useState(EMPTY_USUARIO_FORM)
  const [formErro, setFormErro] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')
        const [usuariosDto, filiaisDto] = await Promise.all([listarUsuarios(), listarFiliais()])
        if (!ativo) return
        setUsuarios((usuariosDto || []).map(mapUsuario).filter((u) => u.id))
        setFiliais((filiaisDto || []).map(mapFilialOption).filter((f) => f.id))
      } catch {
        if (ativo) {
          setErro('Não foi possível consultar a API')
          setUsuarios([])
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
  const rows = useMemo(() => {
    return usuarios
      .filter((u) => !cargo || u.cargo === cargo)
      .filter((u) => !filialId || u.filialId === filialId)
      .filter((u) => {
        if (!search) return true
        const hay = `${u.nome} ${u.email} ${u.cargo} ${u.filialNome}`.toLowerCase()
        return hay.includes(search)
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [usuarios, cargo, filialId, search])

  const kpis = {
    total: usuarios.length,
    administrador: usuarios.filter((u) => u.cargo === 'ADMINISTRADOR').length,
    financeiro: usuarios.filter((u) => u.cargo === 'FINANCEIRO').length,
    gerente: usuarios.filter((u) => u.cargo === 'GERENTE').length,
    contador: usuarios.filter((u) => u.cargo === 'CONTADOR').length,
  }

  function openCreate() {
    setFormMode('criar')
    setPendingEdit(null)
    setForm({
      ...EMPTY_USUARIO_FORM,
      idFilial: filiais[0]?.id ?? '',
    })
    setFormErro('')
  }

  function openEdit(row) {
    setFormMode('editar')
    setPendingEdit(row)
    setForm(formFromUsuario(row))
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
    const requireSenha = formMode === 'criar'
    const message = validateUsuarioForm(form, { requireSenha })
    if (message) {
      setFormErro(message)
      return
    }
    if (formMode === 'editar' && !pendingEdit?.id) return
    setSaving(true)
    setFormErro('')
    try {
      const senha = form.senha.trim()
      const payload = usuarioPayload(form, { includeSenha: requireSenha || Boolean(senha) })
      const dto = requireSenha
        ? await cadastrarUsuario(payload)
        : await atualizarUsuario(pendingEdit.id, payload)
      const mapped = mapUsuario(dto)
      setUsuarios((prev) => {
        if (requireSenha) return [...prev, mapped]
        return prev.map((u) => (u.id === mapped.id ? mapped : u))
      })
      setToast('Usuário salvo.')
      closeForm()
    } catch (err) {
      setFormErro(err.message || 'Não foi possível salvar o usuário.')
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(row) {
    if (row.id === sessionId) {
      setErro('Não é possível excluir o usuário da sessão atual.')
      return
    }
    setPendingDelete(row)
  }

  async function remove() {
    if (!pendingDelete?.id) return
    if (pendingDelete.id === sessionId) {
      setErro('Não é possível excluir o usuário da sessão atual.')
      setPendingDelete(null)
      return
    }
    setSaving(true)
    setErro('')
    try {
      await excluirUsuario(pendingDelete.id)
      setUsuarios((prev) => prev.filter((u) => u.id !== String(pendingDelete.id)))
      setToast('Usuário excluído.')
      setPendingDelete(null)
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir o usuário.')
      setPendingDelete(null)
    } finally {
      setSaving(false)
    }
  }

  return {
    q,
    setQ,
    cargo,
    setCargo,
    filialId,
    setFilialId,
    filiais,
    rows,
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
    requestDelete,
    sessionId,
    saving,
    remove,
    empty: !carregando && !erro && !usuarios.length,
    emptyFiltro: !carregando && !erro && Boolean(usuarios.length) && !rows.length,
  }
}
