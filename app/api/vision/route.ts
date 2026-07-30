import { NextResponse } from 'next/server'
import { callHaikuVision } from '@/lib/claude'

export async function POST(request: Request) {
  const body = await request.json()
  const { imageBase64, mode } = body

  if (!imageBase64) {
    return NextResponse.json({ error: 'imageBase64 required' }, { status: 400 })
  }

  try {
    let prompt = ''
    if (mode === 'outfit') {
      prompt = `Extract all visible garments from this image. For each garment, provide:
1. Type (e.g., "blue jeans", "white t-shirt", "black leather jacket")
2. Whether it's a specific, identifiable piece

Return a JSON array of objects with: { "name": "garment description", "type": "category" }`
    } else {
      prompt = `Extract garments visible in this image. Return JSON: [{ "name": "...", "type": "..." }]`
    }

    const response = await callHaikuVision(imageBase64, prompt)

    let pieces = []
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        pieces = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      // If Claude doesn't return valid JSON, return empty pieces
      pieces = []
    }

    return NextResponse.json({ pieces })
  } catch (err) {
    console.error('Vision extraction failed:', err)
    return NextResponse.json({ error: 'Vision extraction failed', pieces: [] }, { status: 500 })
  }
}
