'use client'

import { useState, useEffect } from 'react'
import type { Category, ItemStats } from '@/types/database'
import type { SearchResult } from '@/app/api/search/route'
import { ItemForm, type ItemFormData } from './ItemForm'
import { useAddItem } from '@/hooks/useAddItem'

type Step = 'search' | 'form'

interface Props {
  open: boolean
  onClose: () => void
  categories: Category[]
  onItemAdded: (item: ItemStats) => void
  editingItem?: ItemStats | null
}

export function AddItemDrawer({ open, onClose, categories, onItemAdded, editingItem }: Props) {
  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [prefill, setPrefill] = useState<Partial<ItemFormData> | undefined>()
  const { addItem, isLoading } = useAddItem()

  // Handle opening/closing and edit mode
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('search')
        setQuery('')
        setResults([])
        setPrefill(undefined)
      }, 300)
    } else if (editingItem) {
      // Pre-fill form with existing item data
      setPrefill({
        name: editingItem.name,
        brand: editingItem.brand ?? '',
        colour: editingItem.colour ?? '',
        image_url: editingItem.image_url ?? '',
        price: editingItem.price != null ? String(editingItem.price) : '',
        category_id: editingItem.category_id ?? undefined,
        notes: '',
      })
      setStep('form')
    }
  }, [open, editingItem])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  function selectResult(result: SearchResult) {
    setPrefill({
      name: result.name,
      brand: result.brand ?? '',
      image_url: result.image_url ?? '',
      source_url: result.source_url,
      price: result.price != null ? String(result.price) : '',
    })
    setStep('form')
  }

  async function handleFormSubmit(data: ItemFormData) {
    if (editingItem) {
      // Update existing item
      const res = await fetch(`/api/items/${editingItem.item_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) return

      const updated = await res.json()
      const optimistic: ItemStats = {
        item_id: updated.id,
        user_id: updated.user_id,
        name: updated.name,
        brand: updated.brand,
        colour: updated.colour,
        price: updated.price,
        category_id: updated.category_id,
        image_url: updated.image_url,
        versatility_score: editingItem.versatility_score,
        times_worn: editingItem.times_worn,
        cost_per_wear: editingItem.cost_per_wear,
        category_name: editingItem.category_name,
      }
      onItemAdded(optimistic)
      onClose()
    } else {
      // Add new item
      const item = await addItem(data)
      if (!item) return

      const optimistic: ItemStats = {
        item_id: item.id,
        user_id: item.user_id,
        name: item.name,
        brand: item.brand,
        colour: item.colour,
        price: item.price,
        category_id: item.category_id,
        image_url: item.image_url,
        versatility_score: 0,
        times_worn: 0,
        cost_per_wear: null,
      }
      onItemAdded(optimistic)
      onClose()
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-surface rounded-t-3xl transition-transform duration-300 ease-out max-h-[88vh] ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          {step === 'form' && !editingItem ? (
            <button
              onClick={() => setStep('search')}
              className="flex items-center gap-1 text-sm font-medium text-ink/60"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <h2 className="text-base font-semibold text-ink">{editingItem ? 'Edit item' : 'Add item'}</h2>
          )}
          <button onClick={onClose} className="p-1 text-ink/40 hover:text-ink transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {step === 'search' ? (
            <div className="flex flex-col gap-4">
              {/* Search input */}
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search item…"
                  autoFocus
                  className="w-full rounded-xl border border-ink/12 bg-white pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:border-accent transition-colors placeholder:text-ink/30"
                />
              </div>

              {/* Results */}
              {isSearching && (
                <p className="text-sm text-ink/40 text-center py-4">Searching…</p>
              )}

              {!isSearching && results.length > 0 && (
                <ul className="flex flex-col divide-y divide-ink/8">
                  {results.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => selectResult(r)}
                        className="flex items-center gap-3 w-full py-3 text-left hover:bg-ink/4 transition-colors rounded-xl px-1"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent/8 shrink-0">
                          {r.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-accent/30">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className="w-6 h-6">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                          {r.brand && <p className="text-xs text-ink/50">{r.brand}</p>}
                          <p className="text-xs text-accent font-medium">
                            {r.price != null ? `$${r.price.toFixed(2)}` : 'No price available'}
                          </p>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-ink/30 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!isSearching && query.length >= 2 && results.length === 0 && (
                <p className="text-sm text-ink/40 text-center py-4">No results found</p>
              )}

              {/* Manual fallback */}
              <button
                onClick={() => { setPrefill(undefined); setStep('form') }}
                className="text-sm text-accent font-medium text-center py-2"
              >
                + Add manually instead
              </button>
            </div>
          ) : (
            <ItemForm
              prefill={prefill}
              categories={categories}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              isEditing={!!editingItem}
            />
          )}
        </div>
      </div>
    </>
  )
}
