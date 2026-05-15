import fs from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'

export const metadata = { title: 'Prep Brief Rubric - Starting Monday Admin' }

export default async function TraceRubricPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const rubricPath = path.join(process.cwd(), 'src', 'evals', 'prep_brief_rubric.md')
  const rubric = await fs.readFile(rubricPath, 'utf8').catch(() => null)

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/traces" className="text-[13px] text-slate-300 hover:text-white transition-colors">
              LLM Traces
            </Link>
            <Link href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-[26px] font-bold text-slate-900 mb-2">Prep Brief Rubric</h1>
        <p className="text-[13px] text-slate-500 mb-6">
          Use this during trace review. Mark Pass only when every binary check is satisfied.
        </p>

        {rubric ? (
          <div className="bg-white border border-slate-200 rounded p-5">
            <pre className="text-[12px] leading-relaxed text-slate-700 whitespace-pre-wrap">{rubric}</pre>
          </div>
        ) : (
          <div className="bg-white border border-red-200 rounded p-5">
            <p className="text-[13px] font-semibold text-red-700">Rubric file not found</p>
            <p className="text-[12px] text-red-600 mt-1">Expected: src/evals/prep_brief_rubric.md</p>
          </div>
        )}
      </main>
    </div>
  )
}