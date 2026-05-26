import { describe, expect, it } from 'vitest'
import DashboardPage from './page'

describe('dashboard page module', () => {
  it('exports DashboardPage', () => {
    expect(typeof DashboardPage).toBe('function')
  })
})