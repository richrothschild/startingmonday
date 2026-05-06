import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday for VPs — Make the Move from VP to CIO',
  description: 'The campaign infrastructure for technology leaders ready to move from VP to CIO. Position yourself at the right altitude, prepare for search firm conversations, and stay ahead of the market. Free 30-day trial.',
  keywords: [
    'VP to CIO',
    'VP IT to CIO',
    'CIO career path',
    'how to become CIO',
    'technology leadership career transition',
    'senior VP job search',
    'VP technology job search',
    'making VP to CIO move',
    'CIO career advice',
  ],
  openGraph: {
    title: 'Starting Monday for VPs — Make the Move from VP to CIO',
    description: 'Most VP searches fail at positioning, not credentials. The infrastructure to make the VP-to-CIO move deliberately.',
    url: 'https://startingmonday.app/for-vp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for VPs — Make the Move from VP to CIO',
    description: 'Most VP searches fail at positioning, not credentials. The infrastructure to make the VP-to-CIO move deliberately.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-vp',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'vp-up',
    headline: "I'm ready for the next seat.",
    sub: 'VP to CIO. Director to VP. I have the record. Now I need the campaign.',
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
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to land well. Quickly.',
  },
  {
    id: 'passive',
    headline: "I'm not looking — but Sunday nights feel different.",
    sub: 'Not ready to commit. But not at peace either.',
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
  '@id': 'https://startingmonday.app/for-vp/#webpage',
  url: 'https://startingmonday.app/for-vp',
  name: 'Starting Monday for VPs — Make the Move from VP to CIO',
  description: 'Campaign infrastructure for technology leaders ready to move from VP to CIO. Right narrative, right altitude, right preparation.',
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
      audienceType: 'VP of Technology, VP of IT, VP Engineering, aspiring CIO',
    },
  },
}

export default function ForVpPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'Most VP searches fail at positioning, not credentials.',
          h1Lines: ["Your record is strong.", "Your narrative", "needs to match it."],
          body: "The gap between VP and CIO is rarely about capability. It is how you are positioned with search firms, how your resume reads in the first six seconds, and whether your story holds under board-level questioning. Starting Monday gives you the infrastructure to make that move deliberately.",
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Map organizations where a CIO mandate is forming — we flag roles before they are authorized, not just before they are posted',
            'Build your positioning narrative at the right altitude — calibrated to C-suite, not the VP tier you are leaving',
            'Walk into every search firm conversation prepared — brief, objection responses, and win thesis ready in 60 seconds',
          ],
          trialNote: 'Free for 30 days. No credit card.',
        }}
        situations={SITUATIONS}
      />
    </>
  )
}
