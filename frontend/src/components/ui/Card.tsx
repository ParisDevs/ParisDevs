import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-[16px] border border-borda bg-superficie p-5 shadow-[0_1px_2px_rgba(13,31,27,0.04)]', className)}>
      {children}
    </section>
  )
}
