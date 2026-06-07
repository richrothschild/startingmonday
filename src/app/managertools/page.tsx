import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { FAQ, SituationCard } from '@/components/LandingPage'
import { PHProvider } from '@/components/PosthogProvider'

export const metadata: Metadata = {
  title: 'Starting Monday for the Manager Tools Community',
  description: 'A warmer, discipline-first search operating system for the Manager Tools community. Get 90 days free, keep your search private, and share feedback to shape the cohort experience.',
  alternates: { canonical: 'https://startingmonday.app/managertools' },
  openGraph: {
    title: 'Starting Monday for the Manager Tools Community',
    description: 'Manager Tools members get 90 days free with private-by-default search support and a direct feedback loop.',
    url: 'https://startingmonday.app/managertools',
    type: 'website',
  },
}

const MANAGER_TOOLS_SITUATIONS: SituationCard[] = [
  {
    id: 'managertools-community',
    headline: 'Manager Tools members running an executive search.',
    sub: 'Structured weekly cadence with calmer execution and better timing windows.',
  },
]

const MANAGER_TOOLS_FAQS: FAQ[] = [
  {
    question: 'What is special for the Manager Tools cohort?',
    answer: 'Manager Tools members get 90 days free, private-by-default search operations, and a direct feedback loop with the Starting Monday team.',
  },
  {
    question: 'How should I share feedback?',
    answer: 'Please use the in-product feedback form after signup or reply to cohort emails so we can improve quickly based on your experience.',
  },
]

export default function ManagerToolsPage() {
  return (
    <PHProvider>
      <LandingPage
        sourcePage="/managertools"
        hero={{
          eyebrow: 'Manager Tools community: we are glad you are here.',
          h1Lines: ['Run your executive search with calm, consistent momentum.'],
          body: 'Built for Manager Tools members: better timing, clearer narrative, steady weekly execution. Use it, pressure-test it, and tell us what to improve.',
          trialNote: 'Manager Tools members get 90 days free. No credit card. No employer visibility.\nPlease submit your feedback so we can improve this experience quickly.',
        }}
        situations={MANAGER_TOOLS_SITUATIONS}
        faqs={MANAGER_TOOLS_FAQS}
        proofHighlights={[{ metric: 'Manager Tools cohort', detail: 'Warm onboarding, private-by-default execution, and feedback-driven iteration.' }]}
      />
    </PHProvider>
  )
}
