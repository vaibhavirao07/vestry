import type { GapAnalysis } from '@/types/database'

export function GapView({ gaps }: { gaps: GapAnalysis[] }) {
  const ranked = gaps.filter((g) => g.gap_score !== null || g.outfit_appearances > 0)

  if (ranked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-8 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-ink/50 text-sm">No gaps yet.</p>
        <p className="text-ink/30 text-xs">Add items and build outfits to see analysis.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-3">
      {gaps.map((gap, i) => {
        const score = gap.gap_score ?? 0
        // Normalise bar width against the highest score in the list
        const maxScore = Math.max(...gaps.map((g) => g.gap_score ?? 0), 1)
        const barPct = Math.round((score / maxScore) * 100)

        return (
          <div key={gap.category_id} className="bg-white rounded-2xl border border-ink/8 px-4 py-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-semibold text-ink/25 w-4 shrink-0">
                  {i + 1}
                </span>
                <p className="font-semibold text-ink truncate">{gap.category_name}</p>
              </div>
              <span className={[
                'text-xs font-medium rounded-full px-2.5 py-0.5 shrink-0',
                score >= 3 ? 'bg-red-50 text-red-500' :
                score >= 1.5 ? 'bg-amber-50 text-amber-600' :
                'bg-ink/5 text-ink/40',
              ].join(' ')}>
                {score >= 3 ? 'High gap' : score >= 1.5 ? 'Medium gap' : 'Low gap'}
              </span>
            </div>

            {/* Bar */}
            <div className="h-1.5 rounded-full bg-ink/6 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${barPct}%` }}
              />
            </div>

            <p className="text-xs text-ink/50">
              {gap.item_count === 0
                ? `No ${gap.category_name.toLowerCase()} in your closet — appears in ${gap.outfit_appearances} outfit${gap.outfit_appearances !== 1 ? 's' : ''}`
                : `${gap.item_count} item${gap.item_count !== 1 ? 's' : ''} · worn across ${gap.outfit_appearances} outfit${gap.outfit_appearances !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        )
      })}
    </div>
  )
}
