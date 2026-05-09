import Anthropic from '@anthropic-ai/sdk'
import { HAIKU } from '../lib/models.js'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const ROLE_FRAMES = {
  cio: {
    title: 'CIO (Chief Information Officer)',
    signalFocus: 'When interpreting signals: prioritize leadership changes in technology functions, digital transformation announcements, IT budget or spending signals, vendor technology decisions, and organizational changes that create CIO mandates. A CFO departure or board governance change can also indicate a CIO search is coming.',
  },
  cto: {
    title: 'CTO (Chief Technology Officer)',
    signalFocus: 'When interpreting signals: prioritize engineering leadership changes, product launches and pivots, funding rounds that fund engineering buildout, technical architecture announcements, and platform decisions. A founder CTO departure or rapid hiring in engineering often precedes a professional CTO search.',
  },
  cdo_data: {
    title: 'CDO (Chief Data Officer)',
    signalFocus: 'When interpreting signals: treat data_platform signals (Snowflake, Databricks, data lakehouse investments) and ai_investment signals (AI initiative launches, Chief AI Officer hires) as the highest-priority events — they directly indicate a data leadership mandate is forming or expanding. Also flag data governance regulatory changes, Chief AI Officer appointments that may signal CDO consolidation, and organizational changes in data or analytics functions.',
  },
  cdo_digital: {
    title: 'Chief Digital Officer',
    signalFocus: 'When interpreting signals: prioritize digital transformation announcements, customer experience and e-commerce investments, omnichannel initiatives, and organizational changes that create or dissolve CDO mandates. Industry sector timing matters: a retailer or bank announcing a digital push is a leading indicator of a CDO search.',
  },
  ciso: {
    title: 'CISO (Chief Information Security Officer)',
    signalFocus: 'When interpreting signals: treat breach_disclosure and regulatory_change signals as the highest priority — these create immediate CISO urgency regardless of whether the event is at a target company or a sector peer. Also prioritize CISO departures, compliance deadlines (SEC cybersecurity rules, HIPAA updates, PCI-DSS changes), and any board-level governance change that elevates security accountability. A breach at a competitor matters as much as one at a target company.',
  },
  cpo: {
    title: 'CPO (Chief Product Officer)',
    signalFocus: 'When interpreting signals: prioritize product launches and pivots at target companies, competitor feature announcements that indicate a product direction change, app store or review rating movements, product leadership changes or CPO departures, and funding rounds that explicitly call out product investment. A consumer company announcing a platform rebuild or a B2B company launching a new product line often indicates a CPO search.',
  },
  coo: {
    title: 'COO (Chief Operating Officer)',
    signalFocus: 'When interpreting signals: prioritize M&A announcements (integration challenges create COO mandates), revenue pressure or EBITDA signals that indicate a need for operational discipline, operational announcements such as facility openings or closures and supply chain changes, executive hiring in operations functions, and CEO changes that create COO openings. COO roles are rarely posted publicly — the signal that matters is the operational problem that creates the mandate.',
  },
  vp_technology: {
    title: 'VP of Technology',
    signalFocus: 'When interpreting signals: prioritize CIO and CTO role openings at target companies, engineering leadership changes, and technology transformation announcements that indicate the organization is building out its technology function. Also flag step-up opportunities where a C-suite opening aligns with this candidate\'s background.',
  },
}

function getRoleFrame(roleType) {
  return ROLE_FRAMES[roleType] ?? {
    title: 'senior technology executive',
    signalFocus: 'When interpreting signals: prioritize leadership changes, capital events, technology investments, and organizational shifts that create executive-level opportunities.',
  }
}

// Calls Claude to produce structured briefing content from assembled context.
// Returns { subject, intro, matchInsights, followUpSuggestions, closing }
export async function generateBriefing(context) {
  const { userName, targetTitles, roleType, totalCompanies, newMatches, followUps, signals = [], todayStr } = context
  const frame = getRoleFrame(roleType)

  const matchesText = newMatches.length
    ? newMatches.map(m =>
        `Company: ${m.companyName}
Matching roles: ${m.matchingRoles.map(r => `${r.title} (score ${r.score}/100${r.isNew ? ', NEW' : ''})`).join('; ')}
Summary: ${m.aiSummary}`
      ).join('\n\n')
    : 'No new matches.'

  const followUpsText = followUps.length
    ? followUps.map(f => {
        const who = f.contact ? `${f.contact.name}${f.contact.title ? ` (${f.contact.title})` : ''}` : null
        return `Due: ${f.dueDate}${who ? `\nContact: ${who}` : ''}\nAction: ${f.action ?? 'Follow up'}`
      }).join('\n\n')
    : 'No overdue follow-ups.'

  const signalsText = signals.length
    ? signals.map(s => `Company: ${s.companyName}\nType: ${s.signalType}\nWhat happened: ${s.summary}${s.outreachAngle ? `\nOpening: ${s.outreachAngle}` : ''}`).join('\n\n')
    : 'No new signals.'

  const prompt = `You are writing a morning intelligence briefing for ${userName}, a ${frame.title} in active job search.
Target titles: ${targetTitles.join(', ') || frame.title}
Companies tracked: ${totalCompanies}

${frame.signalFocus}

TODAY'S DATA (${todayStr}):

COMPANY SIGNALS (news events that create hiring openings):
${signalsText}

NEW JOB MATCHES (last 24 hours):
${matchesText}

OVERDUE FOLLOW-UPS:
${followUpsText}

Write a morning briefing as JSON with exactly these keys:
- "subject": email subject line (max 75 chars). Specific and factual — name the company or action. No generic phrases. If there are signals, lead with that.
- "intro": 1-2 sentences. State what's on the board today and why it matters. No preamble.
- "signalAlerts": array of { company, signalType, summary, angle (one sentence on why this matters for this specific candidate's search) } — only if there are signals.
- "matchInsights": array of { company, roles (string[]), insight (1-2 sentences, specific to this role and this person's background) } — only for companies with matches.
- "followUpSuggestions": array of { person, action, suggestion (one concrete sentence — what to do and how) } — only if there are follow-ups.
- "closing": 1 sentence. Calm, confident observation about pipeline state. No motivational cliches.

Tone: direct, precise, senior-to-senior. Short sentences. No em dashes. No filler phrases ("great opportunity," "don't miss this," "time is of the essence"). Write as a trusted advisor, not a coach.
Output valid JSON only, no markdown fences.`

  const client = getClient()
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_BRIEFING_MODEL ?? HAIKU,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0]?.text?.trim() ?? '{}'
  const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Fallback: construct from raw context data without AI narration
    return {
      subject: signals.length
        ? `Signal: ${signals[0].companyName}, ${signals[0].signalType} (${todayStr})`
        : `${newMatches.length} new match${newMatches.length !== 1 ? 'es' : ''} (${todayStr})`,
      intro: `Good morning, ${userName}. Here is your search update for ${todayStr}.`,
      signalAlerts: signals.map(s => ({
        company: s.companyName,
        signalType: s.signalType,
        summary: s.summary,
        angle: s.outreachAngle ?? '',
      })),
      matchInsights: newMatches.map(m => ({
        company: m.companyName,
        roles: m.matchingRoles.map(r => r.title),
        insight: m.aiSummary,
      })),
      followUpSuggestions: followUps.map(f => ({
        person: f.contact?.name ?? 'Pending contact',
        action: f.action ?? 'Follow up',
        suggestion: 'Reach out today to keep this relationship warm.',
      })),
      closing: `You have ${totalCompanies} companies being tracked. Every day of consistent outreach compounds.`,
    }
  }
}
