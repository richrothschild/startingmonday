function withTimeout(ms = 12000) {
  return AbortSignal.timeout(ms)
}

function parseCsvRows(text) {
  const lines = String(text ?? '').split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((value) => value.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim())
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ?? ''
    })
    return row
  })
}

function normalizeNotice(record, stateCode) {
  const noticeId = String(
    record.notice_id
  ?? record.noticeid
      ?? record.id
      ?? record.case_number
      ?? record.case
      ?? ''
  ).trim()
  const employerName = String(
    record.employer_name
      ?? record.company
      ?? record.employer
      ?? record.business_name
      ?? ''
  ).trim()
  const sourceUrl = String(record.url ?? record.source_url ?? '').trim() || null
  const eventDateRaw = record.event_date ?? record.layoff_date ?? record.date ?? null
  const eventDate = eventDateRaw ? new Date(eventDateRaw).toISOString().slice(0, 10) : null
  const lossesRaw = record.job_losses ?? record.affected_workers ?? record.affected ?? null
  const jobLosses = lossesRaw !== null && lossesRaw !== '' ? Number(lossesRaw) : null

  if (!noticeId || !employerName) return null

  return {
    state_code: stateCode,
    notice_id: noticeId,
    employer_name: employerName,
    event_date: eventDate,
    job_losses: Number.isFinite(jobLosses) ? jobLosses : null,
    source_url: sourceUrl,
    raw_payload: record,
  }
}

function feedEnvVar(stateCode) {
  return `WARN_FEED_${stateCode}`
}

export async function fetchWarnNoticesForState(stateCode) {
  const upper = String(stateCode ?? '').trim().toUpperCase()
  if (!upper) return []

  const feedUrl = process.env[feedEnvVar(upper)]
  if (!feedUrl) return []

  try {
    const response = await fetch(feedUrl, { signal: withTimeout() })
    if (!response.ok) return []

    const contentType = (response.headers.get('content-type') ?? '').toLowerCase()
    let rows = []
    if (contentType.includes('application/json') || contentType.includes('+json')) {
      const payload = await response.json()
      rows = Array.isArray(payload) ? payload : (payload?.rows ?? payload?.data ?? [])
    } else {
      const text = await response.text()
      rows = parseCsvRows(text)
    }

    return rows
      .map((row) => normalizeNotice(row, upper))
      .filter(Boolean)
  } catch {
    return []
  }
}
