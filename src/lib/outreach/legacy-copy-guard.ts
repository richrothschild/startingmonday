const LEGACY_COPY_MARKERS: Array<{ label: string; regex: RegExp }> = [
  { label: 'legacy first-call subject', regex: /\bsimple\s+[a-z]{2,8}\s+first-call\s+plan\b/i },
  { label: 'Momentum Signal language', regex: /\bmomentum signal\b/i },
  { label: 'search momentum boilerplate', regex: /search\s+momentum\s+is\s+critical/i },
  { label: 'pilot group evidence line', regex: /pilot\s+group\s*\(\s*n\s*=\s*27\s*\)/i },
  { label: 'n=27 evidence line', regex: /\(\s*n\s*=\s*27\s*\)/i },
  { label: 'legacy CTA opener', regex: /if useful,\s*reply yes and i will send/i },
]

export function detectLegacyTemplateCopy(subject: string, body: string): string[] {
  const combined = `${subject}\n${body}`
  return LEGACY_COPY_MARKERS
    .filter(marker => marker.regex.test(combined))
    .map(marker => marker.label)
}

export function assertNoLegacyTemplateCopy(subject: string, body: string): string[] {
  const hits = detectLegacyTemplateCopy(subject, body)
  if (hits.length > 0) {
    throw new Error(`Legacy template markers detected: ${hits.join(', ')}`)
  }
  return hits
}
