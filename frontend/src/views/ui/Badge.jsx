
import { cn } from '@/lib/cn'

export function Badge({
  children,
  tone = 'info',
}


) {
  const map = {
    success: 'bg-[#E8F5EF] text-sucesso border-[#C9E7DA]',
    warning: 'bg-alerta text-alerta-texto border-[#F0E2BE]',
    danger: 'bg-[#FDECEA] text-erro border-[#F5CFCB]',
    info: 'bg-[#EAF3F6] text-informacao border-[#CDE2EA]',
    neutral: 'bg-superficie-2 text-texto-secundario border-borda-forte',
  }
  return (
    <span className={cn('inline-flex h-[23px] items-center rounded-full border px-2.5 text-[11.5px] font-semibold', map[tone])}>
      {children}
    </span>
  )
}
