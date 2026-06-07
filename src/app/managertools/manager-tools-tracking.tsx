'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'

type SignupLinkProps = {
  href: string
  className?: string
  location: 'nav' | 'hero'
  children: React.ReactNode
}

export function ManagerToolsTrackingBeacon() {
  const posthog = usePostHog()

  useEffect(() => {
    posthog?.capture('managertools_landing_view', {
      page: '/managertools',
      campaign: 'horstman-june2026',
      source: 'managertools',
      medium: 'newsletter',
    })
  }, [posthog])

  return null
}

export function ManagerToolsSignupLink({ href, className, location, children }: SignupLinkProps) {
  const posthog = usePostHog()

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        posthog?.capture('signup_initiated', {
          method: 'landing_cta',
          source: 'managertools',
          medium: 'newsletter',
          campaign: 'horstman-june2026',
          location,
        })
      }}
    >
      {children}
    </Link>
  )
}
