import { describe, expect, it } from 'vitest'
import { TraceViewer } from './trace-client'

describe('trace client module', () => {
  it('exports a TraceViewer component', () => {
    expect(typeof TraceViewer).toBe('function')
  })
})