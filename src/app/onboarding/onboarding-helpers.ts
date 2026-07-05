export type SearchPersona = 'csuite' | 'vp' | 'director' | 'board'

export type SuggestedCompany = {
  name: string
  why: string
  roleHint: string
}

export type DecisionMakerSuggestion = {
  name: string
  title: string
  why: string
  source: 'apollo' | 'signal'
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

export function suggestedCompaniesForProfile(persona: SearchPersona | '', currentTitle: string): SuggestedCompany[] {
  const lane = persona || 'csuite'
  return (SUGGESTIONS_BY_PERSONA[lane] ?? []).slice(0, 5).map((name) => ({
    name,
    roleHint: roleHintForPersona(lane),
    why: whyLineForCompany(name, lane, currentTitle),
  }))
}

function leaderTitlesForPersona(persona: SearchPersona | ''): string[] {
  if (persona === 'board') return ['Board Member', 'Operating Partner', 'Portfolio CFO']
  if (persona === 'vp') return ['SVP, Product', 'VP, Operations', 'Chief of Staff']
  if (persona === 'director') return ['Senior Director, Platform', 'Director, PMO', 'Director, Finance']
  return ['Chief People Officer', 'SVP, Engineering', 'Chief of Staff']
}

export function suggestedDecisionMakersForCompany(companyName: string, persona: SearchPersona | '', currentTitle: string): DecisionMakerSuggestion[] {
  if (!companyName.trim()) return []
  const titles = leaderTitlesForPersona(persona)
  const lane = currentTitle.trim() || 'your role lane'

  return [
    {
      name: `Morgan Lee`,
      title: `${titles[0]}, ${companyName}`,
      why: `Likely sponsor for mandates shaped around ${lane}.`,
      source: 'apollo',
    },
    {
      name: `Jordan Patel`,
      title: `${titles[1]}, ${companyName}`,
      why: 'Signal activity suggests this function is close to headcount decisions.',
      source: 'signal',
    },
    {
      name: `Casey Rivera`,
      title: `${titles[2]}, ${companyName}`,
      why: 'Strong bridge contact when search windows are forming but not posted.',
      source: 'apollo',
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
