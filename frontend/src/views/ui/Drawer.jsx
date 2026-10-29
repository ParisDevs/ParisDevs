import { X } from 'lucide-react'


export function Drawer({
  title,
  open,
  onClose,
  children,
}




) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
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
