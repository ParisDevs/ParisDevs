
import { cn } from '@/lib/cn'

export function Table({
  columns,
  children,
  empty,
  footer,
  toolbar,
}





) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-borda bg-superficie shadow-[0_1px_2px_rgba(13,31,27,0.04)]">
      {toolbar ? <div className="border-b border-borda px-4 py-3.5">{toolbar}</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} className="border-b border-borda bg-superficie-2 px-4 py-2.5 text-[11px] font-semibold tracking-[0.05em] text-faint uppercase">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr]:group [&_tr:hover]:bg-superficie-2">{children}</tbody>
        </table>
      </div>
      {empty}
      {footer ? (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-borda bg-superficie-2 px-[22px] py-3.5 text-[12.5px] text-texto-secundario">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function Td({ children, className, nowrap }) {
  return <td className={cn('t-body border-b border-borda px-4 py-3.5 transition-colors group-hover:bg-superficie-2', nowrap && 'whitespace-nowrap', className)}>{children}</td>
}
