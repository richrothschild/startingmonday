import { describe, expect, it } from 'vitest'
import { CopyCommandButton } from './copy-command-button'

describe('copy command button module', () => {
  it('exports CopyCommandButton', () => {
    expect(typeof CopyCommandButton).toBe('function')
  })
})