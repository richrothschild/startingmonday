import { describe, expect, it } from 'vitest'
import DashboardPage from './page'
import { shouldRedirectToStartDashboard } from './page'

describe('dashboard page module', () => {
  it('exports DashboardPage', () => {
    expect(typeof DashboardPage).toBe('function')
  })

  it('redirects first-run users who have not seen start ritual', () => {
    expect(
      shouldRedirectToStartDashboard({
        isFirstRunDashboard: true,
        hasSeenFirstRun: false,
        focus: undefined,
      }),
    ).toBe(true)
  })

  it('does not redirect when user explicitly requests main dashboard', () => {
    expect(
      shouldRedirectToStartDashboard({
        isFirstRunDashboard: true,
        hasSeenFirstRun: false,
        focus: 'main',
      }),
    ).toBe(false)
  })

  it('does not redirect after first-run page has been seen', () => {
    expect(
      shouldRedirectToStartDashboard({
        isFirstRunDashboard: true,
        hasSeenFirstRun: true,
        focus: undefined,
      }),
    ).toBe(false)
  })

  it('does not redirect non-first-run dashboard states', () => {
    expect(
      shouldRedirectToStartDashboard({
        isFirstRunDashboard: false,
        hasSeenFirstRun: false,
        focus: undefined,
      }),
    ).toBe(false)
  })
})