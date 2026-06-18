export function normalizeEmail(value: unknown): string {
  return (value ?? '').toString().trim().toLowerCase()
}

export function pacificTodayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

export function addBusinessDays(isoDate: string, businessDays: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  let remaining = businessDays
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1)
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) remaining -= 1
  }
  return d.toISOString().slice(0, 10)
}

export function buildGoogleCalendarUrl(input: { title: string; details: string; dateISO: string }): string {
  const start = `${input.dateISO.replace(/-/g, '')}T170000Z`
  const endDate = new Date(`${input.dateISO}T00:00:00Z`)
  endDate.setUTCDate(endDate.getUTCDate() + 1)
  const end = `${endDate.toISOString().slice(0, 10).replace(/-/g, '')}T000000Z`
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  const q = new URLSearchParams({
    text: input.title,
    dates: `${start}/${end}`,
    details: input.details,
  })
  return `${base}&${q.toString()}`
}
