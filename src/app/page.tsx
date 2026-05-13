import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Starting Monday - Signal intelligence for C-suite searches',
  description: 'Starting Monday monitors target companies every 48 hours and surfaces signals before a search is formalized. Built for C-suite executives who run a disciplined campaign. Free 30-day trial.',
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
    description: 'Starting Monday monitors target companies every 48 hours and surfaces signals before a search is formalized. Built for C-suite executives who run a disciplined campaign.',
    url: 'https://startingmonday.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday - Signal intelligence for C-suite searches',
    description: 'Starting Monday monitors target companies every 48 hours and surfaces signals before a search is formalized. Built for C-suite executives who run a disciplined campaign.',
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
    id: 'building',
    headline: "I'm still in my role. The decision is made.",
    sub: 'Building my target list and warming up relationships before I announce anything.',
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
  {
    id: 'low-energy',
    headline: "I know I need to do this. I don't have the energy to start.",
    sub: 'One thing at a time. The system does the heavy lifting.',
  },
  {
    id: 'optionality',
    headline: "I'm not searching. I just want to know what's out there.",
    sub: "Before I have to. Monitor the market without committing to a campaign.",
  },
]

const FAQS: FAQ[] = [
  {
    question: 'How is this different from LinkedIn Premium?',
    answer: 'LinkedIn Premium gives you a better job board. Starting Monday monitors company signals before roles are posted, builds prep briefs in 60 seconds, and tracks your full pipeline across every conversation. It is the infrastructure between a job board and a $25,000 coaching engagement.',
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
    answer: 'Your win thesis for that specific company. The objections they are likely to raise and how to counter each one. Questions that signal you understand the business at a peer level. What to leave out of the conversation entirely. Generated from your background, the role, and current company intelligence. Ready in 60 seconds.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Most users are tracking companies and receiving signals within 15 minutes of creating an account. Upload your resume, add target companies, and set your search level. The daily briefing starts the following morning.',
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
          eyebrow: 'For C-suite executives in active search.',
          h1Lines: ["The role was never posted.", "You found it anyway."],
          bodyPreamble: "Most executives in active search won't tell anyone they're looking. Not their peers. Not their network. Not even their closest contacts.",
          body: "Most executive roles are filled before they are ever posted. Starting Monday monitors target companies every 48 hours and surfaces signals before a search opens. You move before the field forms.",
          note: 'Pricing starts at $49/mo. Active campaigns are $199/mo. Executive plans are $499/mo.',
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
