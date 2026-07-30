'use client'

import { useEffect, useState } from 'react'
import type { ItemStats } from '@/types/database'

function formatCostPerWear(cpw: number | null): string {
  if (cpw === null) return '∞'
  return `$${cpw.toFixed(2)}`
}

interface ItemDetailSheetProps {
  item: ItemStats | null
  onClose: () => void
  onEdit: (item: ItemStats) => void
  onDelete: (item: ItemStats) => void
}

export function ItemDetailSheet({ item, onClose, onEdit, onDelete }: ItemDetailSheetProps) {
  const [outfits, setOutfits] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item) return

    async function fetchOutfits() {
      if (!item) return
      setLoading(true)
      try {
        const res = await fetch(`/api/items/${item.item_id}/outfits`)
        if (res.ok) {
          const data = await res.json()
          setOutfits(data.outfitNames || [])
        }
      } catch (err) {
        console.error('Failed to fetch outfit names:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOutfits()
  }, [item?.item_id])

  if (!item) return null

  function handleDelete() {
    if (!item) return
    if (confirm(`Delete "${item.name}" from your closet?`)) {
      onDelete(item)
    }
  }

  return (
    <>
      {/* Overlay */}
      {item && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ${
          item ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl px-4 py-3 flex justify-between items-center border-b border-ink/8">
          <h2 className="text-sm font-semibold text-ink">Item details</h2>
          <button
            onClick={onClose}
            className="text-xl text-ink/40 hover:text-ink/60"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4 pb-20">
          {/* Image */}
          <div className="w-full aspect-square bg-accent/8 rounded-2xl overflow-hidden">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  className="w-12 h-12 text-accent/30"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3C10.34 3 9 4.34 9 6c0 1.12.6 2.1 1.5 2.63V9H6a1 1 0 00-1 1v1h14v-1a1 1 0 00-1-1h-4.5v-.37C14.4 8.1 15 7.12 15 6c0-1.66-1.34-3-3-3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12l-2 8h18l-2-8H5z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-ink">{item.name}</h3>
            {item.brand && (
              <p className="text-sm text-ink/50">{item.brand}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-3">
              <p className="text-xs text-ink/50">Cost per wear</p>
              <p className="text-lg font-semibold text-ink mt-1">
                {formatCostPerWear(item.cost_per_wear)}
              </p>
            </div>
            <div className="bg-surface rounded-xl p-3">
              <p className="text-xs text-ink/50">Times worn</p>
              <p className="text-lg font-semibold text-ink mt-1">{item.times_worn || 0}</p>
            </div>
          </div>

          {/* Outfits */}
          {!loading && outfits.length > 0 && (
            <div>
              <p className="text-xs font-medium text-ink/50 uppercase mb-2">Appears in</p>
              <div className="flex flex-col gap-2">
                {outfits.map((name) => (
                  <div
                    key={name}
                    className="bg-surface rounded-xl px-3 py-2.5 text-sm text-ink"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                onEdit(item)
                onClose()
              }}
              className="flex-1 bg-accent text-white rounded-xl py-3 text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-50 border border-red-100 text-red-600 rounded-xl py-3 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
