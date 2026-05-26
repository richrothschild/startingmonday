import type { Channel } from '@/lib/channel-metrics-events'

export type ChannelRouteSpec = {
  channel: Channel
  label: string
  route: string
  targetCanonicalRoute: string
  primaryCtaLabel: string
  hero: string
  trust: string
}

export const CHANNEL_ROUTE_SPECS: readonly ChannelRouteSpec[] = [
  {
    channel: 'executives',
    label: 'Executives',
    route: '/for-vp',
    targetCanonicalRoute: '/for-vp',
    primaryCtaLabel: 'Enter executive path',
    hero: 'Run a private, signal-first campaign before roles are posted.',
    trust: 'Private by default. No employer visibility.',
  },
  {
    channel: 'coaches',
    label: 'Coaches',
    route: '/for-coaches',
    targetCanonicalRoute: '/for-coaches',
    primaryCtaLabel: 'Enter coach path',
    hero: 'Give clients structure between sessions without adding admin drag.',
    trust: 'Built to amplify coaching strategy time, not replace coaching.',
  },
  {
    channel: 'outplacement',
    label: 'Outplacement',
    route: '/for-outplacement',
    targetCanonicalRoute: '/for-outplacement',
    primaryCtaLabel: 'Enter outplacement path',
    hero: 'Improve cohort momentum with a measurable 30-day operating cadence.',
    trust: 'Board-safe claims and KPI clarity for buyer confidence.',
  },
  {
    channel: 'search_firms',
    label: 'Search Firms',
    route: '/for-search-firms',
    targetCanonicalRoute: '/for-search-firms',
    primaryCtaLabel: 'Enter search-firm path',
    hero: 'Strengthen kickoff quality and shortlist velocity on retained mandates.',
    trust: 'Role-specific preparation depth before first-round interviews.',
  },
]

export const EXECUTIVE_PERSONA_ROUTES = {
  cio_cto_transition: '/for-cio',
  vp_to_c_suite: '/for-vp',
  vp_technology: '/for-vp-technology',
  chief_data_officer: '/for-data-officer',
  chief_digital_officer: '/for-cdo',
  chief_information_security_officer: '/for-ciso',
  chief_product_officer: '/for-cpo',
  chief_operating_officer: '/for-coo',
} as const
