import { cn } from '@/lib/cn'

export function SummaryCard({
  label,
  value,
  hint,
  tone = 'brand',
  active,
  onClick,
}






) {
  const dots = {
    brand: 'bg-primaria',
    warn: 'bg-alerta-texto',
    danger: 'bg-erro',
    ok: 'bg-sucesso',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-1.5 rounded-[14px] border bg-superficie px-[17px] py-[15px] text-left shadow-card transition-shadow',
        active ? 'border-primaria ring-2 ring-primaria/20' : 'border-borda hover:border-borda-forte',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-[7px] w-[7px] rounded-full', dots[tone])} />
        <span className="t-label text-texto-secundario">{label}</span>
      </div>
      <p className="t-kpi">{value}</p>
      {hint ? <p className="t-apoio text-faint">{hint}</p> : null}
    </button>
  )
}
