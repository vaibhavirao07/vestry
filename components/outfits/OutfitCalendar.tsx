'use client'

import { useState, useEffect } from 'react'
import type { OutfitStats, ItemStats, Category } from '@/types/database'
import { MoodBoardCollage } from './MoodBoardCollage'
import { DayPickerSheet } from './DayPickerSheet'
import { OutfitDaySheet } from './OutfitDaySheet'

type OutfitWithItems = OutfitStats & { items: ItemStats[] }

type Props = {
  initialOutfits: OutfitWithItems[]
  categories: Category[]
  allItems: ItemStats[]
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function OutfitCalendar({ initialOutfits, categories, allItems }: Props) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [outfits, setOutfits] = useState<OutfitWithItems[]>(initialOutfits)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitWithItems | null>(null)

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
    // Monday = 0, Sunday = 6
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  function handleNextMonth() {
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
      setDetailOpen(true)
    } else {
      setSelectedDate(clickedDate)
      setPickerOpen(true)
    }
  }

  async function handleSaveOutfit(itemIds: string[]) {
    if (!selectedDate) return
    const res = await fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wornDate: selectedDate.toISOString().split('T')[0],
        selectedItemIds: itemIds,
      }),
    })
    if (res.ok) {
      const newOutfit = await res.json()
      setOutfits([...outfits, newOutfit])
      setPickerOpen(false)
    }
  }

  function handleOutfitUpdated(updated: OutfitWithItems) {
    setOutfits(outfits.map(o => o.outfit_id === updated.outfit_id ? updated : o))
    setSelectedOutfit(updated)
  }

  function handleOutfitDeleted() {
    setOutfits(outfits.filter(o => o.outfit_id !== selectedOutfit?.outfit_id))
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Month header */}
        <div className="px-4 pt-4 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
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
          <div className="grid grid-cols-7 gap-1 mb-2">
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
              const isToday = cellDate.toDateString() === today.toDateString()
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
                  className={`aspect-square rounded-lg border-2 overflow-hidden relative group transition-all ${
                    isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isToday ? 'border-accent' : outfit ? 'border-ink/8' : 'border-ink/8 hover:border-ink/20'
                  } ${
                    outfit ? 'bg-white' : 'bg-white hover:bg-ink/2'
                  }`}
                >
                  {/* Date number */}
                  <div className="absolute top-1 left-1 text-xs font-semibold text-ink z-20">
                    {day}
                  </div>

                  {/* Collage or empty state */}
                  {outfit ? (
                    <div className="inset-0 w-full h-full">
                      <MoodBoardCollage items={outfit.items} size="thumbnail" />
                    </div>
                  ) : !isFuture && (
                    <div className="absolute inset-0 flex items-center justify-center text-ink/20 group-hover:text-ink/40 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
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

      {/* Picker sheet */}
      <DayPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedDate={selectedDate}
        categories={categories}
        allItems={allItems}
        onSave={handleSaveOutfit}
      />

      {/* Detail sheet */}
      {selectedOutfit && (
        <OutfitDaySheet
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          outfit={selectedOutfit}
          categories={categories}
          allItems={allItems}
          onOutfitUpdated={handleOutfitUpdated}
          onOutfitDeleted={handleOutfitDeleted}
        />
      )}
    </>
  )
}
