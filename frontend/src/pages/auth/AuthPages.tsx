
import { type ReactNode, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { Banner, Button, Card, Field, Input } from '@/components/ui'
import { useAuthCopy } from '@/components/layout/AuthLayout'
import { useApp, type Usuario } from '@/state/AppContext'
//import {  } from '@/state/AppContext'
import api from '../../components/services/api'

function AuthCard({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker?: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <Card className="p-7 md:p-8">
      {kicker ? <p className="t-kicker mb-2">{kicker}</p> : null}
      <h1 className="t-h2">{title}</h1>
      {subtitle ? (
        <p className="t-body mt-2 mb-6 text-texto-secundario">
          {subtitle}
        </p>
      ) : (
        <div className="mb-5" />
      )}
      {children}
    </Card>
  )
}

export function LoginPage() {
  const { login, setUsuario } = useApp()
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

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim() || !password) {
      setError(t.credError)
      return
    }

    setLoading(true)
    setError('')

    api.post('/usuarios/login', {
      email: email.trim(),
      senha: password,
    })
      .then((resposta) => {
        console.log('Resposta completa:', resposta)
        console.log('Dados:', resposta.data)
        console.log('JSON:', JSON.stringify(resposta.data))
        
        setUsuario(resposta.data)
        login(email.trim(), stay)
        navigate('/dashboard')
      })
      .catch((erro: any) => {
        console.error('Falha ao fazer login:', erro)

        setError(
          'Não foi possível entrar. Verifique seu e-mail e sua senha.'
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AuthCard
      kicker="Acesso"
      title="Entre na plataforma"
      subtitle="Use a conta da organização. O SSO permanece preparado até o provedor ser configurado."
    >
      {info ? (
        <Banner className="mb-4" tone="info">
          {info}
        </Banner>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => navigate('/sso')}
      >
        <Building2 size={16} />
        {t.sso}
      </Button>

      <p className="t-apoio mt-2 text-center text-faint">
        {t.ssoHint}
      </p>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-borda" />
        <span className="t-apoio text-faint">{t.orLocal}</span>
        <span className="h-px flex-1 bg-borda" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field
          label={t.user}
          error={error && !email ? error : undefined}
        >
          <Input
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>

        <Field label={t.password}>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            autoComplete="current-password"
          />
        </Field>

        {error ? (
          <p className="t-body text-erro">{error}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="t-body flex items-center gap-2">
            <input
              type="checkbox"
              checked={stay}
              onChange={(e) => setStay(e.target.checked)}
            />
            {t.stay}
          </label>

          <Button type="submit" disabled={loading}>
            {loading ? t.entering : t.enter}
          </Button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          <Link className="t-label" to="/recuperar-senha">
            {t.forgot}
          </Link>

          <Link
            className="t-label"
            to="/recuperar-senha?acao=atualizar"
          >
            {t.update}
          </Link>

          <Link className="t-label" to="/">
            Apresentação
          </Link>
        </div>
      </form>
    </AuthCard>
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

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim()) {
      setError(t.recoverError)
      return
    }

    setLoading(true)
    setError('')
    setOk('')

    api.post('/usuarios/recuperar-senha', {
      email: email.trim(),
    })
      .then((resposta: { data: any }) => {
        console.log(
          'Solicitação de recuperação realizada:',
          resposta.data
        )

        setOk(t.recoverOk)

        setTimeout(() => {
          navigate('/verificacao?origem=senha')
        }, 700)
      })
      .catch((erro: any) => {
        console.error('Falha ao recuperar senha:', erro)
        setError(t.recoverError)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AuthCard
      kicker="Acesso"
      title={update ? t.updateTitle : t.recoverTitle}
      subtitle={t.recoverHint}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label={t.user} error={error || undefined}>
          <Input
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>

        {ok ? <Banner tone="success">{ok}</Banner> : null}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? t.sending : t.sendCode}
        </Button>

        <Link className="t-label block" to="/login">
          {t.backLogin}
        </Link>
      </form>
    </AuthCard>
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

  function submit(e: React.FormEvent<HTMLFormElement>) {
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
    <AuthCard
      kicker="Verificação"
      title="Duas etapas"
      subtitle="Informe o código de 6 dígitos enviado para o canal cadastrado. Neste ambiente o código é de demonstração."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Código" error={error || undefined}>
          <Input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
            }}
          />
        </Field>

        <label className="t-body flex items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Lembrar este dispositivo
        </label>

        {info ? <Banner tone="info">{info}</Banner> : null}

        <Button type="submit" className="w-full">
          Confirmar
        </Button>

        <div className="flex justify-between">
          <button
            type="button"
            className="t-label"
            onClick={() =>
              setInfo('Código enviado. Verifique sua caixa de entrada.')
            }
          >
            Reenviar código
          </button>

          <button
            type="button"
            className="t-label"
            onClick={() =>
              setInfo(
                'Use o aplicativo autenticador ou o código do e-mail.'
              )
            }
          >
            Trocar método
          </button>
        </div>
      </form>
    </AuthCard>
  )
}

export function AuthenticatorPage() {
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  return (
    <AuthCard
      kicker="Verificação"
      title="Configurar autenticador"
      subtitle="Escaneie o QR Code no aplicativo autenticador ou informe a chave manual. O QR desta tela é de demonstração."
    >
      <div className="mb-4 flex h-40 items-center justify-center rounded-[8px] border border-borda bg-destaque t-apoio">
        QR Code de demonstração
      </div>

      <p className="t-apoio mb-4">
        Chave manual: PARIS6-DEMO-MFA-7K2Q
      </p>

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
        <Field label="Código" error={error || undefined}>
          <Input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
            }}
          />
        </Field>

        <Button type="submit" className="w-full">
          Confirmar dispositivo
        </Button>
      </form>
    </AuthCard>
  )
}

export function SsoPage() {
  const { login } = useApp()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'idle' | 'ok' | 'fail'>('idle')

  return (
    <AuthCard
      kicker="Acesso"
      title="Entrar com SSO"
      subtitle="Não há redirecionamento real neste ambiente."
    >
      <Banner tone="info" className="mb-4">
        Provedor de identidade não configurado. Esta tela está preparada
        para OpenID Connect quando as credenciais forem definidas.
      </Banner>

      {status === 'fail' ? (
        <Banner tone="error" className="mb-4">
          Falha simulada do provedor.
        </Banner>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setStatus('ok')
            login('ana.souza@paris6.com.br')
            setTimeout(() => navigate('/verificacao'), 500)
          }}
        >
          Continuar com usuário de demonstração
        </Button>

        <Button
          variant="ghost"
          onClick={() => setStatus('fail')}
        >
          Simular falha do provedor
        </Button>

        <Link className="t-label" to="/login">
          Voltar para login
        </Link>
      </div>
    </AuthCard>
  )
}

export function PasswordChangedPage() {
  return (
    <AuthCard
      kicker="Acesso"
      title="Senha alterada"
      subtitle="A senha foi atualizada neste ambiente. Entre com a nova senha."
    >
      <Banner tone="success">
        Senha alterada. Entre com a nova senha.
      </Banner>

      <Link to="/login" className="mt-6 block">
        <Button className="w-full">Entrar</Button>
      </Link>
    </AuthCard>
  )
}

export function SessionExpiredPage() {
  return (
    <AuthCard
      kicker="Acesso"
      title="Sessão expirada"
      subtitle="A sessão foi encerrada por inatividade. Entre novamente para continuar."
    >
      <Link to="/login?motivo=expirada">
        <Button className="w-full">Entrar</Button>
      </Link>
    </AuthCard>
  )
}
