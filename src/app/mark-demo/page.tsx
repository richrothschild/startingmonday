import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DemoContent } from '@/app/demo/page'

export const metadata: Metadata = {
  title: 'Starting Monday | Private Demo',
  description: 'Private review demo — full prep brief generation with no email gate.',
  robots: { index: false, follow: false },
}

export default function MarkDemoPage() {
  return (
    <Suspense fallback={null}>
      <DemoContent bypassGate />
    </Suspense>
  )
}
