export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4 py-12">
      {children}
    </div>
  )
}
