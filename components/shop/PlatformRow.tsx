'use client'

import type { ShopOffer } from '@/types/shop'

type Badges = {
  price?: boolean
  returns?: boolean
  delivery?: boolean
}

export function PlatformRow({ offer, badges }: { offer: ShopOffer; badges: Badges }) {
  const hasBadge = badges.price || badges.returns || badges.delivery

  return (
    <div className="flex items-center gap-3 py-3 border-b border-ink/6 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-ink truncate">{offer.platform}</span>
          {hasBadge && (
            <div className="flex gap-1 flex-wrap">
              {badges.price && (
                <span className="text-[9px] font-semibold bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                  Best price
                </span>
              )}
              {badges.delivery && (
                <span className="text-[9px] font-semibold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                  Fastest
                </span>
              )}
              {badges.returns && (
                <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">
                  Best returns
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-ink/40">
            {offer.delivery ?? 'Check site'}
          </span>
          <span className="text-[11px] text-ink/40">
            {offer.return_days != null ? `${offer.return_days}-day returns` : 'Returns vary'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          {offer.price != null && (
            <span className="text-sm font-semibold">${offer.price}</span>
          )}
          {offer.compare_at_price != null && offer.compare_at_price > (offer.price ?? 0) && (
            <span className="text-[10px] text-ink/30 line-through ml-1.5">
              ${offer.compare_at_price}
            </span>
          )}
        </div>
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-accent border border-accent/30 rounded-full px-3 py-1.5 shrink-0"
        >
          Buy
        </a>
      </div>
    </div>
  )
}
