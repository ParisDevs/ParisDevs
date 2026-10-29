

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  kicker,
  meta,
}






) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[240px] flex-1">
          {kicker ? <p className="t-kicker mb-1.5">{kicker}</p> : null}
          <h1 className="t-h1">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-texto-secundario">{subtitle}</p> : null}
        </div>
        <div className="relative z-10 flex shrink-0 flex-wrap items-start justify-end gap-3">
          {meta ? <div className="t-apoio pt-1 text-right">{meta}</div> : null}
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </header>
  )
}
