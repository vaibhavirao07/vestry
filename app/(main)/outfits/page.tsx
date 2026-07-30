import { createClient } from '@/lib/supabase/server'
import { OutfitCalendar } from '@/components/outfits/OutfitCalendar'

export const metadata = { title: 'Outfits — Vestry' }

export default async function OutfitsPage() {
  const supabase = await createClient()
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  const { data: outfits } = await supabase
    .from('outfits')
    .select('*')
    .gte('worn_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lte('worn_date', `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`)

  // Map to OutfitStats format for component
  const mappedOutfits = (outfits ?? []).map(o => ({
    outfit_id: o.id,
    user_id: o.user_id,
    name: o.name,
    occasion: o.occasion,
    created_at: o.created_at,
    times_worn: 0,
    photo_url: o.photo_url,
    worn_date: o.worn_date,
  }))

  return (
    <div className="flex flex-col h-full">
      <OutfitCalendar initialOutfits={mappedOutfits} />
    </div>
  )
}
