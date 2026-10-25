import { Badge, Tip } from '@/components/ui'
import { reconLabels, reconTips } from '@/data/fixtures'
import type { Transaction } from '@/domain/types'

function reconTone(r: Transaction['recon']) {
  if (r === 'conciliado') return 'success' as const
  if (r === 'divergencia' || r === 'duplicidade') return 'danger' as const
  if (r === 'sugestao') return 'info' as const
  if (r === 'interna') return 'neutral' as const
  return 'warning' as const
}

export function ReconStatusBadge({ recon }: { recon: Transaction['recon'] }) {
  const tip = reconTips[recon]
  return (
    <span className="inline-flex items-center gap-1">
      <Badge tone={reconTone(recon)}>{reconLabels[recon]}</Badge>
      {tip ? <Tip text={tip} /> : null}
    </span>
  )
}
