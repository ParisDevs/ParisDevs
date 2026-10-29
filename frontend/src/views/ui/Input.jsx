
import { cn } from '@/lib/cn'
import { controlClassName } from './controlStyles'

export function Input({ className, ...props }) {
  return <input className={cn(controlClassName, className)} {...props} />
}
