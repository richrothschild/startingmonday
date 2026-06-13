import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

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
    metric: 'Build a board-ready narrative in week one',
    detail: 'Translate your operating track record into a mandate-level story that works with recruiters, boards, and executive peers.',
  },
  {
    metric: 'Move from reactive to weekly execution control',
    detail: 'Run a structured cadence for targeting, outreach, and follow-through so momentum compounds across conversations.',
  },
  {
    metric: 'Enter conversations earlier with stronger context',
    detail: 'Track role-shaping signals before public postings so you are known before the shortlist hardens.',
  },
]

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

export default function ForExecutivesPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <h1 className="sr-only">Starting Monday for executives pursuing C-suite and board-level roles</h1>
      <LandingPage
        hero={{
          eyebrow: 'Become the executive they shape the role for.',
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
      />
    </>
  )
}
