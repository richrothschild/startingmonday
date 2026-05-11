import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday - Find executive roles before they post',
  description: 'Starting Monday monitors your target companies every 48 hours. Know when something changes before it goes public. Built for senior executives in search. Free 30-day trial.',
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
    title: 'Starting Monday - Find executive roles before they post',
    description: 'Starting Monday monitors your target companies every 48 hours. Know when something changes before it goes public. Built for senior executives in search.',
    url: 'https://startingmonday.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday - Find executive roles before they post',
    description: 'Starting Monday monitors your target companies every 48 hours. Know when something changes before it goes public. Built for senior executives in search.',
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
    headline: "I'm not looking - but Sunday nights feel different.",
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
      description: 'AI-powered career search platform for senior executives. Pipeline tracking, company intelligence, and interview prep for CIOs, CTOs, VPs, and other senior leaders in active search.',
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
      name: 'Starting Monday - AI Career Platform for Senior Technology Executives',
      isPartOf: { '@id': 'https://startingmonday.app/#organization' },
      description: 'Pipeline tracking, company intelligence, and AI-powered interview prep for senior executives in active search.',
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'For senior executives in search.',
          h1Lines: ["The role was never posted.", "You found it anyway."],
          body: "By the time a role posts, the short list already exists. The two weeks before that moment is when candidates are considered and relationships are made. Starting Monday monitors your target companies every 48 hours. When something changes before it goes public, you know. That is the window. We help you live there.",
          trialNote: 'Free for 30 days. No credit card.',
        }}
        situations={SITUATIONS}
        showPersonaSelector
      />
    </>
  )
}
