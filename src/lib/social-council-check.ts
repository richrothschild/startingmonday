export const ALLOWED_EMOTIONAL_ANGLES = [
  'candid_humility',
  'practical_relief',
  'conviction',
  'earned_optimism',
  'urgency',
  'grounded_concern',
] as const

export type EmotionalAngle = (typeof ALLOWED_EMOTIONAL_ANGLES)[number]

export type CouncilRecommendation = 'publish' | 'revise' | 'rewrite-opening'

export type ShortFormCouncilCheck = {
  score: number
  characterCount: number
  recommendation: CouncilRecommendation
  councilPass: boolean
  categories: {
    hook: number
    specificity: number
    credibility: number
    wit: number
    compression: number
    cta: number
  }
  checks: {
    under1200: boolean
    oneCoreIdea: boolean
    oneCta: boolean
    oneHumorLineMax: boolean
    realDetail: boolean
    honestClaim: boolean
    emotionalAnglePresent: boolean
    emotionalAngleRotation: boolean
  }
  emotionalAngle: EmotionalAngle | null
  previousEmotionalAngle: EmotionalAngle | null
  textHash: string
  topFixes: string[]
}

function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern)
  return matches ? matches.length : 0
}

export function hashDraftText(input: string): string {
  // Simple deterministic hash for pass-stamp validation without extra dependencies.
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i)
  }
  return `h${(hash >>> 0).toString(16)}`
}

export function getNoteToken(notes: string | null | undefined, key: string): string | null {
  if (!notes) return null
  const prefix = `${key}=`
  const token = notes
    .split('|')
    .map(part => part.trim())
    .find(part => part.startsWith(prefix))
  if (!token) return null
  const value = token.slice(prefix.length).trim()
  return value || null
}

export function setNoteToken(notes: string | null | undefined, key: string, value: string | null): string | null {
  const tokens = (notes ?? '')
    .split('|')
    .map(part => part.trim())
    .filter(Boolean)
    .filter(part => !part.startsWith(`${key}=`))

  if (value !== null && value.trim()) {
    tokens.push(`${key}=${value.trim()}`)
  }

  return tokens.length > 0 ? tokens.join(' | ') : null
}

export function evaluateShortFormCouncilCheck(
  draftText: string,
  emotionalAngle: EmotionalAngle | null,
  previousEmotionalAngle: EmotionalAngle | null,
): ShortFormCouncilCheck {
  const trimmed = draftText.trim()
  const characterCount = trimmed.length
  const lines = trimmed.split('\n').map(line => line.trim()).filter(Boolean)
  const firstLine = lines[0] ?? ''

  const ctaHits = countMatches(trimmed, /(comment|reply|dm|message me|send me|if you want|if this is useful|open to)/gi)
  const humorHits = countMatches(trimmed, /(funny|joke|laugh|smile|recap theater|recap theatre|ironic|irony)/gi)
  const detailHits = countMatches(trimmed, /(\d|week|today|yesterday|client|call|session|pilot|quote|"|')/gi)
  const hedgeHits = countMatches(trimmed, /(usually|often|most|in our pilot|in week one|we are seeing|pattern)/gi)
  const overclaimHits = countMatches(trimmed, /(always|never|everyone|no one|guaranteed|proves)/gi)

  const under1200 = characterCount <= 1200
  const oneCta = ctaHits >= 1 && ctaHits <= 2
  const oneHumorLineMax = humorHits <= 1
  const realDetail = detailHits >= 2
  const honestClaim = overclaimHits === 0 || hedgeHits >= 1
  const oneCoreIdea = countMatches(trimmed, /(\n\n)/g) <= 7
  const emotionalAnglePresent = !!emotionalAngle
  const emotionalAngleRotation = !previousEmotionalAngle || !emotionalAngle || previousEmotionalAngle !== emotionalAngle

  const hook = firstLine.length >= 28 && firstLine.length <= 140 ? 22 : 15
  const specificity = realDetail ? 17 : 11
  const credibility = honestClaim ? 17 : 10
  const wit = oneHumorLineMax ? (humorHits === 1 ? 14 : 10) : 6
  const compression = under1200 ? (characterCount <= 1100 ? 10 : 8) : 3
  const cta = oneCta ? 9 : 5

  const score = hook + specificity + credibility + wit + compression + cta

  const recommendation: CouncilRecommendation =
    score >= 84 ? 'publish' : score >= 72 ? 'revise' : 'rewrite-opening'

  const councilPass =
    recommendation === 'publish' &&
    under1200 &&
    oneCoreIdea &&
    oneCta &&
    oneHumorLineMax &&
    realDetail &&
    honestClaim &&
    emotionalAnglePresent &&
    emotionalAngleRotation

  const topFixes: string[] = []
  if (!under1200) topFixes.push('Trim to 1200 characters or fewer before publishing.')
  if (!emotionalAnglePresent) topFixes.push('Select a primary emotional angle for this post.')
  if (!emotionalAngleRotation) topFixes.push('Rotate emotional angle from the previous post before publishing.')
  if (!realDetail) topFixes.push('Add one lived detail: a role, week marker, number, or direct quote.')
  if (!oneCta) topFixes.push('Keep exactly one clear CTA in the final two lines.')
  if (!honestClaim) topFixes.push('Replace absolute claims with precise, evidence-aware wording.')
  if (hook < 19) topFixes.push('Rewrite the opening line to be sharper and more specific.')
  if (!oneHumorLineMax) topFixes.push('Use one subtle humor beat maximum.')

  if (topFixes.length === 0) {
    topFixes.push('Post is publish-ready under the current council rubric.')
  }

  return {
    score,
    characterCount,
    recommendation,
    councilPass,
    categories: { hook, specificity, credibility, wit, compression, cta },
    checks: {
      under1200,
      oneCoreIdea,
      oneCta,
      oneHumorLineMax,
      realDetail,
      honestClaim,
      emotionalAnglePresent,
      emotionalAngleRotation,
    },
    emotionalAngle,
    previousEmotionalAngle,
    textHash: hashDraftText(trimmed),
    topFixes: topFixes.slice(0, 4),
  }
}
