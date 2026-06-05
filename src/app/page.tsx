import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'
import { PHProvider } from '@/components/PosthogProvider'
import { getRolePathPriorityByCtaKey } from '@/lib/role-path-priority'

export const metadata: Metadata = {
  title: 'Starting Monday (startingmonday.app) - Signal intelligence for C-suite searches',
  description: 'Starting Monday (startingmonday.app) is the signal intelligence platform for C-suite technology searches. Improve search behavior, strengthen relationships, and land the right role with earlier market context and disciplined execution.',
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
    title: 'Starting Monday (startingmonday.app) - Signal intelligence for C-suite searches',
    description: 'Starting Monday (startingmonday.app) is the signal intelligence platform for C-suite technology searches. Improve search behavior, strengthen relationships, and land the right role with earlier market context and disciplined execution.',
    url: 'https://startingmonday.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday (startingmonday.app) - Signal intelligence for C-suite searches',
    description: 'Starting Monday (startingmonday.app) is the signal intelligence platform for C-suite technology searches. Improve search behavior, strengthen relationships, and land the right role with earlier market context and disciplined execution.',
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
    answer: 'LinkedIn Premium is a better job board. Starting Monday improves execution: earlier signals, better timing, and stronger follow-through between coaching sessions.',
  },
  {
    question: 'How do you surface signals before a role is posted?',
    answer: 'We track filings, leadership moves, funding, M&A news, and career pages for your target companies. When signals cluster, we flag a transition window before most formal searches start.',
  },
  {
    question: 'Is my search confidential?',
    answer: 'Yes. Your account and activity are private. We do not sell leads or train on your data, and you can permanently delete your account from Settings.',
  },
  {
    question: 'What does the prep brief include?',
    answer: 'A company-specific win thesis, likely objections, and peer-level questions. It is generated from your background, the role, and current company signals in about a minute.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Most users complete setup quickly: upload resume, add target companies, and set search level. Daily briefings begin the next morning.',
  },
  {
    question: 'Who is this built for?',
    answer: 'CIO/CTO/CISO-level and VP technology leaders moving toward the C-suite. It is built for senior searches, not general job hunting.',
  },
]

const PROOF_HIGHLIGHTS = [
  {
    metric: '81% reached first interview in 30 days',
    detail: 'Directional pilot signal from Jan-May 2026 cohort (n=27) for executive transition workflows.',
  },
  {
    metric: 'Board and search-firm readiness in one workflow',
    detail: 'Signal monitoring, narrative control, and prep briefs run in a single operating cadence.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://startingmonday.app/#organization',
      name: 'Starting Monday',
      alternateName: ['StartingMonday', 'startingmonday.app'],
      url: 'https://startingmonday.app',
      logo: 'https://startingmonday.app/icon.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://startingmonday.app/#website',
      url: 'https://startingmonday.app',
      name: 'Starting Monday',
      alternateName: ['StartingMonday', 'startingmonday.app'],
      publisher: { '@id': 'https://startingmonday.app/#organization' },
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
      isPartOf: { '@id': 'https://startingmonday.app/#website' },
      description: 'Pipeline tracking, company intelligence, and AI-powered interview prep for senior executives in active search.',
    },
  ],
}

export default async function HomePage() {
  const rolePathPriorityByCtaKey = await getRolePathPriorityByCtaKey()

  return (
    <PHProvider>
      <JsonLd data={jsonLd} />
      <EmiMarketingTelemetry pageSlug="/" personaSegment="executives" />
      <LandingPage
        hero={{
          eyebrow: 'You are not behind on talent.',
          h1Lines: ['You are behind on timing, narrative, and prep.'],
          claimMethodLabel: 'Method and evidence →',
          claimMethodHref: '/method-and-evidence',
          claimEvidenceLabel: 'Evidence room →',
          claimEvidenceHref: '/evidence-room',
          body: 'Win with Starting Monday today.',
          steps: [
            'Track the companies where your next role is most likely to emerge.',
            'Set your level and narrative once. Keep your search private by default.',
            'Act early on signal changes and walk into conversations prepared.',
          ],
          trialNote: 'Free for 30 days. No credit card. No employer visibility.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
        proofHighlights={PROOF_HIGHLIGHTS}
        showPersonaSelector
        rolePathPriorityByCtaKey={rolePathPriorityByCtaKey}
      />
    </PHProvider>
  )
}
