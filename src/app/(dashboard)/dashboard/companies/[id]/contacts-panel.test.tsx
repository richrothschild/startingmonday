import { describe, expect, it } from 'vitest'
import { ContactsPanel } from './contacts-panel'

describe('contacts panel module', () => {
  it('exports ContactsPanel', () => {
    expect(typeof ContactsPanel).toBe('function')
  })
})