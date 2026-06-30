import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import { getRolePathPriorityByCtaKey } from '@/lib/role-path-priority'

export const metadata: Metadata = {
  title: 'Starting Monday - Be on the shortlist before the role is posted',
  description: 'Starting Monday helps senior executives find likely-to-open roles early, identify the people shaping the shortlist, and take the next relationship action before the posting goes public.',
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
    title: 'Starting Monday - Be on the shortlist before the role is posted',
    description: 'Find likely-to-open executive roles early, map the decision path, and act before the shortlist is crowded.',
    url: 'https://startingmonday.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday - Be on the shortlist before the role is posted',
    description: 'Find likely-to-open executive roles early, map the decision path, and act before the shortlist is crowded.',
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
    question: 'I already have a strong network. How does this add value?',
    answer: 'Most strong networks are reactive: you know who to call when you need something. Starting Monday makes them proactive: you know when to call, what to say, and which relationships to prioritize before the market moves. Your network is an asset. This makes it strategic.',
  },
  {
    question: 'Is this really different from doing this myself?',
    answer: 'The pieces exist: LinkedIn, company research, conversation prep. What differs is timing and discipline. Starting Monday surfaces opportunities before they are public, flags which relationships matter most, and structures execution so you don\'t lose momentum between conversations. You move earlier. You move with more certainty.',
  },
  {
    question: 'Is my search completely private?',
    answer: 'Completely. No employer visibility, no recruiter access to your data, no sale of information. We do not monetize your search. You own everything you enter, and you can delete your entire account whenever you choose.',
  },
  {
    question: 'Will this add to my workload?',
    answer: 'No. A daily three-minute brief and one weekly update. That\'s it. The system is built around executives already in motion. It reduces cognitive load by centralizing signal, timing, and execution tracking in one place.',
  },
  {
    question: 'What does it cost?',
    answer: 'Forty-nine dollars monthly, or free for your first thirty days. No credit card required, cancel anytime. Designed to fit the search window, not to lock you into long contracts.',
  },
  {
    question: 'How do I know I can trust this?',
    answer: 'The platform was built by search leaders who ran their own campaigns against the same constraints you face. It\'s grounded in research with executives at Fortune 500, private equity, and venture firms. Read the evidence hub to see the research backing the approach.',
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

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const variantParam = Array.isArray(resolvedSearchParams?.lp_variant)
    ? resolvedSearchParams.lp_variant[0]
    : resolvedSearchParams?.lp_variant
  const experimentVariant = variantParam === 'proof_first' ? 'proof_first' : 'control'
  const rolePathPriorityByCtaKey = await getRolePathPriorityByCtaKey()

  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage
        hero={{
          eyebrow: 'Find the role first. Find the decision-makers. Start before it posts.',
          h1Lines: ['Be on the shortlist before the role is posted.'],
          claimMethodLabel: '',
          claimMethodHref: '',
          claimEvidenceLabel: 'Evidence Hub for leaders and their partners ->',
          claimEvidenceHref: '/evidence-hub#early-signals',
          bodyPreamble: 'For senior leaders who win through timing and relationships, not job boards.',
          body: 'Reputation opens doors. Timing decides outcomes. Starting Monday gives you an early view of likely-to-open roles and a clear map of the people who will influence the hire.',
          competitiveEdge: '',
          steps: [
            'See likely-to-open roles before most candidates know they exist.',
            'Identify the decision-path people who shape the shortlist.',
            'Take the next relationship action while timing is still on your side.',
          ],
          trialNote: 'Private by default: visible only to you and explicitly invited collaborators. Free for 30 days. No credit card. No employer visibility.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
        showPersonaSelector
        rolePathPriorityByCtaKey={rolePathPriorityByCtaKey}
        experimentVariant={experimentVariant}
      />
    </>
  )
}

