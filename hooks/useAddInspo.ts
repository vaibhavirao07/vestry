'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { InspoPost } from '@/types/database'
import type { InspoAnalysis } from '@/types/inspo'

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export function useAddInspo() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addInspo(
    imageBlob: Blob,
    analysis: InspoAnalysis,
    sourceUrl: string | null,
  ): Promise<InspoPost | null> {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setIsSaving(false)
      return null
    }

    const ext = EXT_BY_TYPE[imageBlob.type] ?? 'jpg'
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('inspo')
      .upload(path, imageBlob, { contentType: imageBlob.type })

    if (uploadErr) {
      setError(uploadErr.message)
      setIsSaving(false)
      return null
    }

    const { data: { publicUrl } } = supabase.storage.from('inspo').getPublicUrl(path)

    const { data: post, error: insertErr } = await supabase
      .from('inspo_posts')
      .insert({
        user_id: user.id,
        source_url: sourceUrl,
        image_url: publicUrl,
        aesthetic: analysis.aesthetic,
        occasion: analysis.occasion,
        palette: analysis.palette,
        garments: analysis.garments,
      })
      .select()
      .single()

    setIsSaving(false)
    if (insertErr) {
      setError(insertErr.message)
      return null
    }
    return post
  }

  async function removeInspo(post: InspoPost): Promise<boolean> {
    setError(null)
    const supabase = createClient()

    const { error: err } = await supabase.from('inspo_posts').delete().eq('id', post.id)
    if (err) {
      setError(err.message)
      return false
    }
    // best-effort storage cleanup — path is everything after /inspo/ in the public URL
    const path = post.image_url.split('/inspo/')[1]
    if (path) await supabase.storage.from('inspo').remove([path])
    return true
  }

  return { addInspo, removeInspo, isSaving, error }
}
