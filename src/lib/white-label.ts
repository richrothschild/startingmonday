export type WhiteLabelTrackId = 'executive_transition' | 'professional_transition'

export type WhiteLabelTierId = 'solo' | 'boutique' | 'outplacement'

export type WhiteLabelTrackDefinition = {
  id: WhiteLabelTrackId
  label: string
  summary: string
  defaultMilestones: string[]
}

export type WhiteLabelTierDefinition = {
  id: WhiteLabelTierId
  name: string
  baseFeeCents: number
  includedParticipants: number
  overageCents: number
  inclusions: string[]
}

export type WhiteLabelSettings = {
  brandName: string
  trackId: WhiteLabelTrackId
  tierId: WhiteLabelTierId
  primaryColor: string
  accentColor: string
  supportEmail: string
  logoUrl: string | null
}

export const WHITE_LABEL_DEFAULT_SETTINGS: WhiteLabelSettings = {
  brandName: 'Starting Monday',
  trackId: 'executive_transition',
  tierId: 'boutique',
  primaryColor: '#0f172a',
  accentColor: '#f97316',
  supportEmail: 'support@startingmonday.app',
  logoUrl: null,
}

export const WHITE_LABEL_TRACKS: readonly WhiteLabelTrackDefinition[] = [
  {
    id: 'executive_transition',
    label: 'Executive Transition',
    summary: 'High-stakes VP and C-suite transitions with confidential campaign support.',
    defaultMilestones: ['Intake complete', 'Prep ready', 'First outreach sent', 'Offer recorded'],
  },
  {
    id: 'professional_transition',
    label: 'Professional Transition',
    summary: 'Manager, director, and individual-contributor transition workflows with simpler cadence.',
    defaultMilestones: ['Intake complete', 'Positioning ready', 'First outreach sent', 'Interview completed'],
  },
] as const

export const WHITE_LABEL_TIERS: readonly WhiteLabelTierDefinition[] = [
  {
    id: 'solo',
    name: 'Solo',
    baseFeeCents: 29900,
    includedParticipants: 10,
    overageCents: 1900,
    inclusions: ['Branding lite', '1 track', 'Weekly digest', 'Core dashboard'],
  },
  {
    id: 'boutique',
    name: 'Boutique',
    baseFeeCents: 150000,
    includedParticipants: 75,
    overageCents: 1500,
    inclusions: ['Full branding', '2 tracks', 'Cohort dashboard', 'Sponsor report export', 'Priority support'],
  },
  {
    id: 'outplacement',
    name: 'Outplacement',
    baseFeeCents: 500000,
    includedParticipants: 300,
    overageCents: 1000,
    inclusions: ['Multi-cohort ops hub', 'Governance pack', 'SLA reporting', 'Executive readout templates'],
  },
] as const

export function getWhiteLabelTrack(id: WhiteLabelTrackId): WhiteLabelTrackDefinition {
  const track = WHITE_LABEL_TRACKS.find((row) => row.id === id)
  if (!track) {
    throw new Error(`Unknown white-label track: ${id}`)
  }
  return track
}

export function getWhiteLabelTier(id: WhiteLabelTierId): WhiteLabelTierDefinition {
  const tier = WHITE_LABEL_TIERS.find((row) => row.id === id)
  if (!tier) {
    throw new Error(`Unknown white-label tier: ${id}`)
  }
  return tier
}

export function formatDollarAmount(amountCents: number): string {
  return `$${(amountCents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatWhiteLabelTierPrice(tier: WhiteLabelTierDefinition): string {
  return `${formatDollarAmount(tier.baseFeeCents)}/mo`
}

function isValidHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

function normalizeColor(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return fallback
  return isValidHexColor(trimmed) ? trimmed.toLowerCase() : fallback
}

export function resolveWhiteLabelSettings(input: Partial<WhiteLabelSettings> & {
  fallbackBrandName?: string | null
  fallbackSupportEmail?: string | null
} = {}): WhiteLabelSettings {
  const trackId = WHITE_LABEL_TRACKS.some((track) => track.id === input.trackId)
    ? input.trackId as WhiteLabelTrackId
    : WHITE_LABEL_DEFAULT_SETTINGS.trackId
  const tierId = WHITE_LABEL_TIERS.some((tier) => tier.id === input.tierId)
    ? input.tierId as WhiteLabelTierId
    : WHITE_LABEL_DEFAULT_SETTINGS.tierId

  return {
    brandName: input.brandName?.trim() || input.fallbackBrandName?.trim() || WHITE_LABEL_DEFAULT_SETTINGS.brandName,
    trackId,
    tierId,
    primaryColor: normalizeColor(input.primaryColor, WHITE_LABEL_DEFAULT_SETTINGS.primaryColor),
    accentColor: normalizeColor(input.accentColor, WHITE_LABEL_DEFAULT_SETTINGS.accentColor),
    supportEmail: input.supportEmail?.trim() || input.fallbackSupportEmail?.trim() || WHITE_LABEL_DEFAULT_SETTINGS.supportEmail,
    logoUrl: input.logoUrl?.trim() || null,
  }
}
