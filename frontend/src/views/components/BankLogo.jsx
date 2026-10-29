import { institutionOf, institutionOfBank } from '@/models/domain/institutions'
import { cn } from '@/lib/cn'

const ASSETS = {
  itau: { src: '/banks/itau-unibanco.png', bg: '#0033CC', fit: 'cover', scale: 1.28, pos: '50% 50%' },
  xp: { src: '/banks/xp-investimentos.png', bg: '#111111', fit: 'cover', scale: 1.52, pos: '50% 50%' },
  bradesco: { src: '/banks/bradesco.png', bg: '#fff', fit: 'contain', size: '78%' },
  santander: { src: '/banks/santander.png', bg: '#000', fit: 'contain', size: '78%' },
  nubank: { src: '/banks/nubank.png', bg: '#000', fit: 'cover', scale: 1.15, pos: '50% 50%' },
  bb: { src: '/banks/bb.png', bg: '#FFEF3B', fit: 'cover' },
  caixa: { src: '/banks/caixa.png', bg: '#0a7ec2', fit: 'cover' },
  inter: { src: '/banks/inter.png', bg: '#000', fit: 'contain', size: '82%' },
  btg: { src: '/banks/btg-pactual.png', bg: '#fff', fit: 'contain', size: '92%' },
}

function FallbackMark({ id, color, short }) {
  if (id === 'c6') {
    return (
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
        <rect width="32" height="32" rx="16" fill="#111" />
        <text x="16" y="21" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">C6</text>
      </svg>
    )
  }
  if (id === 'sicoob') {
    return (
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
        <rect width="32" height="32" rx="16" fill="#00A859" />
        <circle cx="16" cy="16" r="6.2" fill="none" stroke="#fff" strokeWidth="2.4" />
        <circle cx="16" cy="16" r="2.2" fill="#fff" />
      </svg>
    )
  }
  if (id === 'sicredi') {
    return (
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
        <rect width="32" height="32" rx="16" fill="#3AAA35" />
        <path fill="#fff" d="M16 7.4c-4.7 0-7.6 2.6-7.6 6.2 0 2.3 1.4 4 3.8 5.1L9.6 24h4.2l2-4.6h.4l2 4.6h4.2l-2.6-5.3c2.4-1.1 3.8-2.8 3.8-5.1 0-3.6-2.9-6.2-7.6-6.2Zm0 3.4c2.2 0 3.6 1.1 3.6 2.8S18.2 16.4 16 16.4 12.4 15.3 12.4 13.6 13.8 10.8 16 10.8Z" />
      </svg>
    )
  }
  return (
    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
      {short.slice(0, 2).toUpperCase()}
    </span>
  )
}

export function BankLogo({
  id,
  bank,
  size = 32,
  className,
}) {
  const inst = id ? institutionOf(id) : bank ? institutionOfBank(bank) : undefined
  const asset = inst ? ASSETS[inst.id] : undefined
  const fit = asset?.fit ?? 'contain'
  const scale = asset?.scale ?? 1
  const imgSize = asset?.size ?? (fit === 'cover' ? '100%' : '78%')

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full', className)}
      style={{
        width: size,
        height: size,
        padding: Math.max(1, Math.round(size * 0.06)),
        backgroundColor: asset?.bg ?? inst?.color ?? '#fff',
      }}
      role="img"
      aria-label={inst?.name ?? bank ?? 'Banco'}
    >
      {asset ? (
        <img
          src={asset.src}
          alt=""
          className={fit === 'cover' ? 'h-full w-full object-cover' : 'object-contain'}
          style={{
            width: fit === 'cover' ? '100%' : imgSize,
            height: fit === 'cover' ? '100%' : imgSize,
            objectPosition: asset.pos ?? '50% 50%',
            transform: scale !== 1 ? `scale(${scale})` : undefined,
          }}
        />
      ) : (
        <FallbackMark id={inst?.id ?? ''} color={inst?.color ?? '#5a6e69'} short={inst?.short ?? bank ?? '—'} />
      )}
    </span>
  )
}
