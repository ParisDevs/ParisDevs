import { useCallback, useEffect, useMemo, useState } from 'react'
import { listarContasBancarias } from '@/models/api/contaBancariaService'
import { atualizarOperacao, listarOperacoes } from '@/models/api/operacaoService'
import {
  inScope,
  mapConciliacao,
  mapConta,
  payloadClassificacao,
} from '@/models/domain/dashboardBanking'
import { categoriaCatalogo } from '@/models/domain/finance'
import { filterSaidas } from '@/models/domain/reconCategories'
import { periodRange } from '@/lib/period'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

function contasById(contas) {
  return Object.fromEntries(contas.map((a) => [a.id, a]))
}

function mapear(contasDto, opsDto) {
  const contas = (contasDto || []).map(mapConta).filter((a) => a.id)
  const byId = contasById(contas)
  const lancamentos = (opsDto || [])
    .map((dto) => mapConciliacao(dto, byId))
    .filter((t) => t.id)
    .map((t) => {
      if (t.companyId != null) return t
      const conta = byId[t.accountId]
      return { ...t, companyId: conta?.companyId ?? null }
    })
  return { contas, lancamentos }
}

function recortePeriodo(period) {
  try {
    return periodRange(period)
  } catch {
    const inicio = `${period}-01`
    return { inicio, fim: `${period}-28` }
  }
}

export function useConciliacaoViewModel() {
  const { scope, period, usuario } = useAppViewModel()
  const [lancamentos, setLancamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [salvandoId, setSalvandoId] = useState(null)

  const recarregar = useCallback(async () => {
    if (!usuario) {
      setLancamentos([])
      setCarregando(false)
      return
    }
    try {
      setCarregando(true)
      setErro('')
      const [contasDto, opsDto] = await Promise.all([listarContasBancarias(), listarOperacoes()])
      const { lancamentos: next } = mapear(contasDto, opsDto)
      setLancamentos(next)
    } catch {
      setErro('Não foi possível carregar a conciliação.')
      setLancamentos([])
    } finally {
      setCarregando(false)
    }
  }, [usuario])

  useEffect(() => {
    recarregar()
  }, [recarregar, scope, period])

  const { inicio, fim } = recortePeriodo(period)

  const saidas = useMemo(() => {
    const noRecorte = lancamentos.filter(
      (t) => inScope(t.companyId, scope) && t.date && t.date >= inicio && t.date < fim,
    )
    return filterSaidas(noRecorte)
  }, [lancamentos, scope, inicio, fim])

  const kpis = useMemo(
    () => ({
      conciliado: saidas.filter((t) => t.recon === 'conciliado').length,
      pendente: saidas.filter((t) => t.recon === 'pendente').length,
      divergencia: 0,
      sugestao: 0,
      duplicidade: 0,
    }),
    [saidas],
  )

  const categorias = useMemo(
    () => categoriaCatalogo(saidas.map((t) => t.category)),
    [saidas],
  )

  const classificar = useCallback(
    async (id, categoria) => {
      const op = lancamentos.find((t) => String(t.id) === String(id))
      if (!op) {
        setToast('')
        setErro('Não foi possível atualizar a categoria.')
        return false
      }
      const cat = String(categoria ?? '').trim()
      if (!cat) {
        setToast('Informe a categoria.')
        return false
      }
      try {
        setSalvandoId(String(id))
        setErro('')
        await atualizarOperacao(id, payloadClassificacao(op, cat))
        await recarregar()
        setToast('Categoria atualizada.')
        return true
      } catch (e) {
        setErro(e?.message || 'Não foi possível atualizar a categoria.')
        return false
      } finally {
        setSalvandoId(null)
      }
    },
    [lancamentos, recarregar],
  )

  return {
    saidas,
    lancamentos,
    kpis,
    categorias,
    carregando,
    erro,
    toast,
    setToast,
    salvandoId,
    classificar,
    recarregar,
  }
}

export function useConciliacaoDetalheViewModel(id) {
  const base = useConciliacaoViewModel()
  const item = useMemo(
    () => base.lancamentos.find((t) => String(t.id) === String(id) && t.saida) ?? null,
    [base.lancamentos, id],
  )
  return { ...base, item }
}
