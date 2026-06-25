import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Client Interview Prep - Starting Monday',
  description: 'View and manage client interview preparation.',
}

export default async function CoachClientInterviewPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { clientId } = await params

  // TODO: Fetch client's interview prep data from Supabase
  const clientData = {
    companyName: 'Figma',
    roleTitle: 'VP Engineering',
    interviewDate: '2026-06-28T10:00',
    positioning: 'I build engineering teams that scale from startup chaos to systematic execution.',
    companyContext: 'Figma just announced $200M Series D. They are expanding into enterprise collaboration.',
    roleCompletion: 75,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-[24px] font-bold tracking-tight text-white">
          Interview Prep
        </h2>
        <p className="text-[14px] leading-relaxed text-slate-400">
          Viewing {clientData.companyName} preparation
        </p>
      </div>

      {/* Coach actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="px-4 py-2 text-[13px] font-semibold bg-orange-500 text-slate-900 rounded-lg hover:bg-orange-600 transition-colors">
          Assign homework
        </button>
        <button className="px-4 py-2 text-[13px] font-semibold border border-slate-700 text-slate-300 rounded-lg hover:border-slate-600 transition-colors">
          Leave feedback
        </button>
      </div>

      {/* Client's prep data */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-2">
            Company & Role
          </p>
          <p className="text-[16px] font-semibold text-white">
            {clientData.companyName} - {clientData.roleTitle}
          </p>
          {clientData.interviewDate && (
            <p className="text-[13px] text-slate-400 mt-1">
              Interview: {new Date(clientData.interviewDate).toLocaleString()}
            </p>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">
            Their Positioning
          </p>
          <p className="text-[14px] leading-relaxed text-slate-200">
            {clientData.positioning}
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">
            Company Context Research
          </p>
          <p className="text-[14px] leading-relaxed text-slate-200">
            {clientData.companyContext}
          </p>
        </div>
      </div>

      {/* Completion status */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-slate-300">Interview prep completion</p>
          <p className="text-[13px] font-semibold text-orange-300">{clientData.roleCompletion}%</p>
        </div>
        <div className="h-2 rounded-full bg-slate-950/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
            style={{ width: `${clientData.roleCompletion}%` }}
          />
        </div>
      </div>

      {/* Notes section */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-4">
        <p className="text-[13px] font-semibold text-slate-300">Coaching notes</p>
        <textarea
          placeholder="Add feedback or notes for your client..."
          rows={4}
          className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
        />
        <button className="px-4 py-2 text-[13px] font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
          Save notes
        </button>
      </div>

      {/* Back to client */}
      <Link
        href={`/coach/${clientId}`}
        className="text-[13px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
      >
        ← View all client tasks
      </Link>
    </div>
  )
}
