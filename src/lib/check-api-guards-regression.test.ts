import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('check-api-guards regression coverage', () => {
  it('keeps requireAutomationAccess in recognized guard patterns', () => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'check-api-guards.mjs')
    const source = fs.readFileSync(scriptPath, 'utf8')

    const guardArrayMatch = source.match(/const GUARD_PATTERNS = \[([\s\S]*?)\]/)
    expect(guardArrayMatch, 'GUARD_PATTERNS array should exist in guard checker script').toBeTruthy()

    const guardArraySource = guardArrayMatch?.[1] ?? ''
    expect(guardArraySource).toContain("'requireAutomationAccess'")
  })
})
