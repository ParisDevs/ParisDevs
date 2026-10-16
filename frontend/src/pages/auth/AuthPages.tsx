import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { Banner, Button, Card, Field, Input } from '@/components/ui'
import { useAuthCopy } from '@/components/layout/AuthLayout'
import { users } from '@/data/fixtures'
import { useApp } from '@/state/AppContext'

export function LoginPage() {
  const { login } = useApp()
  const { t } = useAuthCopy()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stay, setStay] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const info = params.get('motivo') === 'logout' ? t.logoutInfo : params.get('motivo') === 'expirada' ? t.expiredInfo : ''

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError(t.credError)
      return
    }
    const known = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!known) {
      setError(t.credError)
      return
    }
    setLoading(true)
    setTimeout(() => {
      login(email.trim(), stay)
      navigate('/verificacao')
    }, 400)
  }

  return (
    <Card className="p-6 md:p-7">
      {info ? <Banner className="mb-4" tone="info">{info}</Banner> : null}

      <Button type="button" className="w-full" onClick={() => navigate('/sso')}>
        <Building2 size={16} />
        {t.sso}
      </Button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-borda" />
        <span className="t-apoio text-faint">{t.orLocal}</span>
        <span className="h-px flex-1 bg-borda" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label={t.user} error={error && !email ? error : undefined}>
          <Input
            type="text"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>
        <Field label={t.password}>
          <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} autoComplete="current-password" />
        </Field>
        {error ? <p className="t-body text-erro">{error}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="t-body flex items-center gap-2">
            <input type="checkbox" checked={stay} onChange={(e) => setStay(e.target.checked)} />
            {t.stay}
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? t.entering : t.enter}
          </Button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          <Link className="t-label" to="/recuperar-senha">{t.forgot}</Link>
          <Link className="t-label" to="/recuperar-senha?acao=atualizar">{t.update}</Link>
        </div>
      </form>
    </Card>
  )
}

export function RecoverPage() {
  const { t } = useAuthCopy()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const update = params.get('acao') === 'atualizar'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const known = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!known) {
      setError(t.recoverError)
      return
    }
    setLoading(true)
    setTimeout(() => {
      setOk(t.recoverOk)
      setTimeout(() => navigate('/verificacao?origem=senha'), 700)
    }, 400)
  }

  return (
    <Card className="p-6 md:p-7">
      <h1 className="t-h1 mb-4">{update ? t.updateTitle : t.recoverTitle}</h1>
      <p className="t-body mb-6 text-texto-secundario">{t.recoverHint}</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t.user} error={error}>
          <Input type="text" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} autoComplete="username" autoCapitalize="none" spellCheck={false} />
        </Field>
        {ok ? <Banner tone="success">{ok}</Banner> : null}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? t.sending : t.sendCode}</Button>
        <Link className="t-label block" to="/login">{t.backLogin}</Link>
      </form>
    </Card>
  )
}

export function MfaPage() {
  const { session } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [remember, setRemember] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (code.replace(/\D/g, '').length !== 6) {
      setError('Código inválido. Tente novamente.')
      return
    }
    if (params.get('origem') === 'senha') {
      navigate('/senha-alterada')
      return
    }
    navigate(session?.firstAccess ? '/authenticator' : '/contexto')
  }

  return (
    <Card>
      <h1 className="t-h1 mb-4">Verificação em duas etapas</h1>
      <p className="t-body mb-6">Digite o código de 6 dígitos.</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Código" error={error}>
          <Input inputMode="numeric" maxLength={6} value={code} onChange={(e) => { setCode(e.target.value); setError('') }} />
        </Field>
        <label className="t-body flex items-center gap-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Lembrar este dispositivo
        </label>
        {info ? <Banner tone="info">{info}</Banner> : null}
        <Button type="submit" className="w-full">Confirmar</Button>
        <div className="flex justify-between">
          <button type="button" className="t-label" onClick={() => setInfo('Código enviado. Verifique sua caixa de entrada.')}>Reenviar código</button>
          <button type="button" className="t-label" onClick={() => setInfo('Use o aplicativo autenticador ou o código do e-mail.')}>Trocar método</button>
        </div>
      </form>
    </Card>
  )
}

export function AuthenticatorPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  return (
    <Card>
      <h1 className="t-h1 mb-4">Configurar autenticador</h1>
      <p className="t-body mb-4 text-texto-secundario">Escaneie o QR Code no aplicativo autenticador ou informe a chave manual.</p>
      <div className="mb-4 flex h-40 items-center justify-center rounded-[8px] border border-borda bg-destaque t-apoio">
        QR Code de demonstração
      </div>
      <p className="t-apoio mb-4">Chave manual: PARIS6-DEMO-MFA-7K2Q</p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length !== 6) {
            setError('Código inválido. Tente novamente.')
            return
          }
          navigate('/contexto')
        }}
      >
        <Field label="Código" error={error}>
          <Input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
        <Button type="submit" className="w-full">Confirmar dispositivo</Button>
      </form>
    </Card>
  )
}

export function SsoPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'ok' | 'fail'>('idle')

  return (
    <Card>
      <h1 className="t-h1 mb-4">Entrar com SSO</h1>
      <p className="t-body mb-6">Você será redirecionado para o provedor corporativo.</p>
      {status === 'fail' ? <Banner tone="error">Não foi possível autenticar no provedor.</Banner> : null}
      <div className="mt-4 flex flex-col gap-2">
        <Button
          onClick={() => {
            setStatus('ok')
            login('ana.souza@paris6.com.br')
            setTimeout(() => navigate('/verificacao'), 500)
          }}
        >
          Continuar no provedor
        </Button>
        <Button variant="secondary" onClick={() => setStatus('fail')}>Simular falha</Button>
        <Link className="t-label" to="/login">Voltar para login</Link>
      </div>
    </Card>
  )
}

export function PasswordChangedPage() {
  return (
    <Card>
      <h1 className="t-h1 mb-4">Senha alterada</h1>
      <Banner tone="success">Senha alterada. Entre com a nova senha.</Banner>
      <Link to="/login" className="mt-6 block">
        <Button className="w-full">Entrar</Button>
      </Link>
    </Card>
  )
}

export function SessionExpiredPage() {
  return (
    <Card>
      <h1 className="t-h1 mb-4">Sessão expirada</h1>
      <p className="t-body mb-6">Sua sessão expirou. Entre novamente.</p>
      <Link to="/login?motivo=expirada">
        <Button className="w-full">Entrar</Button>
      </Link>
    </Card>
  )
}
