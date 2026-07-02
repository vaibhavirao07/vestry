'use client'

import { useState } from 'react'
import { ShopResultCard } from './ShopResultCard'
import type { ClosetSummary, ShopResult } from '@/types/shop'

const EXAMPLE_QUERIES = [
  'white sneakers that go with everything',
  'a blazer for casual Fridays',
  'something fun for a summer date',
]

export function ShopView({ closetSummary }: { closetSummary: ClosetSummary }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ShopResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchedFor, setSearchedFor] = useState<string | null>(null)

  async function runSearch(q: string) {
    if (!q.trim() || loading) return
    setQuery(q)
    setLoading(true)
    setSearched(true)
    setResults([])
    setSearchedFor(null)

    const res = await fetch('/api/shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, closetSummary }),
    })
    const data = await res.json()
    setResults(data.results ?? [])
    setSearchedFor(data.parsedIntent?.channel3Query ?? null)
    setLoading(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runSearch(query)
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto pb-4">
      <form onSubmit={handleSubmit} className="px-4 pb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. white shoes that go with everything"
          className="flex-1 bg-white border border-ink/12 rounded-xl px-4 py-3 text-sm placeholder:text-ink/30 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="bg-accent text-white rounded-xl px-4 text-sm font-semibold disabled:opacity-40 shrink-0"
        >
          {loading ? '…' : 'Find'}
        </button>
      </form>

      {loading && (
        <div className="px-4 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-ink/8 h-72 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-sm text-ink/40">No results. Try a different description.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="px-4 flex flex-col gap-4">
          {searchedFor && (
            <p className="text-xs text-ink/40">Searched for: &ldquo;{searchedFor}&rdquo;</p>
          )}
          {results.map((r, i) => (
            <ShopResultCard key={i} result={r} />
          ))}
        </div>
      )}

      {!searched && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-10 h-10 text-ink/20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          <p className="text-sm text-ink/50 leading-relaxed max-w-xs">
            Describe what you&apos;re looking for — Claude matches it to your wardrobe and finds the best options.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
            {EXAMPLE_QUERIES.map((eg) => (
              <button
                key={eg}
                onClick={() => runSearch(eg)}
                className="text-left text-xs text-accent border border-accent/20 bg-accent/5 rounded-xl px-3 py-2.5"
              >
                &ldquo;{eg}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
