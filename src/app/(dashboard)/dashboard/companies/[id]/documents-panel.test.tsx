import { describe, expect, it } from 'vitest'
import { DocumentsPanel } from './documents-panel'

describe('documents panel module', () => {
  it('exports DocumentsPanel', () => {
    expect(typeof DocumentsPanel).toBe('function')
  })
})