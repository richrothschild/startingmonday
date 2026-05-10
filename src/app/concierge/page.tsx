import type { Metadata } from 'next'
import { ConciergeWaitlist } from './concierge-waitlist'

export const metadata: Metadata = {
  title: 'Executive Concierge — Starting Monday',
  description: 'Monthly strategy sessions for C-suite executives in active search. Platform access plus a direct line to the founder. Coming soon — join the waitlist.',
  robots: { index: false },
}

export default function ConciergePage() {
  return <ConciergeWaitlist />
}
