import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('kanban actions module', () => {
  it('exports moveCompanyStage', () => {
    expect(typeof actions.moveCompanyStage).toBe('function')
  })
})