import { createClient } from '@/lib/supabase/server'
import { GapView } from '@/components/gaps/GapView'

export const metadata = { title: 'Gaps — Vestry' }

export default async function GapsPage() {
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect; queries return empty without a session.

  const { data: gaps } = await supabase
    .from('gap_analysis')
    .select('*')
    .order('gap_score', { ascending: false, nullsFirst: false })

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Gap Analysis</h1>
        <p className="text-sm text-ink/40 mt-1">Categories you wear most but own least</p>
      </header>
      <GapView gaps={gaps ?? []} />
    </div>
  )
}
