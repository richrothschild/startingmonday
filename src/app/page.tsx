import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'

export const metadata = {
  title: 'Starting Monday — AI Career Platform for Senior Professionals',
  description: 'Pipeline tracking, automated company monitoring, and elite interview prep for executives and senior professionals in active search.',
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
    id: 'restructured',
    headline: 'My role was restructured.',
    sub: 'I know my worth. I want to land at the right level, not just the next one.',
  },
  {
    id: 'passive',
    headline: "I'm not looking — but Sunday nights feel different.",
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
]

export default function HomePage() {
  return (
    <LandingPage
      hero={{
        eyebrow: 'At this level, the search is a campaign, not an application.',
        h1Lines: ["Your next role", "isn’t on a", "job board."],
        body: "The best roles at your level are filled before they’re posted. We watch your target companies, surface roles before they go public, and have your brief ready before the first call.",
        note: 'Import your LinkedIn profile during setup. Operational in minutes.',
        steps: [
          'Add your target companies — we check their career pages three times a week, before roles go public',
          'Build your intelligence picture — track contacts, log every conversation, watch for signals before a role is even authorized',
          'Generate a tailored prep brief in 60 seconds, built from their company and your actual background',
        ],
        trialNote: 'Free for 30 days. No credit card.',
      }}
      situations={SITUATIONS}
      showPersonaSelector
    />
  )
}
