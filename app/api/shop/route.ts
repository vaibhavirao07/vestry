import { NextResponse } from 'next/server'
import { callHaiku } from '@/lib/claude'
import { evaluateViolations, determineVerdict } from '@/lib/nudge'
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
    return {
      name: r.title ?? '',
      brand: r.brands?.[0]?.name ?? null,
      image_url: image,
      source_url: r.offers?.[0]?.url ?? '',
      price: r.offers?.[0]?.price?.price ?? null,
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
    // Strip markdown fences, find the JSON array
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
    // Fall back: return all raw products with no scores rather than 0%
    const results: ShopResult[] = rawProducts.map((p) => ({
      ...p,
      compatibility_score: 0,
      outfit_preview: [],
      estimated_cpw: null,
    }))
    return NextResponse.json({ results, parsedIntent: parsed })
  }

  const validScored = scored.filter((s) => s.product_index < rawProducts.length)

  // Step 4: Run nudge rule engine for each scored product (parallel — one Claude call per card that hits the duplicate threshold)
  const nudgeInputs = await Promise.all(
    validScored.map(async (s) => {
      const product = rawProducts[s.product_index]
      const violations = await evaluateViolations(
        { ...product, compatibility_score: s.compatibility_score, outfit_preview: [], estimated_cpw: s.estimated_cpw ?? null },
        parsed,
        closetSummary,
      )
      return { product_index: s.product_index, violations, verdict: determineVerdict(violations) }
    }),
  )

  // Step 5: One Claude call to write nudge messages for amber/red cards
  const needsMessage = nudgeInputs.filter((n) => n.verdict !== 'green')
  const nudgeMessages: Record<number, string> = {}

  if (needsMessage.length > 0) {
    const nudgeSystem = `You are a warm, honest wardrobe assistant writing concise nudge messages to help users shop intentionally.
Each message should be under 12 words, friendly, and specific to the violation.
Amber tone: gently curious. Red tone: direct but kind.
Respond ONLY with valid JSON: {"nudges":[{"product_index":number,"message":"string"}]}`

    const nudgeUser = needsMessage
      .map((n) =>
        `Product ${n.product_index}: ${rawProducts[n.product_index].name}\nViolations: ${n.violations.map((v) => v.detail).join('; ')}\nVerdict: ${n.verdict}`,
      )
      .join('\n\n')

    try {
      const raw = await callHaiku(nudgeSystem, nudgeUser, 1024)
      const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim()
      const parsed2 = JSON.parse(cleaned)
      for (const n of parsed2.nudges ?? []) {
        nudgeMessages[n.product_index] = n.message
      }
    } catch {
      // Fall back to raw violation detail strings
      for (const n of needsMessage) {
        nudgeMessages[n.product_index] = n.violations[0]?.detail ?? ''
      }
    }
  }

  const results: ShopResult[] = validScored.map((s) => {
    const nudgeData = nudgeInputs.find((n) => n.product_index === s.product_index)
    const verdict = nudgeData?.verdict ?? 'green'
    return {
      ...rawProducts[s.product_index],
      compatibility_score: s.compatibility_score,
      outfit_preview: s.outfit_preview ?? [],
      estimated_cpw: s.estimated_cpw ?? null,
      nudge: verdict !== 'green'
        ? { verdict: verdict as 'amber' | 'red', message: nudgeMessages[s.product_index] ?? '' }
        : undefined,
    }
  })

  return NextResponse.json({ results, parsedIntent: parsed })
}
