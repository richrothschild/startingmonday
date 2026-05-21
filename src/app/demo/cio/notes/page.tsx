import type { Metadata } from 'next'
import { CioNotesClient } from '../CioNotesClient'

export const metadata: Metadata = {
  title: 'Starting Monday | CIO Talking Points',
  description: 'Talking points, objections, pilot framing, and negotiation scripts for the CIO demo.',
  robots: { index: false, follow: false },
}

export default function CioNotesPage() {
  return <CioNotesClient />
}
