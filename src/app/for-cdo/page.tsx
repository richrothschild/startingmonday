import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday for CDOs — Chief Digital Officer Search Campaign Infrastructure',
  description: 'Campaign infrastructure for Chief Digital Officers in active search. Know the mandate before the first conversation, track transformation signals, and position yourself precisely for the right organization. Free 30-day trial.',
  keywords: [
    'CDO job search',
    'Chief Digital Officer job search',
    'CDO career',
    'CDO to CIO transition',
    'digital transformation executive job search',
    'Chief Digital Officer career',
    'CDO interview preparation',
    'digital executive search',
    'chief digital officer search strategy',
  ],
  openGraph: {
    title: 'Starting Monday for CDOs — Chief Digital Officer Search',
    description: 'Digital transformation mandates are being absorbed, restructured, and redefined. The CDO who wins knows exactly which mandate they are walking into.',
    url: 'https://startingmonday.app/for-cdo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for CDOs — Chief Digital Officer Search',
    description: 'Digital transformation mandates are being absorbed, restructured, and redefined. Know the mandate before the first conversation.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-cdo',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'absorbed',
    headline: 'My transformation mandate was absorbed by the CIO.',
    sub: 'The org restructured. I need to find a company where digital is still a distinct mandate.',
  },
  {
    id: 'cdo-to-cio',
    headline: 'I want to move from CDO to a broader operating mandate.',
    sub: 'I have the transformation record. Now I need the full P&L.',
  },
  {
    id: 'mandate-confusion',
    headline: 'The CDO title means something different everywhere I look.',
    sub: 'I need to find organizations where the mandate is real, not a rebrand.',
  },
  {
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to land at the right level, at the right kind of organization.',
  },
  {
    id: 'passive',
    headline: "I'm not looking, but my mandate has plateaued.",
    sub: 'The organization has gotten what it needed. Time to find the next transformation.',
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
  '@id': 'https://startingmonday.app/for-cdo/#webpage',
  url: 'https://startingmonday.app/for-cdo',
  name: 'Starting Monday for CDOs — Chief Digital Officer Search Campaign Infrastructure',
  description: 'Campaign infrastructure for Chief Digital Officers in active search. Know the mandate before the first conversation, track transformation signals, and position yourself precisely.',
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
      audienceType: 'Chief Digital Officer, CDO, Head of Digital Transformation',
    },
  },
}

export default function ForCdoPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'Digital transformation mandates are being absorbed, restructured, and redefined.',
          h1Lines: ['Your mandate', 'is real.', 'Own the narrative.'],
          body: 'The Chief Digital Officer search is harder than the CIO search because the mandate varies wildly by organization. At some companies, CDO owns customer-facing digital and the CIO owns infrastructure. At others, CDO is the CIO with a modern title. At others still, it is a transitional role already being absorbed. The candidate who wins is the one who can read which mandate they are walking into and position themselves precisely for it before the first conversation.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Identify companies with authentic digital transformation mandates — board-authorized, revenue-linked, not just a rebrand of the IT function',
            'Track organizational signals that tell you whether the CDO mandate is growing or being consolidated — board composition, digital P&L ownership, reporting line to CEO vs CIO',
            'Build two distinct narratives: CDO-to-CIO for organizations consolidating, CDO-as-strategy for organizations where digital remains a separate mandate',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
      />
    </>
  )
}
