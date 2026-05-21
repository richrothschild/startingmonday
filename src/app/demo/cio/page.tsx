import type { Metadata } from 'next'
import { CioDemoClient } from './CioDemoClient'

export const metadata: Metadata = {
  title: 'Starting Monday | CIO Demo',
  description: 'A direct CIO-specific demo entry point for Starting Monday.',
  robots: { index: false, follow: false },
}

export default function CIODemoPage() {
  return <CioDemoClient />
}
