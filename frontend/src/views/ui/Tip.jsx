import { Info } from 'lucide-react'

export function Tip({ text }) {
  return (
    <span
      className="group relative z-20 inline-flex shrink-0"
      onClick={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Info size={13} className="text-faint" aria-label={text} />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 hidden w-56 -translate-x-1/2 rounded-[8px] border border-borda bg-superficie px-2.5 py-2 text-left t-apoio font-normal text-texto-secundario shadow-[0_8px_24px_rgba(10,26,23,0.12)] group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  )
}
