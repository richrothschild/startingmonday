import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import { createProspect } from '../actions'
import { TYPE_LABELS } from '../page'

export const metadata = { title: 'Add Prospect - B2B Sales' }

export default async function NewProspectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard/admin/b2b" className="text-[13px] text-slate-300 hover:text-white">
            Pipeline
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-7">
          <h1 className="text-[24px] font-bold text-slate-900">Add prospect</h1>
          <p className="text-[13px] text-slate-500 mt-1">Start tracking a new B2B sales conversation.</p>
        </div>

        <form action={createProspect} className="bg-white border border-slate-200 rounded p-6 flex flex-col gap-5">
          <div>
            <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
              Organization name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Lee Hecht Harrison, Wharton School, Sequoia Capital"
              className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
                Prospect type
              </label>
              <select
                name="type"
                defaultValue="outplacement"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 bg-white focus:outline-none focus:border-slate-400"
              >
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
                Website
              </label>
              <input
                name="website"
                type="url"
                placeholder="https://"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
                Estimated seats
              </label>
              <input
                name="estimated_seats"
                type="number"
                min="1"
                placeholder="e.g. 100"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
                Estimated ARR (USD)
              </label>
              <input
                name="estimated_arr"
                type="number"
                min="0"
                placeholder="e.g. 48000"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="How we know them, warm intro, key context..."
              className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 hover:bg-slate-700 transition-colors"
            >
              Add prospect
            </button>
            <Link href="/dashboard/admin/b2b" className="text-[13px] text-slate-400 hover:text-slate-700">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

