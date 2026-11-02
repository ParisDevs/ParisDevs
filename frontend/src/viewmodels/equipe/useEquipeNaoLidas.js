import { useEffect, useState } from 'react'
import { contarNaoLidasEquipe } from '@/models/api/equipeService'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

export function useEquipeNaoLidas() {
  const { usuario } = useAppViewModel()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!usuario) {
      setN(0)
      return undefined
    }
    let cancel = false

    async function carregar() {
      const total = await contarNaoLidasEquipe()
      if (!cancel) setN(total)
    }

    function onEvento(e) {
      setN(Number(e.detail) || 0)
    }

    carregar()
    const id = setInterval(carregar, 30000)
    window.addEventListener('equipe:nao-lidas', onEvento)
    return () => {
      cancel = true
      clearInterval(id)
      window.removeEventListener('equipe:nao-lidas', onEvento)
    }
  }, [usuario])

  return n
}
