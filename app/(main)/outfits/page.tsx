import { createClient } from '@/lib/supabase/server'
import { OutfitCalendar } from '@/components/outfits/OutfitCalendar'
import { ProfileLink } from '@/components/ui/ProfileLink'

export const metadata = { title: 'Outfits — Vestry' }

export default async function OutfitsPage() {
  const supabase = await createClient()
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  const [{ data: outfits }, { data: categories }, { data: items }] = await Promise.all([
    supabase
      .from('outfits')
      .select('*, outfit_items(items(*))')
      .gte('worn_date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lte('worn_date', `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`),
    supabase.from('categories').select('*').order('name'),
    supabase.from('item_stats').select('*').order('name'),
  ])

  // Map outfits with items
  const mappedOutfits = (outfits ?? []).map((o: any) => ({
    outfit_id: o.id,
    user_id: o.user_id,
    name: o.name,
    occasion: o.occasion,
    created_at: o.created_at,
    times_worn: 0,
    photo_url: o.photo_url,
    worn_date: o.worn_date,
    items: o.outfit_items?.map((oi: any) => oi.items).filter(Boolean) || [],
  }))

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Outfits</h1>
        <ProfileLink />
      </header>
      <OutfitCalendar
        initialOutfits={mappedOutfits}
        categories={categories ?? []}
        allItems={items ?? []}
      />
    </div>
  )
}
