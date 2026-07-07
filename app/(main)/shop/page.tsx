import { createClient } from '@/lib/supabase/server'
import { ShopView } from '@/components/shop/ShopView'
import { ProfileLink } from '@/components/ui/ProfileLink'
import type { ClosetSummary } from '@/types/shop'
import type { Garment, SizeProfile } from '@/types/profile'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect; queries return empty without a session.
  const [{ data: items }, { data: gaps }, { data: categories }, { data: profile }, { data: brandSizes }] = await Promise.all([
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
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('brand_sizes').select('brand, garment, size'),
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

  const sizeProfile: SizeProfile = {
    measurements: {
      height: profile?.height ?? null,
      weight: profile?.weight ?? null,
      bust: profile?.bust ?? null,
      waist: profile?.waist ?? null,
      hips: profile?.hips ?? null,
      shoe_size: profile?.shoe_size ?? null,
    },
    brandSizes: (brandSizes ?? []).map((bs) => ({
      brand: bs.brand,
      garment: bs.garment as Garment,
      size: bs.size,
    })),
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Smart Shop</h1>
          <p className="text-sm text-ink/50 mt-1">Find pieces that work with what you own</p>
        </div>
        <ProfileLink />
      </header>
      <ShopView closetSummary={closetSummary} sizeProfile={sizeProfile} initialQuery={q ?? null} />
    </div>
  )
}
