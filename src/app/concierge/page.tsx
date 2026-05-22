import type { Metadata } from 'next'
import Link from 'next/link'
import { ConciergeWaitlist } from './concierge-waitlist'

export const metadata: Metadata = {
  title: 'Executive Concierge - Starting Monday',
  description: 'Full platform intelligence plus monthly strategy sessions with the founder. For C-suite executives in active search where getting it right is not optional. Application required.',
}

export default function ConciergePage() {
  return (
    <>
      <section className="sr-only" aria-label="Executive concierge summary">
        <h1>Executive concierge application</h1>
        <p>Trust and confidentiality: application details remain private and are used only for concierge enrollment review.</p>
        <p>Outcome: accepted members typically reduce preparation and decision drift by 30% with monthly strategy sessions and full search execution support.</p>
        <Link href="/demo">Get started with the product demo</Link>
      </section>
      <ConciergeWaitlist />
    </>
  )
}
