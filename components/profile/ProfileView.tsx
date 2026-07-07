'use client'

import { useState } from 'react'
import { useProfile, type MeasurementsInput } from '@/hooks/useProfile'
import { BRAND_FITS } from '@/lib/sizeCharts'
import type { BrandSize, Profile } from '@/types/database'
import type { Garment } from '@/types/profile'

type Unit = 'imperial' | 'metric'

const GARMENTS: { value: Garment; label: string }[] = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
]

const IN_PER_CM = 1 / 2.54
const LB_PER_KG = 2.2046

// form state holds display-unit strings; stored values are always inches / lbs
type FormState = Record<'height' | 'weight' | 'bust' | 'waist' | 'hips' | 'shoe_size', string>

function toForm(m: MeasurementsInput | null, unit: Unit): FormState {
  const lenFactor = unit === 'metric' ? 2.54 : 1
  const wtFactor = unit === 'metric' ? 1 / LB_PER_KG : 1
  const fmt = (v: number | null, factor: number) =>
    v == null ? '' : String(Math.round(v * factor * 10) / 10)
  return {
    height: fmt(m?.height ?? null, lenFactor),
    weight: fmt(m?.weight ?? null, wtFactor),
    bust: fmt(m?.bust ?? null, lenFactor),
    waist: fmt(m?.waist ?? null, lenFactor),
    hips: fmt(m?.hips ?? null, lenFactor),
    shoe_size: fmt(m?.shoe_size ?? null, 1), // always US
  }
}

function toMeasurements(form: FormState, unit: Unit): MeasurementsInput {
  const lenFactor = unit === 'metric' ? IN_PER_CM : 1
  const wtFactor = unit === 'metric' ? LB_PER_KG : 1
  const num = (s: string, factor: number) => {
    const v = parseFloat(s)
    return Number.isNaN(v) ? null : Math.round(v * factor * 10) / 10
  }
  return {
    height: num(form.height, lenFactor),
    weight: num(form.weight, wtFactor),
    bust: num(form.bust, lenFactor),
    waist: num(form.waist, lenFactor),
    hips: num(form.hips, lenFactor),
    shoe_size: num(form.shoe_size, 1),
  }
}

export function ProfileView({
  initialProfile,
  initialBrandSizes,
}: {
  initialProfile: Profile | null
  initialBrandSizes: BrandSize[]
}) {
  const [unit, setUnit] = useState<Unit>('imperial')
  const [form, setForm] = useState<FormState>(() => toForm(initialProfile, 'imperial'))
  const [saved, setSaved] = useState(false)
  const [brandSizes, setBrandSizes] = useState<BrandSize[]>(initialBrandSizes)
  const [newBrand, setNewBrand] = useState('')
  const [newGarment, setNewGarment] = useState<Garment>('tops')
  const [newSize, setNewSize] = useState('')
  const { saveMeasurements, addBrandSize, removeBrandSize, isSaving, error } = useProfile()

  function switchUnit(next: Unit) {
    if (next === unit) return
    // convert current form values through the stored (in/lbs) representation
    setForm(toForm(toMeasurements(form, unit), next))
    setUnit(next)
  }

  async function handleSave() {
    setSaved(false)
    const ok = await saveMeasurements(toMeasurements(form, unit))
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleAddBrandSize(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newBrand.trim() || !newSize.trim()) return
    const row = await addBrandSize(newBrand, newGarment, newSize)
    if (row) {
      setBrandSizes((prev) => [
        ...prev.filter((b) => b.id !== row.id),
        row,
      ])
      setNewBrand('')
      setNewSize('')
    }
  }

  async function handleRemove(id: string) {
    const ok = await removeBrandSize(id)
    if (ok) setBrandSizes((prev) => prev.filter((b) => b.id !== id))
  }

  const lenUnit = unit === 'metric' ? 'cm' : 'in'
  const wtUnit = unit === 'metric' ? 'kg' : 'lbs'
  const fields: { key: keyof FormState; label: string; suffix: string }[] = [
    { key: 'height', label: 'Height', suffix: lenUnit },
    { key: 'weight', label: 'Weight', suffix: wtUnit },
    { key: 'bust', label: 'Bust', suffix: lenUnit },
    { key: 'waist', label: 'Waist', suffix: lenUnit },
    { key: 'hips', label: 'Hips', suffix: lenUnit },
    { key: 'shoe_size', label: 'Shoe size', suffix: 'US' },
  ]

  return (
    <div className="flex flex-col gap-8 px-4 pb-8">
      {/* Measurements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">Measurements</p>
          <div className="flex rounded-lg border border-ink/12 overflow-hidden text-xs font-medium">
            <button
              onClick={() => switchUnit('imperial')}
              className={`px-3 py-1.5 ${unit === 'imperial' ? 'bg-accent text-white' : 'text-ink/50 bg-white'}`}
            >
              in / lbs
            </button>
            <button
              onClick={() => switchUnit('metric')}
              className={`px-3 py-1.5 ${unit === 'metric' ? 'bg-accent text-white' : 'text-ink/50 bg-white'}`}
            >
              cm / kg
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-xs text-ink/50">{f.label}</span>
              <div className="flex items-center bg-white border border-ink/12 rounded-xl px-3">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="flex-1 py-3 text-sm outline-none min-w-0"
                  placeholder="—"
                />
                <span className="text-xs text-ink/30 shrink-0 pl-1">{f.suffix}</span>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 w-full bg-accent text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40"
        >
          {isSaving ? 'Saving…' : saved ? 'Saved ✓' : 'Save measurements'}
        </button>
      </section>

      {/* Brand sizes */}
      <section>
        <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1">My brand sizes</p>
        <p className="text-xs text-ink/40 mb-3 leading-relaxed">
          Sizes you know fit you — used to recommend sizes at other brands.
        </p>

        {brandSizes.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {brandSizes.map((bs) => (
              <div
                key={bs.id}
                className="flex items-center gap-2 bg-white border border-ink/8 rounded-xl px-3 py-2.5"
              >
                <span className="text-sm font-medium flex-1 min-w-0 truncate">{bs.brand}</span>
                <span className="text-[11px] text-ink/40 bg-ink/5 rounded-full px-2 py-0.5 capitalize">
                  {bs.garment}
                </span>
                <span className="text-sm font-semibold text-accent">{bs.size}</span>
                <button
                  onClick={() => handleRemove(bs.id)}
                  aria-label={`Remove ${bs.brand} size`}
                  className="text-ink/30 text-lg leading-none pl-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddBrandSize} className="flex flex-col gap-2">
          <input
            type="text"
            list="known-brands"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="Brand (e.g. Zara)"
            className="bg-white border border-ink/12 rounded-xl px-3 py-3 text-sm placeholder:text-ink/30 outline-none focus:border-accent"
          />
          <datalist id="known-brands">
            {BRAND_FITS.map((b) => (
              <option key={b.displayName} value={b.displayName} />
            ))}
          </datalist>
          <div className="flex gap-2">
            <select
              value={newGarment}
              onChange={(e) => setNewGarment(e.target.value as Garment)}
              className="flex-1 bg-white border border-ink/12 rounded-xl px-3 py-3 text-sm outline-none"
            >
              {GARMENTS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Size (M, 28, 8.5)"
              className="flex-1 bg-white border border-ink/12 rounded-xl px-3 py-3 text-sm placeholder:text-ink/30 outline-none focus:border-accent min-w-0"
            />
            <button
              type="submit"
              disabled={!newBrand.trim() || !newSize.trim()}
              className="bg-accent text-white rounded-xl px-4 text-sm font-semibold disabled:opacity-40 shrink-0"
            >
              Add
            </button>
          </div>
        </form>
      </section>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
