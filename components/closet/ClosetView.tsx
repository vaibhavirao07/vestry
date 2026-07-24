'use client'

import { useState } from 'react'
import type { Category, ItemStats } from '@/types/database'
import { CategoryFilter } from './CategoryFilter'
import { ItemCard } from './ItemCard'
import { AddItemDrawer } from './AddItemDrawer'
import { ItemDetailSheet } from './ItemDetailSheet'

interface Props {
  initialItems: ItemStats[]
  categories: Category[]
}

export function ClosetView({ initialItems, categories }: Props) {
  const [items, setItems] = useState(initialItems)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItemStats | null>(null)
  const [editingItem, setEditingItem] = useState<ItemStats | null>(null)

  const filtered = activeCategory
    ? items.filter((i) => i.category_id === activeCategory)
    : items

  function handleItemAdded(item: ItemStats) {
    setItems((prev) => [item, ...prev])
  }

  async function handleDelete(item: ItemStats) {
    try {
      const res = await fetch(`/api/items/${item.item_id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.item_id !== item.item_id))
        setSelectedItem(null)
      }
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  function handleEdit(item: ItemStats) {
    setEditingItem(item)
    setDrawerOpen(true)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <CategoryFilter
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {filtered.length === 0 ? (
          <EmptyState
            hasItems={items.length > 0}
            onAdd={() => setDrawerOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-6 gap-2">
            {filtered.map((item) => (
              <ItemCard key={item.item_id} item={item} onTap={setSelectedItem} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Add item"
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
          <path strokeLinecap="round" d="M12 4v16M4 12h16" />
        </svg>
      </button>

      <AddItemDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditingItem(null)
        }}
        categories={categories}
        onItemAdded={handleItemAdded}
        editingItem={editingItem}
      />

      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

function EmptyState({
  hasItems,
  onAdd,
}: {
  hasItems: boolean
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-accent/8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-8 h-8 text-accent">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C10.34 3 9 4.34 9 6c0 1.12.6 2.1 1.5 2.63V9H6a1 1 0 00-1 1v1h14v-1a1 1 0 00-1-1h-4.5v-.37C14.4 8.1 15 7.12 15 6c0-1.66-1.34-3-3-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l-2 8h18l-2-8H5z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-ink">
          {hasItems ? 'Nothing in this category' : 'Your closet is empty'}
        </p>
        <p className="text-sm text-ink/50 mt-1">
          {hasItems
            ? 'Try a different filter or add more items'
            : 'Tap + to add your first item'}
        </p>
      </div>
      {!hasItems && (
        <button
          onClick={onAdd}
          className="rounded-full bg-accent text-white px-6 py-2.5 text-sm font-semibold"
        >
          Add first item
        </button>
      )}
    </div>
  )
}
