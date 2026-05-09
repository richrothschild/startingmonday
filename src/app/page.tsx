import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday — Career Campaign Infrastructure for Senior Technology Executives',
  description: 'The career operating system for CIOs, CTOs, and senior technology executives running a campaign. Intelligence before roles open, prep briefs in 60 seconds, pipeline command center. Free 30-day trial.',
  keywords: [
    'executive job search tools',
    'CIO job search',
    'CTO job search',
    'technology executive career',
    'executive pipeline tracker',
    'AI interview prep executives',
    'executive search campaign',
    'job search CRM executives',
  ],
  openGraph: {
    title: 'Starting Monday — Career Campaign Infrastructure for Senior Technology Executives',
    description: 'The career operating system for CIOs, CTOs, and senior technology executives. Intelligence before roles open, prep briefs in 60 seconds, pipeline command center.',
    url: 'https://startingmonday.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday — Career Campaign Infrastructure for Senior Technology Executives',
    description: 'The career operating system for CIOs, CTOs, and senior technology executives. Intelligence before roles open, prep briefs in 60 seconds, pipeline command center.',
  },
  alternates: {
    canonical: 'https://startingmonday.app',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to land well. Quickly.',
  },
  {
    id: 'executive',
    headline: 'I know exactly what I want.',
    sub: 'Targeted search. I just need to move faster.',
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
    id: 'vp-up',
    headline: "I'm ready for the next seat.",
    sub: 'VP to CIO. Director to VP. I have the record. Now I need the campaign.',
  },
  {
    id: 'returning',
    headline: "I've been saying 'starting Monday' for months.",
    sub: 'This is the one that sticks.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://startingmonday.app/#organization',
      name: 'Starting Monday',
      url: 'https://startingmonday.app',
      logo: 'https://startingmonday.app/icon.png',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://startingmonday.app/#app',
      name: 'Starting Monday',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AI-powered career search platform for senior technology executives. Pipeline tracking, company intelligence, and interview prep for CIOs, CTOs, and VPs in active search.',
      url: 'https://startingmonday.app',
      publisher: { '@id': 'https://startingmonday.app/#organization' },
      offers: {
        '@type': 'Offer',
        price: '49',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          billingDuration: 'P1M',
        },
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://startingmonday.app/#webpage',
      url: 'https://startingmonday.app',
      name: 'Starting Monday — AI Career Platform for Senior Technology Executives',
      isPartOf: { '@id': 'https://startingmonday.app/#organization' },
      description: 'Pipeline tracking, company intelligence, and AI-powered interview prep for CIOs, CTOs, and senior technology executives in active search.',
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'Most executives manage their search the way candidates do. The best ones run a campaign.',
          h1Lines: ["Run your career", "like the executive", "you are."],
          body: "Starting Monday is the career infrastructure for senior technology executives. Watch target companies for signals before roles open. Walk in with a tailored brief. Never let a relationship go cold. Run a campaign, not a job search.",
          trialNote: 'Free for 30 days. No credit card.',
        }}
        situations={SITUATIONS}
        showPersonaSelector
      />
    </>
  )
}
