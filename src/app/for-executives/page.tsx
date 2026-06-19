import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import { CompactTimelineModule } from '@/components/channel/CompactTimelineModule'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

export const metadata: Metadata = {
  title: 'Starting Monday for Executives - Move into C-suite and board-caliber roles',
  description: 'Executive search infrastructure for VP-to-C-suite transitions. Get earlier signals, stronger narrative control, and board-ready preparation with a disciplined operating cadence.',
  keywords: [
    'executive transition infrastructure',
    'VP to C-suite',
    'CIO transition strategy',
    'board-ready executive positioning',
    'executive search signal intelligence',
  ],
  openGraph: {
    title: 'Starting Monday for Executives - Move into C-suite and board-caliber roles',
    description: 'For leaders who need C-suite and board-level readiness before opportunities become obvious.',
    url: 'https://startingmonday.app/for-executives',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for Executives - Move into C-suite and board-caliber roles',
    description: 'Build the timing, narrative, and execution discipline expected for C-suite and board-level opportunities.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-executives',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'vp-up',
    headline: "I'm ready for the next seat.",
    sub: 'VP to C-suite with deliberate positioning and timing.',
  },
  {
    id: 'executive',
    headline: 'I know my target mandate.',
    sub: 'I need stronger timing and cleaner execution.',
  },
  {
    id: 'restructured',
    headline: 'My role changed under me.',
    sub: 'I want to land at the right altitude, not just the next title.',
  },
  {
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to move fast without sacrificing fit or quality.',
  },
  {
    id: 'passive',
    headline: "I'm not officially searching yet.",
    sub: 'I want signal visibility before urgency forces bad decisions.',
  },
  {
    id: 'returning',
    headline: 'I am not repeating last search mistakes.',
    sub: 'This time I want structure, cadence, and decision discipline.',
  },
]

const FAQS: FAQ[] = [
  {
    question: 'What differentiates this from generic executive job-search tools?',
    answer: 'It is built for executive transition behavior, not job-board activity. You get earlier signal timing, audience-specific narrative control, and an operating cadence designed for C-suite conversations.',
  },
  {
    question: 'How does this help with board and search firm conversations?',
    answer: 'It helps you frame mandate-level narratives, rehearse likely objections, and arrive with company-specific context before the conversation starts.',
  },
  {
    question: 'Do I need a current C-suite title for this to work?',
    answer: 'No. The key is demonstrating C-suite scope and decision quality with clear evidence and timing discipline before opportunities are publicly obvious.',
  },
]

const PROOF_HIGHLIGHTS = [
  {
    metric: 'First interviews in 30 days for 81% of pilot users',
    detail: 'Pilot window measured across Jan-May 2026 cohorts.',
  },
  {
    metric: 'Earlier outreach timing relative to typical reactive candidate timelines; detailed methodology available in our pilot report (pilot-2026-q2.md).',
    detail: 'Compared with typical reactive outreach timing in similar executive searches.',
  },
  {
    metric: 'Faster signal-to-action with structured daily briefings',
    detail: 'Daily briefing users converted signal changes into outreach faster than ad hoc workflows.',
  },
]

const ROLE_LANE_SEGMENTS = [
  {
    key: 'leadership',
    label: 'Leadership lane',
    audience: 'Managers, directors, AVPs, and VPs preparing for broader leadership scope.',
    outcome: 'Strengthen mandate framing and recruiter narrative quality for leadership transitions.',
    focus: 'Board-ready story, sponsor alignment, and weekly operating cadence.',
  },
  {
    key: 'technical-leadership',
    label: 'Technical leadership lane',
    audience: 'Technical leads, principals, architects, and senior technical operators.',
    outcome: 'Translate architecture depth into executive-ready positioning that recruiters can act on.',
    focus: 'Technical tradeoff narrative, role-fit proof, and interview drill precision.',
  },
  {
    key: 'delivery-leadership',
    label: 'Delivery leadership lane',
    audience: 'Program managers, TPMs, and delivery leaders stepping into higher-scope roles.',
    outcome: 'Show execution judgment and stakeholder control in high-stakes hiring cycles.',
    focus: 'Execution rhythm, dependency-risk narrative, and high-quality follow-up flow.',
  },
] as const

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-executives/#webpage',
  url: 'https://startingmonday.app/for-executives',
  name: 'Starting Monday for Executives',
  description: 'Executive transition infrastructure for leaders moving into C-suite and board-caliber mandates.',
  isPartOf: {
    '@type': 'WebSite',
    url: 'https://startingmonday.app',
    name: 'Starting Monday',
  },
}

type ForExecutivesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ForExecutivesPage({ searchParams }: ForExecutivesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const variantParam = Array.isArray(resolvedSearchParams?.lp_variant)
    ? resolvedSearchParams.lp_variant[0]
    : resolvedSearchParams?.lp_variant
  const experimentVariant = variantParam === 'proof_first' ? 'proof_first' : 'control'

  return (
    <>
      <JsonLd data={jsonLd} />
      <h1 className="sr-only">Starting Monday for executives pursuing C-suite and board-level roles</h1>
      <LandingPage
        hero={{
          eyebrow: 'Position yourself as the executive the mandate is designed to accommodate.',
          h1Lines: ['Lead at executive altitude', 'before the shortlist hardens.'],
          body: 'Starting Monday gives you a repeatable operating system to win stronger executive conversations, protect role-fit quality, and shorten time to the right mandate.',
          steps: [
            'Define a mandate-level narrative that makes your next seat obvious to decision-makers.',
            'Prioritize the right companies and relationships before the process becomes crowded.',
            'Run disciplined weekly execution that converts conversations into concrete next steps.',
          ],
          trialNote: 'Free for 30 days. No credit card. No employer visibility.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
        proofHighlights={PROOF_HIGHLIGHTS}
        sourcePage="/for-executives"
        experimentVariant={experimentVariant}
      />
      <div className="bg-slate-950 pb-12 sm:pb-14">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-8">
          <div className="rounded-[1.5rem] border border-white/12 bg-slate-900/55 p-5 sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200 mb-2">Role-lane paths</p>
            <h2 className="text-[22px] font-bold leading-snug text-white mb-2">Pick the lane that matches your transition.</h2>
            <p className="text-[14px] leading-relaxed text-slate-200/90 mb-5">
              Each lane has tailored messaging and flow guidance for leadership, technical leadership, and delivery leadership transitions.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {ROLE_LANE_SEGMENTS.map((lane) => (
                <article key={lane.key} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-[12px] font-semibold text-white mb-1">{lane.label}</p>
                  <p className="text-[12px] leading-relaxed text-slate-100 mb-2">{lane.audience}</p>
                  <p className="text-[12px] leading-relaxed text-emerald-300 mb-2">{lane.outcome}</p>
                  <p className="text-[12px] leading-relaxed text-slate-200 mb-3">Focus: {lane.focus}</p>
                  <TrackLink
                    href={`/for-executives/${lane.key}`}
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'role_lane_page_open',
                      source_page: '/for-executives',
                      lane: lane.key,
                    }}
                    className="inline-flex items-center rounded bg-orange-400 px-3 py-2 text-[12px] font-semibold text-slate-950 hover:bg-orange-300 transition-colors"
                  >
                    Open lane page
                  </TrackLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CompactTimelineModule
          channel="executives"
          sourcePage="/for-executives"
          eyebrow="Mini timeline"
          title="See the executive transition flow in 3 phases"
          summary="A quick sequence of how executive features support mandate timing, narrative quality, and shortlist momentum."
          steps={[
            { phase: 'Discover', focus: 'Spot role-shaping signals before mandate visibility peaks', visual: 'Signal timing line' },
            { phase: 'Activate', focus: 'Convert target context into audience-specific positioning', visual: 'Narrative cue cards' },
            { phase: 'Operate', focus: 'Run weekly outreach and prep cadence with accountability', visual: 'Cadence board and progress strip' },
          ]}
        />
        <div className="mx-auto mt-6 max-w-5xl px-4 sm:px-6">
          <Link
            href="/features/executives"
            className="inline-flex items-center rounded border border-slate-700 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
          >
            Read the full executive feature guide
          </Link>
        </div>
      </div>
    </>
  )
}
