'use client'

import dynamic from 'next/dynamic'

const HowStartingMondayHelpsModal = dynamic(
  () => import('@/components/HowStartingMondayHelpsModal').then((mod) => mod.HowStartingMondayHelpsModal),
  { ssr: false }
)

export function DeferredHowStartingMondayHelpsModal({ sourcePage }: { sourcePage?: string }) {
  return <HowStartingMondayHelpsModal sourcePage={sourcePage} />
}