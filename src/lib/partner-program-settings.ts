export const PARTNER_PROGRAM_IDS = [
  'outplacement_standard',
  'outplacement_boutique',
  'outplacement_enterprise',
] as const

export const SPONSOR_TEMPLATE_VARIANTS = [
  'enterprise_board',
  'growth_ops',
  'pilot_compact',
] as const

export const WEEKDAY_IDS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
] as const

export type PartnerProgramId = (typeof PARTNER_PROGRAM_IDS)[number]
export type SponsorTemplateVariant = (typeof SPONSOR_TEMPLATE_VARIANTS)[number]
export type WeeklySummaryDay = (typeof WEEKDAY_IDS)[number]

export type PartnerProgramSettings = {
  defaultProgram: PartnerProgramId
  sponsorTemplateVariant: SponsorTemplateVariant
  cohortNamingPrefix: string | null
  weeklySummaryDay: WeeklySummaryDay
}

export const DEFAULT_PARTNER_PROGRAM_SETTINGS: PartnerProgramSettings = {
  defaultProgram: 'outplacement_standard',
  sponsorTemplateVariant: 'pilot_compact',
  cohortNamingPrefix: null,
  weeklySummaryDay: 'friday',
}

export function isPartnerProgramId(value: unknown): value is PartnerProgramId {
  return typeof value === 'string' && PARTNER_PROGRAM_IDS.includes(value as PartnerProgramId)
}

export function isSponsorTemplateVariant(value: unknown): value is SponsorTemplateVariant {
  return typeof value === 'string' && SPONSOR_TEMPLATE_VARIANTS.includes(value as SponsorTemplateVariant)
}

export function isWeeklySummaryDay(value: unknown): value is WeeklySummaryDay {
  return typeof value === 'string' && WEEKDAY_IDS.includes(value as WeeklySummaryDay)
}

export function resolvePartnerProgramSettings(input: Partial<PartnerProgramSettings> = {}): PartnerProgramSettings {
  return {
    defaultProgram: isPartnerProgramId(input.defaultProgram)
      ? input.defaultProgram
      : DEFAULT_PARTNER_PROGRAM_SETTINGS.defaultProgram,
    sponsorTemplateVariant: isSponsorTemplateVariant(input.sponsorTemplateVariant)
      ? input.sponsorTemplateVariant
      : DEFAULT_PARTNER_PROGRAM_SETTINGS.sponsorTemplateVariant,
    cohortNamingPrefix: input.cohortNamingPrefix?.trim() || null,
    weeklySummaryDay: isWeeklySummaryDay(input.weeklySummaryDay)
      ? input.weeklySummaryDay
      : DEFAULT_PARTNER_PROGRAM_SETTINGS.weeklySummaryDay,
  }
}
