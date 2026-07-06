import * as XLSX from 'xlsx'
import { createHash } from 'node:crypto'

function withTimeout(ms = 12000) {
  return AbortSignal.timeout(ms)
}

function parseCsvRows(text) {
  const lines = String(text ?? '').split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const parseCsvLine = (line) => {
    const out = []
    let cur = ''
    let inQuotes = false
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index]
      if (char === '"') {
        const next = line[index + 1]
        if (inQuotes && next === '"') {
          cur += '"'
          index += 1
          continue
        }
        inQuotes = !inQuotes
        continue
      }
      if (char === ',' && !inQuotes) {
        out.push(cur.trim())
        cur = ''
        continue
      }
      cur += char
    }
    out.push(cur.trim())
    return out
  }

  const headers = parseCsvLine(lines[0]).map((value) => value.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ?? ''
    })
    return row
  })
}

function parseExcelRows(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const firstSheet = workbook.SheetNames[0]
  if (!firstSheet) return []
  const sheet = workbook.Sheets[firstSheet]
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

function coalesce(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const normalized = String(value).trim()
    if (normalized) return normalized
  }
  return ''
}

function stableNoticeId(stateCode, ...parts) {
  const base = parts
    .map((value) => String(value ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join('|')
  if (!base) return ''
  const digest = createHash('sha1').update(base).digest('hex').slice(0, 16)
  return `${stateCode}-${digest}`
}

function parseDateValue(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') {
    // Excel serial dates count days from 1899-12-30.
    const excelEpochUtc = Date.UTC(1899, 11, 30)
    const millis = excelEpochUtc + Math.round(value * 24 * 60 * 60 * 1000)
    const parsedDate = new Date(millis)
    if (!Number.isFinite(parsedDate.getTime())) return null
    return parsedDate.toISOString().slice(0, 10)
  }
  const text = String(value).trim()
  if (!text) return null
  const parsedDate = new Date(text)
  if (!parsedDate || !Number.isFinite(parsedDate.getTime())) return null
  return parsedDate.toISOString().slice(0, 10)
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function toWholeNumber(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const text = String(value).trim()
  if (!text) return null

  // Keep thousands separators for a single numeric token, but do not merge
  // separate numbers (e.g. values with dashes/spaces between distinct tokens).
  const firstTokenMatch = text.match(/-?\d[\d,]*/)
  if (!firstTokenMatch) return null

  const cleaned = firstTokenMatch[0].replace(/,/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function withNormalizedKeys(record) {
  const out = { ...record }
  for (const [key, value] of Object.entries(record ?? {})) {
    const normalizedKey = key
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    if (normalizedKey && out[normalizedKey] === undefined) {
      out[normalizedKey] = value
    }
  }

  // Common state feed aliases (especially NC/GA downloads)
  out.notice_id = coalesce(
    out.notice_id,
    out.noticeid,
    out.id,
    out.case_number,
    out.case,
    out.warn_number,
    out.ga_warn_id,
    out.entry_id,
    out.warn_id
  )
  out.employer_name = coalesce(
    out.employer_name,
    out.company,
    out.employer,
    out.business_name,
    out.warn_notice_warn_notice_name,
    out.company_name,
    out.location,
    out.employer_business_name
  )
  out.event_date = coalesce(
    out.event_date,
    out.layoff_date,
    out.date,
    out.submitted_date,
    out.warn_received,
    out.warn_notice_received,
    out.first_layoff_date,
    out.notification_date_s,
    out.notice_received_date
  )
  out.job_losses = coalesce(
    out.job_losses,
    out.affected_workers,
    out.affected,
    out.total_number_of_affected_employees,
    out.cumulative_scheduled_layoff,
    out.employees_affected,
    out.number_of_employees
  )
  out.source_url = coalesce(out.source_url, out.url, out.notice_url)

  return out
}

async function fetchGATableRows(feedUrl) {
  const parsed = new URL(feedUrl)
  const basePayload = new URLSearchParams(parsed.search)
  const endpoint = parsed.origin + parsed.pathname
  const rows = []
  const pageLength = 100
  let draw = 1
  let start = 0
  let totalRecords = Infinity

  while (start < totalRecords && draw <= 40) {
    const payload = new URLSearchParams(basePayload)
    payload.set('draw', String(draw))
    payload.set('start', String(start))
    payload.set('length', String(pageLength))

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
      },
      body: payload,
      signal: withTimeout(),
    })

    if (!response.ok) break
    const rawText = await response.text()
    const payloadJson = rawText ? JSON.parse(rawText) : null
    const pageRows = Array.isArray(payloadJson?.data) ? payloadJson.data : []
    const recordsTotal = Number(payloadJson?.recordsTotal ?? payloadJson?.recordsFiltered ?? 0)
    if (Number.isFinite(recordsTotal) && recordsTotal > 0) {
      totalRecords = recordsTotal
    }

    if (!pageRows.length) break
    rows.push(...pageRows)

    if (pageRows.length < pageLength) break
    start += pageRows.length
    draw += 1
  }

  return rows.map((row) => {
    const rowValue = Array.isArray(row) ? row : row && typeof row === 'object' ? row : {}
    const rawIdCell = rowValue[0] ?? rowValue['0'] ?? ''
    const companyCell = rowValue[1] ?? rowValue['1'] ?? ''
    const dateCell = rowValue[2] ?? rowValue['2'] ?? ''
    const lossesCell = rowValue[3] ?? rowValue['3'] ?? ''

    const rawId = stripHtml(rawIdCell)
    const companyName = stripHtml(companyCell)
    const submittedDate = stripHtml(dateCell)
    const affectedEmployees = stripHtml(lossesCell)
    const detailLinkMatch = String(rawIdCell).match(/href=["']([^"']+)["']/i)
    const markerUrl = Array.isArray(rowValue?.gv_marker)
      ? rowValue.gv_marker[0]?.url
      : ''
    const sourceUrl = coalesce(
      detailLinkMatch?.[1] ? new URL(detailLinkMatch[1], 'https://www.tcsg.edu').toString() : '',
      markerUrl
    )
    return {
      notice_id: coalesce(rawId, stableNoticeId('GA', companyName, submittedDate, affectedEmployees, sourceUrl)),
      employer_name: companyName,
      event_date: submittedDate,
      job_losses: toWholeNumber(affectedEmployees),
      source_url: sourceUrl,
    }
  })
}

async function fetchOhioCsvRows(feedUrl) {
  let csvUrl = ''
  const currentYear = new Date().getUTCFullYear()
  const fallbackYears = [currentYear + 1, currentYear, currentYear - 1]
  for (const year of fallbackYears) {
    const candidate = `https://dam.assets.ohio.gov/raw/upload/jfs.ohio.gov/${year}/${year}-warn-notice.csv`
    const candidateResponse = await fetch(candidate, { signal: withTimeout() })
    if (candidateResponse.ok) {
      csvUrl = candidate
      break
    }
  }

  if (!csvUrl) {
    const pageResponse = await fetch(feedUrl, {
      signal: withTimeout(),
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
    })

    if (pageResponse.ok) {
      const html = await pageResponse.text()
      const csvUrlMatch = html.match(/https:\/\/dam\.assets\.ohio\.gov\/raw\/upload\/[^\s"'<>]*warn-notice\.csv/i)
      if (csvUrlMatch?.[0]) {
        csvUrl = csvUrlMatch[0]
      } else {
        const htmlRows = parseOhioRowsFromHtml(html, feedUrl)
        if (htmlRows.length > 0) return htmlRows
      }
    }
  }

  if (!csvUrl) return []

  const csvResponse = await fetch(csvUrl, { signal: withTimeout() })
  if (!csvResponse.ok) return []

  const csvText = await csvResponse.text()
  const csvLines = String(csvText).split(/\r?\n/)
  const headerLineIndex = csvLines.findIndex((line) => /^Company\s*,\s*Date Received\s*,\s*URL\s*,/i.test(line.trim()))
  if (headerLineIndex < 0) return []
  const rows = parseCsvRows(csvLines.slice(headerLineIndex).join('\n'))
  return rows.map((row) => {
    const employer = coalesce(row.company)
    const sourceUrl = coalesce(row.url)
    const eventDate = parseDateValue(row['layoff date(s)'] ?? row['date received'])
    const losses = toWholeNumber(row['potential number affected'])
    const noticeId = stableNoticeId('OH', employer, sourceUrl, row['date received'])
    return {
      notice_id: noticeId,
      employer_name: employer,
      event_date: eventDate,
      job_losses: losses,
      source_url: sourceUrl || null,
      raw_state_record_type: 'oh_warn_csv',
    }
  })
}

function mapIllinoisRows(rows) {
  return rows.map((row) => {
    const employer = coalesce(row['COMPANY NAME:'], row.company_name, row.company)
    const receivedDate = row['WARN RECEIVED DATE:']
    const firstLayoffDate = row['FIRST LAYOFF DATE:']
    const endingLayoffDate = row['ENDING LAYOFF DATE:']
    const workersAffected = row['WORKERS AFFECTED:']
    const cityStateZip = coalesce(row['CITY, STATE, ZIP:'])
    const companyAddress = coalesce(row['COMPANY ADDRESS:'])
    const rawId = stableNoticeId('IL', employer, parseDateValue(receivedDate), parseDateValue(firstLayoffDate), workersAffected, cityStateZip)

    return {
      notice_id: rawId,
      employer_name: employer,
      event_date: parseDateValue(firstLayoffDate) ?? parseDateValue(endingLayoffDate) ?? parseDateValue(receivedDate),
      job_losses: toWholeNumber(workersAffected),
      source_url: null,
      company_address: companyAddress,
      city_state_zip: cityStateZip,
      raw_state_record_type: 'il_warn_xlsx',
    }
  })
}

function mapNewJerseyRows(rows) {
  return rows.map((row) => {
    const employer = coalesce(row.Company, row.company, row.employer_name)
    const effectiveDate = row['Effective Date']
    const workforceAffected = row['Workforce Affected']
    const city = coalesce(row.City, row.city)
    const monthPosted = coalesce(row['Month Posted'], row.month_posted)
    const rawId = stableNoticeId('NJ', employer, parseDateValue(effectiveDate), workforceAffected, city, monthPosted)

    return {
      notice_id: rawId,
      employer_name: employer,
      event_date: parseDateValue(effectiveDate),
      job_losses: toWholeNumber(workforceAffected),
      source_url: null,
      city,
      month_posted: monthPosted,
      raw_state_record_type: 'nj_warn_xlsx',
    }
  })
}

function parseOhioRowsFromHtml(html, feedUrl) {
  const text = String(html ?? '')
  const rows = []
  const rowMatches = text.match(/<tr[\s\S]*?<\/tr>/gi) ?? []

  for (const rawRow of rowMatches) {
    if (!/dam\.assets\.ohio\.gov/i.test(rawRow)) continue

    const cellHtml = [...rawRow.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((match) => match[1] ?? '')
    const cells = cellHtml.map((value) => stripHtml(value))
    const hrefMatch = rawRow.match(/href=["']([^"']*dam\.assets\.ohio\.gov[^"']+)["']/i)
    if (!hrefMatch) continue
    const sourceUrl = hrefMatch[1].startsWith('http') ? hrefMatch[1] : new URL(hrefMatch[1], feedUrl).toString()

    const employer = coalesce(cells[0], cells[1])
    const possibleDate = cells.find((value) => /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/.test(value))
    const possibleLosses = cells.find((value) => /\d{1,3}(,\d{3})*$/.test(value))
    const noticeId = stableNoticeId('OH', employer, sourceUrl, possibleDate)

    rows.push({
      notice_id: noticeId,
      employer_name: employer,
      event_date: parseDateValue(possibleDate),
      job_losses: toWholeNumber(possibleLosses),
      source_url: sourceUrl,
      raw_state_record_type: 'oh_warn_html',
    })
  }

  return rows
}

function normalizeNotice(record, stateCode) {
  const normalizedRecord = withNormalizedKeys(record)
  const noticeId = String(
    normalizedRecord.notice_id
  ?? normalizedRecord.noticeid
      ?? normalizedRecord.id
      ?? normalizedRecord.case_number
      ?? normalizedRecord.case
      ?? ''
  ).trim()
  const employerName = String(
    normalizedRecord.employer_name
      ?? normalizedRecord.company
      ?? normalizedRecord.employer
      ?? normalizedRecord.business_name
      ?? ''
  ).trim()
  const sourceUrl = String(normalizedRecord.url ?? normalizedRecord.source_url ?? '').trim() || null
  const eventDateRaw = normalizedRecord.event_date ?? normalizedRecord.layoff_date ?? normalizedRecord.date ?? null
  const eventDate = parseDateValue(eventDateRaw)
  const lossesRaw = normalizedRecord.job_losses ?? normalizedRecord.affected_workers ?? normalizedRecord.affected ?? null
  const jobLosses = toWholeNumber(lossesRaw)

  if (!noticeId || !employerName) return null

  return {
    state_code: stateCode,
    notice_id: noticeId,
    employer_name: employerName,
    event_date: eventDate,
    job_losses: Number.isFinite(jobLosses) ? jobLosses : null,
    source_url: sourceUrl,
    raw_payload: normalizedRecord,
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
    if (upper === 'GA' && feedUrl.includes('gv_datatables_data')) {
      const gaRows = await fetchGATableRows(feedUrl)
      return gaRows
        .map((row) => normalizeNotice(row, upper))
        .filter(Boolean)
    }

    if (upper === 'OH') {
      const ohRows = await fetchOhioCsvRows(feedUrl)
      return ohRows
        .map((row) => normalizeNotice(row, upper))
        .filter(Boolean)
    }

    const response = await fetch(feedUrl, { signal: withTimeout() })
    if (!response.ok) return []

    const contentType = (response.headers.get('content-type') ?? '').toLowerCase()
    let rows = []
    if (contentType.includes('application/json') || contentType.includes('+json')) {
      const payload = await response.json()
      rows = Array.isArray(payload) ? payload : (payload?.rows ?? payload?.data ?? [])
    } else if (contentType.includes('spreadsheet') || contentType.includes('excel') || /\.xlsx?(\?|$)/i.test(feedUrl)) {
      const bytes = Buffer.from(await response.arrayBuffer())
      rows = parseExcelRows(bytes)
      if (upper === 'IL') rows = mapIllinoisRows(rows)
      if (upper === 'NJ') rows = mapNewJerseyRows(rows)
    } else {
      const text = await response.text()
      if (upper === 'OH') {
        rows = parseOhioRowsFromHtml(text, feedUrl)
      } else {
        rows = parseCsvRows(text)
      }
    }

    return rows
      .map((row) => normalizeNotice(row, upper))
      .filter(Boolean)
  } catch {
    return []
  }
}
