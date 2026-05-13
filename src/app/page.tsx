import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday - Signal intelligence for C-suite searches',
  description: 'Signal intelligence for C-suite technology searches. Spot opportunities before roles are broadly posted, then run a disciplined campaign with prep briefs and pipeline control.',
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
    title: 'Starting Monday - Signal intelligence for C-suite searches',
    description: 'Signal intelligence for C-suite technology searches. Spot opportunities before roles are broadly posted, then run a disciplined campaign with prep briefs and pipeline control.',
    url: 'https://startingmonday.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday - Signal intelligence for C-suite searches',
    description: 'Signal intelligence for C-suite technology searches. Spot opportunities before roles are broadly posted, then run a disciplined campaign with prep briefs and pipeline control.',
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
    id: 'building',
    headline: "I'm still in my role. The decision is made.",
    sub: 'Building my target list and warming up relationships before I announce anything.',
  },
  {
    id: 'vp-up',
    headline: "I'm ready for the next seat.",
    sub: 'VP to CIO. Director to VP. I have the record. Now I need the campaign.',
  },
  {
    id: 'monitor',
    headline: "I'm not searching yet. I want to monitor the market.",
    sub: 'Know which opportunities are forming before you need to act. No commitment. No noise.',
  },
  {
    id: 'selective',
    headline: "I left on my terms. I'm being selective.",
    sub: 'Finding the right seat, not the first available one. I want early signal and prep rigor.',
  },
  {
    id: 'returning',
    headline: 'I want to run a better search than last time.',
    sub: 'Sharper process. Earlier intelligence. Fewer reactive moments.',
  },
]

const FAQS: FAQ[] = [
  {
    question: 'How is this different from LinkedIn Premium?',
    answer: 'LinkedIn Premium gives you a better job board. Starting Monday makes your search more effective by surfacing company signals before roles are posted, generating prep briefs in about a minute, and helping you manage the relationships that matter across your pipeline. It complements executive coaching by powering the day-to-day campaign execution between sessions.',
  },
  {
    question: 'How do you surface signals before a role is posted?',
    answer: 'We monitor SEC 8-K filings, executive departure news, funding announcements, acquisition activity, PR wire, and company career pages for every company you track. When multiple signals cluster around a company, we flag it as a transition window. In most cases, that is weeks before any formal search begins.',
  },
  {
    question: 'Is my search confidential?',
    answer: 'Completely. We have no relationship with employers, search firms, or recruiters. Your account, your pipeline, and your activity are private. We do not sell leads. We do not train AI on your data. You can permanently delete your account and all associated data at any time from Settings.',
  },
  {
    question: 'What does the prep brief include?',
    answer: 'Your win thesis for that specific company. The objections they are likely to raise and how to counter each one. Questions that signal you understand the business at a peer level. What to leave out of the conversation entirely. Generated from your background, the role, and current company intelligence. Usually ready in about a minute.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Most users are tracking companies and receiving signals quickly after creating an account. Upload your resume, add target companies, and set your search level. The daily briefing starts the following morning.',
  },
  {
    question: 'Who is this built for?',
    answer: 'CIOs, CTOs, CISOs, CDOs, CPOs, COOs, and VP-level technology leaders making the move to the C-suite. Every AI output is calibrated to senior roles - the prep briefs, strategy, and advisor all operate at that altitude. It is not built for mid-level managers or general job seekers.',
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
          eyebrow: 'A disciplined search system for senior technology executives.',
          h1Lines: ['Be ready.', 'Be early.'],
          bodyPreamble: 'The strongest candidates do not wait for the market to tell them it is time to prepare.',
          body: 'Starting Monday helps you run the search before it becomes reactive: track target companies, spot movement worth acting on, prepare faster, and walk into the right conversation with a sharper point of view.',
          steps: [
            'Add your target companies.',
            'Set your search level and narrative.',
            'Wake up to your first briefing by morning.',
          ],
          trialNote: 'Free for 30 days. No credit card.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
        showPersonaSelector
      />
    </>
  )
}
