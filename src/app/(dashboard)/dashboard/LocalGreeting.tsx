'use client'

import { useSyncExternalStore } from 'react'
import { greetingForHour } from '@/lib/date'

type LocalGreetingProps = {
  firstName: string
  /** Server-computed greeting, used for the hydration render to avoid a mismatch. */
  serverGreeting: string
}

// The greeting only depends on the browser's wall clock, which never changes
// underneath us mid-session in a way we need to react to, so there is nothing
// to subscribe to.
const subscribe = () => () => {}

/**
 * Renders "<greeting>, <firstName>." where the greeting matches the viewer's
 * actual local time. The server cannot know the browser timezone (users often
 * have no stored briefing_timezone, which otherwise falls back to UTC), so
 * useSyncExternalStore renders the server greeting during hydration (matching
 * the server HTML) and then the browser-local greeting on the client. This
 * avoids both a hydration mismatch and the "setState in effect" cascade.
 */
export function LocalGreeting({ firstName, serverGreeting }: LocalGreetingProps) {
  const greeting = useSyncExternalStore(
    subscribe,
    () => greetingForHour(new Date().getHours()),
    () => serverGreeting,
  )

  return (
    <>
      {greeting}, {firstName}.
    </>
  )
}
