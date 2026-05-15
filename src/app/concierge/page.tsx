import type { Metadata } from 'next'
import { ConciergeWaitlist } from './concierge-waitlist'

export const metadata: Metadata = {
  title: 'Executive Concierge - Starting Monday',
  description: 'Full platform intelligence plus monthly strategy sessions with the founder. For C-suite executives in active search where getting it right is not optional. Application required.',
}

export default function ConciergePage() {
  return <ConciergeWaitlist />
}
