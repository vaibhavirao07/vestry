// Static size data for the size-intelligence engine (lib/sizes.ts).
// All measurements in inches; shoe sizes in US women's.

export type FitNote = 'runs small' | 'true to size' | 'runs large'

export type LadderStep = {
  letter: string
  numeric: string // US numeric label(s)
  bustMax: number // upper bound of bust range, inches
  waistMax: number // upper bound of waist range, inches
  hipsMax: number // upper bound of hips range, inches
  waistLabel: string // waist range shown for bottoms, e.g. '29–30"'
}

// Universal women's ladder — index into this array is the brand-neutral "true size".
export const SIZE_LADDER: LadderStep[] = [
  { letter: 'XXS', numeric: '00', bustMax: 31.5, waistMax: 24.5, hipsMax: 34, waistLabel: '24"' },
  { letter: 'XS', numeric: '0–2', bustMax: 33, waistMax: 26, hipsMax: 36, waistLabel: '25–26"' },
  { letter: 'S', numeric: '4–6', bustMax: 35, waistMax: 28, hipsMax: 38, waistLabel: '27–28"' },
  { letter: 'M', numeric: '8–10', bustMax: 37.5, waistMax: 30, hipsMax: 40.5, waistLabel: '29–30"' },
  { letter: 'L', numeric: '12–14', bustMax: 40.5, waistMax: 33, hipsMax: 43.5, waistLabel: '31–33"' },
  { letter: 'XL', numeric: '16', bustMax: 43.5, waistMax: 36, hipsMax: 46.5, waistLabel: '34–36"' },
  { letter: 'XXL', numeric: '18–20', bustMax: Infinity, waistMax: Infinity, hipsMax: Infinity, waistLabel: '37"+' },
]

export type BrandFit = {
  displayName: string
  match: string[] // lowercase substrings matched against the product brand
  tops: FitNote | null // null — no fit data for this garment at this brand
  bottoms: FitNote | null
  shoes: FitNote | null
  topsLabel: 'letter' | 'numeric' // how the brand labels tops/dresses
}

export const BRAND_FITS: BrandFit[] = [
  { displayName: 'Zara', match: ['zara'], tops: 'runs small', bottoms: 'runs small', shoes: 'runs small', topsLabel: 'letter' },
  { displayName: 'H&M', match: ['h&m', 'h & m', 'hm.com'], tops: 'runs small', bottoms: 'runs small', shoes: 'true to size', topsLabel: 'numeric' },
  { displayName: 'Uniqlo', match: ['uniqlo'], tops: 'runs small', bottoms: 'runs small', shoes: null, topsLabel: 'letter' },
  { displayName: 'Mango', match: ['mango'], tops: 'runs small', bottoms: 'true to size', shoes: 'true to size', topsLabel: 'letter' },
  { displayName: 'ASOS', match: ['asos'], tops: 'true to size', bottoms: 'true to size', shoes: 'true to size', topsLabel: 'numeric' },
  { displayName: 'Forever 21', match: ['forever 21', 'forever21'], tops: 'runs small', bottoms: 'runs small', shoes: 'runs small', topsLabel: 'letter' },
  { displayName: 'Urban Outfitters', match: ['urban outfitters'], tops: 'true to size', bottoms: 'true to size', shoes: 'true to size', topsLabel: 'letter' },
  { displayName: 'Free People', match: ['free people'], tops: 'runs large', bottoms: 'runs large', shoes: 'true to size', topsLabel: 'letter' },
  { displayName: 'Madewell', match: ['madewell'], tops: 'true to size', bottoms: 'true to size', shoes: 'true to size', topsLabel: 'letter' },
  { displayName: 'Everlane', match: ['everlane'], tops: 'true to size', bottoms: 'true to size', shoes: 'runs small', topsLabel: 'letter' },
  { displayName: 'Reformation', match: ['reformation'], tops: 'runs small', bottoms: 'runs small', shoes: 'true to size', topsLabel: 'numeric' },
  { displayName: 'Abercrombie', match: ['abercrombie'], tops: 'true to size', bottoms: 'true to size', shoes: null, topsLabel: 'letter' },
  { displayName: 'Aritzia', match: ['aritzia', 'wilfred', 'babaton', 'tna'], tops: 'runs small', bottoms: 'runs small', shoes: null, topsLabel: 'letter' },
  { displayName: "Levi's", match: ['levi'], tops: 'true to size', bottoms: 'true to size', shoes: null, topsLabel: 'letter' },
  { displayName: 'Gap', match: ['gap'], tops: 'runs large', bottoms: 'runs large', shoes: null, topsLabel: 'letter' },
  { displayName: 'Old Navy', match: ['old navy'], tops: 'runs large', bottoms: 'runs large', shoes: 'true to size', topsLabel: 'letter' },
  { displayName: 'Banana Republic', match: ['banana republic'], tops: 'true to size', bottoms: 'true to size', shoes: null, topsLabel: 'letter' },
  { displayName: 'J.Crew', match: ['j.crew', 'j crew', 'jcrew'], tops: 'true to size', bottoms: 'true to size', shoes: 'true to size', topsLabel: 'letter' },
  { displayName: 'Lululemon', match: ['lululemon'], tops: 'true to size', bottoms: 'true to size', shoes: 'true to size', topsLabel: 'numeric' },
  { displayName: 'Skims', match: ['skims'], tops: 'runs small', bottoms: 'runs small', shoes: null, topsLabel: 'letter' },
  { displayName: 'Shein', match: ['shein'], tops: 'runs small', bottoms: 'runs small', shoes: 'runs small', topsLabel: 'letter' },
  { displayName: 'Princess Polly', match: ['princess polly'], tops: 'runs small', bottoms: 'runs small', shoes: 'true to size', topsLabel: 'numeric' },
  { displayName: 'Nike', match: ['nike'], tops: 'true to size', bottoms: 'true to size', shoes: 'runs small', topsLabel: 'letter' },
  { displayName: 'Adidas', match: ['adidas'], tops: 'runs large', bottoms: 'true to size', shoes: 'runs large', topsLabel: 'letter' },
  { displayName: 'New Balance', match: ['new balance'], tops: 'true to size', bottoms: 'true to size', shoes: 'true to size', topsLabel: 'letter' },
  { displayName: 'Steve Madden', match: ['steve madden'], tops: null, bottoms: null, shoes: 'runs small', topsLabel: 'letter' },
  { displayName: 'Sam Edelman', match: ['sam edelman'], tops: null, bottoms: null, shoes: 'true to size', topsLabel: 'letter' },
]

export function findBrandFit(brand: string | null): BrandFit | null {
  if (!brand) return null
  const b = brand.toLowerCase()
  return BRAND_FITS.find((f) => f.match.some((m) => b.includes(m))) ?? null
}
