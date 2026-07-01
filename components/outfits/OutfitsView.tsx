'use client'

import { useState } from 'react'
import { OutfitCard } from './OutfitCard'
import { BuildOutfitDrawer } from './BuildOutfitDrawer'
import type { OutfitStats, ItemStats } from '@/types/database'

type Props = {
  initialOutfits: OutfitStats[]
  items: ItemStats[]
}

export function OutfitsView({ initialOutfits, items }: Props) {
  const [outfits, setOutfits] = useState<OutfitStats[]>(initialOutfits)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleSaved(outfit: OutfitStats) {
    setOutfits((prev) => [outfit, ...prev])
  }

  return (
    <div className="flex-1 overflow-y-auto relative">
      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 px-8 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-accent">
              <rect x="3" y="3" width="8" height="8" rx="2" />
              <rect x="13" y="3" width="8" height="8" rx="2" />
              <rect x="3" y="13" width="8" height="8" rx="2" />
              <rect x="13" y="13" width="8" height="8" rx="2" />
            </svg>
          </div>
          <p className="text-ink/50 text-sm">No outfits yet.</p>
          <p className="text-ink/30 text-xs">Tap + to build your first outfit.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-24">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.outfit_id} outfit={outfit} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Build outfit"
        className="fixed bottom-24 right-4 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center z-30 transition-transform active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <BuildOutfitDrawer
        open={drawerOpen}
        items={items}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
