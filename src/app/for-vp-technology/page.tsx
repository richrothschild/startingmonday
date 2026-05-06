import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday for VP Technology — The Right Mandate at the Right Organization',
  description: 'Campaign infrastructure for VP and SVP Technology leaders in active search. Track the organizations building or restructuring their technology function before roles are posted. Free 30-day trial.',
  keywords: [
    'VP technology job search',
    'VP IT job search',
    'SVP technology career',
    'vice president technology search',
    'VP engineering job search',
    'senior VP technology career',
    'VP technology career transition',
    'technology VP job search strategy',
  ],
  openGraph: {
    title: 'Starting Monday for VP Technology',
    description: 'The best VP Technology roles go to candidates already in the room. Find the right mandate before the role is posted.',
    url: 'https://startingmonday.app/for-vp-technology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for VP Technology',
    description: 'The best VP Technology roles go to candidates already in the room. Find the right mandate before the role is posted.',
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
    id: 'best-vp',
    headline: 'I want a better VP role, not necessarily the CIO seat.',
    sub: 'Broader scope, better organization, more resources. The right mandate at the right level.',
  },
  {
    id: 'restructured',
    headline: 'My VP mandate was reduced in a reorganization.',
    sub: 'The scope changed around me. Time to find a company where technology is taken seriously.',
  },
  {
    id: 'open-to-either',
    headline: 'I am open to the right VP role or a step into the CIO seat.',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-vp-technology/#webpage',
  url: 'https://startingmonday.app/for-vp-technology',
  name: 'Starting Monday for VP Technology — The Right Mandate at the Right Organization',
  description: 'Campaign infrastructure for VP and SVP Technology leaders in active search. Track organizations building or restructuring their technology function before roles are posted.',
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
      audienceType: 'VP Technology, SVP Technology, VP IT, VP Engineering, Vice President Technology',
    },
  },
}

export default function ForVpTechnologyPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'The best VP Technology roles go to the candidates already in the room.',
          h1Lines: ['The right mandate', 'at the right', 'organization.'],
          body: 'The senior technology leader at VP level faces a search that rewards preparation over application. The best roles are filled through referral networks and search firms who already have you in mind — not through job boards you checked last Tuesday. The VP who lands well is not the one who applies fastest. It is the one who has been watching their target organizations before the headcount was approved, and who walks in already knowing the context.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Track organizations where VP Technology roles open at the right scope — companies building out or restructuring their technology function, PE-backed companies adding leadership depth, and growth-stage companies formalizing their first senior technology hire',
            'Build the search firm relationships that place VP technology leaders before the role is posted publicly — most searches at this level are filled from the firm\'s existing candidate relationships, not from inbound applications',
            'Prepare the brief that works for both conversations: VP lateral at a higher-caliber organization, and the first CIO step-up where the timing and company are right',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
      />
    </>
  )
}
