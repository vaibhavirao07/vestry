import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OutfitDetail } from '@/components/outfits/OutfitDetail'

type Props = { params: Promise<{ id: string }> }

export default async function OutfitDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect.

  const [{ data: outfit }, { data: outfitItems }] = await Promise.all([
    supabase.from('outfit_stats').select('*').eq('outfit_id', id).single(),
    supabase.from('outfit_items').select('item_id').eq('outfit_id', id),
  ])

  if (!outfit) notFound()

  const itemIds = (outfitItems ?? []).map((r) => r.item_id)

  const { data: items } = itemIds.length > 0
    ? await supabase.from('item_stats').select('*').in('item_id', itemIds)
    : { data: [] }

  return <OutfitDetail outfit={outfit} items={items ?? []} />
}
