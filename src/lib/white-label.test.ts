import { describe, expect, it } from 'vitest'
import {
  WHITE_LABEL_DEFAULT_SETTINGS,
  WHITE_LABEL_TIERS,
  WHITE_LABEL_TRACKS,
  formatDollarAmount,
  formatWhiteLabelTierPrice,
  getWhiteLabelTier,
  getWhiteLabelTrack,
  resolveWhiteLabelSettings,
} from '@/lib/white-label'

describe('white-label config', () => {
  it('defines the expected tracks', () => {
    expect(WHITE_LABEL_TRACKS).toHaveLength(2)
    expect(getWhiteLabelTrack('executive_transition').label).toBe('Executive Transition')
    expect(getWhiteLabelTrack('professional_transition').defaultMilestones).toContain('Interview completed')
  })

  it('defines the expected tiers', () => {
    expect(WHITE_LABEL_TIERS).toHaveLength(3)
    expect(getWhiteLabelTier('solo').includedParticipants).toBe(10)
    expect(getWhiteLabelTier('outplacement').name).toBe('Outplacement')
    expect(formatWhiteLabelTierPrice(getWhiteLabelTier('boutique'))).toBe('$1,500/mo')
  })

  it('formats dollar amounts cleanly', () => {
    expect(formatDollarAmount(29900)).toBe('$299')
    expect(formatDollarAmount(500000)).toBe('$5,000')
  })

  it('resolves white-label settings with safe defaults', () => {
    expect(resolveWhiteLabelSettings({})).toMatchObject({
      brandName: WHITE_LABEL_DEFAULT_SETTINGS.brandName,
      trackId: WHITE_LABEL_DEFAULT_SETTINGS.trackId,
      tierId: WHITE_LABEL_DEFAULT_SETTINGS.tierId,
      primaryColor: WHITE_LABEL_DEFAULT_SETTINGS.primaryColor,
      accentColor: WHITE_LABEL_DEFAULT_SETTINGS.accentColor,
      supportEmail: WHITE_LABEL_DEFAULT_SETTINGS.supportEmail,
      logoUrl: null,
    })
  })

  it('normalizes custom white-label settings', () => {
    expect(resolveWhiteLabelSettings({
      brandName: '  Nash Transition Group  ',
      trackId: 'professional_transition',
      tierId: 'solo',
      primaryColor: ' #ABCDEF ',
      accentColor: 'not-a-color',
      supportEmail: '  support@example.com ',
      logoUrl: '  https://example.com/logo.svg  ',
    })).toMatchObject({
      brandName: 'Nash Transition Group',
      trackId: 'professional_transition',
      tierId: 'solo',
      primaryColor: '#abcdef',
      accentColor: WHITE_LABEL_DEFAULT_SETTINGS.accentColor,
      supportEmail: 'support@example.com',
      logoUrl: 'https://example.com/logo.svg',
    })
  })
})
