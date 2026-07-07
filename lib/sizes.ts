// Size-intelligence engine — pure logic, no AI.
// "True size" = index into SIZE_LADDER (or a raw US shoe size for shoes).
// A brand that runs small labels garments one step below their real fit,
// so the user buys one label up there: label = true + offset, true = label − offset.

import { SIZE_LADDER, findBrandFit, type BrandFit, type FitNote } from './sizeCharts'
import type { Garment, SizeProfile, SizeRecommendation } from '@/types/profile'

const SHOE_WORDS = ['sneaker', 'shoe', 'boot', 'heel', 'sandal', 'loafer', 'mule', 'flat', 'pump', 'slipper', 'trainer', 'oxford', 'clog', 'espadrille', 'stiletto', 'wedge']
const BOTTOM_WORDS = ['jean', 'trouser', 'pant', 'short', 'skirt', 'legging', 'chino', 'culotte', 'jogger', 'sweatpant', 'cargo', 'denim']

export function detectGarment(productName: string): Garment {
  const n = productName.toLowerCase()
  if (SHOE_WORDS.some((w) => n.includes(w))) return 'shoes'
  if (BOTTOM_WORDS.some((w) => n.includes(w))) return 'bottoms'
  return 'tops'
}

function fitOffset(fit: FitNote | null): number {
  if (fit === 'runs small') return 1
  if (fit === 'runs large') return -1
  return 0
}

function fitText(fit: FitNote | null): string {
  if (fit === 'runs small') return 'runs small, so size up'
  if (fit === 'runs large') return 'runs large, so size down'
  return 'runs true to size'
}

const clampIndex = (i: number) => Math.min(SIZE_LADDER.length - 1, Math.max(0, i))

// Parse a saved size label into a ladder index. Handles letters (XS–XXL),
// US numerics (00–20), and waist inches (23–40, bottoms convention).
function parseSizeToIndex(size: string): number | null {
  const s = size.trim().toUpperCase()
  const letterIndex = SIZE_LADDER.findIndex((step) => step.letter === s)
  if (letterIndex !== -1) return letterIndex
  if (s === '2XS') return 0
  if (s === '2XL') return 6

  const num = parseFloat(s.replace(/[^\d.]/g, ''))
  if (Number.isNaN(num)) return null
  if (s.startsWith('00')) return 0
  if (num <= 2) return 1
  if (num <= 6) return 2
  if (num <= 10) return 3
  if (num <= 14) return 4
  if (num <= 16) return 5
  if (num <= 22) return 6
  // 23+ reads as waist inches
  const waistIndex = SIZE_LADDER.findIndex((step) => num <= step.waistMax)
  return waistIndex === -1 ? SIZE_LADDER.length - 1 : waistIndex
}

function indexToLabel(index: number, garment: Garment, brandFit: BrandFit | null): string {
  const step = SIZE_LADDER[clampIndex(index)]
  if (garment === 'bottoms') return `${step.letter} (${step.waistLabel} waist)`
  if (brandFit?.topsLabel === 'numeric') return `${step.letter} (US ${step.numeric})`
  return step.letter
}

function measurementsToIndex(m: SizeProfile['measurements'], garment: Garment): number | null {
  if (garment === 'bottoms') {
    const primary = m.waist ?? m.hips
    if (primary == null) return null
    const key = m.waist != null ? 'waistMax' : 'hipsMax'
    const i = SIZE_LADDER.findIndex((step) => primary <= step[key])
    return i === -1 ? SIZE_LADDER.length - 1 : i
  }
  // tops/dresses — bust first, waist as fallback
  const votes = [
    m.bust != null ? SIZE_LADDER.findIndex((s) => m.bust! <= s.bustMax) : -1,
    m.waist != null ? SIZE_LADDER.findIndex((s) => m.waist! <= s.waistMax) : -1,
  ].filter((i) => i !== -1)
  if (votes.length === 0) return null
  return Math.max(...votes) // size for the largest measurement so it fits everywhere
}

function formatShoe(size: number): string {
  const snapped = Math.round(size * 2) / 2
  return snapped % 1 === 0 ? String(snapped) : snapped.toFixed(1)
}

export function recommendSize(
  profile: SizeProfile,
  brand: string | null,
  productName: string
): SizeRecommendation | null {
  const garment = detectGarment(productName)
  const brandFit = findBrandFit(brand)
  const brandName = brandFit?.displayName ?? brand

  // 1. Direct — user already saved a size at this brand for this garment
  if (brand) {
    const direct = profile.brandSizes.find((bs) => {
      if (bs.garment !== garment) return false
      if (bs.brand.toLowerCase() === brand.toLowerCase()) return true
      const bsFit = findBrandFit(bs.brand)
      return bsFit != null && brandFit != null && bsFit.displayName === brandFit.displayName
    })
    if (direct) {
      return {
        garment,
        size: direct.size,
        basis: 'direct',
        reason: `You wear ${direct.size} at ${brandName}`,
      }
    }
  }

  const targetFit = brandFit ? brandFit[garment] : null
  const fitPhrase = brandFit
    ? `${brandFit.displayName} ${fitText(targetFit)}`
    : 'assuming standard sizing'

  // 2. Cross-brand — convert a known size at another brand to this brand's scale
  const known = profile.brandSizes.filter((bs) => bs.garment === garment)
  // prefer sources whose fit offset we actually know
  const source = known.find((bs) => findBrandFit(bs.brand)) ?? known[0]

  if (source) {
    const sourceFit = findBrandFit(source.brand)
    if (garment === 'shoes') {
      const sourceSize = parseFloat(source.size)
      if (!Number.isNaN(sourceSize)) {
        const trueSize = sourceSize - 0.5 * fitOffset(sourceFit?.shoes ?? null)
        const size = formatShoe(trueSize + 0.5 * fitOffset(targetFit))
        return {
          garment,
          size,
          basis: 'cross-brand',
          reason: `Based on your ${sourceFit?.displayName ?? source.brand} ${source.size} — ${fitPhrase}`,
        }
      }
    } else {
      const sourceIndex = parseSizeToIndex(source.size)
      if (sourceIndex != null) {
        const trueIndex = sourceIndex - fitOffset(sourceFit ? sourceFit[garment] : null)
        const size = indexToLabel(trueIndex + fitOffset(targetFit), garment, brandFit)
        return {
          garment,
          size,
          basis: 'cross-brand',
          reason: `Based on your ${sourceFit?.displayName ?? source.brand} ${source.size}, order an ${size} here — ${fitPhrase}`,
        }
      }
    }
  }

  // 3. Measurements fallback
  if (garment === 'shoes') {
    if (profile.measurements.shoe_size == null) return null
    const size = formatShoe(profile.measurements.shoe_size + 0.5 * fitOffset(targetFit))
    return {
      garment,
      size,
      basis: 'measurements',
      reason: `Based on your usual US ${formatShoe(profile.measurements.shoe_size)} — ${fitPhrase}`,
    }
  }

  const index = measurementsToIndex(profile.measurements, garment)
  if (index == null) return null
  const size = indexToLabel(index + fitOffset(targetFit), garment, brandFit)
  return {
    garment,
    size,
    basis: 'measurements',
    reason: `Based on your measurements, order an ${size} — ${fitPhrase}`,
  }
}

// Short label for the card badge, e.g. "M" or "8.5"
export function badgeLabel(rec: SizeRecommendation): string {
  return rec.size.split(' ')[0]
}
