

export function billsOf(kind, items, scope) {
  return items.filter((s) => s.kind === kind && (scope === 'grupo' || s.companyId === scope))
}
