import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listarContasBancarias } from '@/models/api/contaBancariaService'
import {
  atualizarOperacao,
  buscarOperacaoPorId,
  cadastrarOperacao,
  excluirOperacao,
} from '@/models/api/operacaoService'
import { mapConta, mapOperacao, scopedAccounts } from '@/models/domain/dashboardBanking'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import {
  EMPTY_OPERACAO_FORM,
  formFromOperacao,
  operacaoPayload,
  toInputDateTime,
  validateOperacaoForm,
} from './operacaoForm'

export function useOperacaoFormViewModel(mode, { onSaved } = {}) {
  const { scope } = useAppViewModel()
  const { id } = useParams()
  const navigate = useNavigate()
  const [contas, setContas] = useState([])
  const [form, setForm] = useState(EMPTY_OPERACAO_FORM)
  const [operacao, setOperacao] = useState(null)
  const [carregando, setCarregando] = useState(mode !== 'criar')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const contasRecorte = scopedAccounts(contas, scope)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')
        const contasDto = await listarContasBancarias()
        if (!ativo) return
        const mapped = (contasDto || []).map(mapConta).filter((a) => a.id)
        setContas(mapped)
        const byId = Object.fromEntries(mapped.map((a) => [a.id, a]))
        if (mode === 'criar') {
          const scoped = scopedAccounts(mapped, scope)
          setForm({
            ...EMPTY_OPERACAO_FORM,
            idContaBancaria: scoped[0]?.id ?? '',
            dtHora: toInputDateTime(''),
          })
          return
        }
        const dto = await buscarOperacaoPorId(id)
        if (!ativo) return
        const mappedOp = mapOperacao(dto, byId)
        setOperacao(mappedOp)
        setForm(formFromOperacao(mappedOp))
      } catch {
        if (ativo) {
          setErro('Não foi possível consultar a API')
          setOperacao(null)
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [id, mode, scope])

  function patch(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErro('')
  }

  async function submit(e) {
    e?.preventDefault()
    const message = validateOperacaoForm(form)
    if (message) {
      setErro(message)
      return
    }
    setSaving(true)
    setErro('')
    try {
      const dto = mode === 'criar' ? await cadastrarOperacao(operacaoPayload(form)) : await atualizarOperacao(id, operacaoPayload(form))
      const byId = Object.fromEntries(contas.map((a) => [a.id, a]))
      const mapped = mapOperacao(dto, byId)
      setOperacao(mapped)
      setForm(formFromOperacao(mapped))
      setToast('Operação salva.')
      if (onSaved) onSaved(mapped)
      else setTimeout(() => navigate('/operacoes'), 400)
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar a operação.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setSaving(true)
    setErro('')
    try {
      await excluirOperacao(id)
      setToast('Operação excluída.')
      setConfirmDelete(false)
      setTimeout(() => navigate('/operacoes'), 400)
    } catch (err) {
      setErro(err.message || 'Não foi possível excluir a operação.')
      setConfirmDelete(false)
    } finally {
      setSaving(false)
    }
  }

  return {
    id,
    form,
    patch,
    contasRecorte,
    operacao,
    carregando,
    saving,
    erro,
    toast,
    confirmDelete,
    setConfirmDelete,
    submit,
    remove,
    missing: mode !== 'criar' && !carregando && !operacao,
  }
}
