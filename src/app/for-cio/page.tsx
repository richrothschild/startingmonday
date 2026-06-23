import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import Link from 'next/link'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

import { ProofStrip } from '@/components/ProofStrip'

export const metadata: Metadata = {
  title: 'Starting Monday for C-suite technology searches - Executive Search Campaign Infrastructure',
  description: 'Campaign infrastructure for C-suite technology searches. Intelligence before roles are posted, relationship precision, and preparation that wins the conversation. Free 30-day trial.',
  keywords: [
    'CIO job search',
    'CTO job search',
    'CIO career',
    'technology executive search',
    'how to find CIO job',
    'CIO interview preparation',
    'executive search firm preparation',
    'C-suite job search',
    'CIO search strategy',
    'how to prepare for CIO interview',
  ],
  openGraph: {
    title: 'Starting Monday for C-suite technology searches - Executive Search Campaign Infrastructure',
    description: 'Many C-suite mandates are relationship-led before posting. Campaign infrastructure for technology executives in active search.',
    url: 'https://startingmonday.app/for-cio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for C-suite technology searches - Executive Search Campaign Infrastructure',
    description: 'Many C-suite mandates are relationship-led before posting. Campaign infrastructure for technology executives in active search.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-cio',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to land at the right level, with the right organization.',
  },
  {
    id: 'executive',
    headline: 'I know exactly what I want.',
    sub: 'Targeted search. I need to move faster than the search firms.',
  },
  {
    id: 'restructured',
    headline: 'My role was restructured.',
    sub: 'I know my worth. I want to land at the right level, not just the next one.',
  },
  {
    id: 'passive',
    headline: "I'm not looking - but Sunday nights feel different.",
    sub: 'Not ready to commit. But not at peace either.',
  },
  {
    id: 'board',
    headline: 'I want the next role to lead to a board seat.',
    sub: 'Running a C-suite search and a board positioning campaign at the same time.',
  },
  {
    id: 'returning',
    headline: "I've been saying 'starting Monday' for months.",
    sub: 'This is the one that sticks.',
  },
]

const FAQS: FAQ[] = [
  {
    question: 'How long does a CIO job search typically take?',
    answer: 'Most CIO searches run six to eighteen months from the point of active engagement. The range depends on target sector, compensation level, and whether you are pursuing an active transition or positioning passively for the right mandate. Searches at Fortune 500 companies run longer than growth-stage or PE-backed mandates. The executives who land fastest started building relationships with search firms and target organizations six to twelve months before they needed to be in market.',
  },
  {
    question: 'Should I work with executive search firms for a CIO role?',
    answer: 'Most CIO mandates above $300K are filled through retained executive search firms before they are posted publicly. The firms that specialize in technology leadership - Korn Ferry, Spencer Stuart, Heidrick and Struggles, and boutique technology practices - maintain short lists of known candidates. Getting on those short lists before a search opens is the most valuable thing a CIO candidate can do. Starting Monday tracks the organizational signals that tend to precede CIO searches, so you can build search firm relationships at the right moment.',
  },
  {
    question: 'What do companies look for when hiring a CIO?',
    answer: 'The CIO evaluation centers on three things: a track record of technology-enabled business outcomes (not just successful IT delivery), the ability to communicate at board level in business terms rather than technical language, and evidence of organizational leadership - building teams and capabilities that outlasted your tenure. The CIO who wins in competitive searches has positioned each role as a business decision, not a technical one.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-cio/#webpage',
  url: 'https://startingmonday.app/for-cio',
  name: 'Starting Monday for C-suite technology searches',
  description: 'Campaign infrastructure for CIOs and CTOs in active search. Intelligence before roles are posted, precise relationship management, and preparation that wins the conversation.',
  isPartOf: {
    '@type': 'WebSite',
    url: 'https://startingmonday.app',
    name: 'Starting Monday',
  },
  about: {
    '@type': 'SoftwareApplication',
    name: 'Starting Monday',
    applicationCategory: 'BusinessApplication',
    audience: {
      '@type': 'Audience',
      audienceType: 'CIO, CTO, Chief Information Officer, Chief Technology Officer',
    },
  },
}

export default function ForCioPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EmiMarketingTelemetry pageSlug="/for-cio" personaSegment="executives" />
      <ProofStrip
        metric="81%"
        label="reached first interview inside 30 days"
        source="27 executives in the Jan–May 2026 pilot cohort"
      />
      <h1 className="sr-only">Starting Monday for C-suite technology searches</h1>
      <section className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div data-emi-proof="cio_prehero_proof" className="lg:col-span-2 border border-slate-700 rounded-xl p-5 bg-slate-950/40">
            <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">CIO proof snapshot</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="border border-slate-700 rounded-lg p-3">
                <p className="text-[22px] font-bold text-emerald-300 leading-none mb-1">81%</p>
                <p className="text-[13px] text-slate-200">Reached first interview inside 30 days</p>
              </div>
              <div className="border border-slate-700 rounded-lg p-3">
                <p className="text-[22px] font-bold text-emerald-300 leading-none mb-1">27</p>
                <p className="text-[13px] text-slate-200">Pilot executives in Jan-May 2026 cohort</p>
              </div>
              <div className="border border-slate-700 rounded-lg p-3">
                <p className="text-[22px] font-bold text-emerald-300 leading-none mb-1">9 days</p>
                <p className="text-[13px] text-slate-200">Median time to first qualified outreach</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-200">Based on 27 executives in the Jan–May 2026 pilot cohort. Results vary by market, role level, and campaign consistency.</p>
          </div>
          <div className="border border-slate-700 rounded-xl p-5 bg-slate-950/40 flex flex-col justify-between">
            <div className="space-y-2 mb-4">
              <TrackLink
                href="/signup?from=executive"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'executives', cta_label: 'cio_prehero_start_trial', source_page: '/for-cio' }}
                className="block text-center text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              >
                Start 30-day trial
              </TrackLink>
              <TrackLink
                href="/evidence-room"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'executives', cta_label: 'cio_prehero_review_method', source_page: '/for-cio' }}
                className="block text-center text-[13px] font-semibold text-white border border-slate-600 px-4 py-2 rounded hover:border-slate-300 transition-colors"
              >
                Evidence Hub
              </TrackLink>
            </div>
            <details data-emi-objection="cio_confidentiality_timing_recruiter" className="border border-slate-700 rounded-lg p-3">
              <summary className="list-none cursor-pointer text-[13px] font-semibold text-slate-200">Have questions first?</summary>
              <ul className="mt-2 space-y-1 text-[13px] text-slate-200">
                <li>• Confidential by default — your activity is never shared with employers.</li>
                <li>• Works alongside your existing recruiter relationships, not against them.</li>
                <li>• Optionality mode available if you are not ready to go active yet.</li>
              </ul>
            </details>
          </div>
        </div>
      </section>
      <LandingPage
        hero={{
          eyebrow: 'Many C-suite mandates are shaped through relationships before they are posted.',
          h1Lines: ["Your next mandate", "won't be", "announced."],
          body: "The best opportunities at your level surface through relationships and reputation, not job boards. The process is quiet, the timeline is compressed, and the candidate who walks in most prepared wins. Starting Monday is the campaign infrastructure for a search that needs to stay invisible until it is done.",
          note: 'Import your profile during setup. Operational in minutes.',
          steps: [
            'Track your target organizations - board changes, leadership gaps, transformation initiatives - before a search is ever authorized',
            'Manage every relationship and conversation with precision - nothing forgotten, nothing cold, nothing left to chance',
            'Walk in fully prepared - brief, positioning, and objection responses assembled in about a minute from their company and your actual record',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
      />
    </>
  )
}

