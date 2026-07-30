'use client'

import { useState, useEffect } from 'react'
import type { ItemStats, Category } from '@/types/database'

type Props = {
  open: boolean
  onClose: () => void
  selectedDate: Date | null
  categories: Category[]
  allItems: ItemStats[]
  onSave: (itemIds: string[]) => Promise<void>
  editingOutfitId?: string
  existingItemIds?: string[]
}

export function DayPickerSheet({
  open,
  onClose,
  selectedDate,
  categories,
  allItems,
  onSave,
  editingOutfitId,
  existingItemIds = [],
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(existingItemIds))
  const [isSaving, setIsSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id ?? null
  )

  const dateStr = selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Group items by category
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = allItems.filter(item => item.category_id === cat.id)
    return acc
  }, {} as Record<string, ItemStats[]>)

  function toggleItem(itemId: string) {
    const newSet = new Set(selectedIds)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
    setSelectedIds(newSet)
  }

  async function handleSave() {
    if (selectedIds.size === 0) return
    setIsSaving(true)
    try {
      await onSave(Array.from(selectedIds))
    } finally {
      setIsSaving(false)
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
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-surface rounded-t-3xl transition-transform duration-300 ease-out max-h-[88vh] ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-ink/8">
          <div>
            <h2 className="text-base font-semibold text-ink">Select pieces</h2>
            <p className="text-xs text-ink/50">{dateStr}</p>
          </div>
          <button onClick={onClose} className="p-1 text-ink/40 hover:text-ink transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
          {/* Category tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-accent text-white'
                    : 'bg-ink/5 text-ink hover:bg-ink/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items grid for active category */}
          {activeCategory && (
            <div>
              <div className="grid grid-cols-2 gap-3">
                {(itemsByCategory[activeCategory] || []).map(item => (
                  <button
                    key={item.item_id}
                    onClick={() => toggleItem(item.item_id)}
                    className={`rounded-lg border-2 transition-all overflow-hidden ${
                      selectedIds.has(item.item_id)
                        ? 'border-accent bg-accent/5'
                        : 'border-ink/8 hover:border-ink/20'
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-square bg-ink/5 relative overflow-hidden">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent/10">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className="w-6 h-6 text-accent/30">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                          </svg>
                        </div>
                      )}
                      {/* Selection checkmark */}
                      {selectedIds.has(item.item_id) && (
                        <div className="absolute inset-0 bg-accent/30 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-ink truncate">{item.name}</p>
                      {item.brand && (
                        <p className="text-[10px] text-ink/50 truncate">{item.brand}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {(itemsByCategory[activeCategory] || []).length === 0 && (
                <p className="text-sm text-ink/40 text-center py-8">No items in this category</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-ink/8 px-4 py-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-3 text-sm font-semibold transition-all
              bg-ink/5 text-ink hover:bg-ink/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || selectedIds.size === 0}
            className="flex-1 rounded-full py-3 text-sm font-semibold transition-all
              bg-accent text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : `Save (${selectedIds.size})`}
          </button>
        </div>
      </div>
    </>
  )
}
