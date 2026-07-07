import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/ProfileView'
import type { BrandSize } from '@/types/database'

export default async function ProfilePage() {
  const supabase = await createClient()
  // TEMPORARY — DO NOT SHIP: no auth redirect; queries return empty without a session.
  const [{ data: profile }, { data: brandSizes }] = await Promise.all([
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('brand_sizes').select('*').order('brand'),
  ])

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-ink/40 mt-1">Your measurements power size recommendations in Smart Shop</p>
      </header>
      <div className="flex-1 overflow-y-auto">
        <ProfileView
          initialProfile={profile ?? null}
          initialBrandSizes={(brandSizes ?? []) as BrandSize[]}
        />
      </div>
    </div>
  )
}
