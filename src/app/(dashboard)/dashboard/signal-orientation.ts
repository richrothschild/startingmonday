type CandidateProfileContext = {
  positioning_summary?: string | null
  target_titles?: string[] | null
  target_sectors?: string[] | null
  role_type?: string | null
  search_persona?: string | null
}

type SignalContext = {
  signal_type: string
  signal_summary: string
  outreach_angle?: string | null
}

type CompanyContext = {
  id: string
  name: string
  sector?: string | null
  company_size?: string | null
  fit_score?: number | null
  notes?: string | null
  role_watch_description?: string | null
}

export type SignalTranslation = {
  whatHappened: string
  whyItMatters: string
  nextStepLabel: string
  nextStepHref: string
  nextStepVerb: 'research' | 'contact' | 'prep' | 'ignore'
}

export type CompanyFitSummary = {
  whyThisFits: string[]
  risksToVerify: string[]
  bestRolesToWatch: string[]
}

function humanizeRoleType(roleType?: string | null) {
  if (!roleType) return ''
  return roleType.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function deriveProfileNoun(profile?: CandidateProfileContext | null) {
  const title = profile?.target_titles?.find((value) => value?.trim())?.trim()
  if (title) return title

  const sector = profile?.target_sectors?.find((value) => value?.trim())?.trim()
  if (sector) return `${sector} search`

  const roleType = humanizeRoleType(profile?.role_type)
  if (roleType) return roleType

  const persona = profile?.search_persona?.trim()
  if (persona) return persona

  const positioning = profile?.positioning_summary?.trim()
  if (positioning) {
    return positioning.length > 64 ? `${positioning.slice(0, 61).trimEnd()}...` : positioning
  }

  return 'search'
}

function deriveProfilePhrase(profile?: CandidateProfileContext | null) {
  const noun = deriveProfileNoun(profile)
  const sector = profile?.target_sectors?.find((value) => value?.trim())?.trim()
  const positioning = profile?.positioning_summary?.trim()
  const base = sector && noun !== `${sector} search` ? `${noun} in ${sector}` : noun
  if (!positioning) return base
  const shortPositioning = positioning.length > 96 ? `${positioning.slice(0, 93).trimEnd()}...` : positioning
  return `${base} focused on ${shortPositioning}`
}

type NextStep = {
  nextStepLabel: string
  nextStepHref: string
  nextStepVerb: SignalTranslation['nextStepVerb']
}

function translateNextStep(signalType: string, company: CompanyContext, contactId?: string | null): NextStep {
  const companyHref = `/dashboard/companies/${company.id}`
  const prepHref = `/dashboard/companies/${company.id}/prep`
  const outreachHref = contactId ? `/dashboard/contacts/${contactId}/outreach` : `/dashboard/contacts?company_id=${encodeURIComponent(company.id)}`

  if (['exec_departure', 'exec_hire', 'board_change', 'leadership_change'].includes(signalType)) {
    return {
      nextStepLabel: 'Prep this company',
      nextStepHref: prepHref,
      nextStepVerb: 'prep',
    }
  }

  if (['layoffs', 'regulatory_change', 'breach_disclosure', 'transformation_budget'].includes(signalType)) {
    return {
      nextStepLabel: 'Research the company',
      nextStepHref: companyHref,
      nextStepVerb: 'research',
    }
  }

  if (['funding', 'expansion', 'acquisition', 'new_product', 'ai_investment', 'partnership', 'award'].includes(signalType)) {
    return {
      nextStepLabel: contactId ? 'Contact the warm path' : 'Research the company',
      nextStepHref: contactId ? outreachHref : companyHref,
      nextStepVerb: contactId ? 'contact' : 'research',
    }
  }

  if (signalType === 'pattern_alert') {
    return {
      nextStepLabel: 'Ignore for now',
      nextStepHref: companyHref,
      nextStepVerb: 'ignore',
    }
  }

  return {
    nextStepLabel: contactId ? 'Contact the warm path' : 'Research the company',
    nextStepHref: contactId ? outreachHref : companyHref,
    nextStepVerb: contactId ? 'contact' : 'research',
  }
}

export function buildSignalTranslation(
  signal: SignalContext,
  profile?: CandidateProfileContext | null,
  company?: CompanyContext | null,
  contactId?: string | null,
): SignalTranslation {
  const profilePhrase = deriveProfilePhrase(profile)
  const noun = deriveProfileNoun(profile)
  const nextStep = translateNextStep(signal.signal_type, company ?? { id: '', name: 'the company' }, contactId)
  const signalLead = signal.outreach_angle?.trim() || signal.signal_summary

  return {
    whatHappened: signal.signal_summary,
    whyItMatters: `${signalLead}${signalLead.endsWith('.') ? '' : '.'} For your ${profilePhrase}, this is a cue to ${nextStep.nextStepVerb} the timing around ${noun}.`,
    nextStepLabel: nextStep.nextStepLabel,
    nextStepHref: nextStep.nextStepHref,
    nextStepVerb: nextStep.nextStepVerb,
  }
}

export function buildCompanyFitSummary(
  company: CompanyContext,
  signals: SignalContext[],
  profile?: CandidateProfileContext | null,
): CompanyFitSummary {
  const targetTitle = profile?.target_titles?.find((value) => value?.trim())?.trim()
  const targetSector = profile?.target_sectors?.find((value) => value?.trim())?.trim()
  const profilePhrase = deriveProfilePhrase(profile)
  const signalLabels = signals.slice(0, 3).map((signal) => signal.signal_summary).filter(Boolean)

  const whyThisFits = [
    company.fit_score != null
      ? `Fit score ${company.fit_score}/10 already signals meaningful overlap.`
      : `Your current search context maps cleanly onto ${company.name}.`,
    targetTitle
      ? `Your target title list already includes ${targetTitle}, which makes this a live watchlist company.`
      : `Your search profile is specific enough to test this company against real roles instead of generic curiosity.`,
    signalLabels.length > 0
      ? `Recent signals: ${signalLabels.join(' | ')}.`
      : `No recent signals have been logged yet, so the fit should be verified against the operating context.`,
  ]

  const risksToVerify = [
    `Confirm the mandate is real, not just a placeholder conversation.`,
    targetSector
      ? `Check whether the company actually matches your ${targetSector} search boundaries.`
      : `Check whether the size, stage, and scope match your search boundaries.`,
    company.notes
      ? `Review private notes before you assume the fit story is complete.`
      : `Add notes on team shape, scope, and leadership dynamics before you go deeper.`,
  ]

  const bestRolesToWatch = [
    (targetTitle ?? humanizeRoleType(profile?.role_type)) || 'Adjacent leadership roles',
    company.role_watch_description?.trim()
      ? company.role_watch_description.trim()
      : `Watch for roles that match ${profilePhrase}.`,
  ]

  return {
    whyThisFits,
    risksToVerify,
    bestRolesToWatch,
  }
}
