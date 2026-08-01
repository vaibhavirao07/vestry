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
          const sizeVariation = size === 'fullscreen'
            ? 60 + (seed % 61) // 60-120px
            : 20 + (seed % 21) // 20-40px
          const xOffset = (seed % 60) - 30 // -30 to +30%
          const yOffset = ((seed + 7) % 60) - 30 // -30 to +30%
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
