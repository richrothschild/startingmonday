'use client'

import { ExecutiveDecisionCockpit } from '@/components/executive/ExecutiveDecisionCockpit'

/**
 * Decision cockpit sub-route under optionality.
 * Sprint ITS-3 / Ticket 18.
 */
export default function OptionalityDecisionCockpitPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">
            Decision Cockpit
          </p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight">
            Target and offer evaluation
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Score targets against what matters, set hard constraints, and capture pre/post interview reflections.
          </p>
        </div>
        <ExecutiveDecisionCockpit
          onSave={(criteria, evaluations) => {
            // TODO: persist to Supabase via /api/executive/decision-cockpit
            console.info('Decision cockpit saved', { criteria, evaluations })
          }}
        />
      </main>
    </div>
  )
}
