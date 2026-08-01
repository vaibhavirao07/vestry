'use client'

import Image from 'next/image'
import type { ItemStats } from '@/types/database'

type Props = {
  items: ItemStats[]
  size: 'thumbnail' | 'fullscreen'
  maxItems?: number
}

export function MoodBoardCollage({ items, size, maxItems = 8 }: Props) {
  const validItems = items.filter(item => item.item_id || item.name)
  const displayItems = validItems.slice(0, maxItems)
  const overflow = items.length > maxItems ? items.length - maxItems : 0

  console.log(`MoodBoardCollage [${size}]: received ${items.length} items, valid=${validItems.length}, display=${displayItems.length}, maxItems=${maxItems}`)

  if (items.length === 0) {
    return (
      <div className={`bg-accent/5 rounded-lg flex items-center justify-center ${
        size === 'fullscreen' ? 'w-full aspect-square' : 'w-full h-full'
      }`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-accent/30">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-lg ${
        size === 'fullscreen' ? 'w-full aspect-square' : 'w-full h-full'
      }`}
    >
      {/* Collage container */}
      <div className="absolute inset-0">
        {displayItems.map((item, i) => {
          const seed = (item.item_id ?? item.name ?? String(i)).charCodeAt(0) + i
          const rotation = ((seed % 16) - 8) // -8 to +8 degrees

          // Calculate base size based on item count (auto-sizing for visibility)
          let baseSize: number
          if (displayItems.length <= 2) baseSize = 80
          else if (displayItems.length <= 4) baseSize = 60
          else if (displayItems.length <= 6) baseSize = 45
          else baseSize = 35

          // Apply size variation only in fullscreen mode
          const sizeVariation = size === 'fullscreen'
            ? baseSize + (seed % 20) // ±0-20px variation in fullscreen
            : baseSize // fixed size in thumbnail

          // Tighter offset ranges to keep items contained within bounds
          const offsetRange = size === 'fullscreen' ? 40 : 25
          const xOffset = (seed % (offsetRange * 2)) - offsetRange
          const yOffset = ((seed + 7) % (offsetRange * 2)) - offsetRange
          const zIndex = i + 1

          return (
            <div
              key={item.item_id}
              className="absolute"
              style={{
                width: `${sizeVariation}px`,
                height: `${sizeVariation}px`,
                left: `${50 + xOffset}%`,
                top: `${50 + yOffset}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                zIndex,
              }}
            >
              {item.image_url ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes={`${sizeVariation}px`}
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-lg bg-accent/20 flex items-center justify-center shadow-sm p-1">
                  <p className="text-[10px] text-accent font-medium text-center line-clamp-2 leading-tight">
                    {item.name}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overflow badge */}
      {overflow > 0 && (
        <div className="absolute bottom-2 right-2 z-50 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold shadow-lg">
          +{overflow}
        </div>
      )}
    </div>
  )
}
