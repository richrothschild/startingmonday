import templateEngine from '@/lib/outreach/template-engine.cjs'
import { assertNoLegacyTemplateCopy } from '@/lib/outreach/legacy-copy-guard'

export type OutreachTemplateChannel = 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'

type BuildOutreachTemplateDraftInput = {
  channel: OutreachTemplateChannel
  fullName?: string
  firstName?: string
  company?: string
  roleLabel?: string
  focus?: string
  step?: string
  state?: string
  newsTrigger?: string
  postTrigger?: string
  profileTrigger?: string
}

function safeFirstName(input: BuildOutreachTemplateDraftInput): string {
  if (input.firstName && input.firstName.trim()) return input.firstName.trim()
  const first = (input.fullName ?? '').trim().split(/\s+/)[0]
  return first && first.length > 0 ? first : 'there'
}

export function buildOutreachTemplateDraft(input: BuildOutreachTemplateDraftInput): { subject: string; body: string; templateSource: 'latest_template_engine' } {
  const generated = templateEngine.buildLatestTemplateDraft({
    channel: input.channel,
    firstName: safeFirstName(input),
    company: (input.company ?? '').trim() || 'your organization',
    roleLabel: (input.roleLabel ?? '').trim() || 'Executive',
    focus: (input.focus ?? '').trim() || (input.roleLabel ?? '').trim() || 'senior transition',
    step: (input.step ?? '').trim(),
    state: (input.state ?? '').trim(),
    newsTrigger: (input.newsTrigger ?? '').trim(),
    postTrigger: (input.postTrigger ?? '').trim(),
    profileTrigger: (input.profileTrigger ?? '').trim(),
  })

  const subject = (generated.subject ?? '').trim()
  const body = (generated.body ?? '').trim()
  assertNoLegacyTemplateCopy(subject, body)

  return {
    subject,
    body,
    templateSource: 'latest_template_engine',
  }
}
