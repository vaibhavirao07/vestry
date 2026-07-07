'use client'

import Image from 'next/image'
import type { InspoPost } from '@/types/database'
import type { InspoGarment } from '@/types/inspo'

export function garmentsOf(post: InspoPost): InspoGarment[] {
  return Array.isArray(post.garments) ? (post.garments as InspoGarment[]) : []
}

export function InspoCard({ post, onTap }: { post: InspoPost; onTap: (post: InspoPost) => void }) {
  const garments = garmentsOf(post)
  const ownedCount = garments.filter((g) => g.owned_item_name != null).length

  return (
    <button
      onClick={() => onTap(post)}
      className="bg-white rounded-2xl border border-ink/8 overflow-hidden flex flex-col text-left w-full active:opacity-70"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <Image
          src={post.image_url}
          alt={post.aesthetic ?? 'Outfit inspiration'}
          fill
          className="object-cover object-top"
          unoptimized
        />
      </div>
      <div className="px-3 py-2.5 flex flex-col gap-1">
        {post.aesthetic && (
          <p className="text-xs font-semibold capitalize leading-tight line-clamp-1">
            {post.aesthetic}
          </p>
        )}
        {garments.length > 0 && (
          <p className="text-[11px] text-ink/40">
            {ownedCount} of {garments.length} owned
          </p>
        )}
      </div>
    </button>
  )
}
