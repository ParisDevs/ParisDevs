import { cn } from '@/lib/cn'

export function BrandMark({ compact = false, onDark = true }) {
  return (
    <span
      className={cn(
        'font-semibold tracking-[0.18em]',
        compact ? 'text-[11px]' : 'text-[12px]',
        onDark ? 'text-ouro' : 'text-primaria',
      )}
    >
      PARIS DEVS
    </span>
  )
}
