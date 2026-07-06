import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import { fetchWarnNoticesForState } from './fetch-warn-notices.js'

function buildWorkbookBuffer(rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

describe('fetchWarnNoticesForState adapter coverage', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('maps Illinois workbook columns into normalized notices', async () => {
    process.env.WARN_FEED_IL = 'https://example.com/il.xlsx'

    const ilWorkbook = buildWorkbookBuffer([
      {
        'COMPANY NAME:': 'Acme Manufacturing',
        'WARN RECEIVED DATE:': '2026-06-01',
        'FIRST LAYOFF DATE:': '2026-06-15',
        'ENDING LAYOFF DATE:': '2026-06-30',
        'WORKERS AFFECTED:': '124',
        'CITY, STATE, ZIP:': 'Chicago, IL 60601',
      },
    ])

    const fetchMock = vi.fn(async (url) => {
      if (String(url) === process.env.WARN_FEED_IL) {
        return new Response(ilWorkbook, {
          status: 200,
          headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('IL')
    expect(rows).toHaveLength(1)
    expect(rows[0].state_code).toBe('IL')
    expect(rows[0].notice_id.startsWith('IL-')).toBe(true)
    expect(rows[0].employer_name).toBe('Acme Manufacturing')
    expect(rows[0].event_date).toBe('2026-06-15')
    expect(rows[0].job_losses).toBe(124)
  })

  it('maps New Jersey workbook columns and avoids oversized merged integers', async () => {
    process.env.WARN_FEED_NJ = 'https://example.com/nj.xlsx'

    const njWorkbook = buildWorkbookBuffer([
      {
        Company: 'Amazon',
        'Effective Date': '2026-04-28',
        'Workforce Affected': '240-417-1414429',
        City: 'Statewide',
        'Month Posted': 'January',
      },
    ])

    const fetchMock = vi.fn(async (url) => {
      if (String(url) === process.env.WARN_FEED_NJ) {
        return new Response(njWorkbook, {
          status: 200,
          headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('NJ')
    expect(rows).toHaveLength(1)
    expect(rows[0].state_code).toBe('NJ')
    expect(rows[0].notice_id.startsWith('NJ-')).toBe(true)
    expect(rows[0].employer_name).toBe('Amazon')
    expect(rows[0].event_date).toBe('2026-04-28')
    expect(rows[0].job_losses).toBe(240)
  })

  it('parses Georgia datatable JSON rows from object-indexed payloads', async () => {
    process.env.WARN_FEED_GA = 'https://example.com/wp-admin/admin-ajax.php?action=gv_datatables_data&view_id=1&post_id=2&nonce=abc&getData=false'

    const payload = {
      draw: 1,
      recordsTotal: 1,
      recordsFiltered: 1,
      data: [
        {
          0: '<a href="https://www.tcsg.edu/warn-public-view/entry/82923/">GA202500108</a>',
          1: 'Conduent',
          2: 'June 29, 2026',
          3: '70',
          gv_marker: [{ url: 'https://www.tcsg.edu/warn-public-view/entry/82923/' }],
        },
      ],
    }

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('/wp-admin/admin-ajax.php')) {
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'content-type': 'application/javascript; charset=UTF-8' },
        })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('GA')
    expect(rows).toHaveLength(1)
    expect(rows[0].state_code).toBe('GA')
    expect(rows[0].notice_id).toBe('GA202500108')
    expect(rows[0].employer_name).toBe('Conduent')
    expect(rows[0].event_date).toBe('2026-06-29')
    expect(rows[0].job_losses).toBe(70)
    expect(rows[0].source_url).toBe('https://www.tcsg.edu/warn-public-view/entry/82923/')
  })

  it('parses Ohio fallback CSV transport and maps key columns', async () => {
    process.env.WARN_FEED_OH = 'https://jfs.ohio.gov/job-workforce-services/job-programs-and-services/submit-a-warn-notice/current-public-notices-of-layoffs-and-closures'

    const ohCsv = [
      's,s,h,s,s,s,s,s,s',
      '13.00%,12.50%,,14.50%,14.00%,12.50%,11.00%,12.00%,10.50%',
      'Company,Date Received,URL,City/County,Layoff/Closure,Potential Number Affected,Layoff Date(s),Phone Number,Union',
      '"Conduent Commerical Solutions, LLC",6/29/26,https://dam.assets.ohio.gov/image/upload/jfs.ohio.gov/warn/WARN%202026/Conduent_Commercial_Solutions_LLC.pdf,Unknown/Unknown,Layoff,16,8/28/26,(315) 404-9183,N',
      '',
    ].join('\n')

    const fetchMock = vi.fn(async (url) => {
      const textUrl = String(url)
      if (/dam\.assets\.ohio\.gov\/raw\/upload\/jfs\.ohio\.gov\/.+warn-notice\.csv/i.test(textUrl)) {
        return new Response(ohCsv, { status: 200, headers: { 'content-type': 'text/csv' } })
      }
      return new Response('not found', { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('OH')
    expect(rows).toHaveLength(1)
    expect(rows[0].state_code).toBe('OH')
    expect(rows[0].notice_id.startsWith('OH-')).toBe(true)
    expect(rows[0].employer_name).toBe('Conduent Commerical Solutions, LLC')
    expect(rows[0].event_date).toBe('2026-08-28')
    expect(rows[0].job_losses).toBe(16)
  })

  it('parses California JSON data portal response', async () => {
    process.env.WARN_FEED_CA = 'https://data.ca.gov/api/3/action/datastore_search'

    const caPayload = {
      result: {
        records: [
          {
            id: 'CA202600445',
            company_name: 'Tesla Gigafactory',
            received_date: '2026-06-15',
            affected_employees: 1247,
            city: 'Sparks',
            county: 'Washoe',
            industry_name: 'Manufacturing',
          },
          {
            id: 'CA202600446',
            company_name: 'Apple Inc',
            date_received: '2026-06-16',
            job_losses: 850,
            city: 'Cupertino',
            county: 'Santa Clara',
            industry: 'Technology',
          },
        ],
      },
    }

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('data.ca.gov')) {
        return new Response(JSON.stringify(caPayload), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('CA')
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows[0].state_code).toBe('CA')
    expect(rows[0].employer_name).toBe('Tesla Gigafactory')
    expect(rows[0].event_date).toBe('2026-06-15')
    expect(rows[0].job_losses).toBe(1247)
  })

  it('parses Texas CSV WARN data', async () => {
    process.env.WARN_FEED_TX = 'https://www.twc.texas.gov/warn-notices.csv'

    const txCsv = [
      'company_name,notice_date,workers_affected,city',
      'Exxon Mobil,2026-05-20,340,Houston',
      'AT&T Services,2026-06-10,215,Dallas',
    ].join('\n')

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('twc.texas.gov')) {
        return new Response(txCsv, { status: 200, headers: { 'content-type': 'text/csv' } })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('TX')
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows[0].state_code).toBe('TX')
    expect(rows[0].employer_name).toBe('Exxon Mobil')
    expect(rows[0].job_losses).toBe(340)
  })

  it('parses Florida Excel WARN data', async () => {
    process.env.WARN_FEED_FL = 'https://www.floridajobs.org/warn-data.xlsx'

    const flWorkbook = buildWorkbookBuffer([
      {
        employer_name: 'Walt Disney World',
        received_date: '2026-05-25',
        affected_workers: 560,
        county: 'Orange',
      },
      {
        employer_name: 'Royal Caribbean',
        received_date: '2026-06-01',
        job_losses: 320,
        county: 'Miami-Dade',
      },
    ])

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('floridajobs.org')) {
        return new Response(flWorkbook, {
          status: 200,
          headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('FL')
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows[0].state_code).toBe('FL')
    expect(rows[0].employer_name).toBe('Walt Disney World')
    expect(rows[0].job_losses).toBe(560)
  })

  it('parses New York CSV WARN database', async () => {
    process.env.WARN_FEED_NY = 'https://www.dol.ny.gov/warn-notices'

    const nyCsv = [
      'employer,date_received,number_of_employees,county',
      'JPMorgan Chase,2026-05-15,890,New York',
      'Goldman Sachs,2026-06-05,450,New York',
    ].join('\n')

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('dol.ny.gov')) {
        return new Response(nyCsv, { status: 200, headers: { 'content-type': 'text/csv' } })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('NY')
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows[0].state_code).toBe('NY')
    expect(rows[0].employer_name).toBe('JPMorgan Chase')
    expect(rows[0].job_losses).toBe(890)
  })

  it('parses Pennsylvania Excel WARN notices', async () => {
    process.env.WARN_FEED_PA = 'https://www.pa.gov/warn-data.xlsx'

    const paWorkbook = buildWorkbookBuffer([
      {
        company_name: 'US Steel',
        notice_received: '2026-04-28',
        number_affected: 410,
        county: 'Allegheny',
      },
    ])

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('pa.gov')) {
        return new Response(paWorkbook, {
          status: 200,
          headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('PA')
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(rows[0].state_code).toBe('PA')
    expect(rows[0].employer_name).toBe('US Steel')
    expect(rows[0].job_losses).toBe(410)
  })

  it('parses Michigan CSV WARN dataset', async () => {
    process.env.WARN_FEED_MI = 'https://www.michigan.gov/warn-notices.csv'

    const miCsv = [
      'employer_name,date_received,workers_affected,county',
      'Ford Motor,2026-06-08,780,Wayne',
      'General Motors,2026-06-12,920,Genesee',
    ].join('\n')

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('michigan.gov')) {
        return new Response(miCsv, { status: 200, headers: { 'content-type': 'text/csv' } })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const rows = await fetchWarnNoticesForState('MI')
    expect(rows.length).toBeGreaterThanOrEqual(2)
    expect(rows[0].state_code).toBe('MI')
    expect(rows[0].employer_name).toBe('Ford Motor')
    expect(rows[0].job_losses).toBe(780)
  })
})
