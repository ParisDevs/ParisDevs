import { X } from 'lucide-react'


export function Modal({
  title,
  subtitle,
  open,
  onClose,
  children,
  footer,
  wide,
}






) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto rounded-[14px] border border-borda bg-superficie p-6 shadow-[0_18px_48px_rgba(10,26,23,0.16)]`}
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
