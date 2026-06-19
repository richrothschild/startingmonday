import { type SearchPersona } from '@/lib/executive-job-search'

export type RoleFamily = 'leadership' | 'technical_leadership' | 'delivery_leadership'

export type RoleTitle =
  | 'manager'
  | 'senior_manager'
  | 'director'
  | 'senior_director'
  | 'avp'
  | 'vp'
  | 'executive'
  | 'technical_lead'
  | 'senior_technical_lead'
  | 'principal'
  | 'senior_principal'
  | 'architect'
  | 'senior_architect'
  | 'project_manager'
  | 'senior_project_manager'
  | 'program_manager'
  | 'senior_program_manager'
  | 'tpm'
  | 'senior_tpm'

export type RoleSeniority = 'core' | 'senior' | 'executive'

export type WorkflowVariant =
  | 'leadership_transition'
  | 'technical_leadership_transition'
  | 'delivery_leadership_transition'

export type RoleProfile = {
  roleFamily: RoleFamily
  roleTitle: RoleTitle
  roleSeniority: RoleSeniority
  workflowVariant: WorkflowVariant
  searchPersonaLegacy: SearchPersona
  roleTypeLegacy: string
}

export type RoleProfileInput = {
  roleFamily?: string | null
  roleTitle?: string | null
  currentTitle?: string | null
  targetTitles?: string[] | null
  searchPersona?: SearchPersona | null
}

const TITLE_RULES: Array<{ pattern: RegExp; roleFamily: RoleFamily; roleTitle: RoleTitle }> = [
  { pattern: /senior\s+technical\s+program\s+manager|sr\.?\s+tpm/i, roleFamily: 'delivery_leadership', roleTitle: 'senior_tpm' },
  { pattern: /technical\s+program\s+manager|\btpm\b/i, roleFamily: 'delivery_leadership', roleTitle: 'tpm' },
  { pattern: /senior\s+program\s+manager|sr\.?\s+program\s+manager/i, roleFamily: 'delivery_leadership', roleTitle: 'senior_program_manager' },
  { pattern: /program\s+manager/i, roleFamily: 'delivery_leadership', roleTitle: 'program_manager' },
  { pattern: /senior\s+project\s+manager|sr\.?\s+project\s+manager/i, roleFamily: 'delivery_leadership', roleTitle: 'senior_project_manager' },
  { pattern: /project\s+manager/i, roleFamily: 'delivery_leadership', roleTitle: 'project_manager' },

  { pattern: /senior\s+architect|principal\s+architect/i, roleFamily: 'technical_leadership', roleTitle: 'senior_architect' },
  { pattern: /\barchitect\b/i, roleFamily: 'technical_leadership', roleTitle: 'architect' },
  { pattern: /senior\s+principal|sr\.?\s+principal/i, roleFamily: 'technical_leadership', roleTitle: 'senior_principal' },
  { pattern: /\bprincipal\b/i, roleFamily: 'technical_leadership', roleTitle: 'principal' },
  { pattern: /senior\s+technical\s+lead|sr\.?\s+tech(nical)?\s+lead/i, roleFamily: 'technical_leadership', roleTitle: 'senior_technical_lead' },
  { pattern: /technical\s+lead|engineering\s+lead|tech\s+lead/i, roleFamily: 'technical_leadership', roleTitle: 'technical_lead' },

  { pattern: /chief|\bcxo\b|president|general\s+manager/i, roleFamily: 'leadership', roleTitle: 'executive' },
  { pattern: /\bsvp\b|senior\s+vice\s+president|\bvp\b|vice\s+president/i, roleFamily: 'leadership', roleTitle: 'vp' },
  { pattern: /\bavp\b|assistant\s+vice\s+president|associate\s+vice\s+president/i, roleFamily: 'leadership', roleTitle: 'avp' },
  { pattern: /senior\s+director|sr\.?\s+director/i, roleFamily: 'leadership', roleTitle: 'senior_director' },
  { pattern: /\bdirector\b/i, roleFamily: 'leadership', roleTitle: 'director' },
  { pattern: /senior\s+manager|sr\.?\s+manager/i, roleFamily: 'leadership', roleTitle: 'senior_manager' },
  { pattern: /\bmanager\b/i, roleFamily: 'leadership', roleTitle: 'manager' },
]

function normalizeRoleFamily(input: string | null | undefined): RoleFamily | null {
  switch ((input ?? '').trim().toLowerCase()) {
    case 'leadership':
      return 'leadership'
    case 'technical_leadership':
      return 'technical_leadership'
    case 'delivery_leadership':
      return 'delivery_leadership'
    default:
      return null
  }
}

function normalizeRoleTitle(input: string | null | undefined): RoleTitle | null {
  const value = (input ?? '').trim().toLowerCase()
  const valid: RoleTitle[] = [
    'manager',
    'senior_manager',
    'director',
    'senior_director',
    'avp',
    'vp',
    'executive',
    'technical_lead',
    'senior_technical_lead',
    'principal',
    'senior_principal',
    'architect',
    'senior_architect',
    'project_manager',
    'senior_project_manager',
    'program_manager',
    'senior_program_manager',
    'tpm',
    'senior_tpm',
  ]
  return valid.includes(value as RoleTitle) ? (value as RoleTitle) : null
}

function inferFromTitle(currentTitle: string | null | undefined, targetTitles: string[] | null | undefined): Pick<RoleProfile, 'roleFamily' | 'roleTitle'> {
  const combined = `${currentTitle ?? ''} ${(targetTitles ?? []).join(' ')}`.trim()
  for (const rule of TITLE_RULES) {
    if (rule.pattern.test(combined)) {
      return { roleFamily: rule.roleFamily, roleTitle: rule.roleTitle }
    }
  }
  return { roleFamily: 'leadership', roleTitle: 'director' }
}

function inferSeniority(roleTitle: RoleTitle): RoleSeniority {
  if (roleTitle === 'executive' || roleTitle === 'vp' || roleTitle === 'avp') return 'executive'
  if (roleTitle.startsWith('senior_')) return 'senior'
  return 'core'
}

function inferWorkflowVariant(roleFamily: RoleFamily): WorkflowVariant {
  if (roleFamily === 'technical_leadership') return 'technical_leadership_transition'
  if (roleFamily === 'delivery_leadership') return 'delivery_leadership_transition'
  return 'leadership_transition'
}

function inferLegacySearchPersona(roleTitle: RoleTitle, fallback: SearchPersona | null | undefined): SearchPersona {
  if (roleTitle === 'executive') return 'csuite'
  if (roleTitle === 'vp' || roleTitle === 'avp') return 'vp'
  if (fallback) return fallback
  return 'director'
}

function inferLegacyRoleType(roleFamily: RoleFamily, roleTitle: RoleTitle): string {
  if (roleFamily === 'technical_leadership') return 'technical_leadership'
  if (roleFamily === 'delivery_leadership') return 'delivery_leadership'
  if (roleTitle === 'executive') return 'executive'
  if (roleTitle === 'vp' || roleTitle === 'avp') return 'vp'
  return 'director'
}

export function resolveRoleProfile(input: RoleProfileInput): RoleProfile {
  const normalizedFamily = normalizeRoleFamily(input.roleFamily)
  const normalizedTitle = normalizeRoleTitle(input.roleTitle)

  const inferred = normalizedFamily && normalizedTitle
    ? { roleFamily: normalizedFamily, roleTitle: normalizedTitle }
    : inferFromTitle(input.currentTitle, input.targetTitles)

  const roleSeniority = inferSeniority(inferred.roleTitle)
  const workflowVariant = inferWorkflowVariant(inferred.roleFamily)
  const searchPersonaLegacy = inferLegacySearchPersona(inferred.roleTitle, input.searchPersona)
  const roleTypeLegacy = inferLegacyRoleType(inferred.roleFamily, inferred.roleTitle)

  return {
    roleFamily: inferred.roleFamily,
    roleTitle: inferred.roleTitle,
    roleSeniority,
    workflowVariant,
    searchPersonaLegacy,
    roleTypeLegacy,
  }
}