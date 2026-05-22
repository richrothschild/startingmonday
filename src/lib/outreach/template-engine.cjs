const CHANNELS = {
  EXECUTIVES: 'executives',
  SEARCH_FIRMS: 'search_firms',
  COACHES: 'coaches',
  OUTPLACEMENT_FIRMS: 'outplacement_firms',
}

function focusText(raw) {
  const value = String(raw || '').trim()
  return value || 'senior transition'
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

function binaryCtaLine(asset, audience) {
  return `If helpful, I can send ${asset} for your ${audience}. If not useful right now, no worries and I will leave it here.`
}

function buildExecutiveFollowupDraft({ firstName, company, focus, roleLabel, step }) {
  const transitionFocus = focusText(focus || roleLabel || 'Executive')
  const benchmarkAsset = benchmarkAssetForFocus(transitionFocus)
  const subject = step === 'followup_2'
    ? `Quick question on senior ${roleLabel} transition conversations at ${company}`
    : step === 'followup_3'
      ? `Quick question on ${roleLabel} transition conversations at ${company}`
      : `Quick question on ${roleLabel} transition conversations at ${company}`

  if (step === 'followup_1') {
    return {
      subject,
      body: [
        `Hi ${firstName},`,
        '',
        `I have been following your work at ${company}, and I wanted to follow up on my earlier note about ${transitionFocus} transitions.`,
        '',
        stakesLineForFocus(transitionFocus, company),
        '',
        microProofLine(CHANNELS.EXECUTIVES, transitionFocus),
        '',
        `For ${transitionFocus} candidates, that is where ${proofLineForFocus(transitionFocus)} usually shows up in the first serious conversation.`,
        '',
        costOfInactionLine(CHANNELS.EXECUTIVES),
        '',
        `If useful, I can send a one-page sample built around your ${transitionFocus} context.`,
        '',
        binaryCtaLine(benchmarkAsset, `${transitionFocus} transition context`),
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (step === 'followup_2') {
    return {
      subject,
      body: [
        `Hi ${firstName},`,
        '',
        `I have been following your work at ${company}, and I had one more thought on ${transitionFocus} transitions.`,
        '',
        `I can also send ${benchmarkAsset} so you can see how the first week, first pitch, and first follow-up should look for this role.`,
        '',
        `For ${transitionFocus} leaders, that is where ${proofLineForFocus(transitionFocus)} becomes visible in a way that is hard to fake and easy to evaluate.`,
        '',
        costOfInactionLine(CHANNELS.EXECUTIVES),
        '',
        binaryCtaLine(benchmarkAsset, `${transitionFocus} transition context`),
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  return {
    subject,
    body: [
      `Hi ${firstName},`,
      '',
      `I have been following your work at ${company}, and I am closing the loop on my note about ${transitionFocus} transitions.`,
      '',
      `If timing is not right, no problem. If it is, I can send one concise example plus ${benchmarkAsset} so you can judge it quickly.`,
      '',
      costOfInactionLine(CHANNELS.EXECUTIVES),
      '',
      'That is usually the cleanest way to show role depth in the first conversation without overexplaining it.',
      '',
      binaryCtaLine(benchmarkAsset, `${transitionFocus} transition context`),
      '',
      'Rich',
      'startingmonday.app',
    ].join('\n'),
  }
}

function buildLatestTemplateDraft({ channel, firstName, company, roleLabel, focus, step }) {
  const safeFirstName = String(firstName || 'there').trim() || 'there'
  const safeCompany = String(company || 'your team').trim() || 'your team'
  const safeRoleLabel = String(roleLabel || 'Executive').trim() || 'Executive'
  const transitionFocus = focusText(focus || roleLabel || 'senior transition')

  if (channel === CHANNELS.EXECUTIVES && step && step.startsWith('followup_')) {
    return buildExecutiveFollowupDraft({
      firstName: safeFirstName,
      company: safeCompany,
      focus: transitionFocus,
      roleLabel: safeRoleLabel,
      step,
    })
  }

  if (channel === CHANNELS.EXECUTIVES) {
    const asset = benchmarkAssetForFocus(transitionFocus)
    const proof = proofLineForFocus(transitionFocus)
    return {
      subject: `Quick question on ${safeRoleLabel} transition conversations at ${safeCompany}`,
      body: [
        `${safeFirstName},`,
        '',
        `I have been following your work at ${safeCompany}, and I thought this might be useful for ${safeRoleLabel} transitions.`,
        '',
        'I built Starting Monday as a practical execution system for senior leaders: target-company intelligence, role-specific prep briefs, and outreach workflows that improve signal quality in first-touch conversations.',
        '',
        stakesLineForFocus(transitionFocus, safeCompany),
        '',
        microProofLine(CHANNELS.EXECUTIVES, transitionFocus),
        '',
        `The clearest proof point for ${safeRoleLabel} leaders is ${proof}.`,
        '',
        costOfInactionLine(CHANNELS.EXECUTIVES),
        '',
        `For ${safeRoleLabel} candidates, the biggest win is ${proof}.`,
        '',
        `If useful, I can send a one-page sample built around your ${safeRoleLabel} context.`,
        '',
        binaryCtaLine(asset, `${safeRoleLabel} transition context`),
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === CHANNELS.SEARCH_FIRMS) {
    return {
      subject: `Quick question on ${safeCompany} mandate readiness`,
      body: [
        `${safeFirstName},`,
        '',
        `I have been following your work at ${safeCompany}, and I thought this might be useful for ${transitionFocus.toUpperCase()} transitions.`,
        '',
        'I built Starting Monday as a practical execution system: target-company intelligence, role-specific prep briefs, and outreach workflows that improve signal quality in first-touch conversations.',
        '',
        'If useful, I can send a one-page example tailored to your mandate mix so you can decide quickly if it is relevant.',
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === CHANNELS.COACHES) {
    const proof = coachProofPointForFocus(transitionFocus)
    const asset = coachAssetForFocus(transitionFocus)
    return {
      subject: `Quick question on executive transition readiness for ${safeCompany}`,
      body: [
        `Hi ${safeFirstName},`,
        '',
        `I have been following your work at ${safeCompany}, and I thought this might be useful for the executives you support.`,
        '',
        'I built Starting Monday to give executive coaches a practical execution layer: company targeting, interview narrative discipline, and outreach workflows that hold up under pressure.',
        '',
        coachStakesLineForFocus(transitionFocus, safeCompany),
        '',
        microProofLine(CHANNELS.COACHES, transitionFocus),
        '',
        `The concrete proof point is ${proof}.`,
        '',
        costOfInactionLine(CHANNELS.COACHES),
        '',
        `If useful, I can send ${asset} so you can see exactly how it changes first-touch conversation quality.`,
        '',
        binaryCtaLine(asset, 'coach practice'),
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  const outplacementAsset = outplacementAssetForFocus(transitionFocus)
  const outplacementFocusLabel = /programs?$/i.test(transitionFocus) ? transitionFocus : `${transitionFocus} programs`
  return {
    subject: `Quick question on transition cohort readiness for ${safeCompany}`,
    body: [
      `Hi ${safeFirstName},`,
      '',
      `I have been following your work at ${safeCompany}, and I thought this might be useful for your transition cohorts.`,
      '',
      'Starting Monday helps outplacement teams enforce one measurable execution standard across targeting, narrative quality, and first-conversation readiness.',
      '',
      outplacementStakesLine(transitionFocus, safeCompany),
      '',
      microProofLine(CHANNELS.OUTPLACEMENT_FIRMS, transitionFocus),
      '',
      `The concrete proof point is ${outplacementProofPoint(transitionFocus)}.`,
      '',
      costOfInactionLine(CHANNELS.OUTPLACEMENT_FIRMS),
      '',
      `For ${outplacementFocusLabel}, the operating asset is ${outplacementAsset}.`,
      '',
      binaryCtaLine(outplacementAsset, 'transition cohort'),
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
