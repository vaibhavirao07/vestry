export type InspoGarment = {
  name: string
  category: string // tops | bottoms | dresses | outerwear | shoes | bags | accessories
  colour: string
  descriptors: string[]
  brand_guess: string | null
  owned_item_name: string | null // matching closet item, resolved at save time
}

export type InspoAnalysis = {
  aesthetic: string
  occasion: string
  palette: string[]
  garments: InspoGarment[]
}

// item fields the closet-matching step needs
export type ClosetItemLite = {
  name: string
  colour: string | null
  category_name: string | null
}
