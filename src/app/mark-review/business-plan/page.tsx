import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday | Mark Horstman Business Plan Brief',
  description:
    'Business planning brief for Mark: channel TAM, monetization, 5-year revenue model, execution risk, and competitive pressure.',
  alternates: { canonical: 'https://startingmonday.app/mark-review/business-plan' },
  openGraph: {
    title: 'Starting Monday | Mark Horstman Business Plan Brief',
    description:
      'Business planning brief for Mark: channel TAM, monetization, 5-year revenue model, execution risk, and competitive pressure.',
    url: 'https://startingmonday.app/mark-review/business-plan',
  },
}

type ChannelPlan = {
  channel: string
  targetBuyer: string
  tamEstimate: string
  whyNow: string
  monetization: string
  year5Share: string
}

const CHANNEL_PLAN: ChannelPlan[] = [
  {
    channel: 'Individual executives (direct)',
    targetBuyer: 'Senior operators running an active or near-active transition campaign.',
    tamEstimate: 'US serviceable TAM: ~$120M-$260M annualized subscription potential.',
    whyNow: 'High pain, low tooling fit in current search stack, and clear urgency moments.',
    monetization: 'Monthly and quarterly subscriptions with premium execution modes.',
    year5Share: 'Foundation channel for proof, testimonials, and referral loops.',
  },
  {
    channel: 'Executive coaches',
    targetBuyer: 'Independent and boutique coaches with senior transition clients.',
    tamEstimate: 'US serviceable TAM: ~$80M-$180M annualized equivalent across seat-based usage.',
    whyNow: 'Coaches need leverage between sessions and better execution visibility.',
    monetization: 'Per-coach subscription plus seat expansion and premium workflow controls.',
    year5Share: 'Primary wedge for repeatable B2B acquisition and retention stability.',
  },
  {
    channel: 'Search firms',
    targetBuyer: 'Retained and boutique firms focused on executive placements.',
    tamEstimate: 'US serviceable TAM: ~$70M-$160M depending on team penetration and seat depth.',
    whyNow: 'Candidate readiness quality is a measurable bottleneck in high-stakes searches.',
    monetization: 'Team subscription with readiness and intelligence add-ons.',
    year5Share: 'Second expansion engine after coach wedge proves repeatability.',
  },
  {
    channel: 'Outplacement and transition providers',
    targetBuyer: 'Program owners delivering executive transition support at cohort scale.',
    tamEstimate: 'US serviceable TAM: ~$100M-$250M from institutional contracts and cohort licenses.',
    whyNow: 'Need for premium outcomes without linear labor expansion.',
    monetization: 'Program and cohort contracts with annual renewals and implementation services.',
    year5Share: 'Largest enterprise-scale ARR opportunity if trust and onboarding friction are solved.',
  },
]

const YEARLY_REVENUE = [
  { year: 'Year 1', direct: '$0.45M', coaches: '$0.20M', search: '$0.05M', outplacement: '$0.00M', total: '$0.70M' },
  { year: 'Year 2', direct: '$1.00M', coaches: '$0.70M', search: '$0.30M', outplacement: '$0.20M', total: '$2.20M' },
  { year: 'Year 3', direct: '$1.80M', coaches: '$1.60M', search: '$0.90M', outplacement: '$0.70M', total: '$5.00M' },
  { year: 'Year 4', direct: '$2.70M', coaches: '$3.00M', search: '$2.00M', outplacement: '$1.50M', total: '$9.20M' },
  { year: 'Year 5', direct: '$3.80M', coaches: '$4.60M', search: '$3.60M', outplacement: '$3.10M', total: '$15.10M' },
]

const KEY_OBSTACLES = [
  {
    heading: 'Channel adoption friction',
    detail:
      'Each channel already uses a patched workflow of CRM, notes, spreadsheets, and manual AI prompts. Starting Monday must prove a lower-friction path to better outcomes, not just another tool.',
  },
  {
    heading: 'AI baseline compression',
    detail:
      'General AI tools continuously improve and set a "good enough" baseline. Differentiation must come from integrated workflow, context persistence, and measurable behavior change.',
  },
  {
    heading: 'DIY competition by channel',
    detail:
      'Direct users can DIY with LLM plus spreadsheets, coaches can DIY templates and docs, firms can DIY with ATS/CRM extensions, and outplacement providers can DIY internal playbooks.',
  },
  {
    heading: 'Switching costs in existing ecosystems',
    detail:
      'Teams are anchored to established systems and process habits. Adoption requires low migration burden, role-specific onboarding, and clear interoperability.',
  },
  {
    heading: 'Growth constraints: authority, reach, and frequency',
    detail:
      'Domain authority is still emerging, organic reach is slow, and paid channels need high repetition to build trust in a high-consideration buying decision.',
  },
]

const CHANNEL_COMPETITION = [
  {
    channel: 'Individual executives',
    aiCompetitor: 'Direct LLM prompting and personal prompt libraries.',
    diyCompetitor: 'Spreadsheets, personal CRMs, and manual prep docs.',
    incumbentSwitchingCost: 'Moderate: low tool lock-in, high habit lock-in.',
  },
  {
    channel: 'Executive coaches',
    aiCompetitor: 'Generic coaching assistants and content generators.',
    diyCompetitor: 'Coach-built templates, Notion stacks, and manual workflows.',
    incumbentSwitchingCost: 'Medium-high: process and client-delivery routines are entrenched.',
  },
  {
    channel: 'Search firms',
    aiCompetitor: 'Internal AI copilots attached to ATS/CRM stack.',
    diyCompetitor: 'Analyst/manual brief workflows and research teams.',
    incumbentSwitchingCost: 'High: workflow and trust models tied to existing platforms.',
  },
  {
    channel: 'Outplacement providers',
    aiCompetitor: 'Program-level AI content layers and partner tools.',
    diyCompetitor: 'Internal transition curriculum and advisor-driven process.',
    incumbentSwitchingCost: 'High: procurement, legal, and training overhead for rollout.',
  },
]

const MISSING_FOR_DECISION = [
  'Channel-level activation and retention baselines with shared definitions.',
  'Conversion funnel by channel: lead -> pilot -> paid -> retained.',
  'Proof that operating outcomes improve vs AI-only and DIY controls.',
  'Implementation burden measurement: onboarding time, training time, and support load by channel.',
  'Quarterly de-risk plan with explicit stop/go gates for each channel.',
]

export default function MarkBusinessPlanPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/mark-review" className="text-[10px] font-bold tracking-[0.18em] uppercase" aria-label="Back to Mark review brief">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mark-review" className="text-[13px] text-slate-300 hover:text-white transition-colors">
              Mark brief
            </Link>
            <Link href="/" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Main site
            </Link>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Business Plan View</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            Starting Monday: channel TAM, monetization, and growth risk
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-4xl">
            This page is the planning reference for your review: channel TAM assumptions, monetization model, 5-year revenue estimate, major obstacles, competitive pressure, and key missing evidence.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-18">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Channel operating plan summary</p>
            <div className="space-y-4">
              {CHANNEL_PLAN.map((item) => (
                <article key={item.channel} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[14px] font-semibold text-slate-900">{item.channel}</p>
                  <p className="text-[13px] text-slate-700 mt-1">Buyer: {item.targetBuyer}</p>
                  <p className="text-[13px] text-slate-700 mt-1">TAM: {item.tamEstimate}</p>
                  <p className="text-[13px] text-slate-700 mt-1">Why now: {item.whyNow}</p>
                  <p className="text-[13px] text-slate-700 mt-1">Monetization: {item.monetization}</p>
                  <p className="text-[12px] text-slate-600 mt-2">Year 5 role: {item.year5Share}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Estimated revenue (years 1-5, base case)</p>
            <p className="text-[13px] text-slate-700 mb-4">
              Directional model only. Treat this as a planning baseline and replace assumptions with measured conversion, retention, and margin data each quarter.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Year</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Direct</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Coaches</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Search firms</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Outplacement</th>
                    <th className="py-2 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {YEARLY_REVENUE.map((row) => (
                    <tr key={row.year} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-3 text-[13px] font-semibold text-slate-900">{row.year}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.direct}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.coaches}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.search}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.outplacement}</td>
                      <td className="py-3 text-[13px] font-semibold text-slate-900">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Key operating obstacles</p>
            <div className="space-y-4">
              {KEY_OBSTACLES.map((item) => (
                <div key={item.heading} className="border-l-4 border-slate-300 pl-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.heading}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Competition and switching costs by channel</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Channel</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">AI competitor baseline</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">DIY competitor baseline</th>
                    <th className="py-2 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Switching cost profile</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANNEL_COMPETITION.map((row) => (
                    <tr key={row.channel} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-3 text-[13px] font-semibold text-slate-900">{row.channel}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.aiCompetitor}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.diyCompetitor}</td>
                      <td className="py-3 text-[13px] text-slate-700">{row.incumbentSwitchingCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-blue-300 rounded-lg p-6 bg-blue-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-700 mb-4">What would increase confidence</p>
            <ul className="space-y-2.5">
              {MISSING_FOR_DECISION.map((item) => (
                <li key={item} className="text-[14px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-blue-700 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-orange-300 rounded-lg p-6 bg-orange-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600 mb-4">What I'm asking from you</p>
            <p className="text-[14px] text-slate-800 leading-relaxed mb-4">
              I am not asking for an endorsement. I am asking for candid feedback on where this plan is strongest and where it is least credible.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              <li>What is the single biggest gap in this plan?</li>
              <li>Which proof requirement matters most before scaling?</li>
              <li>If it is good enough, would you suggest one or two executives who could review the product and provide direct feedback?</li>
            </ol>
          </section>
        </div>
      </main>
    </div>
  )
}
