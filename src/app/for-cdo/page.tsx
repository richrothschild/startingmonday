import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday for C-suite digital leaders - Chief Digital Officer Search Campaign Infrastructure',
  description: 'Campaign infrastructure for C-suite digital leaders in active search. Know the mandate before the first conversation, track transformation signals, and position yourself precisely for the right organization. Free 30-day trial.',
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
    title: 'Starting Monday for C-suite digital leaders - Chief Digital Officer Search',
    description: 'Digital transformation mandates are being absorbed, restructured, and redefined. The CDO who wins knows exactly which mandate they are walking into.',
    url: 'https://startingmonday.app/for-cdo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for CDOs - Chief Digital Officer Search',
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

const FAQS: FAQ[] = [
  {
    question: 'How do I find CDO roles where the digital mandate is real and not just a rebrand?',
    answer: 'The indicators of a genuine CDO mandate are specific: direct CEO reporting line rather than through the CIO, board-level sponsorship of the digital initiative, digital P&L with revenue accountability rather than just cost center ownership, and evidence that the company has made a sustained multi-year investment. Organizations with a meaningful digital revenue line, a dedicated board committee, or a transformation initiated by the CEO rather than the IT function are the ones worth pursuing. The rest are technology leadership roles with a modern title.',
  },
  {
    question: 'What is the difference between a CDO and a CIO search at the executive level?',
    answer: 'A CIO search is a technical infrastructure and delivery mandate. A CDO search is a customer-facing and revenue-linked digital mandate. The candidate who wins a CDO role speaks the language of customer experience, digital product, and revenue growth - not IT delivery and cost management. Where those mandates overlap varies by company. The CDO who can articulate both conversations clearly is the one who makes short lists at organizations where the mandate is still being defined.',
  },
  {
    question: 'How do I position myself for both CDO and CIO roles at the same time?',
    answer: 'Build two distinct narratives from the same record, not one blended narrative that fits neither audience. The CDO narrative leads with customer outcomes and digital revenue. The CIO narrative leads with technology capability and business enablement. Candidates who try to hedge - presenting themselves as both in the same conversation - come across as lacking conviction about what they are built for. Know which version a specific opportunity requires, and enter that conversation with the right frame.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-cdo/#webpage',
  url: 'https://startingmonday.app/for-cdo',
  name: 'Starting Monday for CDOs - Chief Digital Officer Search Campaign Infrastructure',
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
      <h1 className="sr-only">Starting Monday for C-suite digital leaders in CDO searches</h1>
      <section className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">Quick navigation</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] mb-3">
            <a href="#fit-check" className="text-slate-300 hover:text-white underline underline-offset-2">Fit check</a>
            <a href="#search-model" className="text-slate-300 hover:text-white underline underline-offset-2">Search model</a>
            <a href="#trust" className="text-slate-300 hover:text-white underline underline-offset-2">Trust and privacy</a>
            <a href="#faq" className="text-slate-300 hover:text-white underline underline-offset-2">FAQ</a>
          </div>
          <Link href="/signup" className="inline-block text-[12px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors">
            Start free trial
          </Link>
        </div>
      </section>
      <LandingPage
        hero={{
          eyebrow: 'Digital transformation mandates are being absorbed, restructured, and redefined.',
          h1Lines: ['Your mandate', 'is real.', 'Own the narrative.'],
          body: 'The Chief Digital Officer search is harder than the CIO search because the mandate varies wildly by organization. At some companies, CDO owns customer-facing digital and the CIO owns infrastructure. At others, CDO is the CIO with a modern title. At others still, it is a transitional role already being absorbed. The candidate who wins is the one who can read which mandate they are walking into and position themselves precisely for it before the first conversation.',
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Identify companies with authentic digital transformation mandates - board-authorized, revenue-linked, not just a rebrand of the IT function',
            'Track organizational signals that tell you whether the CDO mandate is growing or being consolidated - board composition, digital P&L ownership, reporting line to CEO vs CIO',
            'Build two distinct narratives: CDO-to-CIO for organizations consolidating, CDO-as-strategy for organizations where digital remains a separate mandate',
          ],
          trialNote: '30-day pilot. No credit card. Cancel any time.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
      />
    </>
  )
}

