import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import { ProofStrip } from '@/components/ProofStrip'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'VP Technology Search: The Right Mandate at the Right Organization - Starting Monday',
  description: 'VP technology search infrastructure for VP and SVP Technology leaders. Track organizations building or restructuring technology leadership before roles are posted.',
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
    title: 'VP Technology Search - Starting Monday',
    description: 'The best VP Technology roles go to candidates already in the room. Find the right mandate before the role is posted.',
    url: 'https://startingmonday.app/for-vp-technology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VP Technology Search - Starting Monday',
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

const FAQS: FAQ[] = [
  {
    question: 'How long does a VP Technology job search typically take?',
    answer: 'Most VP Technology searches run four to nine months in active market. The range depends on whether you are pursuing a lateral move at a higher-caliber organization or a step up in scope, and how warm your search firm relationships are before you start. The fastest searches belong to executives who have been in contact with the right search firm partners in the last twelve months and who have a clear answer to what mandate they are built for.',
  },
  {
    question: 'Do VP Technology candidates need a formal title change to move to a better role?',
    answer: 'Not necessarily. Many of the most valuable VP Technology moves are lateral in title and significant in scope - moving from a company where technology is treated as a cost center to one where it is a strategic priority, or from a constrained budget to a mandate with real resources. The title matters less than the mandate, the reporting line, and the organization. Starting Monday helps you identify companies that are actively building or restructuring their technology function, which is where the real scope is.',
  },
  {
    question: 'How do executive search firms evaluate VP Technology candidates?',
    answer: 'Search firms filling VP Technology mandates are looking for candidates who can answer one question: what did the technology function look like before you got there, and what was measurably different after? They are not looking for a list of systems implemented or teams managed. They want a clean narrative of scope, constraint, and outcome. Candidates who lead with their team size or their stack do not make short lists. Candidates who lead with the business problem and the measurable result do.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-vp-technology/#webpage',
  url: 'https://startingmonday.app/for-vp-technology',
  name: 'Starting Monday for VP Technology - The Right Mandate at the Right Organization',
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
      <h1 className="sr-only">Starting Monday for VP Technology searches</h1>
      <ProofStrip
        metric="81%"
        label="of pilot executives reached first interview inside 30 days"
        source="27 executives in the Jan–May 2026 cohort"
      />
      <LandingPage
        hero={{
          eyebrow: 'The best VP Technology roles go to the candidates already in the room.',
          h1Lines: ['The right mandate', 'at the right', 'organization.'],
          body: 'The senior technology leader at VP level faces a search that rewards preparation over application. The best roles are filled through referral networks and search firms who already have you in mind - not through job boards you checked last Tuesday. The VP who lands well is not the one who applies fastest. It is the one who has been watching their target organizations before the headcount was approved, and who walks in already knowing the context.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Track organizations where VP Technology roles open at the right scope - companies building out or restructuring their technology function, PE-backed companies adding leadership depth, and growth-stage companies formalizing their first senior technology hire',
            'Build the search firm relationships that place VP technology leaders before the role is posted publicly - most searches at this level are filled from the firm\'s existing candidate relationships, not from inbound applications',
            'Prepare the brief that works for both conversations: VP lateral at a higher-caliber organization, and the first CIO step-up where the timing and company are right',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
      />
    </>
  )
}
