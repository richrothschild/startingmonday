import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday for CIOs and CTOs — Executive Search Campaign Infrastructure',
  description: 'Campaign infrastructure for CIOs and CTOs in active search. Intelligence before roles are posted, relationship precision, and preparation that wins the conversation. Free 30-day trial.',
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
    title: 'Starting Monday for CIOs and CTOs',
    description: 'The best CIO mandates are created, not posted. Campaign infrastructure for technology executives in active search.',
    url: 'https://startingmonday.app/for-cio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for CIOs and CTOs',
    description: 'The best CIO mandates are created, not posted. Campaign infrastructure for technology executives in active search.',
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
    headline: "I'm not looking — but Sunday nights feel different.",
    sub: 'Not ready to commit. But not at peace either.',
  },
  {
    id: 'board',
    headline: 'I want the next role to lead to a board seat.',
    sub: 'Running a CIO search and a board positioning campaign at the same time.',
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
  '@id': 'https://startingmonday.app/for-cio/#webpage',
  url: 'https://startingmonday.app/for-cio',
  name: 'Starting Monday for CIOs and CTOs',
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
      <LandingPage
        hero={{
          eyebrow: 'The best CIO mandates are created, not posted.',
          h1Lines: ["Your next mandate", "won't be", "announced."],
          body: "The best opportunities at your level surface through relationships and reputation, not job boards. The process is quiet, the timeline is compressed, and the candidate who walks in most prepared wins. Starting Monday is the campaign infrastructure for a search that needs to stay invisible until it is done.",
          note: 'Import your profile during setup. Operational in minutes.',
          steps: [
            'Track your target organizations — board changes, leadership gaps, transformation initiatives — before a search is ever authorized',
            'Manage every relationship and conversation with precision — nothing forgotten, nothing cold, nothing left to chance',
            'Walk in fully prepared — brief, positioning, and objection responses assembled in 60 seconds from their company and your actual record',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
      />
    </>
  )
}
