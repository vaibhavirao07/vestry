'use client'

import Image from 'next/image'
import type { ItemStats } from '@/types/database'

type Props = {
  items: ItemStats[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
}

export function ItemPickerGrid({ items, selectedIds, onToggle }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2">
        <p className="text-ink/40 text-sm">No items in your closet yet.</p>
        <p className="text-ink/30 text-xs">Add items first, then build outfits.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
      {items.map((item) => {
        const selected = selectedIds.has(item.item_id)
        return (
          <button
            key={item.item_id}
            onClick={() => onToggle(item.item_id)}
            className={[
              'relative rounded-xl overflow-hidden border-2 transition-all text-left',
              selected ? 'border-accent ring-2 ring-accent/20' : 'border-transparent',
            ].join(' ')}
          >
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
              {selected && (
                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-ink truncate">{item.name}</p>
              {item.brand && <p className="text-[10px] text-ink/40 truncate">{item.brand}</p>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
