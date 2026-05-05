import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addCompany } from './actions'

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
    null

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
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Add company</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">Add a company to your pipeline to track and monitor.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-8 max-w-xl">

          {errorMsg && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
              {errorMsg}
            </div>
          )}

          <form action={addCompany} className="flex flex-col gap-5">

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                autoFocus
                defaultValue={prefillName ?? ''}
                placeholder="Acme Corp"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Stage
                </label>
                <select
                  name="stage"
                  defaultValue="watching"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                >
                  {STAGES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Fit score <span className="text-slate-300 font-normal">(1–10)</span>
                </label>
                <input
                  name="fit_score"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="—"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
                <p className="mt-1.5 text-[12px] text-slate-400">1 = weak fit &middot; 10 = dream company</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Sector
              </label>
              <input
                name="sector"
                type="text"
                placeholder="e.g. Healthcare, Fintech"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Company website
              </label>
              <input
                name="company_url"
                type="url"
                placeholder="https://acme.com"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Main URL &mdash; used to discover press room and leadership page</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Career page URL
              </label>
              <input
                name="career_page_url"
                type="url"
                placeholder="https://acme.com/careers"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Used in job scans &mdash; runs Mon / Wed / Fri</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Warm intro through Sarah, strong culture fit…"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                className="bg-slate-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0"
              >
                Add to pipeline
              </button>
              <Link
                href="/dashboard"
                className="text-[14px] text-slate-400 hover:text-slate-600"
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
