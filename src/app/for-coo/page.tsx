import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday for COOs — Technology Executives Making the Move to Operations',
  description: 'Campaign infrastructure for CIOs and CTOs moving into COO roles. Identify organizations where a technology-background COO fits, track operational mandate signals, and build the narrative that crosses the functional boundary. Free 30-day trial.',
  keywords: [
    'COO job search',
    'CIO to COO',
    'CTO to COO',
    'technology executive operations role',
    'chief operating officer technology background',
    'technology leader COO career',
    'COO search strategy',
    'operations executive technology background',
    'technology executive career transition',
  ],
  openGraph: {
    title: 'Starting Monday for COOs — Technology Executives in Operations',
    description: 'The technology executive who can run the business is the most valuable person in the room. Make the CIO-to-COO move deliberately.',
    url: 'https://startingmonday.app/for-coo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for COOs — Technology Executives in Operations',
    description: 'The technology executive who can run the business is the most valuable person in the room. Make the CIO-to-COO move deliberately.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-coo',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'scope-exceeded-title',
    headline: 'I am running operations but my title still says CIO.',
    sub: 'The scope has grown past the title. I need the seat that matches what I am already doing.',
  },
  {
    id: 'deliberate-move',
    headline: 'I want to make the CIO-to-COO move deliberately.',
    sub: 'I have the operational record. Now I need to position it at the right altitude and find the right organization.',
  },
  {
    id: 'digital-native',
    headline: 'The CEO needs an operator who understands what we built.',
    sub: 'Digital-native company, scaling fast. The COO seat needs someone who knows the technology and can run the business.',
  },
  {
    id: 'succession',
    headline: 'I am being positioned as a CEO successor.',
    sub: 'COO is the role, but the horizon is the top seat. I need to make this move count.',
  },
  {
    id: 'passive',
    headline: "I'm not looking, but my mandate keeps expanding beyond technology.",
    sub: 'Operations, finance, people. If I am running it, I should own it.',
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
  '@id': 'https://startingmonday.app/for-coo/#webpage',
  url: 'https://startingmonday.app/for-coo',
  name: 'Starting Monday for COOs — Technology Executives Making the Move to Operations',
  description: 'Campaign infrastructure for CIOs and CTOs moving into COO roles. Identify where a technology-background COO fits, track operational mandate signals, and build the narrative that crosses the functional boundary.',
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
      audienceType: 'Chief Operating Officer, COO, CIO transitioning to COO, CTO transitioning to COO',
    },
  },
}

export default function ForCooPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'The technology executive who can run the business is the most valuable person in the room.',
          h1Lines: ['Operations is', 'the next', 'mandate.'],
          body: 'The path from CIO or CTO into the COO seat is one of the most valuable transitions in the current market. Digital-native companies scaling past the point where the CEO can run everything need someone who understands the technology foundation and can manage the business built on top of it. PE-backed companies driving operational improvement need executives who can deliver efficiency without breaking the digital advantage. The candidate who makes this move deliberately, with a clear operational narrative, is rare enough to command the room.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Identify organizations where a technology-background COO fits: digital-native companies scaling rapidly, PE-backed operations with an improvement mandate, and CEO succession contexts where operational credibility is the missing piece',
            'Track the signals that precede COO mandate creation: CEO bandwidth signals, operational complexity outgrowing current leadership structure, PE ownership transitions requiring a disciplined operator',
            'Build the narrative that bridges your technology leadership record with operational credibility — specific P&L ownership, cross-functional scope, and operational metrics that make you a COO candidate, not just a senior technology executive with broad responsibilities',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
      />
    </>
  )
}
