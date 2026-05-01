import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveProfile } from './actions'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}
const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error: saveError } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, briefing_time, briefing_days, briefing_timezone, target_titles, target_sectors, positioning_summary')
    .eq('user_id', user.id)
    .single()

  const activeDays: string[] = profile?.briefing_days ?? DEFAULT_DAYS
  const briefingTime = profile?.briefing_time
    ? profile.briefing_time.slice(0, 5)
    : '07:00'
  const targetTitles = (profile?.target_titles ?? []).join(', ')
  const targetSectors = (profile?.target_sectors ?? []).join(', ')
  const positioningSummary = profile?.positioning_summary ?? ''

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <Link
            href="/dashboard"
            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Profile</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">{user.email}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-8 max-w-xl">

          {saved && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded text-[13px] text-green-700">
              Profile saved.
            </div>
          )}
          {saveError && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
              Save failed. Please try again.
            </div>
          )}

          <form action={saveProfile} className="flex flex-col gap-6">

            {/* Name */}
            <div>
              <label htmlFor="full_name" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                defaultValue={profile?.full_name ?? ''}
                placeholder="Richard Rothschild"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Target titles */}
            <div>
              <label htmlFor="target_titles" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Target titles
              </label>
              <input
                id="target_titles"
                name="target_titles"
                type="text"
                defaultValue={targetTitles}
                placeholder="CIO, VP of Technology, Director of IT"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Comma-separated. Used to score job matches in company scans.</p>
            </div>

            {/* Target sectors */}
            <div>
              <label htmlFor="target_sectors" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Target sectors
              </label>
              <input
                id="target_sectors"
                name="target_sectors"
                type="text"
                defaultValue={targetSectors}
                placeholder="Healthcare, Fintech, SaaS"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Comma-separated. Helps refine match scoring.</p>
            </div>

            {/* Positioning summary */}
            <div>
              <label htmlFor="positioning_summary" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Positioning summary
              </label>
              <textarea
                id="positioning_summary"
                name="positioning_summary"
                rows={4}
                defaultValue={positioningSummary}
                placeholder="e.g. Transformation CIO with 15+ years leading large-scale technology modernization at enterprise retailers. Known for building high-performing teams and delivering ERP and platform migrations under budget."
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Used to personalize interview prep briefs and chat context.</p>
            </div>

            {/* Briefing time */}
            <div>
              <label htmlFor="briefing_time" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Daily briefing time
              </label>
              <input
                id="briefing_time"
                name="briefing_time"
                type="time"
                defaultValue={briefingTime}
                className="border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
              />
              {profile?.briefing_timezone && (
                <p className="mt-1.5 text-[12px] text-slate-400">
                  {profile.briefing_timezone}
                </p>
              )}
            </div>

            {/* Briefing days */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">
                Briefing days
              </p>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map(day => (
                  <label
                    key={day}
                    className="flex items-center justify-center w-12 h-9 rounded text-[12px] font-semibold cursor-pointer border transition-colors border-slate-200 text-slate-400 hover:border-slate-400 has-[:checked]:bg-slate-900 has-[:checked]:text-white has-[:checked]:border-slate-900"
                  >
                    <input
                      type="checkbox"
                      name="briefing_days"
                      value={day}
                      defaultChecked={activeDays.includes(day)}
                      className="sr-only"
                    />
                    {DAY_ABBR[day]}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-slate-400">
                The daily briefing email will be sent on these days at the time above.
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="bg-slate-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0"
              >
                Save profile
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}
