import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams: params } = new URL(request.url)
  const year = params.get('year')
  const month = params.get('month')

  if (!year || !month) {
    return NextResponse.json({ error: 'year and month required' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(parseInt(year), parseInt(month), 0)
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`

  const { data, error } = await supabase
    .from('outfits')
    .select('*, outfit_items(items(*))')
    .eq('user_id', user.id)
    .gte('worn_date', startDate)
    .lte('worn_date', endDateStr)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const outfits = data?.map(o => ({
    ...o,
    items: o.outfit_items?.map((oi: any) => oi.items).filter(Boolean) || [],
    outfit_items: undefined,
  })) || []

  return NextResponse.json({ outfits })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { wornDate, selectedItemIds } = body

  if (!selectedItemIds || selectedItemIds.length === 0) {
    return NextResponse.json({ error: 'selectedItemIds required' }, { status: 400 })
  }

  // Auto-generate outfit name from date
  const date = new Date(wornDate)
  const outfitName = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  // Create outfit
  const { data: outfit, error: outfitError } = await supabase
    .from('outfits')
    .insert({
      user_id: user.id,
      name: outfitName,
      worn_date: wornDate,
    })
    .select()
    .single()

  if (outfitError) return NextResponse.json({ error: outfitError.message }, { status: 500 })

  // Link items to outfit and create wear logs
  const outfitItems = selectedItemIds.map((itemId: string) => ({
    outfit_id: outfit.id,
    item_id: itemId,
  }))

  const { error: itemsError } = await supabase.from('outfit_items').insert(outfitItems)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  // Create wear logs (one per item)
  const wearLogs = selectedItemIds.map((itemId: string) => ({
    outfit_id: outfit.id,
    user_id: user.id,
    worn_on: wornDate,
  }))

  const { error: logsError } = await supabase.from('wear_logs').insert(wearLogs)
  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 500 })

  // Fetch and return outfit with items
  const { data: fullOutfit } = await supabase
    .from('outfits')
    .select('*, outfit_items(items(*))')
    .eq('id', outfit.id)
    .single()

  const result = {
    ...fullOutfit,
    items: fullOutfit?.outfit_items?.map((oi: any) => oi.items).filter(Boolean) || [],
  }

  return NextResponse.json(result)
}
