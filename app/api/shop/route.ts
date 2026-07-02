import { NextResponse } from 'next/server'
import { callHaiku } from '@/lib/claude'
import type { ClosetSummary, ParsedIntent, ShopResult } from '@/types/shop'

type RawProduct = {
  name: string
  brand: string | null
  image_url: string | null
  source_url: string
  price: number | null
}

export async function POST(request: Request) {
  const body = await request.json() as { query: string; closetSummary: ClosetSummary }
  const { query, closetSummary } = body

  if (!query?.trim()) {
    return NextResponse.json({ results: [] })
  }

  const channel3ApiKey = process.env.CHANNEL3_API_KEY
  if (!channel3ApiKey || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Missing API configuration' }, { status: 500 })
  }

  // Step 1: Claude Haiku parses intent and builds a Channel3 search query
  const closetLines = closetSummary.items
    .map((i) => `${i.name}${i.colour ? ` (${i.colour})` : ''}, worn ${i.times_worn}x`)
    .join('\n')
  const gapNames = closetSummary.topGaps.map((g) => g.category_name).join(', ')

  const intentSystem = `You are a fashion assistant. Given a natural language shopping query and the user's existing wardrobe, extract structured intent and build an optimised Channel3 product search string.
Respond ONLY with valid JSON — no markdown, no explanation:
{
  "category": "string",
  "colour": "string",
  "vibe": "string",
  "budget": number | null,
  "channel3Query": "3-6 word fashion product search string"
}`

  const intentUser = `Search query: "${query}"

User's closet:
${closetLines || '(empty)'}

Wardrobe gaps: ${gapNames || 'none identified'}`

  let parsed: ParsedIntent
  try {
    const raw = await callHaiku(intentSystem, intentUser)
    parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    return NextResponse.json({ error: 'Failed to parse intent' }, { status: 500 })
  }

  // Step 2: Channel3 product search using the AI-generated query
  const c3Res = await fetch('https://api.trychannel3.com/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': channel3ApiKey },
    body: JSON.stringify({ query: parsed.channel3Query, limit: 8 }),
  })

  if (!c3Res.ok) {
    return NextResponse.json({ results: [] })
  }

  const c3Data = await c3Res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawProducts: RawProduct[] = (c3Data.products ?? []).slice(0, 8).map((r: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images: any[] = r.images ?? []
    const image =
      images.find((i) => i.is_cleaned_image)?.url ??
      images.find((i) => i.is_main_image)?.url ??
      images[0]?.url ??
      null
    return {
      name: r.title ?? '',
      brand: r.brands?.[0]?.name ?? null,
      image_url: image,
      source_url: r.offers?.[0]?.url ?? '',
      price: r.offers?.[0]?.price?.price ?? null,
    }
  })

  if (rawProducts.length === 0) {
    return NextResponse.json({ results: [] })
  }

  // Step 3: Claude Haiku scores products for closet compatibility
  const closetItemNames = closetSummary.items.map((i) => i.name)

  const scoringSystem = `You are a fashion stylist. Score each product for compatibility with the user's wardrobe.
Respond ONLY with valid JSON — no markdown, no explanation.
Return an array with the top 3-5 most compatible items:
[{
  "product_index": number,
  "compatibility_score": number (0-100),
  "outfit_preview": ["closet item name", "closet item name"] (2-3 real items from the user's closet that pair well),
  "estimated_cpw": number | null (price ÷ estimated lifetime wears: shoes=150, tops/pants=80, bags=200, jackets=100, accessories=120)
}]`

  const scoringUser = `User's closet items:
${closetItemNames.length ? closetItemNames.join('\n') : '(empty closet)'}

Products to score:
${rawProducts.map((p, i) => `${i}. ${p.name} — ${p.brand ?? 'unknown'} — $${p.price ?? '?'}`).join('\n')}`

  let scored: {
    product_index: number
    compatibility_score: number
    outfit_preview: string[]
    estimated_cpw: number | null
  }[]
  try {
    const raw = await callHaiku(scoringSystem, scoringUser)
    scored = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    scored = rawProducts.slice(0, 3).map((_, i) => ({
      product_index: i,
      compatibility_score: 0,
      outfit_preview: [],
      estimated_cpw: null,
    }))
  }

  const results: ShopResult[] = scored
    .filter((s) => s.product_index < rawProducts.length)
    .map((s) => ({
      ...rawProducts[s.product_index],
      compatibility_score: s.compatibility_score,
      outfit_preview: s.outfit_preview ?? [],
      estimated_cpw: s.estimated_cpw ?? null,
    }))

  return NextResponse.json({ results, parsedIntent: parsed })
}
