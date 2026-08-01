'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OutfitStats } from '@/types/database'

type SavePayload = {
  name: string
  occasion: string | null
  itemIds: string[]
}

export function useSaveOutfit() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveOutfit(payload: SavePayload): Promise<OutfitStats | null> {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Sign in to save outfits')
      setIsLoading(false)
      return null
    }

    const { data: outfit, error: outfitErr } = await supabase
      .from('outfits')
      .insert({
        user_id: user.id,
        name: payload.name.trim(),
        occasion: payload.occasion || null,
      })
      .select()
      .single()

    if (outfitErr || !outfit) {
      setError(outfitErr?.message ?? 'Failed to save outfit')
      setIsLoading(false)
      return null
    }

    if (payload.itemIds.length > 0) {
      const { error: itemsErr } = await supabase
        .from('outfit_items')
        .insert(payload.itemIds.map((item_id) => ({ outfit_id: outfit.id, item_id })))

      if (itemsErr) {
        setError(itemsErr.message)
        setIsLoading(false)
        return null
      }
    }

    setIsLoading(false)
    return {
      outfit_id: outfit.id,
      user_id: outfit.user_id,
      name: outfit.name,
      occasion: outfit.occasion,
      photo_url: outfit.photo_url ?? null,
      worn_date: outfit.worn_date ?? null,
      created_at: outfit.created_at,
      times_worn: 0,
    }
  }

  return { saveOutfit, isLoading, error }
}
