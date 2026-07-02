'use client'

type Props = {
  verdict: 'amber' | 'red'
  message: string
}

export function NudgeBanner({ verdict, message }: Props) {
  return (
    <div
      className={`mx-2.5 mb-2 rounded-lg px-2.5 py-1.5 text-[10px] leading-tight flex items-start gap-1.5 ${
        verdict === 'red'
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-amber-50 border border-amber-200 text-amber-700'
      }`}
    >
      <span className="shrink-0 mt-px">{verdict === 'red' ? '🚩' : '💛'}</span>
      <span>{message}</span>
    </div>
  )
}
