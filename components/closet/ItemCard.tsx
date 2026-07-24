import Image from 'next/image'
import type { ItemStats } from '@/types/database'

function formatCostPerWear(cpw: number | null): string {
  if (cpw === null) return '∞ /wear'
  return `$${cpw.toFixed(2)}/wear`
}

interface ItemCardProps {
  item: ItemStats
  onTap?: (item: ItemStats) => void
}

export function ItemCard({ item, onTap }: ItemCardProps) {
  return (
    <div
      onClick={() => onTap?.(item)}
      className="flex flex-col rounded-2xl overflow-hidden bg-white border border-ink/8 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="aspect-square relative bg-accent/8">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 16vw"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              className="w-10 h-10 text-accent/30"
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

      <div className="p-2 flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-ink leading-tight truncate">{item.name}</p>
        {item.brand && (
          <p className="text-[10px] text-ink/40 truncate">{item.brand}</p>
        )}
      </div>
    </div>
  )
}
