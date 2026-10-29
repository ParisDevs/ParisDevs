

export function Empty({ children, action }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <p className="t-body text-texto-secundario">{children}</p>
      {action ? <div className="mt-4 flex justify-center gap-2">{action}</div> : null}
    </div>
  )
}
