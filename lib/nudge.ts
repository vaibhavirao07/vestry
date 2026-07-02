import { callHaiku } from '@/lib/claude'
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

// Only calls Claude when category count threshold is met — keeps token usage low
async function checkDuplicate(
  productName: string,
  parsedCategory: string,
  items: ClosetSummary['items'],
): Promise<RuleViolation | null> {
  const matching = items.filter((i) => i.category_name && categoriesMatch(parsedCategory, i.category_name))
  if (matching.length < 3) return null

  const system = `You are a fashion expert reviewing wardrobe similarity.
Given a product being considered for purchase and a list of existing wardrobe items, identify which existing items are genuinely similar in style.
Judge by neckline, silhouette, fabric type, and occasion — NOT just shared category or colour.
A fishnet top and a crew neck tee are NOT similar even if both are white tops.
Respond ONLY with valid JSON: {"similar_items": ["item name", ...]}`

  const user = `Product being considered: "${productName}"

Existing wardrobe items in the same category:
${matching.map((i) => `- ${i.name}${i.colour ? ` (${i.colour})` : ''}`).join('\n')}`

  try {
    const raw = await callHaiku(system, user, 512)
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim()
    const result: { similar_items: string[] } = JSON.parse(cleaned)
    const similar = result.similar_items ?? []

    if (similar.length === 0) return null

    return {
      rule: 'duplicate',
      detail: similar.length === 1
        ? `You already own something very similar: ${similar[0]}`
        : `You already own ${similar.length} genuinely similar styles`,
    }
  } catch {
    // Claude call failed — fall back to raw count so the rule still works
    return { rule: 'duplicate', detail: `You already own ${matching.length} items in this category` }
  }
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

export async function evaluateViolations(
  product: ShopResult,
  intent: ParsedIntent,
  closet: ClosetSummary,
): Promise<RuleViolation[]> {
  const violations: RuleViolation[] = []

  // Duplicate check: async — calls Claude only when category count >= 3
  const dup = await checkDuplicate(product.name, intent.category, closet.items)
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
