
import { cn } from '@/lib/cn'

export function Card({ className, children }) {
  return (
    <section className={cn('rounded-[16px] border border-borda bg-superficie p-5 shadow-card', className)}>
      {children}
    </section>
  )
}
