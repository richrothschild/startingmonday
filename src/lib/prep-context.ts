import { DOC_CHARS } from '@/lib/ai-limits'

export type Signal = {
  signal_type: string
  signal_summary: string
  outreach_angle?: string | null
  signal_date: string
}
export type ScanRow = {
  scanned_at: string
  ai_score?: number | null
  ai_summary?: string | null
  raw_hits?: unknown
}
export type ContactRow = {
  name: string
  title?: string | null
  firm?: string | null
  channel?: string | null
  notes?: string | null
}
export type DocRow = { label: string; content: string }

export const DOC_LABEL_NAMES: Record<string, string> = {
  job_description: 'Job Description',
  news:            'News & Press',
  annual_report:   'Annual Report',
  org_notes:       'Org Notes',
  other:           'Other',
}

const SCAN_FALLBACKS: Record<string, string> = {
  cio:          'CIO searches frequently run through retained search and rarely appear on public career pages. Use company notes, signals, and sector context to infer the transformation mandate.',
  cto:          'CTO searches often post under engineering or technology leadership titles. Use company notes and signals to infer the technical mandate.',
  cdo_data:     'CDO roles are often titled Head of Data, SVP Analytics, or Chief AI Officer. Use company notes to infer the data mandate and maturity level.',
  cdo_digital:  'Chief Digital Officer searches are often run confidentially. Use company notes and sector context to infer the digital transformation agenda.',
  ciso:         'CISO searches frequently run through retained search and may post under VP Information Security or Director of Cybersecurity. Use sector, regulatory context, and signals to infer the mandate.',
  cpo:          'CPO searches are often unlisted or posted under Head of Product or General Manager. Use company notes and product signals to infer the product mandate.',
  coo:          'COO mandates are created around specific operational challenges, not posted roles. Add notes describing the operational situation this company is navigating to generate a mandate-specific brief.',
  vp_technology:'Technology leadership roles may post under VP Engineering, IT Director, or similar titles. Use company notes to confirm the role scope.',
}

export function buildScanSection(scanResults: ScanRow[] | null, roleType?: string | null): string {
  const fallback = (roleType ? SCAN_FALLBACKS[roleType] : null)
    ?? 'The role may be unlisted or filled through retained search. Use company notes, signals, and sector context to infer the likely mandate.'
  if (!scanResults?.[0]) return `No career page scan on file. ${fallback}`
  const scan = scanResults[0]
  const matches = ((scan.raw_hits ?? []) as { title: string; score: number; is_match: boolean; summary: string }[])
    .filter(h => h.is_match)
  const date = new Date(scan.scanned_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
  return matches.length > 0
    ? `Career page scanned ${date}:\n` + matches.map(h => `- ${h.title} (fit score: ${h.score}): ${h.summary}`).join('\n')
    : `Career page scanned ${date}. No matching roles found on the public career page. ${fallback}`
}

export function buildSignalSection(signals: Signal[] | null): string | null {
  if (!(signals ?? []).length) return null
  return (signals ?? []).map(s => {
    const date = new Date(s.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    return `- [${s.signal_type.toUpperCase()}] ${date}: ${s.signal_summary}${s.outreach_angle ? `\n  Angle: ${s.outreach_angle}` : ''}`
  }).join('\n')
}

export function buildContactSection(contacts: ContactRow[] | null): string {
  if (!(contacts ?? []).length) return 'No contacts on file.'
  return (contacts ?? []).map(c => {
    const parts = [c.title, c.firm].filter(Boolean).join(' at ')
    return `- ${c.name}${parts ? `, ${parts}` : ''}${c.channel ? ` (via ${c.channel})` : ''}${c.notes ? `: ${c.notes}` : ''}`
  }).join('\n')
}

export function buildDocSection(documents: DocRow[] | null): string | null {
  if (!(documents ?? []).length) return null
  return (documents ?? []).map(d => {
    const labelName = DOC_LABEL_NAMES[d.label] ?? d.label
    const content = d.content.length > DOC_CHARS ? d.content.slice(0, DOC_CHARS) + '\n[truncated]' : d.content
    return `[${labelName}]\n${content}`
  }).join('\n\n')
}
