import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addCompany } from './actions'
import { CompanySearchInput } from './company-search-input'

const STAGES = [
  { value: 'watching',     label: 'Watching' },
  { value: 'researching',  label: 'Researching' },
  { value: 'applied',      label: 'In Process' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer',        label: 'Offer' },
]

export default async function AddCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; name?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error, name: prefillName } = await searchParams
  const errorMsg =
    error === 'duplicate' ? 'A company with that name is already in your pipeline.' :
    error === 'required'  ? 'Company name is required.' :
    error === 'limit'     ? 'You have reached the 25-company limit. Upgrade to Executive for an unlimited pipeline, or archive a company to make room.' :
    null

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-100">

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.95)_54%,_rgba(10,15,28,0.98)_100%)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link
            href="/dashboard"
            className="text-[13px] text-slate-300 hover:text-white transition-colors"
          >
            &larr; Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
<div className="mb-8">
          <h1 className="text-[26px] font-bold text-white leading-tight">Add company</h1>
          <p className="text-[13px] text-slate-300 mt-1.5">Add a company to your pipeline to track and monitor.</p>
        </div>

        <div className="mb-4 max-w-xl bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-md">
          <p className="text-[12px] text-slate-300">Need examples for targeting and pipeline setup?</p>
          <Link href="/guide?q=Where+do+I+add+companies+to+my+target+list%3F" className="text-[12px] font-semibold text-orange-200 hover:text-orange-100 hover:underline">
            Open Guide
          </Link>
        </div>

        <div className="bg-white/5 border border-white/15 rounded-xl p-5 sm:p-8 max-w-xl shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-md">

          {errorMsg && (
            <div className="mb-6 px-4 py-3 bg-rose-500/15 border border-rose-300/30 rounded text-[13px] text-rose-100">
              {errorMsg}
            </div>
          )}

          <form action={addCompany} className="flex flex-col gap-5">

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                Company name <span className="text-rose-300">*</span>
              </label>
              <CompanySearchInput defaultValue={prefillName} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                  Stage
                </label>
                <select
                  name="stage"
                  defaultValue="watching"
                  className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 focus:outline-none focus:border-orange-300 bg-slate-900/70"
                >
                  {STAGES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                  Fit score <span className="text-slate-500 font-normal">(1–10)</span>
                </label>
                <input
                  name="fit_score"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="-"
                  className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 bg-slate-900/70 placeholder:text-slate-500 focus:outline-none focus:border-orange-300"
                />
                <p className="mt-1.5 text-[12px] text-slate-400">1 = weak fit &middot; 10 = dream company</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                  Sector
                </label>
                <input
                  name="sector"
                  type="text"
                  placeholder="e.g. Healthcare, Fintech"
                  className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 bg-slate-900/70 placeholder:text-slate-500 focus:outline-none focus:border-orange-300"
                />
              </div>
              <div>
                <label htmlFor="company_size" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                  Company size
                </label>
                <select
                  id="company_size"
                  name="company_size"
                  className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 focus:outline-none focus:border-orange-300 bg-slate-900/70"
                >
                  <option value="">Unknown</option>
                  <option value="startup">Startup (under 200)</option>
                  <option value="midmarket">Mid-Market (200-2,000)</option>
                  <option value="enterprise">Enterprise (2,000+)</option>
                </select>
                <p className="mt-1.5 text-[12px] text-slate-400">Used to calibrate CTO prep briefs</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                Company website
              </label>
              <input
                name="company_url"
                type="text"
                placeholder="acme.com or https://acme.com"
                className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 bg-slate-900/70 placeholder:text-slate-500 focus:outline-none focus:border-orange-300"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Main URL - used to discover press room and leadership page</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                Career page URL
              </label>
              <input
                name="career_page_url"
                type="text"
                placeholder="acme.com/careers or https://acme.com/careers"
                className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 bg-slate-900/70 placeholder:text-slate-500 focus:outline-none focus:border-orange-300"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Used in job scans - runs Mon / Wed / Fri</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Warm intro through Sarah, strong culture fit…"
                className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 bg-slate-900/70 placeholder:text-slate-500 focus:outline-none focus:border-orange-300 resize-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                className="bg-orange-400 text-slate-950 text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0 hover:bg-orange-300 transition-colors"
              >
                Add to pipeline
              </button>
              <Link
                href="/dashboard"
                className="text-[14px] text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}

