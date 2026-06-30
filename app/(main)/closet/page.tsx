import { createClient } from '@/lib/supabase/server'
import { ClosetView } from '@/components/closet/ClosetView'

export const metadata = { title: 'Closet — Vestry' }

export default async function ClosetPage() {
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: skip auth redirect; queries return empty without a session.
  // Re-enable by restoring: const { data: { user } } = await supabase.auth.getUser()
  //                         if (!user) redirect('/auth/login')

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase.from('item_stats').select('*'),
    supabase.from('categories').select('*').order('name'),
  ])

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Vestry</h1>
      </header>
      <ClosetView
        initialItems={items ?? []}
        categories={categories ?? []}
      />
    </div>
  )
}
