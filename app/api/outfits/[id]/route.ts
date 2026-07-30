import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const body = await request.json()
  const { selectedItemIds } = body

  if (!selectedItemIds || selectedItemIds.length === 0) {
    return NextResponse.json({ error: 'selectedItemIds required' }, { status: 400 })
  }

  // Delete existing outfit_items
  const { error: deleteError } = await supabase
    .from('outfit_items')
    .delete()
    .eq('outfit_id', id)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  // Insert new outfit_items
  const outfitItems = selectedItemIds.map((itemId: string) => ({
    outfit_id: id,
    item_id: itemId,
  }))

  const { error: insertError } = await supabase.from('outfit_items').insert(outfitItems)
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // Delete existing wear_logs
  const { error: logsDeleteError } = await supabase
    .from('wear_logs')
    .delete()
    .eq('outfit_id', id)

  if (logsDeleteError) return NextResponse.json({ error: logsDeleteError.message }, { status: 500 })

  // Get outfit's worn_date to recreate logs with same date
  const { data: outfitData } = await supabase
    .from('outfits')
    .select('worn_date')
    .eq('id', id)
    .single()

  // Create new wear_logs
  const wearLogs = selectedItemIds.map(() => ({
    outfit_id: id,
    user_id: user.id,
    worn_on: outfitData?.worn_date || new Date().toISOString().split('T')[0],
  }))

  const { error: logsError } = await supabase.from('wear_logs').insert(wearLogs)
  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 500 })

  // Fetch and return updated outfit with items
  const { data: updated } = await supabase
    .from('outfits')
    .select('*, outfit_items(items(*))')
    .eq('id', id)
    .single()

  const result = {
    outfit_id: updated?.id,
    user_id: updated?.user_id,
    name: updated?.name,
    occasion: updated?.occasion,
    created_at: updated?.created_at,
    times_worn: 0,
    photo_url: updated?.photo_url,
    worn_date: updated?.worn_date,
    items: updated?.outfit_items?.map((oi: any) => oi.items).filter(Boolean) || [],
  }

  return NextResponse.json(result)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { error } = await supabase
    .from('outfits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
