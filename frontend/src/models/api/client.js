import axios from 'axios'
import { clearSession, loadToken } from '@/models/session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

function isLoginRequest(config) {
  const url = String(config?.url ?? '')
  const method = String(config?.method ?? 'get').toLowerCase()
  return method === 'post' && url.includes('/usuarios/login')
}

api.interceptors.request.use((config) => {
  if (isLoginRequest(config)) {
    return config
  }
  const token = loadToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && !isLoginRequest(error.config)) {
      clearSession()
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        const paginaPublica =
          path === '/login' ||
          path === '/recuperar-senha' ||
          path === '/sso' ||
          path === '/verificacao' ||
          path === '/authenticator' ||
          path === '/senha-alterada' ||
          path === '/sessao-expirada' ||
          path === '/'
        if (!paginaPublica) {
          window.location.assign('/login?motivo=expirada')
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
