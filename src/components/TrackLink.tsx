'use client'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import type { ComponentPropsWithoutRef } from 'react'
import { withDeterministicVariant } from '@/lib/experiment-variants'

type Props = ComponentPropsWithoutRef<typeof Link> & {
  event: string
  properties?: Record<string, string | number | boolean | null>
  logToUserEvents?: boolean
}

export function TrackLink({ event, properties, onClick, children, logToUserEvents = false, ...props }: Props) {
  const ph = usePostHog()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const enrichedProperties = withDeterministicVariant(properties, ph?.get_distinct_id?.())

    try {
      ph?.capture(event, enrichedProperties)
    } catch {
      // never block navigation
    }

    if (logToUserEvents) {
      try {
        void fetch('/api/events/channel-funnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, properties: enrichedProperties }),
          keepalive: true,
        })
      } catch {
        // never block navigation
      }
    }

    onClick?.(e)
  }

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  )
}
