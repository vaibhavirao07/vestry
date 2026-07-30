import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'

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
    .select('*')
    .eq('user_id', user.id)
    .gte('worn_date', startDate)
    .lte('worn_date', endDateStr)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ outfits: data })
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
  const { wornDate, photoBase64, pieces } = body

  // Upload photo to Supabase Storage
  let photoUrl: string | null = null
  if (photoBase64) {
    const buffer = Buffer.from(photoBase64.split(',')[1], 'base64')
    const filename = `${user.id}/${uuid()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('outfit-photos')
      .upload(filename, buffer, { contentType: 'image/jpeg', upsert: false })

    if (!uploadError) {
      const { data: publicUrl } = supabase.storage
        .from('outfit-photos')
        .getPublicUrl(filename)
      photoUrl = publicUrl.publicUrl
    }
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
      photo_url: photoUrl,
    })
    .select()
    .single()

  if (outfitError) return NextResponse.json({ error: outfitError.message }, { status: 500 })

  // Match pieces and create wear logs
  const matchedItemIds = pieces
    .filter((p: any) => p.matched && p.closetItemId)
    .map((p: any) => p.closetItemId)

  for (const itemId of matchedItemIds) {
    await supabase.from('wear_logs').insert({
      outfit_id: outfit.id,
      user_id: user.id,
      worn_on: wornDate,
    })
  }

  return NextResponse.json(outfit)
}
