export type CoachHandoffPayload = {
  idealLifeVision?: string
  careerVisionStatement?: string
  nextRoleCriteria?: string[]
  industries?: string[]
  companies?: string[]
}

export type CoachHandoffPreview = {
  positioningSummary: string
  targetSectors: string[]
  targetCompanies: string[]
  roleCriteria: string[]
  notes: string
}

function cleanList(values: unknown, maxItems: number): string[] {
  if (!Array.isArray(values)) return []
  const deduped = new Set<string>()
  for (const value of values) {
    if (typeof value !== 'string') continue
    const cleaned = value.trim()
    if (!cleaned) continue
    deduped.add(cleaned)
    if (deduped.size >= maxItems) break
  }
  return [...deduped]
}

function cleanText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLen)
}

export function mapCoachHandoffToPreview(input: CoachHandoffPayload): CoachHandoffPreview {
  const idealLifeVision = cleanText(input.idealLifeVision, 1200)
  const careerVisionStatement = cleanText(input.careerVisionStatement, 1200)
  const nextRoleCriteria = cleanList(input.nextRoleCriteria, 15)
  const industries = cleanList(input.industries, 25)
  const companies = cleanList(input.companies, 50)

  const positioningSummaryParts = [careerVisionStatement, idealLifeVision].filter(Boolean)
  const positioningSummary = positioningSummaryParts.join('\n\n').trim()

  const notesBlocks: string[] = []
  if (idealLifeVision) notesBlocks.push(`Ideal life vision:\n${idealLifeVision}`)
  if (careerVisionStatement) notesBlocks.push(`Career vision statement:\n${careerVisionStatement}`)
  if (nextRoleCriteria.length > 0) notesBlocks.push(`Role criteria:\n- ${nextRoleCriteria.join('\n- ')}`)

  return {
    positioningSummary,
    targetSectors: industries,
    targetCompanies: companies,
    roleCriteria: nextRoleCriteria,
    notes: notesBlocks.join('\n\n').trim(),
  }
}
