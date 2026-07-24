import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: outfits, error } = await supabase
    .from('outfit_items')
    .select('outfit_id')
    .eq('item_id', itemId)
    .then(async (res) => {
      if (res.error || !res.data?.length) return { data: [], error: res.error }
      const outfitIds = res.data.map(oi => oi.outfit_id)
      return supabase
        .from('outfits')
        .select('id, name')
        .eq('user_id', user.id)
        .in('id', outfitIds)
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const outfitNames = (outfits ?? []).map((o: any) => o.name)
  return NextResponse.json({ outfitNames })
}
