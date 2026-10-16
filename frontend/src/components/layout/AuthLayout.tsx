import { createContext, useContext, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { copy, loadLang, saveLang, type Lang } from '@/lib/i18n'
import { Select } from '@/components/ui'

type AuthLang = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (typeof copy)[Lang]
}

const AuthLangContext = createContext<AuthLang | null>(null)

export function useAuthCopy() {
  const ctx = useContext(AuthLangContext)
  if (!ctx) throw new Error('useAuthCopy precisa do AuthLayout')
  return ctx
}

export function AuthLayout() {
  const [lang, setLangState] = useState<Lang>(loadLang)
  const t = copy[lang]

  function setLang(next: Lang) {
    saveLang(next)
    setLangState(next)
  }

  return (
    <AuthLangContext.Provider value={{ lang, setLang, t }}>
      <div className="flex min-h-svh flex-col bg-fundo">
        <header className="flex justify-end px-4 py-3 md:px-8">
          <label className="flex items-center gap-2">
            <span className="t-apoio text-faint">{t.language}</span>
            <Select
              value={lang}
              aria-label={t.language}
              className="w-auto min-w-[160px] py-1.5 text-[13px]"
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              <option value="pt">Português (Brasil)</option>
              <option value="en">English</option>
            </Select>
          </label>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-[440px]">
            <div className="mb-7 text-center">
              <p className="text-[18px] font-semibold tracking-tight">{t.platform}</p>
            </div>
            <Outlet />
          </div>
        </div>

        <footer className="px-4 py-5 text-center">
          <p className="t-apoio text-texto-secundario">{t.authz}</p>
          <p className="t-apoio mt-1 text-faint">{t.version}</p>
        </footer>
      </div>
    </AuthLangContext.Provider>
  )
}
