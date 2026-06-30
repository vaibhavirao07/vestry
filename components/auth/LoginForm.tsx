'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    console.log('[LoginForm] calling signInWithPassword for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('[LoginForm] result — data:', data, '| error:', error)

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    console.log('[LoginForm] success — redirecting to /closet')
    window.location.href = '/closet'
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          className={inputCls}
        />
      </Field>

      <Field label="Password">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-ink/50">
        No account?{' '}
        <Link href="/auth/signup" className="text-accent font-medium">
          Sign up
        </Link>
      </p>
    </form>
  )
}

const inputCls =
  'w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-accent transition-colors placeholder:text-ink/30'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink/50 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}
