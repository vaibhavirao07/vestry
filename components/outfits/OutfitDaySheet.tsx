'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { OutfitStats, ItemStats } from '@/types/database'

type Props = {
  open: boolean
  onClose: () => void
  outfit: OutfitStats
  onOutfitDeleted: () => void
}

export function OutfitDaySheet({ open, onClose, outfit, onOutfitDeleted }: Props) {
  const [items, setItems] = useState<ItemStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch outfit items on open
  if (open && isLoading) {
    fetch(`/api/outfits/${outfit.outfit_id}/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }

  async function handleDelete() {
    if (!confirm('Delete this outfit?')) return
    const res = await fetch(`/api/outfits/${outfit.outfit_id}`, { method: 'DELETE' })
    if (res.ok) {
      onOutfitDeleted()
      onClose()
    }
  }

  const dateStr = outfit.worn_date
    ? new Date(outfit.worn_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown date'

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-surface rounded-t-3xl transition-transform duration-300 ease-out max-h-[90vh] ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-ink/8">
          <h2 className="text-base font-semibold text-ink">{dateStr}</h2>
          <button onClick={onClose} className="p-1 text-ink/40 hover:text-ink transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
          {/* Photo */}
          {outfit.photo_url && (
            <div className="w-full rounded-xl overflow-hidden bg-ink/5 mb-4">
              <img src={outfit.photo_url} alt="Outfit" className="w-full h-auto" />
            </div>
          )}

          {/* Pieces */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Pieces worn</h3>
            {isLoading ? (
              <p className="text-sm text-ink/40">Loading…</p>
            ) : items.length > 0 ? (
              <div className="flex flex-col gap-2">
                {items.map(item => (
                  <div key={item.item_id} className="bg-white rounded-lg p-3 border border-ink/8 flex gap-3">
                    {item.image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-ink/5 shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{item.name}</p>
                      {item.brand && (
                        <p className="text-xs text-ink/50">{item.brand}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink/40">No items logged for this outfit</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-ink/8 px-4 py-4 flex flex-col gap-2">
          <button
            onClick={() => {/* TODO: edit pieces */}}
            className="w-full rounded-full py-3 text-sm font-semibold transition-all
              bg-ink/5 text-ink hover:bg-ink/10"
          >
            Edit pieces
          </button>
          <button
            onClick={handleDelete}
            className="w-full rounded-full py-3 text-sm font-semibold transition-all
              bg-red-50 border border-red-100 text-red-600 hover:bg-red-100"
          >
            Delete outfit
          </button>
        </div>
      </div>
    </>
  )
}
