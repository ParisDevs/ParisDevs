

export function Field({
  label,
  error,
  children,
}



) {
  return (
    <label className="block">
      <span className="t-label mb-1.5 block text-texto-secundario">{label}</span>
      {children}
      {error ? <span className="t-body mt-2 block text-erro">{error}</span> : null}
    </label>
  )
}
