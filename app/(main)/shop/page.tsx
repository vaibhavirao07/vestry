import { createClient } from '@/lib/supabase/server'
import { ShopView } from '@/components/shop/ShopView'
import type { ClosetSummary } from '@/types/shop'

export default async function ShopPage() {
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect; queries return empty without a session.
  const [{ data: items }, { data: gaps }, { data: categories }] = await Promise.all([
    supabase
      .from('item_stats')
      .select('name, colour, times_worn, cost_per_wear, category_id')
      .order('times_worn', { ascending: false }),
    supabase
      .from('gap_analysis')
      .select('category_name, gap_score')
      .order('gap_score', { ascending: false })
      .limit(5),
    supabase.from('categories').select('id, name'),
  ])

  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]))

  const cpwItems = (items ?? []).filter((i) => i.cost_per_wear != null)
  const avgCostPerWear =
    cpwItems.length > 0
      ? cpwItems.reduce((sum, i) => sum + (i.cost_per_wear ?? 0), 0) / cpwItems.length
      : null

  const closetSummary: ClosetSummary = {
    items: (items ?? []).map((i) => ({
      name: i.name,
      colour: i.colour,
      times_worn: i.times_worn,
      category_name: i.category_id ? (catMap[i.category_id] ?? null) : null,
    })),
    topGaps: (gaps ?? []).map((g) => ({
      category_name: g.category_name,
      gap_score: g.gap_score,
    })),
    avgCostPerWear,
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Smart Shop</h1>
        <p className="text-sm text-ink/50 mt-1">Find pieces that work with what you own</p>
      </header>
      <ShopView closetSummary={closetSummary} />
    </div>
  )
}
