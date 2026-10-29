

export function Kv({ items }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[11.5px] text-faint">{item.label}</dt>
          <dd className="t-body mt-1">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
