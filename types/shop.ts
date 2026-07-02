export type ParsedIntent = {
  category: string
  colour: string
  vibe: string
  budget: number | null
  channel3Query: string
}

export type ShopResult = {
  name: string
  brand: string | null
  image_url: string | null
  source_url: string
  price: number | null
  compatibility_score: number
  outfit_preview: string[]
  estimated_cpw: number | null

}

export type ClosetSummary = {
  items: { name: string; colour: string | null; times_worn: number; category_name: string | null }[]
  topGaps: { category_name: string; gap_score: number | null }[]
  avgCostPerWear: number | null
}
