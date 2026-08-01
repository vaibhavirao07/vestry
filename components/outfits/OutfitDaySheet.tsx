'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { OutfitStats, ItemStats, Category } from '@/types/database'
import { MoodBoardCollage } from './MoodBoardCollage'
import { DayPickerSheet } from './DayPickerSheet'

type Props = {
  open: boolean
  onClose: () => void
  outfit: OutfitStats & { items: ItemStats[] }
  categories: Category[]
  allItems: ItemStats[]
  onOutfitUpdated: (outfit: OutfitStats & { items: ItemStats[] }) => void
  onOutfitDeleted: () => void
}

export function OutfitDaySheet({
  open,
  onClose,
  outfit,
  categories,
  allItems,
  onOutfitUpdated,
  onOutfitDeleted,
}: Props) {
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  const dateStr = outfit.worn_date
    ? new Date(outfit.worn_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown date'

  async function handleDelete() {
    if (!confirm('Delete this outfit?')) return
    const res = await fetch(`/api/outfits/${outfit.outfit_id}`, { method: 'DELETE' })
    if (res.ok) {
      onOutfitDeleted()
      onClose()
    }
  }

  async function handleSaveEdit(itemIds: string[]) {
    const res = await fetch(`/api/outfits/${outfit.outfit_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedItemIds: itemIds }),
    })
    if (res.ok) {
      const updated = await res.json()
      onOutfitUpdated(updated)
      setEditSheetOpen(false)
    }
  }

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
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-surface rounded-t-3xl transition-transform duration-300 ease-out h-[90vh] ${
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

        {/* Content - Two columns */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex gap-4 h-full">
            {/* Left: Compact collage */}
            <div className="shrink-0 w-40 h-40">
              <MoodBoardCollage items={outfit.items} size="thumbnail" maxItems={8} />
            </div>

            {/* Right: Pieces list */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-ink mb-3">Pieces ({outfit.items.length})</h3>
              <div className="flex flex-col gap-2">
                {outfit.items.map(item => (
                  <div key={item.item_id} className="bg-white rounded-lg p-3 border border-ink/8 flex gap-3">
                    {item.image_url && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-ink/5 shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                      {item.brand && (
                        <p className="text-xs text-ink/50 truncate">{item.brand}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-ink/8 px-4 py-4 flex flex-col gap-2">
          <button
            onClick={() => setEditSheetOpen(true)}
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

      {/* Edit picker sheet */}
      <DayPickerSheet
        open={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        selectedDate={outfit.worn_date ? new Date(outfit.worn_date) : null}
        categories={categories}
        allItems={allItems}
        onSave={handleSaveEdit}
        editingOutfitId={outfit.outfit_id}
        existingItemIds={outfit.items.map(i => i.item_id)}
      />
    </>
  )
}
