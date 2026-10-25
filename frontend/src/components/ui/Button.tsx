import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button
      className={cn(
        't-button inline-flex h-[38px] items-center justify-center gap-2 rounded-[8px] px-4 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-primaria text-white hover:bg-primaria-escura',
        variant === 'secondary' && 'border border-borda-forte bg-superficie text-texto hover:bg-superficie-2',
        variant === 'ghost' && 'bg-transparent text-texto-secundario hover:bg-superficie-2 hover:text-texto',
        className,
      )}
      {...props}
    />
  )
}
