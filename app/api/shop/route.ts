import { NextResponse } from 'next/server'
import { callHaiku } from '@/lib/claude'
import { getMerchantInfo, getDomainName } from '@/lib/merchants'
import type { ClosetSummary, ParsedIntent, ShopOffer, ShopResult } from '@/types/shop'

type RawProduct = {
  name: string
  brand: string | null
  image_url: string | null
  source_url: string
  price: number | null
  offers: ShopOffer[]
}

export async function POST(request: Request) {
  const body = await request.json() as { query: string; closetSummary: ClosetSummary }
  const { query, closetSummary } = body

  if (!query?.trim()) {
    return NextResponse.json({ results: [] })
  }

  const channel3ApiKey = process.env.CHANNEL3_API_KEY
  if (!channel3ApiKey || !process.env.CLAUDE_API_KEY) {
    return NextResponse.json({ error: 'Missing API configuration' }, { status: 500 })
  }

  // Step 1: Claude Haiku parses intent and builds a Channel3 search query
  const closetLines = closetSummary.items
    .map((i) => `${i.name}${i.colour ? ` (${i.colour})` : ''}, worn ${i.times_worn}x`)
    .join('\n')
  const gapNames = closetSummary.topGaps.map((g) => g.category_name).join(', ')

  console.log('[shop] closetSummary items count:', closetSummary.items.length)
  console.log('[shop] closet lines sent to Claude:\n', closetLines || '(empty)')

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
    console.log('[shop] intent raw response:', raw)
    parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim())
    console.log('[shop] parsed intent:', parsed)
  } catch (err) {
    console.error('[shop] intent parse failed:', err)
    return NextResponse.json({ error: 'Failed to parse intent' }, { status: 500 })
  }

  // Step 2: Channel3 product search — request 50, take top 20 after scoring
  const c3Res = await fetch('https://api.trychannel3.com/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': channel3ApiKey },
    body: JSON.stringify({ query: parsed.channel3Query, limit: 50 }),
  })

  if (!c3Res.ok) {
    console.error('[shop] Channel3 error:', c3Res.status, await c3Res.text())
    return NextResponse.json({ results: [] })
  }

  const c3Data = await c3Res.json()
  console.log('[shop] Channel3 raw product count:', c3Data.products?.length ?? 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawProducts: RawProduct[] = (c3Data.products ?? []).slice(0, 20).map((r: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images: any[] = r.images ?? []
    const image =
      images.find((i) => i.is_cleaned_image)?.url ??
      images.find((i) => i.is_main_image)?.url ??
      images[0]?.url ??
      null

    // Extract all offers, enrich with static merchant data, sort by price, cap at 5
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offers: ShopOffer[] = (r.offers ?? [])
      .filter((o: any) => o.url && o.domain)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((o: any): ShopOffer => {
        const merchant = getMerchantInfo(o.domain)
        return {
          platform: merchant?.name ?? getDomainName(o.domain),
          domain: o.domain,
          price: o.price?.price ?? null,
          compare_at_price: o.price?.compare_at_price ?? null,
          url: o.url,
          return_days: merchant?.return_days ?? null,
          delivery: merchant?.delivery ?? null,
          delivery_min: merchant?.delivery_min ?? null,
          availability: o.availability ?? null,
        }
      })
      .sort((a: ShopOffer, b: ShopOffer) => {
        if (a.price == null) return 1
        if (b.price == null) return -1
        return a.price - b.price
      })
      .slice(0, 5)

    return {
      name: r.title ?? '',
      brand: r.brands?.[0]?.name ?? null,
      image_url: image,
      source_url: offers[0]?.url ?? r.offers?.[0]?.url ?? '',
      price: offers[0]?.price ?? r.offers?.[0]?.price?.price ?? null,
      offers,
    }
  })

  console.log('[shop] rawProducts after mapping:', rawProducts.length)

  if (rawProducts.length === 0) {
    return NextResponse.json({ results: [] })
  }

  // Step 3: Claude Haiku scores products for closet compatibility
  const closetItemNames = closetSummary.items.map((i) => i.name)

  const scoringSystem = `You are a fashion stylist. Score each product for compatibility with the user's wardrobe.
Respond ONLY with valid JSON — no markdown, no explanation.
Return an array with up to 15 most compatible items, sorted by compatibility_score descending:
[{
  "product_index": number,
  "compatibility_score": number (0-100),
  "outfit_preview": ["closet item name", "closet item name"],
  "estimated_cpw": number | null
}]`

  const scoringUser = `User's closet items:
${closetItemNames.length ? closetItemNames.join('\n') : '(empty closet — score based on general versatility)'}

Products to score:
${rawProducts.map((p, i) => `${i}. ${p.name} — ${p.brand ?? 'unknown'} — $${p.price ?? '?'}`).join('\n')}`

  let scored: {
    product_index: number
    compatibility_score: number
    outfit_preview: string[]
    estimated_cpw: number | null
  }[]
  try {
    const raw = await callHaiku(scoringSystem, scoringUser, 4096)
    console.log('[shop] scoring raw response >>>>\n', raw, '\n<<<<')
    const fenceStripped = raw.replace(/```json\n?|\n?```/g, '').trim()
    const arrayStart = fenceStripped.indexOf('[')
    const arrayEnd = fenceStripped.lastIndexOf(']')
    if (arrayStart === -1 || arrayEnd === -1) {
      throw new Error(`No JSON array found in response: ${fenceStripped.slice(0, 200)}`)
    }
    const cleaned = fenceStripped.slice(arrayStart, arrayEnd + 1)
    scored = JSON.parse(cleaned)
    console.log('[shop] scored items count:', scored.length)
  } catch (err) {
    console.error('[shop] scoring parse failed:', err)
    const results: ShopResult[] = rawProducts.map((p) => ({
      ...p,
      compatibility_score: 0,
      outfit_preview: [],
      estimated_cpw: null,
      offers: p.offers,
    }))
    return NextResponse.json({ results, parsedIntent: parsed })
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
