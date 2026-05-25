export type MicroProductChannel = 'executives' | 'coaches' | 'outplacement' | 'search_firms'

export type MicroProductDefinition = {
  slug: string
  name: string
  summary: string
  channel: MicroProductChannel
  persona: string
  billingType: 'one_time' | 'subscription'
  defaultInterval: 'one_time' | 'month' | 'year'
  amountCents: number
  audienceType: 'b2c' | 'b2b'
  ctaHref: string
  ctaLabel: string
}

export const MICRO_PRODUCT_DEFINITIONS: readonly MicroProductDefinition[] = [
  {
    slug: 'exec-interview-narrative-pack',
    name: 'Executive Interview Narrative Pack',
    summary: 'Role-specific story architecture and interview narrative drills for C-suite loops.',
    channel: 'executives',
    persona: 'active_mode',
    billingType: 'one_time',
    defaultInterval: 'one_time',
    amountCents: 14900,
    audienceType: 'b2c',
    ctaHref: '/settings/billing?addOn=exec-interview-narrative-pack',
    ctaLabel: 'Buy add-on',
  },
  {
    slug: 'board-transition-brief-kit',
    name: 'Board Transition Brief Kit',
    summary: 'Board-facing transition brief templates for optionality and discreet positioning.',
    channel: 'executives',
    persona: 'passive_mode',
    billingType: 'subscription',
    defaultInterval: 'month',
    amountCents: 7900,
    audienceType: 'b2c',
    ctaHref: '/settings/billing?addOn=board-transition-brief-kit',
    ctaLabel: 'Buy add-on',
  },
  {
    slug: 'coach-client-readiness-kit',
    name: 'Coach Client Readiness Kit',
    summary: 'Coach-facing readiness scorecards and weekly accountability templates.',
    channel: 'coaches',
    persona: 'coach_practice',
    billingType: 'subscription',
    defaultInterval: 'month',
    amountCents: 5900,
    audienceType: 'b2b',
    ctaHref: '/partners#apply',
    ctaLabel: 'Request pilot',
  },
  {
    slug: 'outplacement-operator-pack',
    name: 'Outplacement Operator Pack',
    summary: 'Pilot launch scorecards, intervention triggers, and customer success scripts.',
    channel: 'outplacement',
    persona: 'practice_leader',
    billingType: 'subscription',
    defaultInterval: 'month',
    amountCents: 9900,
    audienceType: 'b2b',
    ctaHref: '/for-outplacement',
    ctaLabel: 'View operator pack',
  },
  {
    slug: 'search-firm-brief-accelerator',
    name: 'Search-Firm Brief Accelerator',
    summary: 'Search kickoff templates and intake-to-brief turnaround support for retained teams.',
    channel: 'search_firms',
    persona: 'retained_search_lead',
    billingType: 'one_time',
    defaultInterval: 'one_time',
    amountCents: 12900,
    audienceType: 'b2b',
    ctaHref: '/partners#apply',
    ctaLabel: 'Request pilot',
  },
]

export function getMicroProductsForChannel(channel: MicroProductChannel): MicroProductDefinition[] {
  return MICRO_PRODUCT_DEFINITIONS.filter((item) => item.channel === channel)
}

export function getMicroProductBySlug(slug: string): MicroProductDefinition | undefined {
  return MICRO_PRODUCT_DEFINITIONS.find((item) => item.slug === slug)
}

export function formatMicroProductPrice(amountCents: number, interval: MicroProductDefinition['defaultInterval']): string {
  const amount = `$${(amountCents / 100).toFixed(0)}`
  if (interval === 'month') return `${amount}/mo`
  if (interval === 'year') return `${amount}/yr`
  return amount
}
