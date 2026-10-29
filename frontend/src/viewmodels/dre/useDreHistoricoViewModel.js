import { useEffect, useMemo, useState } from 'react'
import { buscarDreHistorico } from '@/models/api/dreService'
import { mapDreHistoricoItem } from '@/models/domain/dre'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

function idFilialOf(scope) {
  if (scope === 'grupo') return undefined
  const id = Number(scope)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function useDreHistoricoViewModel() {
  const { scope } = useAppViewModel()
  const idFilial = idFilialOf(scope)
  const [itens, setItens] = useState([])
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      setErro('')
      try {
        const lista = await buscarDreHistorico({ idFilial })
        if (!ativo) return
        setItens(lista.map(mapDreHistoricoItem).filter((item) => item.dataReferencia))
      } catch (err) {
        if (ativo) {
          setErro(err.message || 'Não foi possível consultar o histórico da DRE.')
          setItens([])
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [idFilial])

  const rows = useMemo(() => {
    return itens.filter((item) => {
      if (de && item.dataReferencia < de) return false
      if (ate && item.dataReferencia > ate) return false
      return true
    })
  }, [itens, de, ate])

  return {
    rows,
    de,
    ate,
    setDe,
    setAte,
    carregando,
    erro,
  }
}
