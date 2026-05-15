'use client'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import type { ComponentPropsWithoutRef } from 'react'

type Props = ComponentPropsWithoutRef<typeof Link> & {
  event: string
  properties?: Record<string, string | number | boolean | null>
}

export function TrackLink({ event, properties, onClick, children, ...props }: Props) {
  const ph = usePostHog()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    try {
      ph?.capture(event, properties ?? {})
    } catch {
      // never block navigation
    }
    onClick?.(e)
  }

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  )
}
