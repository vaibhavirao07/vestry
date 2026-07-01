'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checkInbox, setCheckInbox] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error('[SignupForm] signUp error:', error)
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Email confirmation disabled in Supabase → session returned immediately
    if (data.session) {
      window.location.href = '/closet'
      return
    }

    // Email confirmation is enabled → ask user to check inbox
    setCheckInbox(true)
    setIsLoading(false)
  }

  if (checkInbox) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-7 h-7 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-ink">Check your inbox</p>
          <p className="mt-1 text-sm text-ink/50">
            We sent a confirmation link to <span className="text-ink font-medium">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
        <Link href="/auth/login" className="text-sm text-accent font-medium mt-2">
          Back to sign in
        </Link>
      </div>
    )
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          required
          className={inputCls}
        />
      </Field>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-ink/50">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-accent font-medium">
          Sign in
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
