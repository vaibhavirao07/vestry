type MerchantInfo = {
  name: string
  return_days: number
  delivery: string
  delivery_min: number  // for fastest-delivery comparison
  region: 'US' | 'UAE'
}

const MERCHANTS: Record<string, MerchantInfo> = {
  // US
  'asos.com':              { name: 'ASOS',               return_days: 28, delivery: '3–5 days',   delivery_min: 3, region: 'US' },
  'zara.com':              { name: 'Zara',               return_days: 30, delivery: '2–4 days',   delivery_min: 2, region: 'US' },
  'hm.com':                { name: 'H&M',                return_days: 30, delivery: '3–7 days',   delivery_min: 3, region: 'US' },
  'nordstrom.com':         { name: 'Nordstrom',          return_days: 45, delivery: '2–3 days',   delivery_min: 2, region: 'US' },
  'revolve.com':           { name: 'Revolve',            return_days: 30, delivery: '3–5 days',   delivery_min: 3, region: 'US' },
  'net-a-porter.com':      { name: 'Net-a-Porter',       return_days: 28, delivery: '1–2 days',   delivery_min: 1, region: 'US' },
  'uniqlo.com':            { name: 'Uniqlo',             return_days: 30, delivery: '3–5 days',   delivery_min: 3, region: 'US' },
  'mango.com':             { name: 'Mango',              return_days: 30, delivery: '3–5 days',   delivery_min: 3, region: 'US' },
  'forever21.com':         { name: 'Forever 21',         return_days: 30, delivery: '5–7 days',   delivery_min: 5, region: 'US' },
  'urbanoutfitters.com':   { name: 'Urban Outfitters',   return_days: 30, delivery: '3–5 days',   delivery_min: 3, region: 'US' },
  'amazon.com':            { name: 'Amazon Fashion',     return_days: 30, delivery: '1–2 days',   delivery_min: 1, region: 'US' },
  // UAE
  'namshi.com':            { name: 'Namshi',             return_days: 14, delivery: '1–2 days',   delivery_min: 1, region: 'UAE' },
  'ounass.com':            { name: 'Ounass',             return_days: 14, delivery: 'Same day',   delivery_min: 0, region: 'UAE' },
  'sivvi.com':             { name: 'Sivvi',              return_days: 14, delivery: '2–3 days',   delivery_min: 2, region: 'UAE' },
  'bloomingdales.ae':      { name: "Bloomingdale's UAE", return_days: 30, delivery: '2–3 days',   delivery_min: 2, region: 'UAE' },
  'harveynichols.com':     { name: 'Harvey Nichols',     return_days: 28, delivery: '2–4 days',   delivery_min: 2, region: 'UAE' },
  'noon.com':              { name: 'Noon Fashion',       return_days: 15, delivery: '1–2 days',   delivery_min: 1, region: 'UAE' },
  '6thstreet.com':         { name: '6thStreet',          return_days: 15, delivery: '2–3 days',   delivery_min: 2, region: 'UAE' },
}

export function getMerchantInfo(domain: string): MerchantInfo | null {
  const clean = domain.replace(/^www\./, '')
  return MERCHANTS[clean] ?? MERCHANTS[domain] ?? null
}

export function getDomainName(domain: string): string {
  const clean = domain.replace(/^www\./, '').split('.')[0]
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}
