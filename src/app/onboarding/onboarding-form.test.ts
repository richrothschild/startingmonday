import { describe, expect, it } from 'vitest'
import { OnboardingForm } from './onboarding-form'

describe('onboarding form module', () => {
  it('exports an OnboardingForm component', () => {
    expect(typeof OnboardingForm).toBe('function')
  })
})