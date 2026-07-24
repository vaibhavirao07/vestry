'use client'

import { useState } from 'react'
import type { Category } from '@/types/database'

export type ItemFormData = {
  name: string
  brand: string
  colour: string
  price: string
  category_id: string
  notes: string
  image_url: string
  source_url: string
}

const empty: ItemFormData = {
  name: '', brand: '', colour: '', price: '',
  category_id: '', notes: '', image_url: '', source_url: '',
}

interface Props {
  prefill?: Partial<ItemFormData>
  categories: Category[]
  onSubmit: (data: ItemFormData) => void
  isLoading?: boolean
  isEditing?: boolean
}

export function ItemForm({ prefill, categories, onSubmit, isLoading, isEditing }: Props) {
  const [form, setForm] = useState<ItemFormData>({ ...empty, ...prefill })

  function set(field: keyof ItemFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {form.image_url && (
        <div className="relative h-40 rounded-xl overflow-hidden bg-accent/8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      <Field label="Name *">
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Levi's 501 Jeans"
          className={inputCls}
          required
        />
      </Field>

      <Field label="Brand">
        <input
          type="text"
          value={form.brand}
          onChange={(e) => set('brand', e.target.value)}
          placeholder="e.g. Levi's"
          className={inputCls}
        />
      </Field>

      <div className="flex gap-3">
        <Field label="Colour" className="flex-1">
          <input
            type="text"
            value={form.colour}
            onChange={(e) => set('colour', e.target.value)}
            placeholder="e.g. Dark indigo"
            className={inputCls}
          />
        </Field>
        <Field label="Price ($)" className="w-28">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0.00"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Category *">
        <select
          value={form.category_id}
          onChange={(e) => set('category_id', e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any notes…"
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </Field>

      <button
        type="submit"
        disabled={!form.name.trim() || isLoading}
        className="mt-2 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Saving…' : isEditing ? 'Update item' : 'Save item'}
      </button>
    </form>
  )
}

const inputCls =
  'w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent transition-colors placeholder:text-ink/30'

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label className="text-xs font-medium text-ink/50 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}
