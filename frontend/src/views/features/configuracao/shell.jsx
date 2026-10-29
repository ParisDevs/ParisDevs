import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/views/ui'

export function ConfigCrumbs({ current }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-[13px] text-texto-secundario" aria-label="Navegação">
      <Link to="/configuracoes" className="font-medium text-primaria hover:underline">
        Configurações
      </Link>
      <ChevronRight size={14} className="text-faint" aria-hidden />
      <span className="font-medium text-texto">{current}</span>
    </nav>
  )
}

export function SettingsSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="t-label px-0.5 tracking-[0.08em] text-texto-secundario uppercase">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  )
}

export function SettingsNavCard({ to, icon: Icon, title, description }) {
  return (
    <Link to={to} className="block min-w-0">
      <Card className="flex h-full items-center gap-3 p-4 transition-colors hover:border-borda-forte hover:bg-superficie-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-destaque text-primaria">
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="t-h3">{title}</h3>
          <p className="t-apoio mt-0.5 text-texto-secundario">{description}</p>
        </div>
        <ChevronRight size={16} className="shrink-0 text-faint" />
      </Card>
    </Link>
  )
}

export function CheckRow({ checked, onChange, children }) {
  return (
    <label className="t-body flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-borda px-3 py-2.5">
      <input type="checkbox" className="mt-1" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  )
}

export function CardAlso({ children, flush }) {
  return (
    <div className={flush ? 'flex flex-wrap gap-2' : 'flex flex-wrap gap-2 border-t border-borda pt-4'}>
      <p className="t-label w-full text-texto-secundario">Ver também</p>
      {children}
    </div>
  )
}
