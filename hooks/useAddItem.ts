'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Item } from '@/types/database'
import type { ItemFormData } from '@/components/closet/ItemForm'

export function useAddItem() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addItem(data: ItemFormData): Promise<Item | null> {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setIsLoading(false)
      return null
    }

    const { data: item, error: err } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        name: data.name.trim(),
        brand: data.brand.trim() || null,
        colour: data.colour.trim() || null,
        price: data.price ? parseFloat(data.price) : null,
        category_id: data.category_id || null,
        notes: data.notes.trim() || null,
        image_url: data.image_url || null,
        source_url: data.source_url || null,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setIsLoading(false)
      return null
    }

    setIsLoading(false)
    return item
  }

  return { addItem, isLoading, error }
}
