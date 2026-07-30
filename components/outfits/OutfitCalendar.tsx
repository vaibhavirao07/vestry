'use client'

import { useState, useEffect } from 'react'
import type { OutfitStats } from '@/types/database'
import { AddOutfitSheet } from './AddOutfitSheet'
import { OutfitDaySheet } from './OutfitDaySheet'

type Props = {
  initialOutfits: OutfitStats[]
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function OutfitCalendar({ initialOutfits }: Props) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [outfits, setOutfits] = useState<OutfitStats[]>(initialOutfits)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitStats | null>(null)

  // Load outfits for current month
  useEffect(() => {
    async function loadOutfits() {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const res = await fetch(`/api/outfits?year=${year}&month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setOutfits(data.outfits || [])
      }
    }
    loadOutfits()
  }, [currentMonth])

  function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  function handleNextMonth() {
    // Only allow navigation to current month or earlier
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    if (nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(nextMonth)
    }
  }

  function handleCellClick(day: number) {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    // Block future dates
    if (clickedDate > today) return

    const outfit = outfits.find(o => {
      if (!o.worn_date) return false
      const oDate = new Date(o.worn_date)
      return oDate.getFullYear() === clickedDate.getFullYear() &&
             oDate.getMonth() === clickedDate.getMonth() &&
             oDate.getDate() === clickedDate.getDate()
    })

    if (outfit) {
      setSelectedOutfit(outfit)
      setDetailSheetOpen(true)
    } else {
      setSelectedDate(clickedDate)
      setAddSheetOpen(true)
    }
  }

  function handleOutfitAdded(newOutfit: OutfitStats) {
    setOutfits([...outfits, newOutfit])
    setAddSheetOpen(false)
  }

  function handleOutfitDeleted() {
    setOutfits(outfits.filter(o => o.outfit_id !== selectedOutfit?.outfit_id))
    setDetailSheetOpen(false)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-ink/40 hover:text-ink transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={handleNextMonth}
              disabled={currentMonth.getTime() >= new Date(today.getFullYear(), today.getMonth(), 1).getTime()}
              className="p-2 text-ink/40 hover:text-ink disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-xs font-semibold text-ink/40 text-center py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />
              }

              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isFuture = cellDate > today
              const outfit = outfits.find(o => {
                if (!o.worn_date) return false
                const oDate = new Date(o.worn_date)
                return oDate.getFullYear() === cellDate.getFullYear() &&
                       oDate.getMonth() === cellDate.getMonth() &&
                       oDate.getDate() === cellDate.getDate()
              })

              return (
                <button
                  key={day}
                  onClick={() => handleCellClick(day)}
                  disabled={isFuture}
                  className={`aspect-square rounded-xl border border-ink/8 overflow-hidden relative group transition-all ${
                    isFuture ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer hover:border-ink/20'
                  } ${outfit ? 'bg-cover bg-center' : 'bg-white hover:bg-ink/2'}`}
                  style={outfit?.photo_url ? { backgroundImage: `url(${outfit.photo_url})` } : {}}
                >
                  {/* Date number */}
                  <div className="absolute top-1 left-1 text-xs font-semibold text-ink z-10">
                    {day}
                  </div>

                  {/* Empty state: + icon */}
                  {!outfit && !isFuture && (
                    <div className="absolute inset-0 flex items-center justify-center text-ink/20 group-hover:text-ink/40 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add outfit sheet */}
      <AddOutfitSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        selectedDate={selectedDate}
        onOutfitAdded={handleOutfitAdded}
      />

      {/* Outfit detail sheet */}
      {selectedOutfit && (
        <OutfitDaySheet
          open={detailSheetOpen}
          onClose={() => setDetailSheetOpen(false)}
          outfit={selectedOutfit}
          onOutfitDeleted={handleOutfitDeleted}
        />
      )}
    </>
  )
}
