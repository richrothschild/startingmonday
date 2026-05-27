import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Executive Coach Prep Worksheet | Starting Monday',
  description:
    'A complete one-page executive coach prep worksheet for before, during, and after high-stakes sessions. Includes pre-session diagnostics, live-session structure, and between-session operating plan.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches/coach-prep-worksheet' },
  openGraph: {
    title: 'Executive Coach Prep Worksheet | Starting Monday',
    description:
      'A complete worksheet coaches can use to structure pre-session preparation, live session execution, and between-session follow-through.',
    url: 'https://startingmonday.app/for-coaches/coach-prep-worksheet',
  },
}

const PREP_SECTIONS: Array<{ title: string; prompts: string[] }> = [
  {
    title: '1) Session Context Snapshot',
    prompts: [
      'Client name / role / target mandate:',
      'Session date and stage in search (early, active interview loop, final):',
      'Primary conversation this prep supports (recruiter, board, hiring manager, networking):',
      'What changed since last session (signals, process stage, confidence, urgency):',
      'Single most important outcome for this session:',
    ],
  },
  {
    title: '2) Current Signal Read',
    prompts: [
      'Top 3 external signals that matter this week:',
      'What each signal means for positioning or timing:',
      'What is noise and should be ignored:',
      'Most likely risk if client overreacts to current signal set:',
    ],
  },
  {
    title: '3) Decision Quality Check',
    prompts: [
      'Big decision client is avoiding right now:',
      'Default behavior if you do nothing this week:',
      'Cost of delay in the next 7 days:',
      'Decision standard you will hold this session (what good looks like):',
    ],
  },
  {
    title: '4) Message Readiness (Recruiter / Board / CEO)',
    prompts: [
      'One sentence positioning line client must deliver cleanly:',
      'Evidence line that proves credibility (specific, not generic):',
      'Likely pushback and non-defensive response:',
      'What to cut because it weakens signal-to-noise ratio:',
    ],
  },
  {
    title: '5) Live Session Plan (45-60 min)',
    prompts: [
      '0-5 min: orient to outcome and constraints:',
      '5-20 min: review top signal and mandate implications:',
      '20-40 min: rehearse one high-stakes exchange:',
      '40-50 min: convert insights into actions with owners and dates:',
      '50-60 min: confirm what gets sent in next 24 hours:',
    ],
  },
  {
    title: '6) Accountability Plan (Between Sessions)',
    prompts: [
      'Three actions due before next session (verb + owner + date):',
      'One metric that proves momentum this week:',
      'Red flag that triggers early check-in (not waiting until next session):',
      'Cadence touchpoint (day/time) for quick status check:',
    ],
  },
  {
    title: '7) Post-Session Debrief (Coach)',
    prompts: [
      'What moved client behavior this session:',
      'What still feels fragile or unresolved:',
      'What you need to tighten in next session design:',
      'Notes to carry forward so next session starts in strategy, not recap:',
    ],
  },
]

const READINESS_SCORE = [
  'Positioning clarity',
  'Evidence quality',
  'Pushback handling',
  'Decision ownership',
  'Follow-through reliability',
]

export default function CoachPrepWorksheetPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span>
            <span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/for-coaches" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Back to for-coaches
          </Link>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-10 pb-12 print:bg-white print:pt-0 print:pb-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3 print:text-slate-600">
            Executive Coach Worksheet
          </p>
          <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.12] tracking-tight mb-4 print:text-slate-900">
            One-Page Coach Prep Worksheet
          </h1>
          <p className="text-[15px] text-slate-300 leading-relaxed max-w-2xl print:text-slate-700">
            Use this before every high-stakes client session to reduce context rebuild, sharpen decision quality,
            and lock in between-session follow-through.
          </p>
          <p className="text-[12px] text-slate-400 mt-4 print:text-slate-500">
            Tip: Save or print this page as PDF and reuse per client session.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <section className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-slate-50 mb-8">
          <h2 className="text-[15px] font-semibold text-slate-900 mb-3">Session Header</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] text-slate-700">
            <p>Coach: ________________________________</p>
            <p>Client: ________________________________</p>
            <p>Date: _________________________________</p>
            <p>Session number: ________________________</p>
            <p className="sm:col-span-2">Primary objective for this session: ______________________________________________</p>
          </div>
        </section>

        <div className="space-y-7">
          {PREP_SECTIONS.map((section) => (
            <section key={section.title} className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-white">
              <h2 className="text-[17px] font-semibold text-slate-900 mb-4">{section.title}</h2>
              <ul className="space-y-3 text-[13px] text-slate-700">
                {section.prompts.map((prompt) => (
                  <li key={prompt}>
                    <p className="font-medium text-slate-800">{prompt}</p>
                    <p className="mt-1 text-slate-400">______________________________________________________________________________</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="border border-orange-200 rounded-2xl p-5 sm:p-6 bg-orange-50/40 mt-8">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-3">Readiness Scorecard (1-5)</h2>
          <p className="text-[13px] text-slate-600 mb-4">
            Score quickly after each session. Anything below 3 becomes a mandatory focus area in the next prep cycle.
          </p>
          <div className="space-y-2 text-[13px] text-slate-700">
            {READINESS_SCORE.map((item) => (
              <div key={item} className="flex items-center justify-between border border-orange-100 bg-white rounded-lg px-3 py-2">
                <span>{item}</span>
                <span>1 2 3 4 5</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-slate-700">Overall session quality score: ______ / 25</p>
          <p className="mt-2 text-[13px] text-slate-700">Highest-priority improvement before next session: __________________________________</p>
        </section>

        <section className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-white mt-8">
          <h2 className="text-[17px] font-semibold text-slate-900 mb-3">Coach Operating Standard (Quick Reminder)</h2>
          <ul className="space-y-2 text-[13px] text-slate-700 leading-relaxed">
            <li>1. Stay with one session outcome. Do not let the session become a general update.</li>
            <li>2. Convert insight into observable action (owner + date + success check).</li>
            <li>3. Protect signal quality. Specific evidence beats motivational language.</li>
            <li>4. End every session with a 7-day plan and one metric that proves momentum.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
