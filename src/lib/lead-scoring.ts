export type ScoreReason = {
  label: string
  points: number
}

export type LeadScoreInput = {
  title: string | null
  channel: string | null
  outreachStatus: string | null
  isPriority: boolean
  hasEmail: boolean
  hasLinkedIn: boolean
  hasNotes: boolean
  leadAgeDays: number
  status: string
}

export type LeadRouting = {
  tier: 'hot' | 'warm' | 'nurture'
  queue: 'hot' | 'warm' | 'nurture'
}

const CHANNEL_POINTS: Record<string, number> = {
  referral: 35,
  inbound: 30,
  recruiter: 26,
  linkedin: 22,
  event: 20,
  cold: 12,
}

const OUTREACH_POINTS: Record<string, number> = {
  meeting_scheduled: 30,
  in_conversation: 22,
  reached_out: 10,
  prospect: 0,
  closed: -10,
}

const SENIORITY_KEYWORDS = [
  'chief',
  'c-level',
  'ciso',
  'cio',
  'cdo',
  'ceo',
  'cto',
  'vp',
  'head',
  'director',
  'partner',
  'founder',
]

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function agePoints(days: number): number {
  if (days <= 7) return 12
  if (days <= 30) return 8
  if (days <= 90) return 4
  if (days <= 180) return 1
  return 0
}

function containsSeniority(title: string | null): boolean {
  if (!title) return false
  const value = title.toLowerCase()
  return SENIORITY_KEYWORDS.some((keyword) => value.includes(keyword))
}

export function scoreLead(input: LeadScoreInput): { score: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = []

  const channelKey = (input.channel ?? '').toLowerCase().trim()
  const channelScore = CHANNEL_POINTS[channelKey] ?? 10
  reasons.push({ label: `Channel: ${channelKey || 'unknown'}`, points: channelScore })

  const outreachKey = (input.outreachStatus ?? 'prospect').toLowerCase().trim()
  const outreachScore = OUTREACH_POINTS[outreachKey] ?? 0
  reasons.push({ label: `Outreach stage: ${outreachKey}`, points: outreachScore })

  if (input.isPriority) reasons.push({ label: 'Marked priority', points: 15 })
  if (containsSeniority(input.title)) reasons.push({ label: 'Senior title match', points: 12 })
  if (input.hasEmail) reasons.push({ label: 'Email available', points: 8 })
  if (input.hasLinkedIn) reasons.push({ label: 'LinkedIn profile available', points: 6 })
  if (input.hasNotes) reasons.push({ label: 'Notes/context available', points: 5 })

  const recency = agePoints(input.leadAgeDays)
  reasons.push({ label: `Lead age: ${input.leadAgeDays}d`, points: recency })

  if (input.status !== 'active') reasons.push({ label: 'Inactive lead penalty', points: -20 })

  const total = reasons.reduce((sum, r) => sum + r.points, 0)
  return { score: clamp(total, 0, 100), reasons }
}

export function routeLead(score: number): LeadRouting {
  if (score >= 80) return { tier: 'hot', queue: 'hot' }
  if (score >= 55) return { tier: 'warm', queue: 'warm' }
  return { tier: 'nurture', queue: 'nurture' }
}
