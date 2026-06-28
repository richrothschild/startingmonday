'use client'

import { useEffect, useState } from 'react'
import { fullDateInTz, greetingInTz } from '@/lib/date'

type DashboardGreetingBlockProps = {
  firstName: string
  briefingTimezone: string | null
}

export function DashboardGreetingBlock({ firstName, briefingTimezone }: DashboardGreetingBlockProps) {
  const [effectiveTimeZone, setEffectiveTimeZone] = useState(() => briefingTimezone ?? 'UTC')

  useEffect(() => {
    if (!briefingTimezone) {
      setEffectiveTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
  }, [briefingTimezone])

  const greeting = greetingInTz(effectiveTimeZone)
  const today = fullDateInTz(effectiveTimeZone)

  return (
    <>
      <p className="text-[13px] font-semibold text-orange-300 mb-2">This week&apos;s operating rhythm</p>
      <h1 className="text-[26px] sm:text-[32px] font-bold text-white leading-tight">
        {greeting}, {firstName}.
      </h1>
      <p className="text-[13px] text-slate-300 mt-1.5">{today}</p>
    </>
  )
}