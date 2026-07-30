'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLogWear } from '@/hooks/useLogWear'
import type { OutfitStats, ItemStats } from '@/types/database'

type Props = {
  outfit: OutfitStats
  items: ItemStats[]
}

export function OutfitDetail({ outfit, items }: Props) {
  const router = useRouter()
  const { timesWorn, wornToday, isLoading, markAsWorn } = useLogWear(
    outfit.outfit_id,
    outfit.times_worn ?? 0,
  )

  async function handleDelete() {
    if (!confirm('Delete this outfit?')) return
    const res = await fetch(`/api/outfits/${outfit.outfit_id}`, { method: 'DELETE' })
    if (res.ok) router.push('/outfits')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-start gap-3">
        <Link href="/outfits" className="mt-0.5 text-ink/40 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink leading-tight">
            {outfit.name}
          </h1>
          <div className="flex items-center gap-2.5">
            {outfit.occasion && (
              <span className="text-xs font-medium text-accent bg-accent/8 rounded-full px-2.5 py-0.5">
                {outfit.occasion}
              </span>
            )}
            <span className="text-xs text-ink/40">worn {timesWorn}×</span>
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-36">
        {items.length === 0 ? (
          <p className="text-sm text-ink/40 text-center py-12">No items in this outfit.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <div key={item.item_id} className="rounded-xl overflow-hidden border border-ink/8 bg-white">
                <div className="aspect-square bg-ink/5 relative">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className="w-8 h-8 text-ink/20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 20H17.5M3 6.5C3 5.12 4.12 4 5.5 4h4.25l1.5 2h.5l1.5-2H17.5C18.88 4 20 5.12 20 6.5v9A4.5 4.5 0 0115.5 20h-7A4.5 4.5 0 014 15.5v-9z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-medium text-ink truncate">{item.name}</p>
                  {item.brand && (
                    <p className="text-[10px] text-ink/40 truncate">{item.brand}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mark as worn CTA */}
      <div className="fixed inset-x-0 bottom-0 px-4 pb-8 pt-4 bg-gradient-to-t from-surface via-surface/95 to-transparent flex flex-col gap-3">
        <button
          onClick={markAsWorn}
          disabled={wornToday || isLoading}
          className="w-full rounded-full py-4 text-sm font-semibold transition-all disabled:opacity-60
            bg-accent text-white disabled:bg-ink/10 disabled:text-ink/40"
        >
          {wornToday ? 'Worn today ✓' : isLoading ? 'Logging…' : 'Mark as worn'}
        </button>
        <button
          onClick={handleDelete}
          className="w-full rounded-full py-4 text-sm font-semibold transition-all
            bg-red-50 border border-red-100 text-red-600 hover:bg-red-100"
        >
          Delete outfit
        </button>
      </div>
    </div>
  )
}
