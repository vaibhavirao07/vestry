'use client'

import { useState } from 'react'
import { InspoCard } from './InspoCard'
import { InspoDetailSheet } from './InspoDetailSheet'
import { AddInspoDrawer } from './AddInspoDrawer'
import { useAddInspo } from '@/hooks/useAddInspo'
import type { InspoPost } from '@/types/database'
import type { ClosetItemLite } from '@/types/inspo'

export function InspoView({
  initialPosts,
  closetItems,
}: {
  initialPosts: InspoPost[]
  closetItems: ClosetItemLite[]
}) {
  const [posts, setPosts] = useState<InspoPost[]>(initialPosts)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<InspoPost | null>(null)
  const { removeInspo } = useAddInspo()

  async function handleDelete(post: InspoPost) {
    setSelected(null)
    const ok = await removeInspo(post)
    if (ok) setPosts((prev) => prev.filter((p) => p.id !== post.id))
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto pb-4 relative">
      {posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-ink/20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
          <p className="text-sm text-ink/50 leading-relaxed max-w-xs">
            Save outfit inspiration from TikTok, Pinterest or screenshots — Claude breaks down the
            look and shows what you already own.
          </p>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-3">
          {posts.map((post) => (
            <InspoCard key={post.id} post={post} onTap={setSelected} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Add inspo"
        className="fixed bottom-24 right-4 w-14 h-14 bg-accent text-white text-2xl font-light rounded-full shadow-lg flex items-center justify-center z-30 transition-transform active:scale-95"
      >
        +
      </button>

      <AddInspoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closetItems={closetItems}
        onAdded={(post) => setPosts((prev) => [post, ...prev])}
      />
      <InspoDetailSheet
        post={selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}
