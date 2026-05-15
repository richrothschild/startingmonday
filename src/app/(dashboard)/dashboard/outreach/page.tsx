import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const metadata = {
  title: 'Outreach Hub - Starting Monday',
}

type CsvRow = Record<string, string>

type CsvSummary = {
  rowCount: number
  rows: CsvRow[]
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      out.push(current)
      current = ''
      continue
    }

    current += ch
  }

  out.push(current)
  return out
}

function parseCsv(content: string): CsvSummary {
  const lines = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return { rowCount: 0, rows: [] }
  }

  const headers = parseCsvLine(lines[0])
  const rows: CsvRow[] = []

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line)
    const row: CsvRow = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cols[i] ?? ''
    }
    rows.push(row)
  }

  return { rowCount: rows.length, rows }
}

async function readOutreachCsv(fileName: string): Promise<CsvSummary> {
  const fullPath = path.join(process.cwd(), 'docs', 'outreach', fileName)
  const content = await readFile(fullPath, 'utf8')
  return parseCsv(content)
}

export default async function OutreachHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, onboarding_completed_at')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) {
    redirect('/onboarding')
  }

  const [master50, firstTouch, followUps] = await Promise.all([
    readOutreachCsv('prospecting_combined_strict_50_personalized.csv'),
    readOutreachCsv('send_ready_emails_first_10.csv'),
    readOutreachCsv('send_ready_followups_first_10.csv'),
  ])

  const preview = master50.rows.slice(0, 10)

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Outreach Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Internal outbound operating center: send queue, follow-ups, and personalized target list.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Personalized Prospects</p>
            <p className="text-[24px] font-bold text-slate-900">{master50.rowCount}</p>
            <p className="text-[12px] text-slate-500 mt-1">Master list rows</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">First Touch</p>
            <p className="text-[24px] font-bold text-slate-900">{firstTouch.rowCount}</p>
            <p className="text-[12px] text-slate-500 mt-1">Ready-to-send emails</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Follow-Ups</p>
            <p className="text-[24px] font-bold text-slate-900">{followUps.rowCount}</p>
            <p className="text-[12px] text-slate-500 mt-1">Automated sequence rows</p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-[16px] font-bold text-slate-900">Operating Cadence</h2>
              <p className="text-[12px] text-slate-500">Run this every week to keep outbound moving.</p>
            </div>
            <a
              href="/calendar/starting-monday-outreach-reminders.ics"
              download
              className="text-[12px] font-semibold text-white bg-slate-900 rounded px-3 py-2 hover:bg-slate-700 transition-colors"
            >
              Download Reminder Calendar
            </a>
          </div>
          <ol className="px-5 py-4 text-[13px] text-slate-700 list-decimal ml-5 space-y-2">
            <li>Monday: send first-touch notes to your active batch.</li>
            <li>Wednesday: send follow-up 1 for non-responders (day 3).</li>
            <li>Friday: send follow-up 2 for non-responders (day 7).</li>
            <li>Friday: review replies, meetings booked, and next-week list.</li>
          </ol>
        </section>

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[16px] font-bold text-slate-900">Current Prospect Preview</h2>
            <p className="text-[12px] text-slate-500 mt-1">Top 10 rows from the personalized master list.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 px-4 py-3">Name</th>
                  <th className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 px-4 py-3">Role</th>
                  <th className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 px-4 py-3">Company</th>
                  <th className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 px-4 py-3">Email Guess</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={`${row.full_name}-${idx}`} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 text-[13px] text-slate-900">{row.full_name}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-600">{row.role_bucket}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-600">{row.company}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-600">{row.email_guess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/calendar" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">In-App Calendar</p>
            <p className="text-[12px] text-slate-500">Manage date-based follow-ups alongside the outreach routine.</p>
          </Link>
          <Link href="/dashboard/contacts" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">Contacts</p>
            <p className="text-[12px] text-slate-500">Update statuses: first sent, follow-up sent, replied, meeting booked.</p>
          </Link>
        </section>
      </main>
    </div>
  )
}
