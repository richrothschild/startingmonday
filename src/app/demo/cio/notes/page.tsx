import type { Metadata } from 'next'
import { CioNotesClient } from '../CioNotesClient'

export const metadata: Metadata = {
  title: 'Starting Monday | Kenneth Talking Points',
  description: 'Kenneth-specific talking points, objections, pilot framing, and negotiation scripts.',
  robots: { index: false, follow: false },
}

export default function CioNotesPage() {
  return <CioNotesClient />
}
