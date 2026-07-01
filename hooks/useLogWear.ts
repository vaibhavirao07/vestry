'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLogWear(outfitId: string, initialCount: number) {
  const [timesWorn, setTimesWorn] = useState(initialCount)
  const [wornToday, setWornToday] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function markAsWorn() {
    if (wornToday || isLoading) return
    setIsLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    const { error } = await supabase
      .from('wear_logs')
      .insert({ user_id: user.id, outfit_id: outfitId, worn_at: today })

    if (!error) {
      setTimesWorn((n) => n + 1)
      setWornToday(true)
    }

    setIsLoading(false)
  }

  return { timesWorn, wornToday, isLoading, markAsWorn }
}
