import { institutionOf, institutionOfBank } from '@/domain/institutions'
import { cn } from '@/lib/cn'

const ASSETS: Record<string, { src: string; bg?: string }> = {
  itau: { src: '/banks/itau.png', bg: '#EC7000' },
  xp: { src: '/banks/xp.png', bg: '#1a1a1a' },
  bradesco: { src: '/banks/bradesco.png', bg: '#fff' },
  santander: { src: '/banks/santander.png', bg: '#000' },
  nubank: { src: '/banks/nubank.png', bg: '#000' },
  bb: { src: '/banks/bb.png', bg: '#FFEF3B' },
  caixa: { src: '/banks/caixa.png', bg: '#0a7ec2' },
  inter: { src: '/banks/inter.png', bg: '#000' },
  btg: { src: '/banks/btg.png', bg: '#0b1220' },
}

function FallbackMark({ id, color, short }: { id: string; color: string; short: string }) {
  if (id === 'c6') {
    return (
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#111" />
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
        <rect width="32" height="32" rx="8" fill="#3AAA35" />
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
}: {
  id?: string
  bank?: string
  size?: number
  className?: string
}) {
  const inst = id ? institutionOf(id) : bank ? institutionOfBank(bank) : undefined
  const asset = inst ? ASSETS[inst.id] : undefined
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] shadow-[0_0_0_1px_rgba(13,31,27,0.08)]', className)}
      style={{ width: size, height: size, backgroundColor: asset?.bg ?? '#fff' }}
      role="img"
      aria-label={inst?.name ?? bank ?? 'Banco'}
    >
      {asset ? (
        <img src={asset.src} alt="" className="h-[72%] w-[72%] object-contain" />
      ) : (
        <FallbackMark id={inst?.id ?? ''} color={inst?.color ?? '#5a6e69'} short={inst?.short ?? bank ?? '—'} />
      )}
    </span>
  )
}
