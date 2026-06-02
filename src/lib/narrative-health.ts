export type NarrativeHealthInput = {
  positioningSummary?: string | null
  linkedinHeadline?: string | null
  linkedinAbout?: string | null
  narrativeVersionCount?: number | null
}

export type NarrativeHealthResult = {
  score: number
  band: 'strong' | 'developing' | 'fragile'
  gaps: string[]
}

function hasQuantifiedOutcome(text: string): boolean {
  return /\b\d+(%|x|k|m|b)?\b/i.test(text)
}

function hasForwardFrame(text: string): boolean {
  return /(seeking|targeting|next|now|role|mandate)/i.test(text)
}

export function evaluateNarrativeHealth(input: NarrativeHealthInput): NarrativeHealthResult {
  const positioning = (input.positioningSummary ?? '').trim()
  const headline = (input.linkedinHeadline ?? '').trim()
  const about = (input.linkedinAbout ?? '').trim()
  const versions = input.narrativeVersionCount ?? 0

  let score = 0
  const gaps: string[] = []

  if (positioning.length >= 120) {
    score += 35
  } else {
    gaps.push('Positioning summary is too short to carry your executive identity under pressure.')
  }

  if (hasQuantifiedOutcome(positioning) || hasQuantifiedOutcome(about)) {
    score += 25
  } else {
    gaps.push('Narrative does not include quantified outcomes from recent leadership chapters.')
  }

  if (hasForwardFrame(positioning)) {
    score += 20
  } else {
    gaps.push('Positioning does not clearly frame why this role, why now.')
  }

  if (headline.length >= 20 && about.length >= 120) {
    score += 10
  } else {
    gaps.push('LinkedIn headline/about are incomplete for consistent market narrative.')
  }

  if (versions >= 2) {
    score += 10
  } else {
    gaps.push('Narrative has not been versioned yet; capture at least one update checkpoint.')
  }

  const clamped = Math.max(0, Math.min(100, score))
  const band: NarrativeHealthResult['band'] = clamped >= 80 ? 'strong' : clamped >= 55 ? 'developing' : 'fragile'

  return { score: clamped, band, gaps }
}