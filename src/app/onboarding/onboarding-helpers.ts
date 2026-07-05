export type SearchPersona = 'csuite' | 'vp' | 'director' | 'board'

export type SuggestedCompany = {
  name: string
  why: string
  roleHint: string
}

export type DecisionRoleTarget = {
  title: string
  why: string
}

const SUGGESTIONS_BY_PERSONA: Record<SearchPersona, string[]> = {
  csuite: ['Microsoft', 'Salesforce', 'ServiceNow', 'Oracle', 'Workday'],
  vp: ['Stripe', 'Snowflake', 'Databricks', 'Figma', 'Anthropic'],
  director: ['HubSpot', 'Okta', 'Crowdstrike', 'MongoDB', 'Datadog'],
  board: ['KKR', 'Blackstone', 'General Atlantic', 'Vista Equity', 'Thoma Bravo'],
}

export function seededCompaniesFor(persona: SearchPersona | ''): string[] {
  const picks = SUGGESTIONS_BY_PERSONA[persona || 'csuite'] ?? []
  return picks.slice(0, 3)
}

export function suggestionsForPersona(persona: SearchPersona | ''): string[] {
  return SUGGESTIONS_BY_PERSONA[persona || 'csuite'] ?? []
}

function roleHintForPersona(persona: SearchPersona | ''): string {
  if (persona === 'vp') return 'Likely seat: VP or SVP track'
  if (persona === 'director') return 'Likely seat: Director or Senior Director track'
  if (persona === 'board') return 'Likely seat: board or advisory track'
  return 'Likely seat: CIO, CTO, or COO track'
}

function whyLineForCompany(name: string, persona: SearchPersona | '', currentTitle: string): string {
  const hint = currentTitle ? `based on your current title as ${currentTitle.trim()}` : 'based on your leadership lane'
  const common = persona === 'board'
    ? 'This kind of organization often wants board-level context, not generic search noise.'
    : persona === 'vp'
      ? 'This company profile usually rewards operators who can build momentum early.'
      : persona === 'director'
        ? 'This is a strong match when you need influence, not just visibility.'
        : 'This is a strong fit when the role is still taking shape and timing matters.'

  return `${name} feels relevant ${hint}. ${common}`
}

export function suggestedCompaniesForProfile(persona: SearchPersona | '', currentTitle: string, resumeText = ''): SuggestedCompany[] {
  const lane = persona || 'csuite'
  const sector = detectSectorFromText(`${currentTitle} ${resumeText}`)
  const sectorPool = sector ? (SUGGESTIONS_BY_SECTOR[sector] ?? []) : []
  const personaPool = SUGGESTIONS_BY_PERSONA[lane] ?? []

  const merged: string[] = []
  for (const name of [...sectorPool, ...personaPool]) {
    if (!merged.includes(name)) merged.push(name)
    if (merged.length >= 5) break
  }

  return merged.map((name) => ({
    name,
    roleHint: roleHintForPersona(lane),
    why: sectorPool.includes(name) && sector
      ? `${name} sits in ${SECTOR_LABELS[sector]}, which matches the experience in your profile. ${whyTailForPersona(lane)}`
      : whyLineForCompany(name, lane, currentTitle),
  }))
}

type SectorKey = 'fintech' | 'healthcare' | 'security' | 'infrastructure' | 'retail' | 'data_ai'

const SECTOR_LABELS: Record<SectorKey, string> = {
  fintech: 'financial technology',
  healthcare: 'healthcare and life sciences',
  security: 'security',
  infrastructure: 'cloud and infrastructure',
  retail: 'retail and consumer',
  data_ai: 'data and AI',
}

const SECTOR_PATTERNS: Record<SectorKey, RegExp> = {
  fintech: /\b(fintech|payments?|banking|financial services|trading|lending|insurance|insurtech)\b/i,
  healthcare: /\b(healthcare|health care|hospital|clinical|pharma|biotech|life sciences|medical|payer|provider)\b/i,
  security: /\b(cyber ?security|infosec|security operations|soc|zero trust|threat|siem|appsec)\b/i,
  infrastructure: /\b(cloud|infrastructure|devops|platform engineering|sre|kubernetes|data center|networking)\b/i,
  retail: /\b(retail|e-?commerce|consumer goods|cpg|merchandising|omnichannel|supply chain)\b/i,
  data_ai: /\b(machine learning|artificial intelligence|\bai\b|\bml\b|data platform|analytics|data science|llm)\b/i,
}

const SUGGESTIONS_BY_SECTOR: Record<SectorKey, string[]> = {
  fintech: ['Stripe', 'Plaid', 'Adyen', 'Ramp', 'Brex'],
  healthcare: ['Oscar Health', 'Tempus', 'Datavant', 'Komodo Health', 'Veeva'],
  security: ['Crowdstrike', 'Palo Alto Networks', 'Okta', 'Snyk', 'Wiz'],
  infrastructure: ['Cloudflare', 'HashiCorp', 'Datadog', 'Snowflake', 'Vercel'],
  retail: ['Shopify', 'Instacart', 'Chewy', 'Wayfair', 'Faire'],
  data_ai: ['Databricks', 'Anthropic', 'Scale AI', 'Hugging Face', 'Pinecone'],
}

export function detectSectorFromText(text: string): SectorKey | null {
  if (!text.trim()) return null
  let best: { key: SectorKey; hits: number } | null = null
  for (const key of Object.keys(SECTOR_PATTERNS) as SectorKey[]) {
    const matches = text.match(new RegExp(SECTOR_PATTERNS[key].source, 'gi'))
    const hits = matches?.length ?? 0
    if (hits > 0 && (!best || hits > best.hits)) best = { key, hits }
  }
  return best?.key ?? null
}

function whyTailForPersona(persona: SearchPersona | ''): string {
  if (persona === 'board') return 'Organizations here often want board-level context, not generic search noise.'
  if (persona === 'vp') return 'This profile usually rewards operators who build momentum early.'
  if (persona === 'director') return 'A strong match when you need influence, not just visibility.'
  return 'A strong fit when the role is still taking shape and timing matters.'
}

function leaderTitlesForPersona(persona: SearchPersona | ''): string[] {
  if (persona === 'board') return ['Board Member', 'Operating Partner', 'Portfolio CFO']
  if (persona === 'vp') return ['SVP, Product', 'VP, Operations', 'Chief of Staff']
  if (persona === 'director') return ['Senior Director, Platform', 'Director, PMO', 'Director, Finance']
  return ['Chief People Officer', 'SVP, Engineering', 'Chief of Staff']
}

export function decisionRoleTargetsForCompany(companyName: string, persona: SearchPersona | '', currentTitle: string): DecisionRoleTarget[] {
  if (!companyName.trim()) return []
  const titles = leaderTitlesForPersona(persona)
  const lane = currentTitle.trim() || 'your role lane'

  return [
    {
      title: titles[0],
      why: `This seat typically sponsors mandates shaped around ${lane}.`,
    },
    {
      title: titles[1],
      why: 'This function is usually closest to headcount and backfill decisions.',
    },
    {
      title: titles[2],
      why: 'A strong bridge seat when search windows are forming but not posted.',
    },
  ]
}

export function firstNoteDraftForCompany(companyName: string, currentTitle: string): string {
  const lane = currentTitle.trim() || 'senior leadership'
  return `Hi [First Name] - I have been tracking ${companyName} as your team shapes the next leadership bench. I lead ${lane} mandates and wanted to share one concise perspective on where I can help the next phase. If useful, I can send a short note with two relevant outcomes and context.`
}

export function followUpSequenceForWeekOne(companyName: string): string[] {
  return [
    `Day 2: Send the first note tied to one live ${companyName} signal.`,
    'Day 4: Follow up with one specific business angle and one question.',
    'Day 7: Close the loop with a short update and a clear next-step ask.',
  ]
}
