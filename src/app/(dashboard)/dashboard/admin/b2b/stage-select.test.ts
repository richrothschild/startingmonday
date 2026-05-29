import { describe, expect, it } from 'vitest'
import StageSelect from './stage-select'

describe('admin b2b stage select module', () => {
  it('exports StageSelect', () => {
    expect(typeof StageSelect).toBe('function')
  })
})