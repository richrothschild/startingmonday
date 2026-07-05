import Anthropic from '@anthropic-ai/sdk'
import { HAIKU } from '../lib/models.js'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

// Named patterns per role type. Claude must match one of these or return detected=false.
export const PATTERN_LIBRARY = {
  cio: [
    {
      name: 'Leadership Transition Window',
      match: 'CIO or senior technology exec departure, especially with any secondary signal. The most direct opening for an external CIO — reach out before the search is formalized.',
    },
    {
      name: 'M&A Integration Mandate',
      match: 'Acquisition combined with exec change or expansion. Creates immediate need for a CIO who can integrate systems, data, and teams across combined entities.',
    },
    {
      name: 'Digital Transformation Mandate',
      match: 'New CEO or COO hire combined with technology investment, expansion, or product announcement. Signals a mandate for a transformational CIO to execute a new strategic vision.',
    },
    {
      name: 'Cloud and AI Buildout',
      match: 'Funding combined with technology product announcements or expansion. Company entering a platform modernization phase where an incoming CIO sets the architecture direction.',
    },
    {
      name: 'Scale-Up Phase',
      match: 'Multiple growth signals — funding, expansion, exec hires — indicating the company is outgrowing its current IT infrastructure and needs a seasoned CIO to lead the next phase.',
    },
  ],

  cto: [
    {
      name: 'Technical Leadership Opening',
      match: 'CTO or VP Engineering departure, alone or with any secondary signal. Most direct indicator of an active or imminent engineering leadership search.',
    },
    {
      name: 'Engineering Buildout',
      match: 'Series B or C funding combined with exec hires. Company professionalizing its engineering organization — needs its first real CTO or a significant upgrade.',
    },
    {
      name: 'AI Product Acceleration',
      match: 'AI or product announcements combined with funding and exec change. Company needs a CTO to build an AI-native stack or lead a technical transformation from the top.',
    },
    {
      name: 'Post-Acquisition Technical Integration',
      match: 'Acquisition combined with tech or exec signals. Acquiring company needs a CTO to manage technical debt, platform integration, and combined engineering org.',
    },
    {
      name: 'Platform Scaling Phase',
      match: 'Multiple growth signals across funding, expansion, and product. Company needs a CTO who has scaled engineering organizations through this exact inflection point.',
    },
  ],

  ciso: [
    {
      name: 'Post-Incident CISO Search',
      match: 'Security incident or breach combined with CISO departure or exec change. Most urgent signal category — company needs crisis-experienced security leadership immediately.',
    },
    {
      name: 'Pre-IPO Compliance Buildup',
      match: 'Late-stage funding combined with governance, compliance, or exec signals. Company preparing for public company security standards — SOX, SEC disclosure rules, board-level reporting.',
    },
    {
      name: 'Regulatory Response Mandate',
      match: 'Regulatory filing, compliance announcement, or legal event combined with exec change. Needs a CISO with regulatory depth who can manage audits and board-level accountability.',
    },
    {
      name: 'M&A Security Gap',
      match: 'Acquisition combined with leadership change. Expanded attack surface and compliance scope create an urgent, well-funded CISO mandate.',
    },
    {
      name: 'Board Security Escalation',
      match: 'C-suite exec change combined with any security-adjacent or governance signal. Board is elevating security as a strategic priority and needs a CISO who can operate at that level.',
    },
  ],

  coo: [
    {
      name: 'CEO Transition',
      match: 'New CEO hire combined with any secondary signal. Incoming CEOs either bring their own COO or quickly discover they need an operational counterpart — highest-conversion pattern for COO candidates.',
    },
    {
      name: 'Scale-Up Operations',
      match: 'Funding combined with expansion and exec departure or hire. Company building operational infrastructure for the next growth phase and needs a COO to design and run it.',
    },
    {
      name: 'Turnaround Leadership',
      match: 'Layoffs combined with exec departure or acquisition. Company needs a COO with restructuring experience, cost discipline, and the credibility to lead through a reset.',
    },
    {
      name: 'Pre-IPO Operations',
      match: 'Late-stage funding combined with exec buildout. Company needs a COO with public company operational experience before the S-1 — process, compliance, and investor-grade reporting.',
    },
    {
      name: 'M&A Integration',
      match: 'Acquisition combined with exec hiring or departure. Company needs a COO to integrate operations, culture, and process across entities at speed.',
    },
  ],

  cpo: [
    {
      name: 'Product Leadership Opening',
      match: 'CPO or VP Product departure, alone or with any secondary signal. Most direct indicator of an active or imminent product leadership search.',
    },
    {
      name: 'Product Pivot',
      match: 'New product announcement combined with funding and exec change. Company changing direction needs a new product leader who owns the new vision from day one.',
    },
    {
      name: 'AI Product Transformation',
      match: 'AI product announcement combined with exec hire and funding. Company needs a CPO who can define, build, and govern AI-native product experiences.',
    },
    {
      name: 'Platform Expansion',
      match: 'Acquisition combined with new product and exec hire. Portfolio expansion requires a CPO who can manage a broader, more complex product surface.',
    },
    {
      name: 'Consumer Scale-Up',
      match: 'Funding combined with expansion and product announcement. Scaling consumer product needs a CPO with high-scale consumer product experience and growth instincts.',
    },
  ],

  cdo_data: [
    {
      name: 'Data Platform Mandate',
      match: 'New CTO or CIO hire combined with data announcements or funding. Someone new is building a data organization and needs a CDO to define it — high-influence, early entry point.',
    },
    {
      name: 'AI Transformation Signal',
      match: 'AI product announcement combined with exec hire. Company needs a CDO to govern data quality, lineage, and infrastructure as the foundation for AI.',
    },
    {
      name: 'Post-Breach Data Governance',
      match: 'Security incident or compliance signal combined with exec departure. Company needs a CDO with data governance and regulatory depth to rebuild trust.',
    },
    {
      name: 'Analytics Maturity Push',
      match: 'Funding combined with expansion and data-adjacent exec hire. Company investing in data-driven decision making and needs a CDO to build the capability from the ground up.',
    },
  ],

  cdo_digital: [
    {
      name: 'Digital Revenue Transformation',
      match: 'New CEO combined with expansion or digital product announcement. Company pivoting to digital channels as a primary revenue driver needs a CDO to own the transformation.',
    },
    {
      name: 'E-commerce Scale-Up',
      match: 'Funding combined with new product and expansion. Consumer digital buildout at scale — needs a CDO who has managed digital P&L and customer acquisition.',
    },
    {
      name: 'Customer Experience Mandate',
      match: 'Exec hire combined with product announcement and expansion. Company needs a CDO to own the end-to-end customer digital journey across channels.',
    },
    {
      name: 'Omnichannel Integration',
      match: 'Acquisition combined with product announcement and exec hire. Company needs a CDO to unify digital and physical customer experience across a larger, more complex entity.',
    },
  ],

  vp_technology: [
    {
      name: 'CTO Building Out Leadership',
      match: 'New CTO hire combined with funding or product announcement. Incoming CTOs build their VP-level leadership team in the first 90 days — high-probability window.',
    },
    {
      name: 'Engineering Scale-Up',
      match: 'Funding combined with exec hires and expansion. Company needs an experienced VP Engineering to scale the organization through the next headcount doubling.',
    },
    {
      name: 'Technology Leadership Gap',
      match: 'CTO or VP Tech departure with any secondary signal. Company needs VP-level engineering leadership to hold the org during the search — often converts to a permanent role.',
    },
    {
      name: 'Platform Migration Phase',
      match: 'Acquisition combined with exec change and product announcement. Company needs a VP Engineering to lead technical migration, integration, and team consolidation.',
    },
  ],
}

export const GENERIC_PATTERNS = [
  { name: 'Leadership Transition', match: 'Executive departures combined with new hires. Direct opening for external candidates before the search is formalized.' },
  { name: 'Growth Phase', match: 'Funding combined with exec hires and expansion. Company needs experienced leaders to scale through an inflection point.' },
  { name: 'M&A Integration', match: 'Acquisition combined with leadership change. Integration mandate creates executive openings with clear scope.' },
  { name: 'Restructuring', match: 'Layoffs combined with exec departure or acquisition. Operational reset creates leadership openings for candidates with turnaround experience.' },
  { name: 'Pre-IPO Buildup', match: 'Late-stage funding combined with exec hires and expansion. Company needs experienced public-company operators before the S-1.' },
]

// Detect if recent signals match a named pattern for this candidate's role type.
// Returns { detected, pattern_name, pattern_summary, outreach_angle } or { detected: false }.
export async function correlateSignals(companyName, signals, roleType = null) {
  if (signals.length < 2) return { detected: false }

  const patterns = PATTERN_LIBRARY[roleType] ?? GENERIC_PATTERNS
  const patternList = patterns.map(p => `- ${p.name}: ${p.match}`).join('\n')

  const signalList = signals
    .slice(0, 10)
    .map(s => `- ${s.signal_type} (${s.signal_date}): ${s.signal_summary}`)
    .join('\n')

  const roleContext = roleType
    ? `The candidate is a ${roleType.toUpperCase().replace(/_/g, '/')} executive job seeker.`
    : 'The candidate is a C-suite or VP-level executive job seeker.'

  const prompt = `You are analyzing a cluster of recent signals about "${companyName}" to determine if they match a named pattern meaningful for an executive job seeker.

${roleContext}

Signals (past 60 days):
${signalList}

Named patterns to match against (use one of these exact names or set detected=false):
${patternList}

Only set detected=true when at least two signals together clearly fit one of the named patterns. Set detected=false if signals are weak, unrelated, or do not cleanly map to a named pattern.

Output JSON only, no markdown fences:
{
  "detected": true or false,
  "pattern_name": "exact name from the list above, or null if detected=false",
  "pattern_summary": "Two sentences: what specifically is happening at this company and why it matters right now for this candidate.",
  "outreach_angle": "One sentence: what makes this the right moment to reach out, specific to the pattern and company."
}`

  try {
    const msg = await getClient().messages.create({
      model: HAIKU,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0]?.text?.trim() ?? '{}'
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    const { logger } = await import('../lib/logger.js')
    logger.warn('correlate-signals: failed', { company: companyName, error: err.message })
    return { detected: false }
  }
}
