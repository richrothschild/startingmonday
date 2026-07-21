'use client'

import { useEffect, useState } from 'react'
import { greetingForHour } from '@/lib/date'

type LocalGreetingProps = {
  firstName: string
  /** Server-computed greeting, used for the initial render to avoid a hydration mismatch. */
  serverGreeting: string
}

/**
 * Renders "<greeting>, <firstName>." where the greeting matches the viewer's
 * actual local time. The server cannot know the browser timezone (users often
 * have no stored briefing_timezone, which otherwise falls back to UTC), so we
 * render the server value first and correct to the browser-local greeting after
 * mount. Initial client render equals the server HTML, so there is no hydration
 * warning.
 */
export function LocalGreeting({ firstName, serverGreeting }: LocalGreetingProps) {
  const [greeting, setGreeting] = useState(serverGreeting)

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()))
  }, [])

  return (
    <>
      {greeting}, {firstName}.
    </>
  )
}
