import { CircleHelp, X } from 'lucide-react'
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button
      className={cn(
        't-button inline-flex h-[38px] items-center justify-center gap-2 rounded-[6px] px-4 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-primaria text-white hover:bg-primaria-escura',
        variant === 'secondary' && 'border border-borda-forte bg-superficie text-texto hover:bg-superficie-2',
        variant === 'ghost' && 'bg-transparent text-texto-secundario hover:bg-superficie-2 hover:text-texto',
        className,
      )}
      {...props}
    />
  )
}

export function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="t-label mb-1.5 block text-texto-secundario">{label}</span>
      {children}
      {error ? <span className="t-body mt-2 block text-erro">{error}</span> : null}
    </label>
  )
}

const control =
  'w-full rounded-[6px] border border-borda-forte bg-superficie px-3.5 py-2.5 t-body text-texto outline-none placeholder:text-faint'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, 'min-h-24', className)} {...props} />
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-[14px] border border-borda bg-superficie p-5 shadow-[0_1px_2px_rgba(10,26,23,0.04)]', className)}>
      {children}
    </section>
  )
}

export function Tip({ text }: { text: string }) {
  return (
    <span
      className="group relative z-20 inline-flex shrink-0"
      onClick={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <CircleHelp size={13} className="text-faint" aria-label={text} />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 hidden w-56 -translate-x-1/2 rounded-[8px] border border-borda bg-superficie px-2.5 py-2 text-left t-apoio font-normal text-texto-secundario shadow-[0_8px_24px_rgba(10,26,23,0.12)] group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  )
}

export function Kpi({
  label,
  value,
  hint,
  hintTone,
  to,
  tip,
}: {
  label: string
  value: string
  hint?: string
  hintTone?: 'up' | 'down'
  to?: string
  tip?: string
}) {
  const body = (
    <Card className={cn('flex h-[104px] w-full flex-col justify-between overflow-visible p-4', to && 'transition-shadow hover:border-borda-forte hover:shadow-[0_4px_16px_rgba(10,26,23,0.07)]')}>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primaria" />
        <p className="t-label truncate text-texto-secundario">{label}</p>
        {tip ? <Tip text={tip} /> : null}
      </div>
      <p className="t-kpi truncate whitespace-nowrap text-[22px] leading-none">{value}</p>
      <p
        className={cn(
          't-apoio truncate',
          hintTone === 'up' && 'text-sucesso',
          hintTone === 'down' && 'text-erro',
          !hintTone && 'text-faint',
        )}
      >
        {hint || '\u00a0'}
      </p>
    </Card>
  )
  return to ? (
    <Link to={to} className="block min-w-0">
      {body}
    </Link>
  ) : (
    body
  )
}

export function Badge({
  children,
  tone = 'info',
}: {
  children: ReactNode
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}) {
  const map = {
    success: 'bg-[#E8F5EF] text-sucesso border-[#C9E7DA]',
    warning: 'bg-alerta text-alerta-texto border-[#F0E2BE]',
    danger: 'bg-[#FDECEA] text-erro border-[#F5CFCB]',
    info: 'bg-[#EAF3F6] text-informacao border-[#CDE2EA]',
    neutral: 'bg-superficie-2 text-texto-secundario border-borda-forte',
  }
  return (
    <span className={cn('inline-flex h-[23px] items-center rounded-full border px-2.5 text-[11.5px] font-semibold', map[tone])}>
      {children}
    </span>
  )
}

export function Banner({ children, tone = 'alert', className }: { children: ReactNode; tone?: 'alert' | 'error' | 'success' | 'info'; className?: string }) {
  const map = {
    alert: 'bg-alerta text-alerta-texto border-[#F0E2BE]',
    error: 'bg-[#FDECEA] text-erro border-[#F5CFCB]',
    success: 'bg-[#E8F5EF] text-sucesso border-[#C9E7DA]',
    info: 'bg-destaque text-primaria border-brand-line',
  }
  return <div className={cn('t-body rounded-[10px] border px-4 py-3', map[tone], className)}>{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="t-body py-14 text-center text-faint">{children}</p>
}

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[260px] flex-1">
          <h1 className="t-h1">{title}</h1>
          {subtitle ? <p className="mt-1.5 max-w-xl text-[14px] text-texto-secundario">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </header>
  )
}

export function SummaryCard({
  label,
  value,
  hint,
  tone = 'brand',
  active,
  onClick,
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'brand' | 'warn' | 'danger' | 'ok'
  active?: boolean
  onClick?: () => void
}) {
  const dots = {
    brand: 'bg-primaria',
    warn: 'bg-alerta-texto',
    danger: 'bg-erro',
    ok: 'bg-sucesso',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-1.5 rounded-[14px] border bg-superficie px-[17px] py-[15px] text-left shadow-[0_1px_2px_rgba(10,26,23,0.04)] transition-shadow',
        active ? 'border-primaria shadow-[0_0_0_3px_#eaf3f0]' : 'border-borda hover:border-borda-forte hover:shadow-[0_4px_16px_rgba(10,26,23,0.07)]',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-[7px] w-[7px] rounded-full', dots[tone])} />
        <span className="t-label text-texto-secundario">{label}</span>
      </div>
      <p className="t-kpi">{value}</p>
      {hint ? <p className="t-apoio text-faint">{hint}</p> : null}
    </button>
  )
}

export function Table({
  columns,
  children,
  empty,
  footer,
  toolbar,
}: {
  columns: string[]
  children: ReactNode
  empty?: ReactNode
  footer?: ReactNode
  toolbar?: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-borda bg-superficie shadow-[0_1px_2px_rgba(10,26,23,0.04)]">
      {toolbar ? <div className="border-b border-borda px-4 py-3.5">{toolbar}</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} className="border-b border-borda bg-superficie-2 px-4 py-2.5 text-[11px] font-semibold tracking-[0.05em] text-faint uppercase">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {empty}
      {footer ? (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-borda bg-superficie-2 px-[22px] py-3.5 text-[12.5px] text-texto-secundario">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function Td({ children, className, nowrap }: { children: ReactNode; className?: string; nowrap?: boolean }) {
  return <td className={cn('t-body border-b border-borda px-4 py-3.5', nowrap && 'whitespace-nowrap', className)}>{children}</td>
}

export function Modal({
  title,
  subtitle,
  open,
  onClose,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  open: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1A17]/36 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-[14px] border border-borda bg-superficie p-6 shadow-[0_18px_48px_rgba(10,26,23,0.16)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="t-h2">
              {title}
            </h2>
            {subtitle ? <p className="t-apoio mt-1 text-texto-secundario">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-faint hover:text-texto">
            <X size={18} />
          </button>
        </div>
        {children}
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}

export function Drawer({
  title,
  open,
  onClose,
  children,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0A1A17]/36" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-borda bg-superficie shadow-[0_18px_48px_rgba(10,26,23,0.16)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-borda p-6">
          <h2 className="t-h2">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-faint">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  )
}

export function Tabs({
  value,
  onChange,
  items,
}: {
  value: string
  onChange: (v: string) => void
  items: { id: string; label: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            'inline-flex h-[29px] items-center rounded-full border px-3 text-[12.5px] font-medium',
            value === item.id
              ? 'border-primaria bg-primaria text-white'
              : 'border-borda-forte bg-superficie text-texto-secundario hover:border-faint hover:text-texto',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function Kv({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[11.5px] text-faint">{item.label}</dt>
          <dd className="t-body mt-1">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Toast({ message, tone }: { message: string | null; tone?: 'success' | 'error' }) {
  if (!message) return null
  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm">
      <Banner tone={tone === 'error' ? 'error' : 'success'}>{message}</Banner>
    </div>
  )
}
