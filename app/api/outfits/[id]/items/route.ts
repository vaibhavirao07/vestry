import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify outfit ownership
  const { data: outfit } = await supabase
    .from('outfits')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!outfit || outfit.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch items for this outfit
  const { data: items, error } = await supabase
    .from('outfit_items')
    .select('items(id, user_id, name, brand, colour, price, image_url, category_id)')
    .eq('outfit_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const flattened = items?.map((oi: any) => oi.items).filter(Boolean) || []
  return NextResponse.json({ items: flattened })
}
