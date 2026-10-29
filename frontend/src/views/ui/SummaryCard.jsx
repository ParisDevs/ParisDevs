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
        'flex flex-col gap-1.5 rounded-[14px] border bg-superficie px-[17px] py-[15px] text-left shadow-[0_1px_2px_rgba(10,26,23,0.04)] transition-shadow',
        active ? 'border-primaria shadow-[0_0_0_3px_#eaf3f0]' : 'border-borda hover:border-borda-forte hover:shadow-[0_4px_16px_rgba(10,26,23,0.07)]',
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
