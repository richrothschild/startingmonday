import { describe, expect, it } from 'vitest'
import { InviteClient } from './invite-client'

describe('invite client module', () => {
  it('exports InviteClient', () => {
    expect(typeof InviteClient).toBe('function')
  })
})