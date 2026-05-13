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
    answer: 'LinkedIn Premium gives you a better job board. Starting Monday monitors company signals before roles are posted, builds prep briefs in about a minute, and tracks your full pipeline across every conversation. It is the infrastructure between a job board and a $25,000 coaching engagement.',
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
          eyebrow: 'Signal intelligence for C-suite technology searches.',
          h1Lines: ['Spot executive opportunities', '1\u20133 weeks before they post.'],
          claimMethodLabel: 'How we estimate the timing window (method and sources)',
          claimMethodHref: '/blog/how-we-estimate-early-role-signals',
          body: 'Starting Monday monitors target companies every 48 hours, flags early search signals, and gives you prep briefs plus pipeline control so you run a disciplined campaign before the field forms. Timing varies by company and sector.',
          note: 'Monitor $49/mo · Active $199/mo · Executive $499/mo · Free 30-day trial',
          steps: [
            'Add your target companies.',
            'Upload your resume.',
            'Your first briefing is ready by morning.',
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
