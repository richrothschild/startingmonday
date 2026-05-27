const CHANNELS = {
  EXECUTIVES: 'executives',
  SEARCH_FIRMS: 'search_firms',
  COACHES: 'coaches',
  OUTPLACEMENT_FIRMS: 'outplacement_firms',
}

const EMOTIONAL_STATES = {
  PANIC: 'panic',
  OPTIONALITY: 'optionality',
  BURNOUT: 'burnout',
  BOARD_TRACK: 'board-track',
}

function focusText(raw) {
  const value = String(raw || '').trim()
  return value || 'senior transition'
}

function cleanTrigger(raw) {
  const value = String(raw || '').replace(/\s+/g, ' ').trim()
  if (!value) return ''
  return value.replace(/[.!?]+$/, '')
}

function channelFallbackTrigger(channel, focus) {
  if (channel === CHANNELS.EXECUTIVES) {
    return `In first-week ${focus} moves, early momentum can slip when the first-call story is not clear.`
  }
  if (channel === CHANNELS.COACHES) {
    return 'Between sessions, client prep can end up split across inboxes, docs, and memory.'
  }
  if (channel === CHANNELS.SEARCH_FIRMS) {
    return 'In retained search, first-touch quality can slip once partner review starts repeating.'
  }
  return `Across ${focus}, first-call quality can vary more than teams expect.`
}

function triggerLine(channel, focus, { newsTrigger, postTrigger, profileTrigger }) {
  const candidate = cleanTrigger(newsTrigger) || cleanTrigger(postTrigger) || cleanTrigger(profileTrigger)
  if (!candidate) return channelFallbackTrigger(channel, focus)

  if (channel === CHANNELS.COACHES) {
    return `I saw ${candidate}, and that pressure is real for most coaches.`
  }
  if (channel === CHANNELS.SEARCH_FIRMS) {
    return `I saw ${candidate}, and this is usually when first-touch quality matters most.`
  }
  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    return `I saw ${candidate}, and it often signals uneven first-call readiness across the cohort.`
  }
  const simplifiedCandidate = candidate.replace(/\b([A-Za-z]{2,5}) succession plan announced\b/i, '$1 leadership changes')
  return `I saw ${simplifiedCandidate}, and that usually adds pressure to early search conversations.`
}

function normalizeState(raw) {
  const value = String(raw || '').toLowerCase().trim()
  if (value === EMOTIONAL_STATES.PANIC) return EMOTIONAL_STATES.PANIC
  if (value === EMOTIONAL_STATES.OPTIONALITY) return EMOTIONAL_STATES.OPTIONALITY
  if (value === EMOTIONAL_STATES.BURNOUT) return EMOTIONAL_STATES.BURNOUT
  if (value === EMOTIONAL_STATES.BOARD_TRACK || value === 'board') return EMOTIONAL_STATES.BOARD_TRACK
  return ''
}

function inferState({ state, focus, roleLabel }) {
  const normalized = normalizeState(state)
  if (normalized) return normalized

  const hints = `${String(focus || '')} ${String(roleLabel || '')}`.toLowerCase()
  if (hints.includes('board') || hints.includes('advisor') || hints.includes('ceo')) return EMOTIONAL_STATES.BOARD_TRACK
  if (hints.includes('burnout') || hints.includes('overwhelm') || hints.includes('exhaust')) return EMOTIONAL_STATES.BURNOUT
  if (hints.includes('displaced') || hints.includes('urgent') || hints.includes('recovery')) return EMOTIONAL_STATES.PANIC
  return EMOTIONAL_STATES.OPTIONALITY
}

function stateLine(channel, state, focus, company) {
  if (state === EMOTIONAL_STATES.PANIC) {
    return `${focus} leaders at ${company} are usually under time pressure to create momentum in the first 72 hours.`
  }
  if (state === EMOTIONAL_STATES.BURNOUT) {
    return `${focus} leaders at ${company} often need lower cognitive load so progress does not stall from decision fatigue.`
  }
  if (state === EMOTIONAL_STATES.BOARD_TRACK) {
    return `${focus} leaders at ${company} usually need a board-track narrative that signals governance readiness early.`
  }
  if (channel === CHANNELS.COACHES) {
    return `Coach-led ${focus} transitions at ${company} usually need steady between-session momentum without adding coach admin.`
  }
  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    return `${focus} cohorts at ${company} often need consistent progression quality without adding coordinator overhead.`
  }
  return `${focus} leaders at ${company} often want optionality with a low-noise execution rhythm.`
}

function signalLine(focus, company) {
  return `I have been following your work at ${company}, and this stood out for ${focus} transitions.`
}

function decisionLine(channel, focus) {
  if (channel === CHANNELS.SEARCH_FIRMS) {
    return `The decision is whether your mandate team should standardize first-touch narrative quality for ${focus} searches this quarter.`
  }
  if (channel === CHANNELS.COACHES) {
    return `The decision is whether between-session readiness for ${focus} clients should stay manual or move to one coach-visible operating loop.`
  }
  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    return `The decision is whether ${focus} cohorts need one measurable readiness standard across targeting, narrative quality, and first-conversation prep.`
  }
  return `The decision is whether the first serious ${focus} conversation should be anchored on a role-specific benchmark before outreach starts.`
}

function legalSafeProofLine(channel, focus) {
  if (channel === CHANNELS.COACHES) {
    return `In our Jan-May 2026 pilot cohort (n=27), median time to first qualified outreach was 9 days and coaching adoption was 43 percent; results vary by market conditions and execution quality.`
  }
  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    return `In our Jan-May 2026 pilot cohort (n=27), activated users reached first qualified outreach in a 9-day median; use this as directional evidence, not a guarantee.`
  }
  if (channel === CHANNELS.SEARCH_FIRMS) {
    return `In our Jan-May 2026 pilot cohort (n=27), median time to first qualified outreach was 9 days; results vary by mandate mix, market timing, and execution quality.`
  }
  return `In our Jan-May 2026 pilot cohort (n=27), activated users reached first qualified outreach in a 9-day median; results vary by market conditions and execution quality.`
}

function binaryCtaLine(asset, audience) {
  return `If you want it, reply yes and I will send ${asset} for your ${audience}. If not useful right now, reply pass and I will close the loop.`
}

function searchFirmEconomicsLine(company) {
  return `This is built to improve mandate economics at ${company} by reducing partner prep rework and improving first-conversation quality before candidate outreach scales.`
}

function outplacementEconomicsLine(company) {
  return `This is built to improve program consistency at ${company} with repeatable counselor workflows, measurable cohort standards, and lower coordinator burden.`
}

function benchmarkAssetForFocus(focus) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'the CFO board-readiness scorecard'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'the CTO architecture-to-business benchmark'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'the COO sequencing and operating cadence benchmark'
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return 'the CISO risk narrative benchmark'
  if (normalized.includes('CHRO') || normalized.includes('PEOPLE')) return 'the leadership-change benchmark'
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'the board-readiness benchmark'
  if (normalized.includes('VP')) return 'the next-scope readiness benchmark'
  return 'the role-specific benchmark sheet'
}

function proofLineForFocus(focus) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'faster translation of finance credibility into board-readable transition narratives'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'clearer architecture-to-business messaging before first stakeholder interviews'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'stronger execution-cadence proof in early outreach and screening calls'
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return 'higher-confidence risk and resilience framing for non-technical decision-makers'
  if (normalized.includes('CHRO') || normalized.includes('PEOPLE')) return 'more credible people-and-change leadership signaling in first-touch conversations'
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'cleaner board-readiness signal and tighter strategic positioning in early conversations'
  if (normalized.includes('VP')) return 'clearer next-scope readiness proof supported by concrete execution examples'
  return 'cleaner role-specific positioning supported by measurable execution evidence'
}

function stakesLineForFocus(focus, company) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return `For ${focus} leaders at ${company}, the real risk is sounding competent but not board-ready when the first serious conversation starts.`
  if (normalized.includes('CTO') || normalized.includes('TECH')) return `For ${focus} leaders at ${company}, the real risk is being seen as technically strong but too abstract for a CEO, board, or investor audience.`
  if (normalized.includes('COO') || normalized.includes('OPER')) return `For ${focus} leaders at ${company}, the real risk is being known for execution without proving the scale and sequencing that the next role requires.`
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return `For ${focus} leaders at ${company}, the real risk is having the right expertise but losing the room before the business impact lands.`
  if (normalized.includes('CHRO') || normalized.includes('PEOPLE')) return `For ${focus} leaders at ${company}, the real risk is describing culture work in a way that feels soft instead of decisive.`
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return `For ${focus} leaders at ${company}, the real risk is under-selling governance, scale, and decision quality in the first conversation.`
  if (normalized.includes('VP')) return `For ${focus} leaders at ${company}, the real risk is sounding ready for more scope without proving what changes at the higher level.`
  return `For ${focus} leaders at ${company}, the real risk is sounding credible in theory but not specific enough to move the conversation forward.`
}

function coachStakesLineForFocus(focus, company) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return `For ${focus} clients at ${company}, the failure mode is simple: they look accomplished, then lose momentum because governance and board-fit are not explicit in the first two conversations.`
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return `For ${focus} clients at ${company}, the failure mode is sounding financially credible but not investment-grade for board and CEO audiences.`
  if (normalized.includes('CTO') || normalized.includes('TECH')) return `For ${focus} clients at ${company}, the failure mode is deep technical credibility paired with weak business translation in first-touch conversations.`
  if (normalized.includes('COO') || normalized.includes('OPER')) return `For ${focus} clients at ${company}, the failure mode is being known as reliable operators without proving scale leverage for the next mandate.`
  return `For ${focus} clients at ${company}, the failure mode is looking qualified on paper but losing signal quality in live conversations.`
}

function coachProofPointForFocus(focus) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'a board narrative that can be explained in one minute without hand-waving'
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'a finance-first narrative that reads as strategic judgment, not just stewardship'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'a technical narrative that maps directly to revenue, risk, and execution outcomes'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'an operating narrative that proves sequencing, scale, and decision velocity'
  return 'a role narrative that survives hard follow-up questions without drifting into generic language'
}

function coachAssetForFocus(focus) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'the board-readiness interview map'
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'the CFO investment-grade narrative sheet'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'the CTO business-translation interview map'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'the COO sequencing and scale interview map'
  return 'the executive signal-quality interview map'
}

function outplacementStakesLine(focus, company) {
  const normalized = focus.toUpperCase()
  const label = /programs?$/i.test(focus) ? focus : `${focus} programs`
  if (normalized.includes('EXECUTIVE')) return `For ${label} at ${company}, the failure mode is high candidate activity but low qualified progression because first-touch narratives are inconsistent.`
  if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return `For ${label} at ${company}, the failure mode is strong coaching effort with uneven narrative quality across cohorts.`
  if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return `For ${label} at ${company}, the failure mode is candidates moving fast but entering senior conversations underprepared.`
  return `For ${label} at ${company}, the failure mode is operational activity that does not convert into consistent executive-level conversation quality.`
}

function outplacementProofPoint(focus) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('EXECUTIVE')) return 'a consistent first-conversation standard across high-variance senior cohorts'
  if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return 'a cleaner narrative baseline that reduces coach-to-coach quality variance'
  if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return 'faster readiness for high-stakes conversations without adding coordinator overhead'
  return 'a measurable progression standard from targeting to first qualified conversation'
}

function outplacementAssetForFocus(focus) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('EXECUTIVE')) return 'the executive cohort progression benchmark'
  if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return 'the mobility cohort narrative benchmark'
  if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return 'the transition-readiness benchmark'
  return 'the program-level progression benchmark'
}

function microProofLine(channel, focus) {
  const normalized = focus.toUpperCase()
  if (channel === CHANNELS.COACHES) {
    if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'In recent board-track coaching engagements, the strongest lift came when governance fit was stated explicitly in the opening two conversations.'
    if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'In recent finance-track transitions, response quality improved when candidates led with strategic capital judgment before technical detail.'
    if (normalized.includes('CTO') || normalized.includes('TECH')) return 'In recent technology-track transitions, interview progression improved when architecture work was translated into business risk and growth impact.'
    if (normalized.includes('COO') || normalized.includes('OPER')) return 'In recent operations-track transitions, progression improved when sequencing decisions were made explicit instead of implied.'
    return 'In recent executive coaching engagements, progression improved when first-touch messaging was rewritten for role-specific decision criteria.'
  }

  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    if (normalized.includes('EXECUTIVE')) return 'In recent executive cohorts, qualified-conversation rate improved after first-touch narrative standards were normalized across coaches.'
    if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return 'In recent mobility programs, quality variance dropped when every participant used the same role-specific opening narrative framework.'
    if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return 'In recent transition programs, readiness improved when interview preparation and outreach language were measured against one shared benchmark.'
    return 'In recent outplacement cohorts, progression improved when candidate narratives were reviewed against a single measurable quality standard.'
  }

  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'In recent CFO-track transitions, first conversations improved when board language and capital allocation logic were explicit from minute one.'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'In recent CTO-track transitions, response quality improved when technical depth was translated into operating outcomes and decision impact.'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'In recent COO-track transitions, conversion improved when execution stories included sequencing decisions and operating leverage proof.'
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return 'In recent CISO-track transitions, momentum improved when risk language was framed in business continuity and trust terms.'
  return 'In recent executive transitions, progression improved when role-specific narratives were tested and revised before high-stakes conversations.'
}

function costOfInactionLine(channel) {
  if (channel === CHANNELS.COACHES) {
    return 'If this is not relevant right now, no problem - timing matters more than forcing another initiative.'
  }
  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    return 'If this is not relevant right now, no problem - the right use case is when cohorts need cleaner progression quality.'
  }
  return 'If this is not relevant right now, no problem - I would rather keep this useful than push timing.'
}

function buildExecutiveFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const transitionFocus = focusText(focus || roleLabel || 'Executive')
  const benchmarkAsset = benchmarkAssetForFocus(transitionFocus)
  const subject = step === 'followup_2'
    ? `Should I send the ${roleLabel} benchmark for ${company}`
    : step === 'followup_3'
      ? `Closing the loop on ${roleLabel} readiness for ${company}`
      : `Quick follow-up on ${roleLabel} readiness for ${company}`

  if (step === 'followup_1') {
    return {
      subject,
      body: [
        `Hi ${firstName},`,
        '',
        `I am following up on the ${transitionFocus} note for ${company}. Starting Monday gives leaders one page for the first conversation. Momentum Signal shows weekly movement.`,
        '',
        `I can send ${benchmarkAsset}. If useful, reply yes. If not, reply pass. ${legalSafeProofLine(CHANNELS.EXECUTIVES, transitionFocus)} Use this as directional evidence, not a guarantee.`,
      ].join('\n'),
    }
  }

  if (step === 'followup_2') {
    return {
      subject,
      body: [
        `Hi ${firstName},`,
        '',
        `One update from recent ${transitionFocus} transitions at ${company}: the strongest results come when role-specific benchmark language is set before outreach starts. Starting Monday tracks that with Momentum Signal.`,
        '',
        `I can send ${benchmarkAsset}. If useful, reply yes. If not, reply pass. ${legalSafeProofLine(CHANNELS.EXECUTIVES, transitionFocus)} Use this as directional evidence, not a guarantee.`,
      ].join('\n'),
    }
  }

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `Closing the loop on my ${transitionFocus} note for ${company}. Starting Monday gives leaders one clear check on early outreach quality.`,
      '',
      `If timing is right, I can send ${benchmarkAsset}. If useful, reply yes. If not, reply pass. ${legalSafeProofLine(CHANNELS.EXECUTIVES, transitionFocus)} Use this as directional evidence, not a guarantee.`,
    ].join('\n'),
  }
}

function buildSearchFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const transitionFocus = focusText(focus || roleLabel || 'search')
  const asset = 'one-page first-touch plan'
  const subject = step === 'followup_2'
    ? `Should I send the first-touch plan for ${company}`
    : step === 'followup_3'
      ? `Closing the loop on first-touch plan for ${company}`
      : `Quick follow-up on first-touch plan for ${company}`

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `I am following up on the ${transitionFocus} note for ${company}. Starting Monday gives search teams one page for the first-touch standard. Momentum Signal shows week to week movement.`,
      '',
      `I can send ${asset}. If useful, reply yes. If not, reply pass. ${legalSafeProofLine(CHANNELS.SEARCH_FIRMS, transitionFocus)} Use this as directional evidence, not a guarantee.`,
    ].join('\n'),
  }
}

function buildCoachFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const transitionFocus = focusText(focus || roleLabel || 'coaching')
  const asset = 'coach signal map'
  const subject = step === 'followup_2'
    ? `Should I send the coach map for ${company}`
    : step === 'followup_3'
      ? `Closing the loop on coach momentum for ${company}`
      : `Quick follow-up on coach momentum for ${company}`

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `I am following up on the ${transitionFocus} note for ${company}. Starting Monday gives coaches one place for prep and next steps. Momentum Signal shows real traction.`,
      '',
      `I can send ${asset}. If useful, reply yes. If not, reply pass. In our Jan-May 2026 pilot cohort (n=27), median time to first qualified outreach was 9 days. Coaching adoption was 43 percent. Use this as directional evidence, not a guarantee.`,
    ].join('\n'),
  }
}

function buildOutplacementFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const transitionFocus = focusText(focus || roleLabel || 'outplacement')
  const focusLabel = /programs?$/i.test(transitionFocus) ? transitionFocus : `${transitionFocus} programs`
  const asset = 'cohort readiness checklist'
  const subject = step === 'followup_2'
    ? `Should I send the cohort checklist for ${company}`
    : step === 'followup_3'
      ? `Closing the loop on cohort readiness for ${company}`
      : `Quick follow-up on cohort readiness for ${company}`

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `I am following up on the ${focusLabel} note for ${company}. Starting Monday gives counselors one shared readiness check. Momentum Signal shows week to week improvement.`,
      '',
      `I can send ${asset}. If useful, reply yes. If not, reply pass. ${legalSafeProofLine(CHANNELS.OUTPLACEMENT_FIRMS, focusLabel)} Use this as directional evidence, not a guarantee.`,
    ].join('\n'),
  }
}

function buildLatestTemplateDraft({
  channel,
  firstName,
  company,
  roleLabel,
  focus,
  step,
  state,
  profileTrigger,
  postTrigger,
  newsTrigger,
}) {
  const safeFirstName = String(firstName || 'there').trim() || 'there'
  const safeCompany = String(company || 'your team').trim() || 'your team'
  const safeRoleLabel = String(roleLabel || 'Executive').trim() || 'Executive'
  const transitionFocus = focusText(focus || roleLabel || 'senior transition')
  const emotionalState = inferState({ state, focus: transitionFocus, roleLabel: safeRoleLabel })

  if (step && step.startsWith('followup_')) {
    if (channel === CHANNELS.EXECUTIVES) {
      return buildExecutiveFollowupDraft({
        firstName: safeFirstName,
        company: safeCompany,
        focus: transitionFocus,
        roleLabel: safeRoleLabel,
        step,
      })
    }

    if (channel === CHANNELS.SEARCH_FIRMS) {
      return buildSearchFollowupDraft({
        firstName: safeFirstName,
        company: safeCompany,
        focus: transitionFocus,
        roleLabel: safeRoleLabel,
        step,
      })
    }

    if (channel === CHANNELS.COACHES) {
      return buildCoachFollowupDraft({
        firstName: safeFirstName,
        company: safeCompany,
        focus: transitionFocus,
        roleLabel: safeRoleLabel,
        step,
      })
    }

    return buildOutplacementFollowupDraft({
      firstName: safeFirstName,
      company: safeCompany,
      focus: transitionFocus,
      roleLabel: safeRoleLabel,
      step,
    })
  }

  if (channel === CHANNELS.EXECUTIVES) {
    const asset = 'one-page first-call plan'
    const trigger = triggerLine(CHANNELS.EXECUTIVES, transitionFocus, { newsTrigger, postTrigger, profileTrigger })
    return {
      subject: `Simple ${safeRoleLabel} first-call plan for ${safeCompany} team`,
      body: [
        `Hi ${safeFirstName},`,
        '',
        trigger,
        '',
        'When the first serious call is strong, search momentum usually gets easier. When the story is vague, the process gets slower. Starting Monday gives leaders one working plan for the next real conversation. Momentum Signal shows whether that plan is turning into weekly movement.',
        '',
        'In our Jan-May 2026 pilot group (n=27), active users reached first qualified outreach in a median of 9 days. Use this as directional evidence, not a guarantee.',
        '',
        `If useful, reply yes and I will send the ${asset}. If not useful right now, reply pass and I will close the loop.`,
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === CHANNELS.SEARCH_FIRMS) {
    const asset = 'one-page first-touch plan'
    const trigger = triggerLine(CHANNELS.SEARCH_FIRMS, transitionFocus, { newsTrigger, postTrigger, profileTrigger })
    return {
      subject: `${transitionFocus} search first-touch plan for ${safeCompany}`,
      body: [
        `Hi ${safeFirstName},`,
        '',
        trigger,
        '',
        'The first-touch standard usually decides whether a mandate feels sharp or expensive. Starting Monday helps teams hold one clear bar before shortlist outreach scales, and Momentum Signal shows whether mandate velocity is strengthening week to week.',
        '',
        'In our Jan-May 2026 pilot group (n=27), active users reached first qualified outreach in a median of 9 days; results vary by mandate mix and execution.',
        '',
        `If useful, reply yes and I will send the ${asset}. If not useful right now, reply pass and I will close the loop.`,
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === CHANNELS.COACHES) {
    const asset = 'coach signal map'
    const trigger = triggerLine(CHANNELS.COACHES, transitionFocus, { newsTrigger, postTrigger, profileTrigger })
    return {
      subject: `Simple between-session plan for ${safeCompany}`,
      body: [
        `Hi ${safeFirstName},`,
        '',
        trigger,
        '',
        'Starting Monday gives coaches one shared place for signal review, prep, and next-action follow-through without adding admin weight. Momentum Signal shows, week by week, whether the between-session work is turning into real search traction.',
        '',
        'In our Jan-May 2026 pilot group (n=27), active users reached first qualified outreach in a median of 9 days. Coaching adoption was 43 percent; results vary by market and execution.',
        '',
        `If useful, reply yes and I will send the ${asset}. If not useful right now, reply pass and I will close the loop.`,
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  const outplacementAsset = 'cohort readiness checklist'
  const outplacementFocusLabel = /programs?$/i.test(transitionFocus) ? transitionFocus : `${transitionFocus} programs`
  const trigger = triggerLine(CHANNELS.OUTPLACEMENT_FIRMS, outplacementFocusLabel, { newsTrigger, postTrigger, profileTrigger })
  return {
    subject: `Cohort first-call readiness plan for ${safeCompany}`,
    body: [
      `Hi ${safeFirstName},`,
      '',
      trigger,
      '',
      'Starting Monday gives counselors one shared readiness check before the first serious conversation. Momentum Signal shows whether cohort quality is improving week to week.',
      '',
      'In our Jan-May 2026 pilot group (n=27), active users reached first qualified outreach in a median of 9 days; this is directional evidence, not a guarantee.',
      '',
      `If useful, reply yes and I will send the ${outplacementAsset}. If not useful right now, reply pass and I will close the loop.`,
      '',
      'Rich',
      'startingmonday.app',
    ].join('\n'),
  }
}

module.exports = {
  CHANNELS,
  buildLatestTemplateDraft,
}
