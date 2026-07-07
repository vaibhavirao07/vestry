export type Garment = 'tops' | 'bottoms' | 'shoes'

// all measurements in inches / lbs; shoe_size in US women's
export type SizeProfile = {
  measurements: {
    height: number | null
    weight: number | null
    bust: number | null
    waist: number | null
    hips: number | null
    shoe_size: number | null
  }
  brandSizes: { brand: string; garment: Garment; size: string }[]
}

export type SizeRecommendation = {
  garment: Garment
  size: string
  // direct = user saved a size for this exact brand
  // cross-brand = converted from a known size at another brand
  // measurements = derived from body measurements
  basis: 'direct' | 'cross-brand' | 'measurements'
  reason: string
}
