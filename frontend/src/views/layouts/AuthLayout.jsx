import { createContext, useContext, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { BrandMark } from '@/views/components/BrandMark'
import { ThemeToggle } from '@/views/components/ThemeToggle'
import { copy, loadLang, saveLang, } from '@/lib/i18n'







const AuthLangContext = createContext(null)

export function useAuthCopy() {
  const ctx = useContext(AuthLangContext)
  if (!ctx) throw new Error('useAuthCopy precisa do AuthLayout')
  return ctx
}

export function AuthLayout() {
  const [lang, setLangState] = useState(loadLang)
  const t = copy[lang]

  function setLang(next) {
    saveLang(next)
    setLangState(next)
  }

  return (
    <AuthLangContext.Provider value={{ lang, setLang, t }}>
      <div className="flex min-h-svh flex-col bg-fundo">
        <header className="flex h-14 shrink-0 items-center justify-between bg-menu px-4 md:px-8">
          <Link to="/" className="no-underline">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-white/70 hover:bg-white/10 hover:text-white" />
            <label className="flex items-center gap-2">
              <span className="t-apoio text-white/60">{t.language}</span>
              <span className="relative">
                <select
                  value={lang}
                  aria-label={t.language}
                  className="h-9 min-w-[11.5rem] appearance-none rounded-[8px] border border-white/20 bg-menu-hover py-0 pr-8 pl-3 text-[13px] text-white outline-none"
                  style={{ colorScheme: 'dark' }}
                  onChange={(e) => setLang(e.target.value)}
                >
                  <option value="pt">Português (Brasil)</option>
                  <option value="en">English</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-white/70" />
              </span>
            </label>
          </div>
        </header>

        <div className="grid flex-1 lg:grid-cols-2">
          <div className="relative hidden overflow-hidden bg-menu lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(201,176,122,0.18),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(11,93,78,0.45),transparent_50%)]" />
            <div className="relative flex h-full flex-col justify-end p-12 text-white">
              <p className="t-kicker text-ouro">Plataforma interna</p>
              <p className="mt-3 text-[28px] font-semibold leading-tight tracking-tight">Open Finance, conciliação e DRE no mesmo recorte.</p>
              <p className="mt-4 max-w-md text-[15px] text-white/70">
                Contas autorizadas pelo titular, extratos importados e classificação gerencial — sem tratar transferência como receita.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-[radial-gradient(700px_320px_at_100%_0%,rgba(11,93,78,0.07),transparent_50%)] px-4 py-10 md:px-10">
            <div className="w-full max-w-[440px]">
              <Outlet />
            </div>
            <footer className="mt-8 text-center">
              <p className="t-apoio text-texto-secundario">{t.authz}</p>
              <p className="t-apoio mt-1 text-faint">{t.version}</p>
            </footer>
          </div>
        </div>
      </div>
    </AuthLangContext.Provider>
  )
}
