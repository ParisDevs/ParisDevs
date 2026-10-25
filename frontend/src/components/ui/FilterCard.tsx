import { ChevronDown, type LucideIcon } from 'lucide-react'
import { type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function FilterCard({
  icon: Icon,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { icon?: LucideIcon }) {
  return (
    <label className={cn('relative flex min-w-0 flex-1 items-center', className)}>
      {Icon ? (
        <Icon size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
      ) : null}
      <select
        className={cn(
          'h-[52px] w-full min-w-0 appearance-none rounded-[16px] border border-borda bg-superficie pr-10 text-[13.5px] font-medium text-texto shadow-[0_1px_2px_rgba(13,31,27,0.04)] outline-none',
          Icon ? 'pl-10' : 'pl-4',
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-faint" />
    </label>
  )
}
