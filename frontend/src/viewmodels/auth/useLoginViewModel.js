import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuthCopy } from '@/views/layouts/AuthLayout'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import api from '@/models/api/client'

export function useLoginViewModel() {
  const { login } = useAppViewModel()
  const { t } = useAuthCopy()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stay, setStay] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const info =
    params.get('motivo') === 'logout'
      ? t.logoutInfo
      : params.get('motivo') === 'expirada'
        ? t.expiredInfo
        : ''

  function onEmailChange(value) {
    setEmail(value)
    setError('')
  }

  function onPasswordChange(value) {
    setPassword(value)
    setError('')
  }

  function submit(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError(t.credError)
      return
    }
    setLoading(true)
    setError('')
    api
      .post('/usuarios/login', { email: email.trim(), senha: password })
      .then((resposta) => {
        const token = resposta.data?.token
        const usuario = resposta.data?.usuario
        if (!token || !usuario?.id || !usuario.email) {
          setError(t.loginUnavailable)
          return
        }
        login({ usuario, token }, stay)
        navigate('/dashboard')
      })
      .catch((erro) => {
        if (axios.isAxiosError(erro) && erro.response?.status === 401) {
          setError(t.credError)
          return
        }
        setError(t.loginUnavailable)
      })
      .finally(() => setLoading(false))
  }

  return {
    t,
    email,
    password,
    stay,
    error,
    loading,
    info,
    onEmailChange,
    onPasswordChange,
    setStay,
    submit,
    goSso: () => navigate('/sso'),
  }
}
