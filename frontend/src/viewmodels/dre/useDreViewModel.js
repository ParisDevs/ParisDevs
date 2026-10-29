import { useEffect, useState } from 'react'
import { buscarDre, buscarDrePorData, gerarDre } from '@/models/api/dreService'
import { dataD1, mapDreRelatorio } from '@/models/domain/dre'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

function idFilialOf(scope) {
  if (scope === 'grupo') return undefined
  const id = Number(scope)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function useDreViewModel(dataUrl) {
  const { scope } = useAppViewModel()
  const idFilial = idFilialOf(scope)
  const dataAlvo = dataUrl || dataD1()
  const historico = Boolean(dataUrl)
  const [relatorio, setRelatorio] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      setErro('')
      try {
        const dto = historico
          ? await buscarDrePorData(dataAlvo, { idFilial })
          : await buscarDre({ data: dataAlvo, idFilial })
        if (!ativo) return
        let mapped = mapDreRelatorio(dto)
        if (!historico && mapped.origem === 'AO_VIVO') {
          try {
            const gerado = await gerarDre({ data: dataAlvo, idFilial })
            if (!ativo) return
            mapped = mapDreRelatorio(gerado)
          } catch {
            /* mantém o cálculo ao vivo se a gravação falhar */
          }
        }
        setRelatorio(mapped)
      } catch (err) {
        if (ativo) {
          setErro(err.message || 'Não foi possível consultar a DRE.')
          setRelatorio(null)
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [dataAlvo, historico, idFilial])

  async function atualizar() {
    setSaving(true)
    setErro('')
    try {
      const dto = await gerarDre({ data: dataAlvo, idFilial })
      setRelatorio(mapDreRelatorio(dto))
      setToast('DRE do dia gravada no histórico.')
    } catch (err) {
      setErro(err.message || 'Não foi possível gravar a DRE no histórico.')
    } finally {
      setSaving(false)
    }
  }

  return {
    relatorio,
    dataAlvo,
    historico,
    carregando,
    saving,
    erro,
    toast,
    atualizar,
  }
}
