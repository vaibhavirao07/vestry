'use client'

import type { Category } from '@/types/database'

interface Props {
  categories: Category[]
  active: string | null
  onChange: (id: string | null) => void
}

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      <Pill label="All" active={active === null} onClick={() => onChange(null)} />
      {categories.map((cat) => (
        <Pill
          key={cat.id}
          label={cat.name}
          active={active === cat.id}
          onClick={() => onChange(cat.id)}
        />
      ))}
    </div>
  )
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-white text-ink border border-ink/12 hover:border-ink/24'
      }`}
    >
      {label}
    </button>
  )
}
