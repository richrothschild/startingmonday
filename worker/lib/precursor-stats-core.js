// Pure aggregation core for precursor statistics. No DB dependencies.

// Laplace-smoothed hit rate: (preceded + 1) / (total + 2). Keeps small-n
// cells away from 0/1 extremes.
export function laplaceRate(preceded, total) {
  return (preceded + 1) / (total + 2)
}

export function median(values) {
  if (!values?.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

// Aggregates labeled events into precursor stat rows across three dimension
// sets: (event_type), (event_type, sector), (event_type, role_family).
//
// events: [{ id, event_type, sector }]
// labelsByEvent: Map<eventId, [{ days_to_opening, role_family }]>
//   (labels already filtered to the window and to countable openings)
export function aggregatePrecursorStats(events, labelsByEvent, { windowDays = 90 } = {}) {
  const cells = new Map() // key -> { event_type, sector, role_family, n_events, n_preceded, days: [] }

  function bump(key, dims, preceded, days) {
    if (!cells.has(key)) {
      cells.set(key, { ...dims, n_events: 0, n_preceded: 0, days: [] })
    }
    const cell = cells.get(key)
    cell.n_events += 1
    if (preceded) {
      cell.n_preceded += 1
      if (days !== null) cell.days.push(days)
    }
  }

  for (const event of events ?? []) {
    const labels = labelsByEvent.get(event.id) ?? []
    const preceded = labels.length > 0
    const minDays = preceded ? Math.min(...labels.map(l => l.days_to_opening)) : null

    // Overall dimension.
    bump(`t|${event.event_type}`, { event_type: event.event_type, sector: null, role_family: null }, preceded, minDays)

    // Sector dimension.
    if (event.sector) {
      bump(
        `ts|${event.event_type}|${event.sector}`,
        { event_type: event.event_type, sector: event.sector, role_family: null },
        preceded,
        minDays,
      )
    }

    // Role-family dimension: numerator is family-specific, denominator is all
    // events of this type — P(opening of family F within window | event).
    const families = new Set(labels.map(l => l.role_family).filter(Boolean))
    for (const family of ['leadership', 'technical_leadership', 'delivery_leadership']) {
      const familyLabels = labels.filter(l => l.role_family === family)
      const familyPreceded = familyLabels.length > 0
      const familyDays = familyPreceded ? Math.min(...familyLabels.map(l => l.days_to_opening)) : null
      bump(
        `tf|${event.event_type}|${family}`,
        { event_type: event.event_type, sector: null, role_family: family },
        familyPreceded,
        familyDays,
      )
    }
    void families
  }

  return [...cells.values()].map(cell => ({
    event_type: cell.event_type,
    sector: cell.sector,
    role_family: cell.role_family,
    window_days: windowDays,
    n_events: cell.n_events,
    n_preceded: cell.n_preceded,
    hit_rate: Number(laplaceRate(cell.n_preceded, cell.n_events).toFixed(4)),
    median_days_to_opening: median(cell.days),
  }))
}
