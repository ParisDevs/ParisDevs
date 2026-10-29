import { useEffect, useState } from 'react'
import { atualizarUsuario, buscarUsuarioPorId } from '@/models/api/usuarioService'
import { cargoLabel, lerFotoArquivo } from '@/models/domain/usuario'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

function filialIdOf(usuario) {
  const id = usuario?.filial?.idFilial
  return id != null && id !== '' ? Number(id) : null
}

function validatePerfil(form) {
  if (!String(form.nome ?? '').trim()) return 'Informe o nome.'
  const email = String(form.email ?? '').trim()
  if (!email) return 'Informe o e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Insira um e-mail válido.'
  return ''
}

export function usePerfilViewModel() {
  const { usuario, session, atualizarSessaoUsuario } = useAppViewModel()
  const admin = session?.role === 'administrador'
  const [form, setForm] = useState({
    nome: usuario?.nome ?? '',
    email: usuario?.email ?? '',
    foto: usuario?.foto ?? '',
  })
  const [cargo, setCargo] = useState(usuario?.cargo ?? '')
  const [filialNome, setFilialNome] = useState(usuario?.filial?.razaoSocial ?? '')
  const [idFilial, setIdFilial] = useState(filialIdOf(usuario))
  const [erro, setErro] = useState('')
  const [formErro, setFormErro] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!usuario?.id) {
      setErro('Não foi possível identificar o usuário da sessão.')
      return
    }
    let ativo = true
    async function carregar() {
      try {
        const dto = await buscarUsuarioPorId(usuario.id)
        if (!ativo || !dto?.id) return
        setForm({ nome: dto.nome ?? '', email: dto.email ?? '', foto: dto.foto ?? '' })
        setCargo(dto.cargo ?? '')
        setFilialNome(dto.filial?.razaoSocial ?? '')
        setIdFilial(filialIdOf(dto))
        setErro('')
      } catch {
        if (ativo) setErro('Não foi possível consultar o perfil na API.')
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [usuario?.id])

  function patchForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormErro('')
  }

  async function saveForm(e) {
    e?.preventDefault()
    if (!usuario?.id) {
      setFormErro('Não foi possível identificar o usuário da sessão.')
      return
    }
    const message = validatePerfil(form)
    if (message) {
      setFormErro(message)
      return
    }
    if (!cargo || idFilial == null || !Number.isInteger(idFilial) || idFilial <= 0) {
      setFormErro('Cargo e filial da sessão estão incompletos. Não é possível salvar.')
      return
    }
    setSaving(true)
    setFormErro('')
    try {
      const dto = await atualizarUsuario(usuario.id, {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cargo,
        idFilial,
        foto: form.foto || null,
      })
      atualizarSessaoUsuario(dto)
      setForm({
        nome: dto.nome ?? form.nome,
        email: dto.email ?? form.email,
        foto: dto.foto ?? form.foto,
      })
      setCargo(dto.cargo ?? cargo)
      setFilialNome(dto.filial?.razaoSocial ?? filialNome)
      setIdFilial(filialIdOf(dto) ?? idFilial)
      setToast('Perfil salvo.')
    } catch (err) {
      setFormErro(err.message || 'Não foi possível salvar o perfil.')
    } finally {
      setSaving(false)
    }
  }

  async function escolherFoto(file) {
    if (!file) return
    setFormErro('')
    try {
      const foto = await lerFotoArquivo(file)
      patchForm('foto', foto)
    } catch (err) {
      setFormErro(err.message || 'Não foi possível ler a foto.')
    }
  }

  const nomeExibido = form.nome.trim() || usuario?.nome || ''
  const emailExibido = form.email.trim() || usuario?.email || ''

  return {
    admin,
    form,
    cargoNome: cargoLabel(cargo),
    filialNome: filialNome || '—',
    nomeExibido,
    emailExibido,
    erro,
    formErro,
    toast,
    saving,
    patchForm,
    escolherFoto,
    saveForm,
  }
}
