import { LandingPage } from '@/components/LandingPage'
import type { SituationCard } from '@/components/LandingPage'

export const metadata = {
  title: 'Starting Monday — For Active CIO/CTO Search',
  description: 'Campaign infrastructure for CIOs and CTOs in active search. Intelligence before roles are posted, precise relationship management, and preparation that wins the conversation.',
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to land at the right level, with the right organization.',
  },
  {
    id: 'executive',
    headline: 'I know exactly what I want.',
    sub: 'Targeted search. I need to move faster than the search firms.',
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
    id: 'board',
    headline: 'I want the next role to lead to a board seat.',
    sub: 'Running a CIO search and a board positioning campaign at the same time.',
  },
  {
    id: 'returning',
    headline: "I've been saying 'starting Monday' for months.",
    sub: 'This is the one that sticks.',
  },
]

export default function ForCioPage() {
  return (
    <LandingPage
      hero={{
        eyebrow: 'The best CIO mandates are created, not posted.',
        h1Lines: ["Your next mandate", "won't be", "announced."],
        body: "The best opportunities at your level surface through relationships and reputation, not job boards. The process is quiet, the timeline is compressed, and the candidate who walks in most prepared wins. Starting Monday is the campaign infrastructure for a search that needs to stay invisible until it is done.",
        note: 'Import your profile during setup. Operational in minutes.',
        steps: [
          'Track your target organizations — board changes, leadership gaps, transformation initiatives — before a search is ever authorized',
          'Manage every relationship and conversation with precision — nothing forgotten, nothing cold, nothing left to chance',
          'Walk in fully prepared — brief, positioning, and objection responses assembled in 60 seconds from their company and your actual record',
        ],
        trialNote: '30-day pilot. No credit card. Cancel any time.',
      }}
      situations={SITUATIONS}
    />
  )
}
