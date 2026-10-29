import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

export function UserAvatar({ src, name, size = 40, className }) {
  const label = name || 'Usuário'
  const fontSize = size <= 28 ? '10.5px' : size <= 40 ? '12px' : '16px'
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primaria font-bold text-white',
        className,
      )}
      style={{ width: size, height: size, fontSize }}
      aria-hidden="true"
    >
      {initials(label)}
    </span>
  )
}
