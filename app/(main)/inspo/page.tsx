import { createClient } from '@/lib/supabase/server'
import { InspoView } from '@/components/inspo/InspoView'
import { ProfileLink } from '@/components/ui/ProfileLink'
import type { ClosetItemLite } from '@/types/inspo'

export const metadata = { title: 'Inspo — Vestry' }

export default async function InspoPage() {
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect; queries return empty without a session.
  const [{ data: posts }, { data: items }, { data: categories }] = await Promise.all([
    supabase.from('inspo_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('item_stats').select('name, colour, category_id'),
    supabase.from('categories').select('id, name'),
  ])

  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]))
  const closetItems: ClosetItemLite[] = (items ?? []).map((i) => ({
    name: i.name,
    colour: i.colour,
    category_name: i.category_id ? (catMap[i.category_id] ?? null) : null,
  }))

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inspo</h1>
          <p className="text-sm text-ink/40 mt-1">Your outfit mood board, matched to your closet</p>
        </div>
        <ProfileLink />
      </header>
      <InspoView initialPosts={posts ?? []} closetItems={closetItems} />
    </div>
  )
}
