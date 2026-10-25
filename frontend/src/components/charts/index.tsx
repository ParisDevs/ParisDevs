import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money, moneyShort, percent } from '@/lib/format'
import { Card, Tip } from '@/components/ui'

const AXIS = { fill: '#5C6D6A', fontSize: 11 }
const PLOT = 'chart-plot h-[220px] w-full min-w-0 overflow-visible'
const PLOT_BAR = 'chart-plot chart-plot-bar h-[220px] w-full min-w-0 overflow-visible'

function ChartLegend({ payload }: { payload?: ReadonlyArray<{ value?: string; color?: string }> }) {
  if (!payload?.length) return null
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1">
      {payload.map((entry) => (
        <li key={String(entry.value)} className="flex items-center gap-1.5 text-[12px] text-texto-secundario">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

const MARGIN = { top: 12, right: 16, left: 12, bottom: 8 }
const PLOT_PIE = 'chart-plot chart-plot-pie h-[220px] w-full min-w-0 overflow-visible'
const AXIS_PROPS = { axisLine: false, tickLine: false } as const

function ChartTooltip({
  active,
  payload,
  label,
  extra,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ name?: unknown; value?: unknown; payload?: Record<string, string | number> }>
  label?: unknown
  extra?: { key: string; name: string }[]
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload ?? {}
  const items = [
    ...payload.map((p) => ({ name: String(p.name ?? ''), value: Number(p.value ?? 0) })),
    ...(extra ?? []).map((e) => ({ name: e.name, value: Number(row[e.key] ?? 0) })),
  ]
  return (
    <div className="rounded-[8px] border border-borda bg-superficie px-3 py-2 shadow-[0_8px_24px_rgba(10,26,23,0.12)]">
      {label != null && label !== '' ? <p className="mb-1.5 text-[12px] font-semibold text-texto">{String(label)}</p> : null}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name} className="flex min-w-[140px] justify-between gap-4 t-apoio text-texto-secundario">
            <span>{item.name}</span>
            <span className="font-medium text-texto">{money(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function hasSeries(data: Array<Record<string, string | number>>, keys: string[]) {
  return data.some((row) => keys.some((key) => Number(row[key] ?? 0) !== 0))
}

function ChartFrame({ title, tip, children }: { title: string; tip?: string; children: ReactNode }) {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-visible p-4">
      <h3 className="t-h3 mb-2 flex shrink-0 items-center gap-2">
        <span>{title}</span>
        {tip ? <Tip text={tip} /> : null}
      </h3>
      {children}
    </Card>
  )
}

export function LineCard({
  title,
  tip,
  data,
  series,
  highlight,
}: {
  title: string
  tip?: string
  data: Array<Record<string, string | number>>
  series: { key: string; color: string; name: string }[]
  highlight?: string
}) {
  return (
    <ChartFrame title={title} tip={tip}>
      <div className={PLOT}>
        {hasSeries(data, series.map((s) => s.key)) ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={MARGIN}>
              <XAxis dataKey="label" tick={AXIS} tickMargin={4} minTickGap={20} padding={{ left: 16, right: 12 }} {...AXIS_PROPS} />
              <YAxis width={72} tick={AXIS} tickFormatter={(v) => moneyShort(Number(v))} {...AXIS_PROPS} />
              <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={false} />
              <Legend content={(props) => <ChartLegend payload={props.payload} />} />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 3, fill: s.color, stroke: 'none' }}
                />
              ))}
              {highlight
                ? series.map((s) => {
                    const row = data.find((d) => d.label === highlight)
                    const y = row ? Number(row[s.key] ?? 0) : null
                    if (y == null || Number.isNaN(y)) return null
                    return <ReferenceDot key={`${s.key}-h`} x={highlight} y={y} r={3} fill={s.color} stroke="none" />
                  })
                : null}
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </ChartFrame>
  )
}

export function BarCard({
  title,
  tip,
  data,
  series,
  highlight,
  tooltipOnly,
}: {
  title: string
  tip?: string
  data: Array<Record<string, string | number>>
  series: { key: string; color: string; name: string }[]
  highlight?: string
  /** Séries exibidas só no tooltip (ex.: resultado líquido). */
  tooltipOnly?: { key: string; name: string }[]
}) {
  return (
    <ChartFrame title={title} tip={tip}>
      <div className={PLOT_BAR}>
        {hasSeries(data, series.map((s) => s.key)) ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={MARGIN} accessibilityLayer={false}>
              <XAxis dataKey="label" tick={AXIS} tickMargin={4} padding={{ left: 10, right: 10 }} {...AXIS_PROPS} />
              <YAxis width={72} tick={AXIS} tickFormatter={(v) => moneyShort(Number(v))} {...AXIS_PROPS} />
              <Tooltip content={(props) => <ChartTooltip {...props} extra={tooltipOnly} />} cursor={false} isAnimationActive={false} />
              <Legend content={(props) => <ChartLegend payload={props.payload} />} />
              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={s.color}
                  stroke="none"
                  strokeWidth={0}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                  activeBar={false}
                >
                  {data.map((row, i) => (
                    <Cell key={`${s.key}-${i}`} fill={s.color} stroke="none" strokeWidth={0} fillOpacity={!highlight || row.label === highlight ? 1 : 0.4} />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </ChartFrame>
  )
}

export type GastoCategoriaDatum = import('@/domain/reconCategories').GastoCategoriaRow

export function GastosPorCategoriaCard({
  title = 'Saídas por categoria',
  tip,
  rows,
  categoryHref,
}: {
  title?: string
  tip?: string
  rows: GastoCategoriaDatum[]
  categoryHref?: (groupId: string) => string
}) {
  const sorted = [...rows].filter((r) => r.amount > 0).sort((a, b) => b.amount - a.amount)
  const totalAmount = sorted.reduce((s, r) => s + r.amount, 0)
  const totalCount = sorted.reduce((s, r) => s + r.count, 0)
  const max = sorted[0]?.amount ?? 0
  const plotH = 148

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-borda px-4 py-3.5">
        <h2 className="t-h3 flex items-center gap-2">
          <span>{title}</span>
          {tip ? <Tip text={tip} /> : null}
        </h2>
      </div>
      {!sorted.length ? (
        <p className="t-body px-4 py-8 text-texto-secundario">Nenhuma saída no período.</p>
      ) : (
        <>
          <div className="px-3 pb-2 pt-5" aria-hidden={false}>
            <div className="flex h-[148px] items-end justify-center gap-1.5 sm:gap-2 md:gap-2.5">
              {sorted.map((row) => {
                const h = max ? Math.max(36, Math.round((row.amount / max) * plotH)) : 36
                const Icon = row.Icon
                return (
                  <div
                    key={row.id}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end"
                    title={`${row.label}: ${money(-row.amount)}`}
                  >
                    <div
                      className="flex w-full max-w-[52px] flex-col items-center justify-end rounded-t-[10px] shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]"
                      style={{ height: h, backgroundColor: row.color }}
                    >
                      <Icon className="mb-2 shrink-0 text-white" size={18} strokeWidth={2.25} aria-hidden />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex items-end justify-between gap-4 border-t border-borda px-4 py-3.5">
            <div>
              <p className="text-[15px] font-semibold text-texto">Todas as saídas</p>
              <p className="t-apoio text-texto-secundario">{totalCount} lançamentos</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold text-texto">{money(-totalAmount)}</p>
              <p className="t-apoio text-texto-secundario">100%</p>
            </div>
          </div>
          <div className="border-t border-borda bg-superficie-2 px-4 py-2.5">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-faint uppercase">Gastos por categoria</p>
          </div>
          <ul className="divide-y divide-borda">
            {sorted.map((row) => {
              const Icon = row.Icon
              const href = categoryHref?.(row.id)
              const label = href ? (
                <Link to={href} className="truncate text-[14px] font-semibold text-primaria hover:underline">
                  {row.label}
                </Link>
              ) : (
                <p className="truncate text-[14px] font-semibold text-texto">{row.label}</p>
              )
              return (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: row.color }}
                  >
                    <Icon size={17} strokeWidth={2.25} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    {label}
                    <p className="t-apoio text-texto-secundario">
                      {row.count} {row.count === 1 ? 'lançamento' : 'lançamentos'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-texto">{money(-row.amount)}</p>
                    <p className="t-apoio text-texto-secundario">{percent(row.pct, 0)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Card>
  )
}

export function PieCard({
  title,
  tip,
  data,
}: {
  title: string
  tip?: string
  data: { name: string; value: number; color: string }[]
}) {
  return (
    <ChartFrame title={title} tip={tip}>
      <div className={PLOT_PIE}>
        {data.some((d) => d.value) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={MARGIN}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={68}
                stroke="none"
                strokeWidth={0}
                isAnimationActive={false}
                activeShape={false}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} stroke="none" strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={(props) => <ChartTooltip {...props} />} cursor={false} isAnimationActive={false} />
              <Legend content={(props) => <ChartLegend payload={props.payload} />} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </ChartFrame>
  )
}
