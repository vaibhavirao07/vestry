import { NextResponse } from 'next/server'

export type SearchResult = {
  name: string
  brand: string | null
  image_url: string | null
  source_url: string
  price: number | null
}

const KNOWN_BRANDS = new Set([
  'cotton on',
  'zara',
  'h&m',
  'uniqlo',
  'mango',
  'asos',
  'forever 21',
  'topshop',
  'revolve',
  'free people',
  'anthropologie',
  'urban outfitters',
  "levi's",
  'nike',
  'adidas',
  'new balance',
  'veja',
  'madewell',
  'reformation',
  '& other stories',
  'cos',
  'arket',
])

function detectAndRestructureQuery(query: string): string {
  const words = query.toLowerCase().split(/\s+/)

  // Check if first 1-2 words match a known brand
  const firstWord = words[0]
  const twoWords = `${words[0]} ${words[1]}`.trim()

  let detectedBrand: string | null = null
  let wordsToRemove = 0

  if (KNOWN_BRANDS.has(twoWords) && words.length > 2) {
    detectedBrand = twoWords
    wordsToRemove = 2
  } else if (KNOWN_BRANDS.has(firstWord)) {
    detectedBrand = firstWord
    wordsToRemove = 1
  }

  if (detectedBrand) {
    // Restructure: brand first, then rest of query, then "women"
    const restOfQuery = words.slice(wordsToRemove).join(' ')
    // Capitalize brand for better matching
    const capitalizedBrand = detectedBrand.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return `${capitalizedBrand} ${restOfQuery} women`.trim()
  }

  // No brand detected, return original query
  return query
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const restructuredQuery = detectAndRestructureQuery(q)

  const apiKey = process.env.CHANNEL3_API_KEY
  if (!apiKey) {
    return NextResponse.json({ results: [] })
  }

  try {
    const res = await fetch('https://api.trychannel3.com/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ query: restructuredQuery, limit: 20 }),
      next: { revalidate: 60 },
    })

    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()

    // Filter results with suspiciously low prices (likely bad data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: SearchResult[] = (data.products ?? [])
      .filter((r: any) => {
        const price = r.offers?.[0]?.price?.price
        // Keep if no price, or if price >= $5 (reasonable minimum for most items)
        return !price || price >= 5
      })
      .slice(0, 20)
      .map((r: any) => {
        // brands is an array — grab the first one
        const brand: string | null = r.brands?.[0]?.name ?? null

        // prefer is_cleaned_image (white bg), then is_main_image, then first image
        const images: any[] = r.images ?? []
        const image =
          images.find((i) => i.is_cleaned_image)?.url ??
          images.find((i) => i.is_main_image)?.url ??
          images[0]?.url ??
          null

        // price is already a number inside offers[0].price.price
        const price: number | null = r.offers?.[0]?.price?.price ?? null

        // buy link includes Channel3 affiliate tracking
        const source_url: string = r.offers?.[0]?.url ?? ''

        return {
          name: r.title ?? '',
          brand,
          image_url: image,
          source_url,
          price,
        }
      })

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
