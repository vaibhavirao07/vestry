export type NudgeVerdict = 'green' | 'amber' | 'red'

export type RuleViolation = {
  rule: 'duplicate' | 'unworn' | 'mismatch' | 'impulse'
  detail: string
}

export type NudgeResult = {
  verdict: NudgeVerdict
  violations: RuleViolation[]
  message: string
}
