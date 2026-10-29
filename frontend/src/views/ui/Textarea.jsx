
import { cn } from '@/lib/cn'
import { controlClassName } from './controlStyles'

export function Textarea({ className, ...props }) {
  return <textarea className={cn(controlClassName, 'min-h-24', className)} {...props} />
}
