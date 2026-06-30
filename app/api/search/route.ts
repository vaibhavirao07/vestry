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

  const apiKey = process.env.BRAVE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ results: [] })
  }

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/shopping/search?q=${encodeURIComponent(q)}&count=8`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
        next: { revalidate: 60 },
      },
    )

    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: SearchResult[] = (data.results ?? []).slice(0, 8).map((r: any) => ({
      name: r.title ?? r.name ?? '',
      brand: r.merchant_name ?? r.brand ?? null,
      image_url: r.thumbnail?.src ?? r.thumbnail?.url ?? null,
      source_url: r.url ?? r.product_url ?? '',
      price: r.price?.value != null ? parseFloat(r.price.value) : null,
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
