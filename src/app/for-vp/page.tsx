import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'

export const metadata = {
  title: 'Starting Monday — For VPs Making the Move to CIO',
  description: 'The campaign infrastructure for technology leaders ready to move from VP to CIO. Position yourself at the right altitude, prepare for search firm conversations, and stay ahead of the market.',
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

export default function ForVpPage() {
  return (
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
  )
}
