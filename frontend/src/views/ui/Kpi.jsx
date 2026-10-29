
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from './Card'
import { Tip } from './Tip'

export function Kpi({
  label,
  value,
  hint,
  hintTone,
  to,
  tip,
  icon: Icon,
}







) {
  const body = (
    <Card
      className={cn(
        'flex min-h-[138px] w-full flex-col justify-between overflow-visible p-5',
        to && 'transition-shadow hover:border-borda-forte hover:shadow-[0_4px_16px_rgba(13,31,27,0.07)]',
      )}
    >
      <div className="flex items-start gap-2.5">
        {Icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-destaque text-primaria">
            <Icon size={15} strokeWidth={1.75} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <p className="t-label truncate text-texto-secundario">{label}</p>
            {tip ? <Tip text={tip} /> : null}
          </div>
        </div>
      </div>
      <p className="t-kpi mt-3 truncate whitespace-nowrap text-texto">{value}</p>
      <p
        className={cn(
          'mt-1.5 flex items-center gap-0.5 t-apoio truncate',
          hintTone === 'up' && 'text-sucesso',
          hintTone === 'ok' && 'text-sucesso',
          hintTone === 'down' && 'text-erro',
          !hintTone && 'text-faint',
        )}
      >
        {hintTone === 'up' ? <ArrowUpRight size={12} /> : null}
        {hintTone === 'down' ? <ArrowDownRight size={12} /> : null}
        <span className="truncate">{hint || '\u00a0'}</span>
      </p>
    </Card>
  )
  return to ? (
    <Link to={to} className="block min-w-0">
      {body}
    </Link>
  ) : (
    body
  )
}
