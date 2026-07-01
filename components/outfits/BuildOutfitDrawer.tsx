'use client'

import { useState, useEffect } from 'react'
import { ItemPickerGrid } from './ItemPickerGrid'
import { useSaveOutfit } from '@/hooks/useSaveOutfit'
import { OCCASION_TAGS } from '@/types/database'
import type { ItemStats, OutfitStats } from '@/types/database'

type Step = 'pick' | 'name'

type Props = {
  open: boolean
  items: ItemStats[]
  onClose: () => void
  onSaved: (outfit: OutfitStats) => void
}

export function BuildOutfitDrawer({ open, items, onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>('pick')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [name, setName] = useState('')
  const [occasion, setOccasion] = useState<string | null>(null)

  const { saveOutfit, isLoading, error } = useSaveOutfit()

  useEffect(() => {
    if (!open) {
      setStep('pick')
      setSelectedIds(new Set())
      setName('')
      setOccasion(null)
    }
  }, [open])

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (!name.trim()) return
    const saved = await saveOutfit({
      name,
      occasion,
      itemIds: Array.from(selectedIds),
    })
    if (saved) {
      onSaved(saved)
      onClose()
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/40 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-3xl max-h-[88dvh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-ink/15 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          {step === 'name' ? (
            <button
              onClick={() => setStep('pick')}
              className="text-accent text-sm font-medium"
            >
              ← Back
            </button>
          ) : (
            <span className="w-12" />
          )}
          <h2 className="text-base font-semibold text-ink">
            {step === 'pick' ? 'Pick items' : 'Name your outfit'}
          </h2>
          <button
            onClick={onClose}
            className="text-ink/40 text-sm w-12 text-right"
          >
            Cancel
          </button>
        </div>

        {step === 'pick' && (
          <>
            <p className="text-xs text-ink/40 text-center pb-3 shrink-0">
              {selectedIds.size === 0 ? 'Tap items to select' : `${selectedIds.size} selected`}
            </p>
            <div className="overflow-y-auto flex-1">
              <ItemPickerGrid
                items={items}
                selectedIds={selectedIds}
                onToggle={toggleItem}
              />
            </div>
            <div className="px-4 py-4 shrink-0">
              <button
                onClick={() => setStep('name')}
                disabled={selectedIds.size === 0}
                className="w-full bg-accent text-white font-semibold rounded-2xl py-4 disabled:opacity-30 transition-opacity"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 'name' && (
          <div className="flex flex-col gap-5 px-4 py-4 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wide">
                Outfit name
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Sunday Market Look"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-ink/12 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wide">
                Occasion (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setOccasion(occasion === tag ? null : tag)}
                    className={[
                      'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                      occasion === tag
                        ? 'bg-accent text-white'
                        : 'bg-white border border-ink/12 text-ink/60',
                    ].join(' ')}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={!name.trim() || isLoading}
              className="w-full bg-accent text-white font-semibold rounded-2xl py-4 disabled:opacity-30 transition-opacity mt-auto"
            >
              {isLoading ? 'Saving…' : 'Save Outfit'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
