import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthCopy } from '@/views/layouts/AuthLayout'
import api from '@/models/api/client'

export function useRecoverViewModel() {
  const { t } = useAuthCopy()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const update = params.get('acao') === 'atualizar'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  function onEmailChange(value) {
    setEmail(value)
    setError('')
  }

  function submit(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError(t.recoverError)
      return
    }
    setLoading(true)
    setError('')
    setOk('')
    api
      .post('/usuarios/recuperar-senha', { email: email.trim() })
      .then(() => {
        setOk(t.recoverOk)
        setTimeout(() => navigate('/verificacao?origem=senha'), 700)
      })
      .catch(() => setError(t.recoverError))
      .finally(() => setLoading(false))
  }

  return { t, update, email, error, ok, loading, onEmailChange, submit }
}
