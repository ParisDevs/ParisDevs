import { type ReactNode } from 'react'

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
