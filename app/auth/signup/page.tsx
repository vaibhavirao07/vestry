import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = { title: 'Create account — Vestry' }

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm flex flex-col gap-10">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-accent tracking-tight">Vestry</h1>
        <p className="mt-2 text-sm text-ink/50">Your AI wardrobe assistant</p>
      </div>
      <SignupForm />
    </div>
  )
}
