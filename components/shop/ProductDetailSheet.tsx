'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PlatformRow } from './PlatformRow'
import type { ShopResult, ShopOffer } from '@/types/shop'
import type { SizeRecommendation } from '@/types/profile'

type Props = {
  result: ShopResult | null
  sizeRec: SizeRecommendation | null
  onClose: () => void
}

function computeBadges(offers: ShopOffer[]) {
  if (offers.length < 2) return {}

  const withPrice = offers.filter((o) => o.price != null)
  const withReturns = offers.filter((o) => o.return_days != null)
  const withDelivery = offers.filter((o) => o.delivery_min != null)

  const bestPriceDomain = withPrice.length
    ? withPrice.reduce((a, b) => (a.price! < b.price! ? a : b)).domain
    : null
  const bestReturnsDomain = withReturns.length
    ? withReturns.reduce((a, b) => (a.return_days! > b.return_days! ? a : b)).domain
    : null
  const fastestDomain = withDelivery.length
    ? withDelivery.reduce((a, b) => (a.delivery_min! < b.delivery_min! ? a : b)).domain
    : null

  return { bestPriceDomain, bestReturnsDomain, fastestDomain }
}

export function ProductDetailSheet({ result, sizeRec, onClose }: Props) {
  if (!result) return null

  const { offers, outfit_preview, compatibility_score, estimated_cpw } = result
  const { bestPriceDomain, bestReturnsDomain, fastestDomain } = computeBadges(offers)

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-3xl max-h-[88dvh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-ink/15 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <span className="w-12" />
          <h2 className="text-base font-semibold text-ink">Product Details</h2>
          <button
            onClick={onClose}
            className="text-ink/40 text-sm w-12 text-right"
          >
            Cancel
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 pb-8">
          {/* Product summary row */}
          <div className="flex gap-3 mb-5">
            {result.image_url && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                <Image
                  src={result.image_url}
                  alt={result.name}
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
              </div>
            )}
            <div className="flex flex-col justify-center gap-1 min-w-0">
              <p className="text-sm font-semibold leading-tight line-clamp-2">{result.name}</p>
              {result.brand && (
                <p className="text-xs text-ink/50">{result.brand}</p>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold bg-accent text-white px-2 py-0.5 rounded-full">
                  {compatibility_score}% match
                </span>
                {estimated_cpw != null && (
                  <span className="text-[11px] text-ink/40">${estimated_cpw.toFixed(2)}/wear</span>
                )}
              </div>
            </div>
          </div>

          {/* Pairs with */}
          {outfit_preview.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
                Pairs with
              </p>
              <p className="text-sm text-ink/70 leading-relaxed">
                {outfit_preview.join(', ')}
              </p>
            </div>
          )}

          {/* Your Size */}
          <div className="mb-5">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
              Your Size
            </p>
            {sizeRec ? (
              <div className="flex items-center gap-3 bg-white border border-ink/8 rounded-xl px-3 py-3">
                <span className="text-base font-semibold text-accent shrink-0">{sizeRec.size}</span>
                <p className="text-xs text-ink/60 leading-relaxed">{sizeRec.reason}</p>
              </div>
            ) : (
              <p className="text-xs text-ink/40">
                <Link href="/profile" className="text-accent underline underline-offset-2">
                  Add your sizes in Profile
                </Link>{' '}
                to see a recommendation here.
              </p>
            )}
          </div>

          {/* Where to Buy */}
          <div>
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-3">
              Where to Buy
            </p>

            {offers.length > 0 ? (
              <div>
                {offers.map((offer) => (
                  <PlatformRow
                    key={offer.domain}
                    offer={offer}
                    badges={{
                      price: offer.domain === bestPriceDomain,
                      returns: offer.domain === bestReturnsDomain,
                      delivery: offer.domain === fastestDomain,
                    }}
                  />
                ))}
              </div>
            ) : (
              // No offer data — direct buy via the product's source URL
              <a
                href={result.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm font-semibold text-white bg-accent rounded-2xl py-4"
              >
                Buy now {result.price != null ? `· $${result.price}` : ''}
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
