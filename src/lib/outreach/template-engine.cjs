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

function subjectCompanyLabel(raw) {
  const safe = String(raw || '').replace(/\s+/g, ' ').trim()
  if (!safe) return 'your team'
  if (safe.length <= 24) return safe

  const words = safe.split(' ').filter(Boolean)
  if (words.length >= 2) {
    const firstTwo = words.slice(0, 2).join(' ')
    if (/\b(team|group|firm|partners|coaching)\b/i.test(firstTwo)) {
      return firstTwo
    }
    return `${firstTwo} team`
  }

  return 'your team'
}

function channelFallbackTrigger(channel, focus) {
  if (channel === CHANNELS.EXECUTIVES) {
    return `When a ${focus} search opens, even strong candidates can sound generic in the first recruiter and board call.`
  }
  if (channel === CHANNELS.COACHES) {
    return 'Between sessions, prep work usually ends up split across notes, email, and memory.'
  }
  if (channel === CHANNELS.SEARCH_FIRMS) {
    return 'In retained search, shortlist quality drops when the first outreach starts before the role story is crisp.'
  }
  return `Across ${focus}, candidates can get prepared in different ways, and counselors feel the inconsistency.`
}

function triggerLine(channel, focus, { newsTrigger, postTrigger, profileTrigger }) {
  const candidate = cleanTrigger(newsTrigger) || cleanTrigger(postTrigger) || cleanTrigger(profileTrigger)
  if (!candidate) return channelFallbackTrigger(channel, focus)

  if (channel === CHANNELS.COACHES) {
    return `I saw ${candidate}, and it looked like the kind of prep load coaches end up carrying between sessions.`
  }
  if (channel === CHANNELS.SEARCH_FIRMS) {
    return `I saw ${candidate}, and it looked like the kind of moment when shortlist quality can drift.`
  }
  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    return `I saw ${candidate}, and it looked like the kind of growth point where cohort consistency gets harder to hold.`
  }
  const simplifiedCandidate = candidate.replace(/\b([A-Za-z]{2,5}) succession plan announced\b/i, '$1 leadership changes')
  return `I saw ${simplifiedCandidate}, and it looked like recruiter and board conversations may be coming fast.`
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
    return `Across Jan-May 2026 coaching cases (n=27), median time to first qualified outreach was 9 days and coaching adoption was 43 percent; results vary by market conditions and execution quality.`
  }
  if (channel === CHANNELS.OUTPLACEMENT_FIRMS) {
    return `Across Jan-May 2026 outplacement cases (n=27), activated users reached first qualified outreach in a 9-day median.`
  }
  if (channel === CHANNELS.SEARCH_FIRMS) {
    return `Across Jan-May 2026 search cases (n=27), median time to first qualified outreach was 9 days; results vary by mandate mix, market timing, and execution quality.`
  }
  return `Across Jan-May 2026 transition cases (n=27), activated users reached first qualified outreach in a 9-day median; results vary by market conditions and execution quality.`
}

function binaryCtaLine(asset, audience) {
  return `If you want it, reply yes and I will send ${asset} for your ${audience}.\nReply pass and I will close the loop.`
}

function searchFirmEconomicsLine(company) {
  return `This is built to improve mandate economics at ${company} by reducing partner prep rework and improving first-conversation quality before candidate outreach scales.`
}

function outplacementEconomicsLine(company) {
  return `This is built to improve program consistency at ${company} with repeatable counselor workflows, measurable cohort standards, and lower coordinator burden.`
}

function benchmarkAssetForFocus(focus) {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'the CFO recruiter-and-board-call brief'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'the CTO business-translation brief'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'the COO scale story brief'
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return 'the CISO business-risk brief'
  if (normalized.includes('CHRO') || normalized.includes('PEOPLE')) return 'the people leadership brief'
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'the board-call brief'
  if (normalized.includes('VP')) return 'the next-scope story brief'
  return 'the role story brief'
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
  const subjectCompany = subjectCompanyLabel(company)
  const subject = step === 'followup_2'
    ? `Should I send the ${roleLabel} call brief for ${subjectCompany}`
    : step === 'followup_3'
      ? `Close the loop on ${roleLabel} call prep for ${subjectCompany}`
      : `A clearer ${roleLabel} story for ${subjectCompany}`

  if (step === 'followup_1') {
    return {
      subject,
      body: [
        `Hi ${firstName},`,
        '',
        `When a ${transitionFocus} search moves fast, the first recruiter call can decide whether the process gets easier or noisier.`,
        '',
        `Starting Monday helps senior candidates turn a long career into a short story recruiters, CEOs, and boards can follow quickly.`,
        `Also, Search momentum is critical, and Starting Monday helps keep it moving.`,
        '',
        `Reply yes and I will send ${benchmarkAsset}.`,
        'Tight messaging can make all the difference.',
        'Reply pass and I will close the loop.',
      ].join('\n'),
    }
  }

  if (step === 'followup_2') {
    return {
      subject,
      body: [
        `Hi ${firstName},`,
        '',
        `If this search is live, the first recruiter call usually decides whether your story feels specific or generic.`,
        '',
        `Starting Monday helps senior candidates make role fit clear before the first recruiter, CEO, or board conversation.`,
        `Also, Search momentum is critical, and Starting Monday helps keep it moving.`,
        '',
        `Reply yes and I will send ${benchmarkAsset}.`,
        'Tight messaging can make all the difference.',
        'Reply pass and I will close the loop.',
      ].join('\n'),
    }
  }

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `Closing the loop on my ${transitionFocus} note for ${company}.`,
      '',
      `Starting Monday helps senior candidates make recruiter and board conversations clearer before the search gets noisy.`,
      `Also, Search momentum is critical, and Starting Monday helps keep it moving.`,
      '',
      `Reply yes and I will send ${benchmarkAsset}.`,
      'Tight messaging can make all the difference.',
      'Reply pass and I will close the loop.',
    ].join('\n'),
  }
}

function buildSearchFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const transitionFocus = focusText(focus || roleLabel || 'search')
  const asset = 'the first outreach brief'
  const subjectCompany = subjectCompanyLabel(company)
  const subject = step === 'followup_2'
    ? `Should I send the first outreach brief for ${subjectCompany}`
    : step === 'followup_3'
      ? `Close the loop on shortlist quality for ${subjectCompany}`
      : `A tighter shortlist story for ${subjectCompany}`

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `When the role story is fuzzy, partner review drags and shortlist quality drops.`,
      '',
      `Starting Monday gives search teams one short brief for what the first outreach should say before volume starts.`,
      `Also, Search momentum is critical, and Starting Monday helps keep it moving.`,
      '',
      `Reply yes and I will send ${asset}.`,
      'It is meant to cut rework and keep the mandate on-brief.',
      'Reply pass and I will close the loop.',
    ].join('\n'),
  }
}

function buildCoachFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const asset = 'the coach prep worksheet'
  const subjectCompany = subjectCompanyLabel(company)
  const subject = step === 'followup_2'
      ? `Should I send the coach prep worksheet for ${subjectCompany}`
    : step === 'followup_3'
        ? `Close the loop on coach prep for ${subjectCompany}`
      : `More client time, less prep for ${subjectCompany}`

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `Prep work between sessions usually gets scattered.`,
      `Starting Monday keeps coach notes, client signals, and next steps in one place so prep takes less time.`,
      `Also, Search momentum is critical for your clients, and Starting Monday helps keep it moving between sessions.`,
      '',
      `Reply yes and I will send ${asset}. Keeping prep and next steps in one place is a big win for both coaches and clients. It is meant to cut admin work and protect client time.`,
      'Reply pass and I will close the loop.',
    ].join('\n'),
  }
}

function buildOutplacementFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const asset = 'cohort readiness checklist'
  const subjectCompany = subjectCompanyLabel(company)
  const subject = step === 'followup_2'
    ? `Should I send the cohort checklist for ${subjectCompany}`
    : step === 'followup_3'
      ? `Close the loop on cohort readiness for ${subjectCompany}`
      : `A shared readiness checklist for ${subjectCompany}`

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `Candidates can get prepared in different ways across the same program.`,
      `Starting Monday gives counselors one checklist for what interview-ready, role-fit, and compensation-ready looks like so cohorts stay aligned and coordinator cleanup drops.`,
      `Also, Search momentum is critical, and Starting Monday helps keep it moving across the cohort.`,
      '',
      `Reply yes and I will send the ${asset}. A standard process to support candidates is a big win for counselors and program directors.`,
      'Reply pass and I will close the loop.',
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
    const asset = 'the one-page CFO call brief'
    const trigger = triggerLine(CHANNELS.EXECUTIVES, transitionFocus, { newsTrigger, postTrigger, profileTrigger })
    return {
      subject: `A clearer ${safeRoleLabel} story for recruiter and board calls`,
      body: [
        `Hi ${safeFirstName},`,
        '',
        trigger,
        '',
        `Starting Monday helps senior candidates turn a long career into a short story recruiters, CEOs, and boards can follow quickly.`,
        `Also, Search momentum is critical, and Starting Monday helps keep it moving.`,
        'Across Jan-May 2026 transition cases (n=27), median time to first qualified outreach was 9 days.',
        'Results vary by market conditions and execution quality.',
        '',
        `Reply yes and I will send ${asset}. It shows what to lead with, what to cut, and what to save for later.`,
        'Tight messaging can make all the difference.',
        'Reply pass and I will close the loop.',
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === CHANNELS.SEARCH_FIRMS) {
    const asset = 'the first outreach brief'
    const trigger = triggerLine(CHANNELS.SEARCH_FIRMS, transitionFocus, { newsTrigger, postTrigger, profileTrigger })
    return {
      subject: `A tighter first outreach brief for ${safeCompany}`,
      body: [
        `Hi ${safeFirstName},`,
        '',
        trigger,
        '',
        'Starting Monday gives search teams one short brief for what the first outreach should say before volume starts.',
        'Also, Search momentum is critical, and Starting Monday helps keep it moving.',
        `Reply yes and I will send ${asset}.`,
        'It is meant to cut partner rework and keep shortlist quality tight.',
        'Reply pass and I will close the loop.',
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === CHANNELS.COACHES) {
    const asset = 'the coach prep worksheet'
    const trigger = triggerLine(CHANNELS.COACHES, transitionFocus, { newsTrigger, postTrigger, profileTrigger })
    return {
      subject: `Less prep work between sessions for ${safeCompany}`,
      body: [
        `Hi ${safeFirstName},`,
        '',
        trigger,
        '',
        'Starting Monday keeps coach notes, client signals, and next steps in one place so prep takes less time and coaching time stays protected.',
        'Also, Search momentum is critical for your clients, and Starting Monday helps keep it moving between sessions.',
        '',
        `Reply yes and I will send ${asset}. Keeping prep and next steps in one place is a big win for both coaches and clients.`,
        'Reply pass and I will close the loop.',
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
    subject: `A shared readiness checklist for ${safeCompany}`,
    body: [
      `Hi ${safeFirstName},`,
      '',
      trigger,
      '',
      'Starting Monday gives counselors one checklist for what interview-ready, role-fit, and compensation-ready looks like so cohorts stay aligned and coordinator cleanup drops.',
      'Also, Search momentum is critical, and Starting Monday helps keep it moving across the cohort.',
      '',
      `Reply yes and I will send the ${outplacementAsset}. A standard process to support candidates is a big win for counselors and program directors.`,
      'Reply pass and I will close the loop.',
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
