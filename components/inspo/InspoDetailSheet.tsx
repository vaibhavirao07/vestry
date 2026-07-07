'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { InspoPost } from '@/types/database'
import { garmentsOf } from './InspoCard'

type Props = {
  post: InspoPost | null
  onClose: () => void
  onDelete: (post: InspoPost) => void
}

export function InspoDetailSheet({ post, onClose, onDelete }: Props) {
  if (!post) return null
  const garments = garmentsOf(post)

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-3xl max-h-[88dvh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-ink/15 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <button onClick={() => onDelete(post)} className="text-red-500/70 text-sm w-14 text-left">
            Delete
          </button>
          <h2 className="text-base font-semibold text-ink">Inspo</h2>
          <button onClick={onClose} className="text-ink/40 text-sm w-14 text-right">
            Close
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-8">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 mb-4">
            <Image
              src={post.image_url}
              alt={post.aesthetic ?? 'Outfit inspiration'}
              fill
              className="object-cover object-top"
              unoptimized
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-5">
            {post.aesthetic && (
              <span className="text-xs font-semibold bg-accent text-white px-2.5 py-1 rounded-full capitalize">
                {post.aesthetic}
              </span>
            )}
            {post.occasion && (
              <span className="text-xs text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full">
                {post.occasion}
              </span>
            )}
            {post.palette.map((colour) => (
              <span key={colour} className="text-[11px] text-ink/40 bg-white border border-ink/8 px-2 py-1 rounded-full capitalize">
                {colour}
              </span>
            ))}
          </div>

          {garments.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-2">
                The look
              </p>
              <div className="flex flex-col gap-2">
                {garments.map((g, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-ink/8 rounded-xl px-3 py-2.5">
                    <span
                      className={`text-sm shrink-0 ${g.owned_item_name ? 'text-green-600' : 'text-ink/25'}`}
                    >
                      {g.owned_item_name ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight capitalize line-clamp-1">{g.name}</p>
                      {g.owned_item_name ? (
                        <p className="text-[11px] text-green-600/80 line-clamp-1">
                          You own: {g.owned_item_name}
                        </p>
                      ) : (
                        <p className="text-[11px] text-ink/40">Not in your closet</p>
                      )}
                    </div>
                    {!g.owned_item_name && (
                      <Link
                        href={`/shop?q=${encodeURIComponent(g.name)}`}
                        className="text-xs font-semibold text-accent shrink-0"
                      >
                        Find it →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.source_url && (
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink/40 underline underline-offset-2"
            >
              View original post
            </a>
          )}
        </div>
      </div>
    </>
  )
}
