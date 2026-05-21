import type { Metadata } from 'next'
import { CioPresentationClient } from './CioPresentationClient'

export const metadata: Metadata = {
  title: 'Starting Monday | Kenneth Kicia Demo',
  description: 'Presentation page tailored to Kenneth Kicia and Florida public-sector CIO context.',
  robots: { index: false, follow: false },
}

export default function CIODemoPage() {
  return <CioPresentationClient />
}
