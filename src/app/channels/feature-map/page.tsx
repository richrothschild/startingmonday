import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ChannelFeatureMapClient } from './ChannelFeatureMapClient'

export const metadata: Metadata = {
  title: 'Channel Feature Map | Starting Monday',
  description:
    'Explore channel-specific features, workflow timing, and outcomes with a visual operating timeline.',
  alternates: { canonical: 'https://startingmonday.app/channels/feature-map' },
}

export default function ChannelFeatureMapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <ChannelFeatureMapClient />
    </Suspense>
  )
}
