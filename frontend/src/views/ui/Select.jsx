
import { cn } from '@/lib/cn'
import { controlClassName } from './controlStyles'

export function Select({ className, ...props }) {
  return <select className={cn(controlClassName, className)} {...props} />
}
