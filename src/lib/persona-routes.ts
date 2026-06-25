export type PersonaSpec = {
  slug: string
  label: string
  summary: string
  destination: string
}

export const EXECUTIVE_PERSONAS: readonly PersonaSpec[] = [
  {
    slug: 'cio-cto-transition',
    label: 'CIO and CTO transition',
    summary: 'Role-level search operating cadence for C-suite technology leadership transitions.',
    destination: '/for-cio',
  },
  {
    slug: 'vp-to-c-suite',
    label: 'VP to C-suite move',
    summary: 'Promotion-track narrative, signal timing, and executive-level prep progression.',
    destination: '/for-executives',
  },
  {
    slug: 'vp-technology',
    label: 'VP technology path',
    summary: 'Execution for VP-level technology leaders pursuing strategic scope expansion.',
    destination: '/for-leaders',
  },
  {
    slug: 'chief-data-officer',
    label: 'Chief Data Officer path',
    summary: 'Data-mandate context with governance and analytics-led transition framing.',
    destination: '/for-data-officer',
  },
  {
    slug: 'chief-digital-officer',
    label: 'Chief Digital Officer path',
    summary: 'Digital transformation mandate positioning with board-level relevance.',
    destination: '/for-cdo',
  },
  {
    slug: 'ciso-path',
    label: 'CISO path',
    summary: 'Security leadership campaign readiness and role-specific transition signaling.',
    destination: '/for-ciso',
  },
  {
    slug: 'cpo-path',
    label: 'CPO path',
    summary: 'Product leadership positioning and transition execution cadence.',
    destination: '/for-cpo',
  },
  {
    slug: 'coo-path',
    label: 'COO path',
    summary: 'Operational leadership route with mandate and execution narrative support.',
    destination: '/for-coo',
  },
]

export const COACH_PERSONAS: readonly PersonaSpec[] = [
  {
    slug: 'independent-executive-coach',
    label: 'Independent executive coach',
    summary: 'Solo practice workflow for between-session accountability and prep quality.',
    destination: '/for-coaches',
  },
  {
    slug: 'boutique-firm-coach',
    label: 'Boutique firm coach partner',
    summary: 'Team-based coaching operations with standardized scorecards and shared views.',
    destination: '/for-coaches/economics',
  },
  {
    slug: 'enterprise-sponsored-coach',
    label: 'Enterprise-sponsored coach cohort',
    summary: 'Cohort governance and proof for enterprise-sponsored transition programs.',
    destination: '/for-coaches/trust-pack',
  },
  {
    slug: 'search-affiliate-transition-coach',
    label: 'Search-affiliate transition coach',
    summary: 'Retained-search-adjacent workflow with trust boundaries, interview arcs, and proof assets.',
    destination: '/for-coaches/search-affiliate',
  },
]

export const OUTPLACEMENT_PERSONAS: readonly PersonaSpec[] = [
  {
    slug: 'practice-leader',
    label: 'Practice leader',
    summary: 'Program-level ROI and operating outcomes for outplacement service lines.',
    destination: '/for-outplacement/economics',
  },
  {
    slug: 'program-operations-director',
    label: 'Program operations director',
    summary: 'No-custom pilot rollout with intervention cadence and scorecard controls.',
    destination: '/for-outplacement/operating-scorecard',
  },
  {
    slug: 'counselor-lead',
    label: 'Counselor lead',
    summary: 'Counselor enablement and what-changed execution visibility between sessions.',
    destination: '/for-outplacement/runbook',
  },
  {
    slug: 'procurement-and-legal',
    label: 'Procurement and legal reviewer',
    summary: 'Board-safe claims, KPI definitions, and security posture review path.',
    destination: '/for-outplacement/trust-pack',
  },
]

export const SEARCH_FIRM_PERSONAS: readonly PersonaSpec[] = [
  {
    slug: 'partner-firm-lead',
    label: 'Partner and firm lead',
    summary: 'Mandate-level differentiation, kickoff quality, and shortlist velocity outcomes.',
    destination: '/search-firms',
  },
  {
    slug: 'principal-delivery-lead',
    label: 'Principal and delivery lead',
    summary: 'Execution-quality route for consultant workflows and candidate prep standards.',
    destination: '/search-firms',
  },
  {
    slug: 'candidate-success-owner',
    label: 'Candidate success owner',
    summary: 'Candidate readiness and interview-prep rigor across active retained searches.',
    destination: '/search-firms/sample-cfo-brief',
  },
]
