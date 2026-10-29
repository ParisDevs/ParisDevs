
import { cn } from '@/lib/cn'

export function Badge({
  children,
  tone = 'info',
}


) {
  const map = {
    success: 'bg-sucesso/12 text-sucesso border-sucesso/25',
    warning: 'bg-alerta text-alerta-texto border-alerta-texto/25',
    danger: 'bg-erro/12 text-erro border-erro/25',
    info: 'bg-informacao/12 text-informacao border-informacao/25',
    neutral: 'bg-superficie-2 text-texto-secundario border-borda-forte',
  }
  return (
    <span className={cn('inline-flex h-[23px] items-center rounded-full border px-2.5 text-[11.5px] font-semibold', map[tone])}>
      {children}
    </span>
  )
}
