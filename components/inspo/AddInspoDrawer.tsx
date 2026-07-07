'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useAddInspo } from '@/hooks/useAddInspo'
import type { InspoPost } from '@/types/database'
import type { ClosetItemLite, InspoAnalysis } from '@/types/inspo'

type Props = {
  open: boolean
  onClose: () => void
  closetItems: ClosetItemLite[]
  onAdded: (post: InspoPost) => void
}

type Step = 'input' | 'analysing' | 'preview'

async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  return dataUrl.split(',')[1]
}

async function base64ToBlob(base64: string, mediaType: string): Promise<Blob> {
  const res = await fetch(`data:${mediaType};base64,${base64}`)
  return res.blob()
}

export function AddInspoDrawer({ open, onClose, closetItems, onAdded }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState<InspoAnalysis | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addInspo, isSaving, error: saveError } = useAddInspo()

  function reset() {
    setStep('input')
    setUrl('')
    setAnalysis(null)
    setImageBlob(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSourceUrl(null)
    setErrorMsg(null)
  }

  function handleClose() {
    onClose()
    setTimeout(reset, 300)
  }

  async function analyse(body: Record<string, unknown>, blob: Blob | null, source: string | null) {
    setStep('analysing')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/inspo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, closetItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed')

      let finalBlob = blob
      if (!finalBlob && data.image) {
        finalBlob = await base64ToBlob(data.image.base64, data.image.mediaType)
      }
      if (!finalBlob) throw new Error('No image available')

      setAnalysis(data.analysis)
      setImageBlob(finalBlob)
      setPreviewUrl(URL.createObjectURL(finalBlob))
      setSourceUrl(source)
      setStep('preview')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed')
      setStep('input')
    }
  }

  async function handleUrlSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!url.trim()) return
    await analyse({ url: url.trim() }, null, url.trim())
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image is too large (max 8 MB)')
      return
    }
    const base64 = await fileToBase64(file)
    await analyse({ imageBase64: base64, mediaType: file.type }, file, null)
  }

  async function handleSave() {
    if (!analysis || !imageBlob) return
    const post = await addInspo(imageBlob, analysis, sourceUrl)
    if (post) {
      onAdded(post)
      handleClose()
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-surface rounded-t-3xl transition-transform duration-300 ease-out max-h-[88dvh] ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <span className="w-12" />
          <h2 className="text-base font-semibold text-ink">
            {step === 'preview' ? 'Save Inspo' : 'Add Inspo'}
          </h2>
          <button onClick={handleClose} className="text-ink/40 text-sm w-12 text-right">
            Cancel
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-8">
          {step === 'input' && (
            <div className="flex flex-col gap-4">
              <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">
                  Paste a link
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="TikTok, Pinterest or Instagram URL"
                    className="flex-1 bg-white border border-ink/12 rounded-xl px-4 py-3 text-sm placeholder:text-ink/30 outline-none focus:border-accent min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!url.trim()}
                    className="bg-accent text-white rounded-xl px-4 text-sm font-semibold disabled:opacity-40 shrink-0"
                  >
                    Analyse
                  </button>
                </div>
                <p className="text-[11px] text-ink/40 leading-relaxed">
                  Instagram links often can&apos;t be read — upload a screenshot instead.
                </p>
              </form>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-ink/8" />
                <span className="text-xs text-ink/30">or</span>
                <div className="flex-1 h-px bg-ink/8" />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-ink/15 rounded-2xl py-10 flex flex-col items-center gap-2 text-ink/40 active:border-accent active:text-accent"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z" />
                </svg>
                <span className="text-sm font-medium">Upload a screenshot</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFile}
                className="hidden"
              />

              {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
            </div>
          )}

          {step === 'analysing' && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-ink/50">Analysing the look…</p>
            </div>
          )}

          {step === 'preview' && analysis && (
            <div className="flex flex-col gap-4">
              {previewUrl && (
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100">
                  <Image src={previewUrl} alt="Inspo preview" fill className="object-cover object-top" unoptimized />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold bg-accent text-white px-2.5 py-1 rounded-full capitalize">
                  {analysis.aesthetic}
                </span>
                <span className="text-xs text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full">
                  {analysis.occasion}
                </span>
                {analysis.palette.map((colour) => (
                  <span key={colour} className="text-[11px] text-ink/40 bg-white border border-ink/8 px-2 py-1 rounded-full capitalize">
                    {colour}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {analysis.garments.map((g, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-ink/8 rounded-xl px-3 py-2.5">
                    <span className={`text-sm shrink-0 ${g.owned_item_name ? 'text-green-600' : 'text-ink/25'}`}>
                      {g.owned_item_name ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight capitalize line-clamp-1">{g.name}</p>
                      <p className={`text-[11px] line-clamp-1 ${g.owned_item_name ? 'text-green-600/80' : 'text-ink/40'}`}>
                        {g.owned_item_name ? `You own: ${g.owned_item_name}` : 'Not in your closet'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-accent text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-40"
              >
                {isSaving ? 'Saving…' : 'Save to mood board'}
              </button>
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
