import type { RuleViolation, NudgeVerdict } from '@/types/nudge'
import type { ClosetSummary, ParsedIntent, ShopResult } from '@/types/shop'

// Synonym groups for keyword-based category matching
const CATEGORY_GROUPS = [
  ['shoe', 'sneaker', 'boot', 'heel', 'flat', 'loafer', 'sandal', 'pump', 'mule', 'clog'],
  ['top', 'shirt', 'blouse', 'tee', 't-shirt', 'tank', 'crop', 'knit', 'sweater', 'jumper'],
  ['pant', 'trouser', 'jean', 'denim', 'legging', 'short'],
  ['dress', 'skirt', 'midi', 'maxi', 'mini'],
  ['jacket', 'blazer', 'coat', 'cardigan', 'outerwear', 'bomber'],
  ['bag', 'purse', 'tote', 'clutch', 'handbag', 'crossbody', 'backpack'],
  ['accessory', 'accessories', 'jewellery', 'jewelry', 'belt', 'scarf', 'hat', 'sunglasses'],
]

function normalise(s: string): string {
  return s.toLowerCase().trim()
}

function categoriesMatch(a: string, b: string): boolean {
  const na = normalise(a)
  const nb = normalise(b)
  if (na.includes(nb) || nb.includes(na)) return true
  for (const group of CATEGORY_GROUPS) {
    if (group.some((w) => na.includes(w)) && group.some((w) => nb.includes(w))) return true
  }
  return false
}

function checkDuplicate(
  parsedCategory: string,
  items: ClosetSummary['items'],
): RuleViolation | null {
  const matching = items.filter((i) => i.category_name && categoriesMatch(parsedCategory, i.category_name))
  if (matching.length >= 3) {
    return { rule: 'duplicate', detail: `You already own ${matching.length} similar items` }
  }
  return null
}

function checkUnworn(
  parsedCategory: string,
  items: ClosetSummary['items'],
): RuleViolation | null {
  const matching = items.filter((i) => i.category_name && categoriesMatch(parsedCategory, i.category_name))
  const unworn = matching.filter((i) => i.times_worn === 0)
  if (unworn.length >= 2) {
    return { rule: 'unworn', detail: `${unworn.length} similar items in your closet haven't been worn yet` }
  }
  return null
}

function checkMismatch(
  parsedColour: string,
  items: ClosetSummary['items'],
): RuleViolation | null {
  const wornItems = items.filter((i) => i.times_worn > 0 && i.colour)
  if (wornItems.length < 3) return null

  // Tally colours weighted by wear count
  const colourCounts: Record<string, number> = {}
  for (const item of wornItems) {
    const c = normalise(item.colour!)
    colourCounts[c] = (colourCounts[c] ?? 0) + item.times_worn
  }
  const topColours = Object.entries(colourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c)

  const pc = normalise(parsedColour)
  if (!pc) return null

  const colourMatch = topColours.some((c) => c.includes(pc) || pc.includes(c))
  if (!colourMatch) {
    const palette = topColours.slice(0, 2).join(' and ')
    return { rule: 'mismatch', detail: `You usually wear ${palette} — this is a ${parsedColour}` }
  }
  return null
}

function checkImpulse(
  price: number | null,
  parsedCategory: string,
  items: ClosetSummary['items'],
): RuleViolation | null {
  if (!price || price < 80) return null
  const matching = items.filter((i) => i.category_name && categoriesMatch(parsedCategory, i.category_name))
  if (matching.length >= 3) {
    return {
      rule: 'impulse',
      detail: `$${price} item in a category where you already own ${matching.length} pieces`,
    }
  }
  return null
}

export function evaluateViolations(
  product: ShopResult,
  intent: ParsedIntent,
  closet: ClosetSummary,
): RuleViolation[] {
  const violations: RuleViolation[] = []

  const dup = checkDuplicate(intent.category, closet.items)
  if (dup) violations.push(dup)

  const unworn = checkUnworn(intent.category, closet.items)
  if (unworn) violations.push(unworn)

  const mismatch = checkMismatch(intent.colour, closet.items)
  if (mismatch) violations.push(mismatch)

  const impulse = checkImpulse(product.price, intent.category, closet.items)
  if (impulse) violations.push(impulse)

  return violations
}

export function determineVerdict(violations: RuleViolation[]): NudgeVerdict {
  if (violations.length === 0) return 'green'
  if (violations.some((v) => v.rule === 'impulse') || violations.length >= 2) return 'red'
  return 'amber'
}
