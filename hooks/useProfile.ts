'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BrandSize } from '@/types/database'
import type { Garment } from '@/types/profile'

export type MeasurementsInput = {
  height: number | null
  weight: number | null
  bust: number | null
  waist: number | null
  hips: number | null
  shoe_size: number | null
}

export function useProfile() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveMeasurements(m: MeasurementsInput): Promise<boolean> {
    setIsSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setIsSaving(false)
      return false
    }

    const { error: err } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, ...m, updated_at: new Date().toISOString() })

    setIsSaving(false)
    if (err) {
      setError(err.message)
      return false
    }
    return true
  }

  async function addBrandSize(brand: string, garment: Garment, size: string): Promise<BrandSize | null> {
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      return null
    }

    const { data, error: err } = await supabase
      .from('brand_sizes')
      .upsert(
        { user_id: user.id, brand: brand.trim(), garment, size: size.trim() },
        { onConflict: 'user_id,brand,garment' },
      )
      .select()
      .single()

    if (err) {
      setError(err.message)
      return null
    }
    return data
  }

  async function removeBrandSize(id: string): Promise<boolean> {
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('brand_sizes').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    return true
  }

  return { saveMeasurements, addBrandSize, removeBrandSize, isSaving, error }
}
