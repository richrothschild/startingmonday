export type VerifiedSourceTier = 'A' | 'B' | 'C'

export type VerifiedSourceCategory =
  | 'occupational-taxonomy'
  | 'opportunity-and-signaling'
  | 'decision-making'
  | 'academic-metadata'

export type VerifiedSourceEntry = {
  key: string
  title: string
  url: string
  tier: VerifiedSourceTier
  category: VerifiedSourceCategory
  keySignals: string[]
  verificationNotes: string
}

export type ResearchProgramItem = {
  itemNumber: 13 | 14 | 15 | 16
  title: string
  goal: string
  output: string
  weeklyInput: string
}

export const VERIFIED_SOURCE_LIBRARY: VerifiedSourceEntry[] = [
  {
    key: 'bls-top-executives',
    title: 'BLS Occupational Outlook Handbook: Top Executives',
    url: 'https://www.bls.gov/ooh/management/top-executives.htm',
    tier: 'A',
    category: 'occupational-taxonomy',
    keySignals: ['role boundary', 'travel/availability', 'succession timing', 'work experience expectations'],
    verificationNotes: 'Public labor-market summary with clear role and work-structure signals.',
  },
  {
    key: 'bls-financial-managers',
    title: 'BLS Occupational Outlook Handbook: Financial Managers',
    url: 'https://www.bls.gov/ooh/management/financial-managers.htm',
    tier: 'A',
    category: 'occupational-taxonomy',
    keySignals: ['financial reporting', 'investment activity', 'long-term goals', '5+ years related experience'],
    verificationNotes: 'Strong role-specific transition and diligence signals for finance leaders.',
  },
  {
    key: 'bls-sales-managers',
    title: 'BLS Occupational Outlook Handbook: Sales Managers',
    url: 'https://www.bls.gov/ooh/management/sales-managers.htm',
    tier: 'A',
    category: 'occupational-taxonomy',
    keySignals: ['customer delivery', 'travel', 'relationship activation', 'rep background'],
    verificationNotes: 'Useful for external-facing leadership and commercial transition patterns.',
  },
  {
    key: 'bls-hr-managers',
    title: 'BLS Occupational Outlook Handbook: Human Resources Managers',
    url: 'https://www.bls.gov/ooh/management/human-resources-managers.htm',
    tier: 'A',
    category: 'occupational-taxonomy',
    keySignals: ['talent leadership', 'change management', 'recruiting travel', 'office-based work'],
    verificationNotes: 'Useful for people-leadership transitions and organizational change patterns.',
  },
  {
    key: 'bls-cis-managers',
    title: 'BLS Occupational Outlook Handbook: Computer and Information Systems Managers',
    url: 'https://www.bls.gov/ooh/management/computer-and-information-systems-managers.htm',
    tier: 'A',
    category: 'occupational-taxonomy',
    keySignals: ['transformation', 'systems', 'stakeholder translation', 'tech experience'],
    verificationNotes: 'Useful for technology and operating-model transition behavior.',
  },
  {
    key: 'bls-pr-managers',
    title: 'BLS Occupational Outlook Handbook: Public Relations and Fundraising Managers',
    url: 'https://www.bls.gov/ooh/management/public-relations-managers.htm',
    tier: 'A',
    category: 'occupational-taxonomy',
    keySignals: ['narrative', 'reputation', 'influence', 'travel/meetings'],
    verificationNotes: 'Useful for communication-led and reputation-sensitive transitions.',
  },
  {
    key: 'onet-work-activities',
    title: 'O*NET Browse by Work Activities',
    url: 'https://www.onetonline.org/find/descriptor/browse/4.A/',
    tier: 'A',
    category: 'occupational-taxonomy',
    keySignals: ['information input', 'interacting with others', 'mental processes', 'work output'],
    verificationNotes: 'Use as the work-activity ontology for behavior mapping.',
  },
  {
    key: 'linkedin-opportunity-index-2020',
    title: 'LinkedIn Economic Graph: Opportunity Index 2020',
    url: 'https://economicgraph.linkedin.com/research/opportunity-index-2020',
    tier: 'A',
    category: 'opportunity-and-signaling',
    keySignals: ['network activation', 'opportunity perception', 'learning culture', 'job opportunity attraction'],
    verificationNotes: 'Directionally strong network and opportunity-perception source.',
  },
  {
    key: 'linkedin-skills-gap-signaling-gap',
    title: 'LinkedIn Economic Graph: Skills Gap or Signaling Gap?',
    url: 'https://economicgraph.linkedin.com/research/skills-gap-or-signalling-gap',
    tier: 'B',
    category: 'opportunity-and-signaling',
    keySignals: ['signaling gaps', 'cross-market mobility', 'platform data framing'],
    verificationNotes: 'Useful for signaling hypotheses, but narrower methodological detail.',
  },
  {
    key: 'spencer-stuart-4cs',
    title: 'Spencer Stuart: The 4Cs: A framework for career decisions',
    url: 'https://www.spencerstuart.com/research-and-insight/the-4cs-a-framework-for-career-decisions',
    tier: 'A',
    category: 'decision-making',
    keySignals: ['company', 'challenge', 'compensation', 'context', 'passive candidate pull'],
    verificationNotes: 'Primary decision framework for executive transition choices.',
  },
  {
    key: 'spencer-stuart-ceo-moment',
    title: 'Spencer Stuart: The CEO Moment',
    url: 'https://www.spencerstuart.com/research-and-insight/the-ceo-moment',
    tier: 'A',
    category: 'decision-making',
    keySignals: ['transition timeline', 'board communication', 'smooth transitions', 'CEO-role rarity'],
    verificationNotes: 'High-value CEO transition timing and board-communication source.',
  },
  {
    key: 'spencer-stuart-first-24-months',
    title: 'Spencer Stuart: 5 Pitfalls That Derail CEOs in the First 24 Months',
    url: 'https://www.spencerstuart.com/research-and-insight/five-pitfalls-that-derail-ceos-in-the-first-24-months',
    tier: 'A',
    category: 'decision-making',
    keySignals: ['early wins', 'board confidence', 'activation', 'board mismanagement', 'personal-transition neglect'],
    verificationNotes: 'Useful for early-transition derailer and intervention logic.',
  },
  {
    key: 'apa-psychnet-record-2008-10055-015',
    title: 'APA PsycNET record 2008-10055-015',
    url: 'https://psycnet.apa.org/record/2008-10055-015',
    tier: 'C',
    category: 'academic-metadata',
    keySignals: ['search-behavior psychology', 'transition psychology'],
    verificationNotes: 'Metadata-only fallback source; use for hypothesis framing, not default product behavior.',
  },
  {
    key: 'journal-of-applied-psychology',
    title: 'Journal of Applied Psychology',
    url: 'https://www.apa.org/pubs/journals/apl',
    tier: 'A',
    category: 'academic-metadata',
    keySignals: ['applied work behavior', 'motivation', 'performance', 'career transitions'],
    verificationNotes: 'Primary peer-reviewed journal source for applied behavior constructs.',
  },
  {
    key: 'personnel-psychology-journal',
    title: 'Personnel Psychology',
    url: 'https://onlinelibrary.wiley.com/journal/17446570',
    tier: 'A',
    category: 'academic-metadata',
    keySignals: ['selection', 'assessment', 'job search behavior', 'career outcomes'],
    verificationNotes: 'High-rigor personnel and career behavior source.',
  },
  {
    key: 'academy-of-management-journal',
    title: 'Academy of Management Journal',
    url: 'https://journals.aom.org/journal/amj',
    tier: 'A',
    category: 'academic-metadata',
    keySignals: ['organizational behavior', 'leadership transitions', 'decision behavior'],
    verificationNotes: 'High-rigor source for leadership and organizational transition constructs.',
  },
  {
    key: 'obhdp-journal',
    title: 'Organizational Behavior and Human Decision Processes',
    url: 'https://www.sciencedirect.com/journal/organizational-behavior-and-human-decision-processes',
    tier: 'A',
    category: 'academic-metadata',
    keySignals: ['decision processes', 'judgment under uncertainty', 'behavioral mechanisms'],
    verificationNotes: 'Primary source for decision-making constructs relevant to transition choices.',
  },
  {
    key: 'linkedin-economic-graph-home',
    title: 'LinkedIn Economic Graph Research Hub',
    url: 'https://economicgraph.linkedin.com/research',
    tier: 'A',
    category: 'opportunity-and-signaling',
    keySignals: ['labor-market shifts', 'talent flows', 'opportunity access'],
    verificationNotes: 'Canonical index for LinkedIn talent and opportunity reports.',
  },
  {
    key: 'lightcast-research',
    title: 'Lightcast Research and Insights',
    url: 'https://lightcast.io/resources/research',
    tier: 'A',
    category: 'opportunity-and-signaling',
    keySignals: ['skills demand', 'hiring trends', 'role language shifts'],
    verificationNotes: 'Labor analytics source for demand and skills trends.',
  },
  {
    key: 'burning-glass-institute',
    title: 'Burning Glass Institute Insights',
    url: 'https://www.burningglassinstitute.org/category/research/',
    tier: 'B',
    category: 'opportunity-and-signaling',
    keySignals: ['career mobility', 'talent pipelines', 'skills-based transitions'],
    verificationNotes: 'Useful labor and mobility analysis source with practical transition relevance.',
  },
  {
    key: 'korn-ferry-insights',
    title: 'Korn Ferry Insights',
    url: 'https://www.kornferry.com/insights',
    tier: 'A',
    category: 'decision-making',
    keySignals: ['leadership transitions', 'executive readiness', 'role expectations'],
    verificationNotes: 'Reputable executive search and leadership transition source.',
  },
  {
    key: 'russell-reynolds-insights',
    title: 'Russell Reynolds Insights',
    url: 'https://www.russellreynolds.com/en/insights',
    tier: 'A',
    category: 'decision-making',
    keySignals: ['board and CEO transitions', 'succession behavior', 'leadership market context'],
    verificationNotes: 'Reputable source for executive and board transition patterns.',
  },
  {
    key: 'egon-zehnder-insights',
    title: 'Egon Zehnder Insights',
    url: 'https://www.egonzehnder.com/insight',
    tier: 'A',
    category: 'decision-making',
    keySignals: ['leadership transitions', 'executive development', 'succession narratives'],
    verificationNotes: 'Reputable search-firm source for leadership transition context.',
  },
  {
    key: 'hbr-leadership-transition-topic',
    title: 'Harvard Business Review Leadership Transition Topic',
    url: 'https://hbr.org/topic/leadership',
    tier: 'B',
    category: 'decision-making',
    keySignals: ['transition strategies', 'leader behavior', 'method-disclosed practitioner studies'],
    verificationNotes: 'Use only articles with disclosed methodology for evidence extraction.',
  },
  {
    key: 'mckinsey-leadership-search',
    title: 'McKinsey Leadership and Organization Insights',
    url: 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights',
    tier: 'B',
    category: 'decision-making',
    keySignals: ['leadership transitions', 'organizational change', 'executive effectiveness'],
    verificationNotes: 'Use method-disclosed studies for transition evidence.',
  },
  {
    key: 'bain-leadership-insights',
    title: 'Bain Leadership Insights',
    url: 'https://www.bain.com/insights/topics/leadership-and-talent/',
    tier: 'B',
    category: 'decision-making',
    keySignals: ['leadership moves', 'talent strategy', 'transition outcomes'],
    verificationNotes: 'Use method-disclosed transition and talent studies only.',
  },
  {
    key: 'bcg-leadership-insights',
    title: 'BCG Leadership and Talent Insights',
    url: 'https://www.bcg.com/capabilities/people-organization/insights',
    tier: 'B',
    category: 'decision-making',
    keySignals: ['leadership context', 'organizational transitions', 'talent behavior'],
    verificationNotes: 'Use method-disclosed studies and avoid unsupported claims.',
  },
  {
    key: 'careeronestop-layoff-reemployment',
    title: 'CareerOneStop Reemployment Resources',
    url: 'https://www.careeronestop.org/LaidOffWorkers/LaidOffWorkers.aspx',
    tier: 'B',
    category: 'opportunity-and-signaling',
    keySignals: ['reemployment pathways', 'transition support structures', 'public benchmark context'],
    verificationNotes: 'Public benchmark context for outplacement and transition support references.',
  },
]

export const RESEARCH_PROGRAM_ITEMS: ResearchProgramItem[] = [
  {
    itemNumber: 13,
    title: 'Signal-mining sprint',
    goal: 'Build objective market context from verified public sources and market signals.',
    output: 'Weekly internal library refresh, verified-source digests, and signal notes.',
    weeklyInput: 'Refresh the verified source stack and capture newly changed or newly relevant material.',
  },
  {
    itemNumber: 14,
    title: 'Public job transition mining',
    goal: 'Mine public job histories, title moves, and tenure patterns for transition context.',
    output: 'Transition-pattern notes and role-move observations tied to real market data.',
    weeklyInput: 'Review public executive profiles and transitions for function, geography, and timing moves.',
  },
  {
    itemNumber: 15,
    title: 'Job-description language analysis',
    goal: 'Analyze role and sub-role hiring language for recurring constraints and cues.',
    output: 'Hiring-language lexicon by role family and an interview-briefing language map.',
    weeklyInput: 'Collect current job descriptions and extract role-specific language patterns.',
  },
  {
    itemNumber: 16,
    title: 'Transition archetype synthesis',
    goal: 'Turn repeated market patterns into archetypes that guide diagnosis and interventions.',
    output: 'Archetype library with triggers, risks, and likely next-best interventions.',
    weeklyInput: 'Compare new signals against archetype hypotheses and refine the library.',
  },
]

export function getVerifiedSourceCatalog(): VerifiedSourceEntry[] {
  return VERIFIED_SOURCE_LIBRARY
}

export function getResearchProgramItems(): ResearchProgramItem[] {
  return RESEARCH_PROGRAM_ITEMS
}
