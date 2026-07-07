import { createClient } from '@/lib/supabase/server'
import { OutfitsView } from '@/components/outfits/OutfitsView'
import { ProfileLink } from '@/components/ui/ProfileLink'

export const metadata = { title: 'Outfits — Vestry' }

export default async function OutfitsPage() {
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect; queries return empty without a session.

  const [{ data: outfits }, { data: items }] = await Promise.all([
    supabase.from('outfit_stats').select('*').order('created_at', { ascending: false }),
    supabase.from('item_stats').select('*').order('name'),
  ])

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Outfits</h1>
        <ProfileLink />
      </header>
      <OutfitsView
        initialOutfits={outfits ?? []}
        items={items ?? []}
      />
    </div>
  )
}
