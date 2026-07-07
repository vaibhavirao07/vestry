import { createClient } from '@/lib/supabase/server'
import { TrendsView } from '@/components/trends/TrendsView'
import { ProfileLink } from '@/components/ui/ProfileLink'

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
      <header className="px-4 pt-12 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trend Radar</h1>
          <p className="text-sm text-ink/40 mt-1">What's in for SS25</p>
        </div>
        <ProfileLink />
      </header>
      <TrendsView trends={trends ?? []} />
    </div>
  )
}
