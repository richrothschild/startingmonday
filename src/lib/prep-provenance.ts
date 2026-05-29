export const PREP_PROVENANCE_VERSION = 1

export type ClaimOriginClass = 'user_provided' | 'system_detected' | 'inferred'

export type SensitivePolicyHook =
  | 'compensation_claim'
  | 'legal_risk_claim'
  | 'security_incident_claim'

export type PrepClaimProvenance = {
  claimText: string
  originClass: ClaimOriginClass
  section: string | null
  sensitivePolicyHooks: SensitivePolicyHook[]
}

export type PrepProvenanceValidationError = {
  index: number
  code: 'missing_claim_text' | 'missing_origin_class' | 'invalid_origin_class' | 'sensitive_inferred_block'
  message: string
}

const ORIGIN_CLASSES: ClaimOriginClass[] = ['user_provided', 'system_detected', 'inferred']

function normalizeLine(line: string): string {
  return line
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sectionHeader(line: string): string | null {
  if (!line.startsWith('## ')) return null
  return line.slice(3).trim() || null
}

function inferOriginClass(claimText: string): ClaimOriginClass {
  const text = claimText.toLowerCase()

  if (
    text.includes('candidate') ||
    text.includes('your resume') ||
    text.includes('verified') ||
    text.includes('career history') ||
    text.includes('star story')
  ) {
    return 'user_provided'
  }

  if (
    text.includes('signal') ||
    text.includes('scan') ||
    text.includes('pipeline') ||
    text.includes('company notes') ||
    text.includes('interview notes') ||
    text.includes('contact') ||
    text.includes('document')
  ) {
    return 'system_detected'
  }

  return 'inferred'
}

function detectSensitivePolicyHooks(claimText: string): SensitivePolicyHook[] {
  const text = claimText.toLowerCase()
  const hooks: SensitivePolicyHook[] = []

  if (/(salary|compensation|equity|cash|bonus|\$|k\b)/i.test(text)) {
    hooks.push('compensation_claim')
  }
  if (/(lawsuit|litigation|regulatory|sec inquiry|legal exposure|compliance breach)/i.test(text)) {
    hooks.push('legal_risk_claim')
  }
  if (/(breach|incident|ransomware|security event|data exfiltration|cyberattack)/i.test(text)) {
    hooks.push('security_incident_claim')
  }

  return hooks
}

export function buildPrepClaimProvenance(outputText: string): PrepClaimProvenance[] {
  const lines = outputText.split('\n')
  const claims: PrepClaimProvenance[] = []
  let currentSection: string | null = null

  for (const rawLine of lines) {
    const maybeSection = sectionHeader(rawLine.trim())
    if (maybeSection) {
      currentSection = maybeSection
      continue
    }

    const claimText = normalizeLine(rawLine)
    if (!claimText) continue
    if (claimText.startsWith('#')) continue
    if (claimText === '---' || claimText === '***') continue
    if (claimText.length < 24) continue

    claims.push({
      claimText,
      originClass: inferOriginClass(claimText),
      section: currentSection,
      sensitivePolicyHooks: detectSensitivePolicyHooks(claimText),
    })

    if (claims.length >= 80) break
  }

  return claims
}

export function validatePrepClaimProvenance(claims: PrepClaimProvenance[]): PrepProvenanceValidationError[] {
  const errors: PrepProvenanceValidationError[] = []

  for (const [index, claim] of claims.entries()) {
    if (!claim.claimText || !claim.claimText.trim()) {
      errors.push({
        index,
        code: 'missing_claim_text',
        message: 'Claim text is required for each provenance record.',
      })
    }

    if (!('originClass' in claim)) {
      errors.push({
        index,
        code: 'missing_origin_class',
        message: 'Every claim must include an originClass.',
      })
      continue
    }

    if (!ORIGIN_CLASSES.includes(claim.originClass)) {
      errors.push({
        index,
        code: 'invalid_origin_class',
        message: `originClass must be one of: ${ORIGIN_CLASSES.join(', ')}.`,
      })
      continue
    }

    if ((claim.sensitivePolicyHooks?.length ?? 0) > 0 && claim.originClass === 'inferred') {
      errors.push({
        index,
        code: 'sensitive_inferred_block',
        message: 'Sensitive claims cannot be stored with inferred originClass.',
      })
    }
  }

  return errors
}
