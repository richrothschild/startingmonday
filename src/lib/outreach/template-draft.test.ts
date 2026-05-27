import { describe, expect, it } from 'vitest'
import { buildOutreachTemplateDraft } from './template-draft'

describe('template draft subject clamp', () => {
  it('keeps generated subjects at or below 80 chars', () => {
    const draft = buildOutreachTemplateDraft({
      channel: 'coaches',
      fullName: 'Andrea Shaw',
      roleLabel: 'Executive Coach',
      company: 'Duke University - The Fuqua School of Business',
      focus: 'Executive Coach',
    })

    expect(draft.subject.length).toBeLessThanOrEqual(80)
  })
})
