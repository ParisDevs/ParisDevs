import { type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { controlClassName } from './controlStyles'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClassName, className)} {...props} />
}
