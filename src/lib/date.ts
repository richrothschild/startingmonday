// en-CA locale formats dates as YYYY-MM-DD, matching the DB date column format.
export function todayInTz(tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
}

// Maps a 24h hour to a time-of-day greeting. Shared by the server-side
// greetingInTz fallback and the client-side LocalGreeting component so both
// use identical thresholds.
export function greetingForHour(hour: number): string {
  // hour12: false can yield 24 at midnight in some environments; normalize.
  const h = ((hour % 24) + 24) % 24
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function greetingInTz(tz: string): string {
  const hour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(new Date()),
    10
  )
  return greetingForHour(hour)
}

export function fullDateInTz(tz: string): string {
  return new Date().toLocaleDateString('en-US', {
    timeZone: tz,
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}
