
import { cn } from '@/lib/cn'

export function Banner({ children, tone = 'alert', className }) {
  const map = {
    alert: 'bg-alerta text-alerta-texto border-alerta-texto/25',
    error: 'bg-erro/12 text-erro border-erro/25',
    success: 'bg-sucesso/12 text-sucesso border-sucesso/25',
    info: 'bg-destaque text-primaria border-brand-line',
  }
  return <div className={cn('t-body rounded-[10px] border px-4 py-3', map[tone], className)}>{children}</div>
}
