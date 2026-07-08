'use client'

import { useEffect } from 'react'

export function FirstRunSeenCookie() {
  useEffect(() => {
    document.cookie = 'sm_first_run_seen=1; Path=/; Max-Age=31536000; SameSite=Lax'
  }, [])

  return null
}
