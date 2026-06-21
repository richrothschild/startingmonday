import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Starting Monday for VP Technology | Move into broader scope roles',
  description: 'Search infrastructure for technology leaders moving into broader scope. Find role-shaping signals earlier and run a disciplined weekly plan.',
  keywords: [
    'rising technology leaders',
    'director to vp technology',
    'senior manager technology transition',
    'technology leadership career move',
    'technology mandate search',
    'vp technology career transition',
    'technology leadership search strategy',
  ],
  openGraph: {
    title: 'Starting Monday for VP Technology',
    description: 'Move into broader leadership scope before the shortlist is crowded.',
    url: 'https://startingmonday.app/for-vp-technology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for VP Technology',
    description: 'Move into broader leadership scope before the shortlist is crowded.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-vp-technology',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'ceiling',
    headline: 'I have reached the ceiling at my current company.',
    sub: 'The next real move is likely outside my current org chart.',
  },
  {
    id: 'broader-mandate',
    headline: 'I want broader scope, not just a new title.',
    sub: 'I need stronger mandate ownership and better resourcing.',
  },
  {
    id: 'restructured',
    headline: 'My mandate was reduced in a reorganization.',
    sub: 'I need an environment where technology is central to strategy.',
  },
  {
    id: 'open-to-either',
    headline: 'I am open to a broader role or first VP step-up.',
    sub: 'The mandate matters more than the title.',
  },
  {
    id: 'passive',
    headline: 'I am not actively looking, but I am paying attention.',
    sub: 'The right mandate would change my timeline quickly.',
  },
  {
    id: 'returning',
    headline: 'I am done with reactive searches.',
    sub: 'This time I want a clear system and consistent weekly execution.',
  },
]

const FAQS: FAQ[] = [
  {
    question: 'How long does a Rising Leaders search typically take?',
    answer: 'Most searches run four to nine months. Speed depends on mandate clarity, relationship strength, and how early you begin before roles are publicly visible.',
  },
  {
    question: 'Do Rising Leaders need a formal title change to make a strong move?',
    answer: 'No. Strong moves are often lateral in title but larger in business scope. The mandate, reporting line, and operating authority matter more than title alone.',
  },
  {
    question: 'How do search firms evaluate Rising Leaders candidates?',
    answer: 'Search firms ask what changed under your leadership. They look for clear scope, operating constraints, and measurable outcomes tied to business impact.',
  },
]

const PROOF_HIGHLIGHTS = [
  {
    metric: 'Earlier shortlist entry through pre-posting timing signals',
    detail: 'Rising leaders can engage before roles become crowded and fully public.',
  },
  {
    metric: 'Sharper role-fit narrative for both lateral and VP-track conversations',
    detail: 'One core story adapted for search partners, operators, and executive stakeholders.',
  },
  {
    metric: 'Weekly operating cadence that keeps momentum visible',
    detail: 'A repeatable plan for targets, outreach, and follow-up without stop-start drift.',
  },
]

const PATHWAYS = [
  {
    title: 'Scope expansion',
    description: 'Move from functional ownership to enterprise-level operating influence with clearer mandate framing.',
  },
  {
    title: 'VP-track readiness',
    description: 'Show decision quality, org-scale leadership, and execution rhythm expected in VP-level hiring.',
  },
  {
    title: 'Mandate-first targeting',
    description: 'Prioritize companies where technology scope is opening, not just where jobs are posted.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-vp-technology/#webpage',
  url: 'https://startingmonday.app/for-vp-technology',
  name: 'Starting Monday for Rising Leaders - The Right Mandate at the Right Organization',
  description: 'Campaign infrastructure for rising technology leaders in active search. Track organizations building or restructuring their technology function before roles are posted.',
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
      audienceType: 'Rising technology leaders, directors, senior managers, technical leads, first-time VP candidates',
    },
  },
}

export default function ForVpTechnologyPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <h1 className="sr-only">Starting Monday for VP technology transitions</h1>
      <LandingPage
        hero={{
          eyebrow: 'For technology leaders moving into broader scope mandates.',
          h1Lines: ['Move into broader scope', 'before the role is posted.'],
          body: 'Starting Monday helps you enter earlier, tell a sharper leadership story, and run a clear weekly plan so you can move into the right mandate with confidence.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Track companies where technology leadership scope is expanding before openings are obvious.',
            'Build search-partner and operator relationships while mandate definitions are still forming.',
            'Carry one clear story that works for both broader lateral and first VP conversations.',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
        proofHighlights={PROOF_HIGHLIGHTS}
        sourcePage="/for-vp-technology"
        showFooter={false}
      />

      <div className="bg-slate-950 pb-12 sm:pb-14">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-8">
          <div className="rounded-[1.5rem] border border-white/12 bg-gradient-to-b from-slate-900/70 to-slate-950/80 p-5 shadow-[0_32px_88px_rgba(2,6,23,0.35)] sm:p-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Rising-leader pathways</p>
            <h2 className="mb-2 text-[22px] font-bold leading-snug text-white">Build the case for broader leadership scope.</h2>
            <p className="mb-5 text-[14px] leading-relaxed text-slate-200/90">
              This page uses the same disciplined visual and operating language as home, then adapts it for VP technology transitions.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PATHWAYS.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_56px_rgba(15,23,42,0.2)]">
                  <p className="mb-2 text-[13px] font-semibold text-white">{item.title}</p>
                  <p className="text-[12px] leading-relaxed text-slate-200/90">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link
            href="/individuals"
            className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
          >
            Back to individuals lane selector
          </Link>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
