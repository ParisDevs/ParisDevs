
import { cn } from '@/lib/cn'

export function Banner({ children, tone = 'alert', className }) {
  const map = {
    alert: 'bg-alerta text-alerta-texto border-[#F0E2BE]',
    error: 'bg-[#FDECEA] text-erro border-[#F5CFCB]',
    success: 'bg-[#E8F5EF] text-sucesso border-[#C9E7DA]',
    info: 'bg-destaque text-primaria border-brand-line',
  }
  return <div className={cn('t-body rounded-[10px] border px-4 py-3', map[tone], className)}>{children}</div>
}
