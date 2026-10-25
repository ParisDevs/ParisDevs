import type { ScheduleItem } from '@/domain/types'

export function billsOf(kind: 'pagar' | 'receber', items: ScheduleItem[], scope: string) {
  return items.filter((s) => s.kind === kind && (scope === 'grupo' || s.companyId === scope))
}
