'use client'

import Image from 'next/image'
import type { ShopResult } from '@/types/shop'

export function ShopResultCard({ result }: { result: ShopResult }) {
  const score = result.compatibility_score
  const barColor =
    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-400' : 'bg-ink/20'

  return (
    <div className="bg-white rounded-2xl border border-ink/8 overflow-hidden">
      {result.image_url && (
        <div className="relative aspect-square bg-stone-50">
          <Image
            src={result.image_url}
            alt={result.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-medium text-sm leading-snug">{result.name}</p>
          {result.brand && (
            <p className="text-xs text-ink/50 mt-0.5">{result.brand}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {result.price != null && (
            <span className="text-sm font-semibold">${result.price}</span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <div className="h-1.5 w-20 bg-ink/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs text-ink/50 tabular-nums w-8">{score}%</span>
          </div>
        </div>

        {result.outfit_preview.length > 0 && (
          <p className="text-xs text-ink/60 leading-relaxed">
            <span className="font-medium text-ink/80">Pairs with: </span>
            {result.outfit_preview.join(', ')}
          </p>
        )}

        {result.estimated_cpw != null && (
          <p className="text-xs font-medium text-accent">
            Est. ${result.estimated_cpw.toFixed(2)}/wear
          </p>
        )}

        {result.source_url && (
          <a
            href={result.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-center text-xs font-semibold text-white bg-accent rounded-xl py-2.5"
          >
            Buy →
          </a>
        )}
      </div>
    </div>
  )
}
