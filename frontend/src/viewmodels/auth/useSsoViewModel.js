import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoUsuarioFromEmail } from '@/models/session'
import { useAppViewModel } from '@/viewmodels/AppViewModel'

export function useSsoViewModel() {
  const { login } = useAppViewModel()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')

  function continueDemo() {
    setStatus('ok')
    login(demoUsuarioFromEmail('ana.souza@paris6.com.br'))
    setTimeout(() => navigate('/verificacao'), 500)
  }

  return {
    status,
    continueDemo,
    failProvider: () => setStatus('fail'),
  }
}
