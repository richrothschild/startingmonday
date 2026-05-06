import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday for CISOs — Chief Information Security Officer Search Infrastructure',
  description: 'Campaign infrastructure for CISOs in active search. Monitor the events that open mandates before searches are authorized, position security as business risk management, and build toward a board seat. Free 30-day trial.',
  keywords: [
    'CISO job search',
    'Chief Information Security Officer job search',
    'CISO career',
    'cybersecurity executive job search',
    'CISO to board',
    'CISO interview preparation',
    'information security executive search',
    'CISO career path',
    'cybersecurity executive career',
    'CISO search strategy',
  ],
  openGraph: {
    title: 'Starting Monday for CISOs — Chief Information Security Officer Search',
    description: 'The best CISO mandates open after a wake-up call. Be in position before the search is authorized.',
    url: 'https://startingmonday.app/for-ciso',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for CISOs — Chief Information Security Officer Search',
    description: 'The best CISO mandates open after a wake-up call. Be in position before the search is authorized.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-ciso',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'acquired',
    headline: 'My company was acquired and security is being consolidated.',
    sub: 'M&A ended my mandate. I need to find the next organization before the market knows I am available.',
  },
  {
    id: 'board',
    headline: 'I want to build a path to a board seat.',
    sub: 'Audit committee. Cyber committee. I have the record. Now I need the positioning.',
  },
  {
    id: 'narrative',
    headline: 'I need to stop being seen as a technical leader.',
    sub: 'My record is in business risk management. My resume still reads like a security engineer.',
  },
  {
    id: 'scale',
    headline: 'I am ready to move to a larger mandate.',
    sub: 'Startup CISO to enterprise, or regulated industry, or global scope. I need to make the jump deliberately.',
  },
  {
    id: 'passive',
    headline: "I'm not looking, but the mandate keeps shrinking.",
    sub: 'Budget cut, scope narrowed, reporting line moved. The signals are there.',
  },
  {
    id: 'returning',
    headline: "I've been saying 'starting Monday' for months.",
    sub: 'This is the one that sticks.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-ciso/#webpage',
  url: 'https://startingmonday.app/for-ciso',
  name: 'Starting Monday for CISOs — Chief Information Security Officer Search Infrastructure',
  description: 'Campaign infrastructure for CISOs in active search. Monitor breach disclosures, regulatory actions, and compliance events before searches are authorized. Position security as business risk.',
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
      audienceType: 'Chief Information Security Officer, CISO, VP Information Security, Head of Cybersecurity',
    },
  },
}

export default function ForCisoPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'The best CISO mandates open after a wake-up call.',
          h1Lines: ['Security is the', 'business risk.', 'Position yourself there.'],
          body: 'CISO searches are event-driven. A breach, an IPO, a regulatory action, an acquisition — these create the urgency that turns a budgeted headcount into an authorized search. The candidate who lands the right role is the one who has been watching those events at their target organizations and can walk in as the person who understands not just the technical problem but the board-level exposure. Starting Monday surfaces those signals before the search firm is engaged.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Monitor target organizations for breach disclosures, regulatory actions, IPO filings, and board cybersecurity committee formations — these events precede authorized CISO searches by weeks',
            'Track the single most important signal: does this CISO report to the CIO or directly to the CEO? That reporting line tells you everything about how seriously the board takes security risk',
            'Build the narrative that positions your security record as business risk management and board-level communication, not technical infrastructure — that is the conversation that gets you in front of the right people',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
      />
    </>
  )
}
