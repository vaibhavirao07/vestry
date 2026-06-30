import { NextResponse } from 'next/server'

export type SearchResult = {
  name: string
  brand: string | null
  image_url: string | null
  source_url: string
  price: number | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ results: [] })
  }

  try {
    const res = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ q, num: 8 }),
      next: { revalidate: 60 },
    })

    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: SearchResult[] = (data.shoppingResults ?? []).slice(0, 8).map((r: any) => {
      // Serper returns price as a string e.g. "$89.99" or "From $49.99"
      const priceMatch = String(r.price ?? '').match(/[\d]+\.?\d*/)
      const price = priceMatch ? parseFloat(priceMatch[0]) : null

      return {
        name: r.title ?? '',
        brand: r.source ?? null,   // merchant/retailer name
        image_url: r.imageUrl ?? null,
        source_url: r.link ?? '',
        price,
      }
    })

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
