'use client'

import Image from 'next/image'
import { badgeLabel } from '@/lib/sizes'
import type { ShopResult } from '@/types/shop'
import type { SizeRecommendation } from '@/types/profile'

type Props = {
  result: ShopResult
  sizeRec: SizeRecommendation | null
  onTap: (result: ShopResult) => void
}

export function ShopResultCard({ result, sizeRec, onTap }: Props) {
  return (
    <button
      onClick={() => {
        if (result.offers.length >= 2) {
          onTap(result)
        } else {
          window.open(result.source_url, '_blank', 'noopener,noreferrer')
        }
      }}
      className="bg-white rounded-xl border border-ink/8 overflow-hidden flex flex-col text-left w-full active:opacity-70"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {result.image_url ? (
          <Image
            src={result.image_url}
            alt={result.name}
            fill
            className="object-cover object-top"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-stone-100" />
        )}
        <span className="absolute top-1.5 right-1.5 bg-accent text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-tight">
          {result.compatibility_score}%
        </span>
        {sizeRec && (
          <span className="absolute bottom-1.5 left-1.5 bg-white/90 text-ink text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-tight border border-ink/8">
            {badgeLabel(sizeRec)}
          </span>
        )}
      </div>

      <div className="px-2 py-1.5 flex flex-col gap-0.5">
        <p className="text-[11px] font-medium leading-tight line-clamp-1">{result.name}</p>
        <div className="flex items-center justify-between gap-1">
          {result.price != null && (
            <span className="text-[11px] font-semibold">${result.price}</span>
          )}
          {result.estimated_cpw != null && (
            <span className="text-[9px] text-ink/40 ml-auto">${result.estimated_cpw.toFixed(2)}/wear</span>
          )}
        </div>
      </div>
    </button>
  )
}
