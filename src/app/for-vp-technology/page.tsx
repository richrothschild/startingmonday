import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Rising Leaders Search: The Right Mandate at the Right Organization',
  description: 'Search infrastructure for rising technology leaders moving into broader scope. Track organizations building or restructuring technology leadership before roles are posted.',
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
    title: 'Rising Leaders Search - Starting Monday',
    description: 'Rising leaders win stronger mandates by getting into the room before the role is posted.',
    url: 'https://startingmonday.app/for-vp-technology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rising Leaders Search - Starting Monday',
    description: 'Rising leaders win stronger mandates by getting into the room before the role is posted.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-vp-technology',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'ceiling',
    headline: 'I have reached the ceiling at my current organization.',
    sub: 'The CIO seat is not opening. I need a company where the next move is real.',
  },
  {
    id: 'broader-mandate',
    headline: 'I want broader scope, not just a title change.',
    sub: 'Better organization, stronger mandate, and real resources for the next level.',
  },
  {
    id: 'restructured',
    headline: 'My mandate was reduced in a reorganization.',
    sub: 'The scope changed around me. Time to find a company where technology is taken seriously.',
  },
  {
    id: 'open-to-either',
    headline: 'I am open to the right broader role or first VP step-up.',
    sub: 'The title matters less than the mandate. I need to position for both conversations.',
  },
  {
    id: 'passive',
    headline: "I am not actively looking, but the right role would get my attention.",
    sub: 'Passive but aware. The right opportunity at the right company would change that.',
  },
  {
    id: 'returning',
    headline: "I've been saying 'starting Monday' for months.",
    sub: 'This is the one that sticks.',
  },
]

const FAQS: FAQ[] = [
  {
    question: 'How long does a Rising Leaders search typically take?',
    answer: 'Most Rising Leaders searches run four to nine months in active market. The range depends on whether you are pursuing a lateral move with broader scope or a first VP-level mandate, and how warm your search-firm relationships are before you start. The fastest searches belong to leaders who have been in contact with the right partners in the last twelve months and who can clearly define the mandate they are built for.',
  },
  {
    question: 'Do Rising Leaders need a formal title change to make a strong move?',
    answer: 'Not necessarily. Many of the strongest moves are lateral in title and significant in scope - moving from a company where technology is treated as a cost center to one where it is a strategic priority, or from constrained budget authority to a mandate with real resources. The title matters less than the mandate, the reporting line, and the organization. Starting Monday helps you identify companies actively building or restructuring technology leadership, where real scope opens first.',
  },
  {
    question: 'How do search firms evaluate Rising Leaders candidates?',
    answer: 'Search firms evaluate Rising Leaders on one core question: what did the technology function look like before you arrived, and what was measurably different after? They are not looking for a list of systems implemented or team size alone. They want a clean narrative of scope, constraints, and outcomes. Candidates who lead with business impact and operating results make short lists faster.',
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
      <h1 className="sr-only">Starting Monday for Rising Leaders searches</h1>
      <LandingPage
        hero={{
          eyebrow: 'For Rising Leaders moving into broader technology scope.',
          h1Lines: ['The right mandate', 'at the right', 'organization.'],
          body: 'Rising Leaders win stronger mandates by preparing before they apply. The best roles are filled through trusted relationships and search-firm networks, not reactive job-board volume. The leaders who move well are not first to apply; they are first to see context, timing, and fit.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Track organizations where leadership scope is expanding before openings are broadly visible',
            'Build search-firm and operator relationships early, while mandate definitions are still forming',
            'Carry one clear story that supports both a broader lateral move and a first VP mandate',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
        sourcePage="/for-vp-technology"
      />
    </>
  )
}
