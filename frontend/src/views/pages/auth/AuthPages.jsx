
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { Banner, Button, Card, Field, Input } from '@/views/ui'
import { useAppViewModel } from '@/viewmodels/AppViewModel'
import { useLoginViewModel } from '@/viewmodels/auth/useLoginViewModel'
import { useRecoverViewModel } from '@/viewmodels/auth/useRecoverViewModel'
import { useSsoViewModel } from '@/viewmodels/auth/useSsoViewModel'

function AuthCard({
  kicker,
  title,
  subtitle,
  children,
}




) {
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
  const {
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
    goSso,
  } = useLoginViewModel()

  return (
    <AuthCard
      kicker={t.loginKicker}
      title={t.loginTitle}
      subtitle={t.loginSubtitle}
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
        onClick={goSso}
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
          error={error && !email.trim() ? error : undefined}
        >
          <Input
            type="text"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>

        <Field
          label={t.password}
          error={error && email.trim() && !password ? error : undefined}
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
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
  const { t, update, email, error, ok, loading, onEmailChange, submit } = useRecoverViewModel()

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
            onChange={(e) => onEmailChange(e.target.value)}
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
  const { session } = useAppViewModel()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [remember, setRemember] = useState(false)

  function submit(e) {
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
  const { status, continueDemo, failProvider } = useSsoViewModel()

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
          onClick={continueDemo}
        >
          Continuar com usuário de demonstração
        </Button>

        <Button
          variant="ghost"
          onClick={failProvider}
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
