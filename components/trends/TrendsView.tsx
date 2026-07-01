import type { Trend } from '@/types/database'

export function TrendsView({ trends }: { trends: Trend[] }) {
  if (trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ink/40 text-sm">No trends loaded.</p>
      </div>
    )
  }

  // Group by category, preserving sort order
  const grouped = trends.reduce<Record<string, Trend[]>>((acc, trend) => {
    ;(acc[trend.category] ??= []).push(trend)
    return acc
  }, {})

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-6">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h2 className="text-xs font-semibold text-ink/40 uppercase tracking-widest mb-3">
            {category}
          </h2>
          <div className="flex flex-col gap-2">
            {items.map((trend) => (
              <div
                key={trend.id}
                className="bg-white rounded-2xl border border-ink/8 px-4 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="font-semibold text-ink truncate">{trend.name}</p>
                  {trend.brand && (
                    <p className="text-xs text-ink/40 truncate">{trend.brand}</p>
                  )}
                </div>
                {trend.season && (
                  <span className="text-xs font-medium text-accent bg-accent/8 rounded-full px-2.5 py-0.5 shrink-0">
                    {trend.season}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
