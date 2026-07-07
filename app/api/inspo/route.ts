import { NextResponse } from 'next/server'
import { callHaiku, callHaikuVision, type VisionImage } from '@/lib/claude'
import type { ClosetItemLite, InspoAnalysis, InspoGarment } from '@/types/inspo'

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const ANALYSIS_SYSTEM = `You are a fashion analyst. You are shown one outfit photo from social media.
Respond with ONLY a JSON object, no other text:
{
  "aesthetic": "<2-4 word aesthetic label, e.g. 'quiet luxury', 'coastal grandma', 'streetwear'>",
  "occasion": "<one of: Casual, Work, Date, Evening, Travel, Weekend, Gym>",
  "palette": ["<3-5 dominant colour names, lowercase>"],
  "garments": [
    {
      "name": "<short garment description, e.g. 'white ribbed tank top'>",
      "category": "<one of: tops, bottoms, dresses, outerwear, shoes, bags, accessories>",
      "colour": "<primary colour, lowercase>",
      "descriptors": ["<2-4 style descriptors, e.g. 'oversized', 'cropped', 'linen'>"],
      "brand_guess": "<brand name if clearly identifiable from logos/design, else null>"
    }
  ]
}
List every clearly visible garment and accessory (max 8). Only guess a brand when genuinely recognisable.`

const MATCH_SYSTEM = `You match garments from an outfit photo against a user's closet inventory.
STRICT RULES — a match requires ALL THREE:
1. The same SPECIFIC garment type — not just the same broad category. Sneakers are not boots or heels; a hoodie is not a blouse; jeans are not leggings or trousers.
2. The same or clearly similar colour.
3. The closet item could genuinely substitute for the garment in this outfit.
Examples:
- "white sneakers" matches "White Nike Air Force 1" (both white sneakers).
- "white ankle boots" does NOT match "White Nike Air Force 1" (boots vs sneakers).
- "yellow cropped hoodie" does NOT match "Yellow silk blouse" (hoodie vs blouse).
- "white sneakers" does NOT match "Black sneakers" (different colour).
If no closet item clearly passes all three rules, the answer is null. When in doubt, answer null.
Respond with ONLY a JSON object, no other text:
{ "matches": [ { "index": <garment index>, "owned_item_name": "<exact closet item name>" | null } ] }
Include one entry per garment, in order.`

function extractJson(raw: string): string {
  const cleaned = raw.replace(/```json|```/g, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in Claude response')
  return cleaned.slice(start, end + 1)
}

// Resolve a social post URL to its main image. TikTok has a public oEmbed
// endpoint; everything else falls back to an og:image scrape. Instagram
// blocks unauthenticated scraping, so it usually fails — the client suggests
// a screenshot upload instead.
async function resolveImageUrl(postUrl: string): Promise<string | null> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  }

  try {
    const host = new URL(postUrl).hostname
    if (host.includes('tiktok.com')) {
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`,
        { headers },
      )
      if (res.ok) {
        const data = await res.json()
        if (typeof data.thumbnail_url === 'string') return data.thumbnail_url
      }
    }

    const res = await fetch(postUrl, { headers, redirect: 'follow' })
    if (!res.ok) return null
    const html = await res.text()
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return og?.[1]?.replace(/&amp;/g, '&') ?? null
  } catch {
    return null
  }
}

async function downloadImage(imageUrl: string): Promise<VisionImage | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
    if (!SUPPORTED_TYPES.includes(contentType as (typeof SUPPORTED_TYPES)[number])) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength > MAX_IMAGE_BYTES) return null
    return { data: buf.toString('base64'), mediaType: contentType as VisionImage['mediaType'] }
  } catch {
    return null
  }
}

async function matchToCloset(
  garments: Omit<InspoGarment, 'owned_item_name'>[],
  closetItems: ClosetItemLite[],
): Promise<(string | null)[]> {
  if (closetItems.length === 0 || garments.length === 0) {
    return garments.map(() => null)
  }
  const user = JSON.stringify({
    garments: garments.map((g, i) => ({ index: i, name: g.name, category: g.category, colour: g.colour })),
    closet: closetItems.map((c) => ({ name: c.name, colour: c.colour, category: c.category_name })),
  })
  try {
    const raw = await callHaiku(MATCH_SYSTEM, user, 2048)
    const parsed = JSON.parse(extractJson(raw)) as {
      matches: { index: number; owned_item_name: string | null }[]
    }
    const byIndex = new Map(parsed.matches.map((m) => [m.index, m.owned_item_name]))
    // only accept names that actually exist in the closet — no invented matches
    const closetNames = new Set(closetItems.map((c) => c.name))
    return garments.map((_, i) => {
      const name = byIndex.get(i) ?? null
      return name != null && closetNames.has(name) ? name : null
    })
  } catch (err) {
    console.error('[inspo] closet match failed:', err)
    return garments.map(() => null)
  }
}

export async function POST(request: Request) {
  if (!process.env.CLAUDE_API_KEY) {
    return NextResponse.json({ error: 'CLAUDE_API_KEY is not set' }, { status: 500 })
  }

  const body = (await request.json()) as {
    url?: string
    imageBase64?: string
    mediaType?: string
    closetItems?: ClosetItemLite[]
  }
  const closetItems = body.closetItems ?? []

  // 1. Get the image — from upload or by resolving the pasted URL
  let image: VisionImage | null = null
  let returnImage = false // URL flow: client needs the bytes back for the Storage upload

  if (body.imageBase64 && body.mediaType) {
    if (!SUPPORTED_TYPES.includes(body.mediaType as (typeof SUPPORTED_TYPES)[number])) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
    }
    image = { data: body.imageBase64, mediaType: body.mediaType as VisionImage['mediaType'] }
  } else if (body.url) {
    const imageUrl = await resolveImageUrl(body.url)
    image = imageUrl ? await downloadImage(imageUrl) : null
    returnImage = true
    if (!image) {
      return NextResponse.json(
        { error: 'Could not get an image from that link. Try uploading a screenshot instead.' },
        { status: 422 },
      )
    }
  } else {
    return NextResponse.json({ error: 'Provide a url or an image' }, { status: 400 })
  }

  // 2. Vision analysis
  let analysis: InspoAnalysis
  try {
    const raw = await callHaikuVision(
      ANALYSIS_SYSTEM,
      'Analyse this outfit photo.',
      image,
      4096,
    )
    const parsed = JSON.parse(extractJson(raw)) as Omit<InspoAnalysis, 'garments'> & {
      garments: Omit<InspoGarment, 'owned_item_name'>[]
    }

    // 3. Cross-reference the closet
    const owned = await matchToCloset(parsed.garments, closetItems)
    analysis = {
      aesthetic: parsed.aesthetic,
      occasion: parsed.occasion,
      palette: Array.isArray(parsed.palette) ? parsed.palette : [],
      garments: parsed.garments.map((g, i) => ({ ...g, owned_item_name: owned[i] })),
    }
  } catch (err) {
    console.error('[inspo] analysis failed:', err)
    return NextResponse.json({ error: 'Could not analyse that image' }, { status: 502 })
  }

  return NextResponse.json({
    analysis,
    image: returnImage ? { base64: image.data, mediaType: image.mediaType } : null,
  })
}
