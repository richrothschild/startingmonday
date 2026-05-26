import { describe, expect, it } from 'vitest'
import { LogoutButton } from './logout-button'

describe('logout button module', () => {
  it('exports LogoutButton', () => {
    expect(typeof LogoutButton).toBe('function')
  })
})