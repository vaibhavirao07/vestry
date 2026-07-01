import Link from 'next/link'
import type { OutfitStats } from '@/types/database'

export function OutfitCard({ outfit }: { outfit: OutfitStats }) {
  return (
    <Link href={`/outfits/${outfit.outfit_id}`} className="bg-white rounded-2xl border border-ink/8 px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="font-semibold text-ink truncate">{outfit.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {outfit.occasion && (
            <span className="text-xs font-medium text-accent bg-accent/8 rounded-full px-2.5 py-0.5 shrink-0">
              {outfit.occasion}
            </span>
          )}
          <span className="text-xs text-ink/40">
            worn {outfit.times_worn}×
          </span>
        </div>
      </div>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-4 h-4 text-ink/20 shrink-0"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  )
}
