'use client'

import { useState } from 'react'
import type { OutfitStats, ItemStats } from '@/types/database'

type ExtractedPiece = {
  name: string
  matched: boolean
  closetItemId?: string
  closetItem?: ItemStats
}

type Props = {
  open: boolean
  onClose: () => void
  selectedDate: Date | null
  onOutfitAdded: (outfit: OutfitStats) => void
}

export function AddOutfitSheet({ open, onClose, selectedDate, onOutfitAdded }: Props) {
  const [step, setStep] = useState<'upload' | 'extract'>('upload')
  const [preview, setPreview] = useState<string | null>(null)
  const [pieces, setPieces] = useState<ExtractedPiece[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newPieceName, setNewPieceName] = useState('')

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      setPreview(base64)
      setIsExtracting(true)

      try {
        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mode: 'outfit' }),
        })
        if (res.ok) {
          const data = await res.json()
          setPieces(data.pieces || [])
          setStep('extract')
        }
      } catch (err) {
        console.error('Vision extraction failed:', err)
      } finally {
        setIsExtracting(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleAddPiece() {
    if (!newPieceName.trim()) return
    setPieces([...pieces, { name: newPieceName.trim(), matched: false }])
    setNewPieceName('')
  }

  function handleRemovePiece(index: number) {
    setPieces(pieces.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!selectedDate || !preview) return
    setIsSaving(true)

    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wornDate: selectedDate.toISOString().split('T')[0],
          photoBase64: preview,
          pieces: pieces,
        }),
      })

      if (res.ok) {
        const outfit = await res.json()
        onOutfitAdded(outfit)
        reset()
      }
    } catch (err) {
      console.error('Failed to save outfit:', err)
    } finally {
      setIsSaving(false)
    }
  }

  function reset() {
    setStep('upload')
    setPreview(null)
    setPieces([])
    setNewPieceName('')
    onClose()
  }

  const dateStr = selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
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
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-ink/8">
          <div>
            <h2 className="text-base font-semibold text-ink">Log outfit</h2>
            <p className="text-xs text-ink/50">{dateStr}</p>
          </div>
          <button onClick={onClose} className="p-1 text-ink/40 hover:text-ink transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
          {step === 'upload' ? (
            <div className="flex flex-col gap-4">
              <label className="block">
                <div className="border-2 border-dashed border-accent/30 rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 text-accent/40 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-3-3m3 3l3-3m-3 9v-6m0 6H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v11a2 2 0 01-2 2H6z" />
                  </svg>
                  <p className="text-sm font-medium text-ink">Upload outfit photo</p>
                  <p className="text-xs text-ink/50 mt-1">Click to select an image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {isExtracting && (
                <p className="text-sm text-ink/50 text-center py-4">Extracting pieces…</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {preview && (
                <div className="w-full rounded-xl overflow-hidden bg-ink/5">
                  <img src={preview} alt="Outfit preview" className="w-full h-auto" />
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-ink mb-3">Pieces worn</h3>
                <div className="flex flex-col gap-2">
                  {pieces.map((piece, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-ink/8 flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink">{piece.name}</p>
                        {piece.matched && piece.closetItem ? (
                          <p className="text-xs text-accent mt-1">✓ {piece.closetItem.brand || 'Item'}</p>
                        ) : (
                          <button
                            onClick={() => {/* TODO: add to closet */}}
                            className="text-xs text-accent font-medium mt-1 hover:underline"
                          >
                            + Add to closet
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemovePiece(i)}
                        className="text-ink/40 hover:text-ink transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add piece manually */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newPieceName}
                    onChange={(e) => setNewPieceName(e.target.value)}
                    placeholder="Add a piece…"
                    className="flex-1 rounded-lg border border-ink/12 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPiece()}
                  />
                  <button
                    onClick={handleAddPiece}
                    className="px-3 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || pieces.length === 0}
                className="w-full rounded-full py-4 text-sm font-semibold transition-all
                  bg-accent text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : 'Save outfit'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
