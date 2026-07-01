import { createClient } from '@/lib/supabase/server'
import { TrendsView } from '@/components/trends/TrendsView'

export const metadata = { title: 'Trends — Vestry' }

export default async function TrendsPage() {
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect; trends table is publicly readable.

  const { data: trends } = await supabase
    .from('trends')
    .select('*')
    .order('category')
    .order('name')

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Trend Radar</h1>
        <p className="text-sm text-ink/40 mt-1">What's in for SS25</p>
      </header>
      <TrendsView trends={trends ?? []} />
    </div>
  )
}
