import { Badge, Tip } from '@/views/ui'
import { reconLabels, reconTips } from '@/models/fixtures'


function reconTone(r) {
  if (r === 'conciliado') return 'success' 
  if (r === 'divergencia' || r === 'duplicidade') return 'danger' 
  if (r === 'sugestao') return 'info' 
  if (r === 'interna') return 'neutral' 
  return 'warning' 
}

export function ReconStatusBadge({ recon }) {
  const tip = reconTips[recon]
  return (
    <span className="inline-flex items-center gap-1">
      <Badge tone={reconTone(recon)}>{reconLabels[recon]}</Badge>
      {tip ? <Tip text={tip} /> : null}
    </span>
  )
}
