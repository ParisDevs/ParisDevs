import { cn } from '@/lib/cn'

export function Tabs({
  value,
  onChange,
  items,
}



) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            'inline-flex h-[29px] items-center rounded-full border px-3 text-[12.5px] font-medium',
            value === item.id
              ? 'border-primaria bg-primaria text-white'
              : 'border-borda-forte bg-superficie text-texto-secundario hover:border-faint hover:text-texto',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
