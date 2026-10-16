export type Lang = 'pt' | 'en'

const KEY = 'pd.lang'

export function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'en' || stored === 'pt') return stored
  } catch {
    /* noop */
  }
  return 'pt'
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* noop */
  }
}

export const copy = {
  pt: {
    platform: 'Plataforma ParisDevs',
    enter: 'Entrar',
    sso: 'Entrar com SSO',
    orLocal: 'Ou acesse com usuário e senha',
    user: 'Usuário',
    password: 'Senha',
    stay: 'Permanecer logado',
    forgot: 'Esqueci minha senha',
    update: 'Atualizar senha',
    version: 'Login — versão 1.0 — RTM 1.00.0',
    authz: 'Autorização de uso para Paris6',
    language: 'Idioma',
    entering: 'Entrando',
    logoutInfo: 'Você saiu do sistema.',
    expiredInfo: 'Sua sessão expirou. Entre novamente.',
    credError: 'Usuário ou senha incorretos.',
    recoverTitle: 'Recuperar senha',
    updateTitle: 'Atualizar senha',
    recoverHint: 'Informe o usuário da sua conta. Vamos enviar um código de verificação.',
    sendCode: 'Enviar código',
    sending: 'Enviando',
    backLogin: 'Voltar para login',
    recoverError: 'Não encontramos uma conta com este usuário.',
    recoverOk: 'Código enviado. Verifique sua caixa de entrada.',
  },
  en: {
    platform: 'ParisDevs Platform',
    enter: 'Sign in',
    sso: 'Sign in with SSO',
    orLocal: 'Or sign in with username and password',
    user: 'Username',
    password: 'Password',
    stay: 'Stay signed in',
    forgot: 'Forgot password',
    update: 'Update password',
    version: 'Login — version 1.0 — RTM 1.00.0',
    authz: 'Authorized use for Paris6',
    language: 'Language',
    entering: 'Signing in',
    logoutInfo: 'You have signed out.',
    expiredInfo: 'Your session expired. Sign in again.',
    credError: 'Incorrect username or password.',
    recoverTitle: 'Forgot password',
    updateTitle: 'Update password',
    recoverHint: 'Enter your account username. We will send a verification code.',
    sendCode: 'Send code',
    sending: 'Sending',
    backLogin: 'Back to login',
    recoverError: 'We could not find an account with this username.',
    recoverOk: 'Code sent. Check your inbox.',
  },
} as const
