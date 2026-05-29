'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'

const INCLUDES = [
  'Everything in Executive ($499/mo) — full intelligence depth, all sources, full brief suite',
  'One 45-minute strategy session each month with the founder, who has run this search from the executive side',
  'AI prepares the session agenda from your live pipeline before every call',
  'Priorities and commitments carry forward into the next session',
  'First access to new capabilities as they ship',
  'Direct channel to the founder between sessions for time-sensitive decisions',
]

const BETA_INCLUDES = [
  '30-day guided rollout focused on your immediate transition objective',
  'Weekly Momentum Signal review and clear next-action plan',
  'Confidential intake and founder-led fit review',
  'No subscription required during beta participation',
  'Direct feedback loop so your experience shapes the product roadmap',
]

const FOR_WHO = [
  { label: 'Active C-suite search', body: 'You are in motion. A board role, a CIO seat, or a CEO opportunity is on the table and you need full depth, not a tool.' },
  { label: 'High-stakes single opportunity', body: 'One company, one role. The intelligence and prep need to be flawless. A mistake here is not recoverable.' },
  { label: 'PE or transformation mandate', body: 'You have been brought in to assess an operator seat. You need company intelligence, positioning, and a peer sounding board before the term sheet conversation.' },
]

export function ConciergeWaitlist() {
  const searchParams = useSearchParams()
  const isBetaProgram = (searchParams.get('program') ?? '').toLowerCase() === 'beta'
  const source = (searchParams.get('from') ?? '').toLowerCase()
  const ph = usePostHog()

  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [situation, setSituation] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formStarted = useRef(false)
  const touchedFields = useRef<Set<string>>(new Set())

  useEffect(() => {
    return () => {
      if (submitted || !ph) return
      const untouched = ['email', 'company', 'role', 'situation'].filter((field) => !touchedFields.current.has(field))
      ph.capture('concierge_form_exit_before_submit', {
        program: isBetaProgram ? 'beta' : 'concierge',
        untouched_fields: untouched,
        touched_fields_count: touchedFields.current.size,
      })
    }
  }, [isBetaProgram, ph, submitted])

  function markFieldInteraction(field: 'email' | 'company' | 'role' | 'situation', value: string) {
    if (!ph) return
    touchedFields.current.add(field)
    if (!formStarted.current) {
      formStarted.current = true
      ph.capture('concierge_form_started', {
        program: isBetaProgram ? 'beta' : 'concierge',
      })
    }

    ph.capture('concierge_field_blur', {
      program: isBetaProgram ? 'beta' : 'concierge',
      field,
      has_value: value.trim().length > 0,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return
    ph?.capture('concierge_form_submit_attempt', {
      program: isBetaProgram ? 'beta' : 'concierge',
      has_company: Boolean(company.trim()),
      has_role: Boolean(role.trim()),
      has_situation: Boolean(situation.trim()),
    })
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/concierge-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          company: company.trim(),
          role: role.trim(),
          situation: situation.trim(),
          program: isBetaProgram ? 'beta' : 'concierge',
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
      ph?.capture('concierge_form_submitted', {
        program: isBetaProgram ? 'beta' : 'concierge',
      })
    } catch {
      setError('Something went wrong. Email us at contact@startingmonday.app.')
      ph?.capture('concierge_form_submit_failed', {
        program: isBetaProgram ? 'beta' : 'concierge',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup?from=concierge"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            {isBetaProgram ? 'Confidential Beta Cohort — Founder-Led, 10 Seats' : 'Executive Concierge &mdash; $1,299/mo'}
          </p>
          <h1 className="text-[34px] sm:text-[42px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            {isBetaProgram ? (
              <>
                Share your transition brief.<br />
                We review it privately.<br />
                If there is fit, we schedule a direct conversation.
              </>
            ) : (
              <>
                The analysis is done.<br />
                The brief is written.<br />
                The intelligence is running<br />before you wake up.
              </>
            )}
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg">
            {isBetaProgram
              ? 'This is a private intake for senior leaders running high-stakes transitions. Share concise context, and we will reply personally with clear next steps.'
              : 'Executive is the full platform at full depth. Concierge adds one thing: a monthly session with the founder, who has run this search from the executive side. The program stays small because it has to.'}
          </p>
          {source === 'landing' && (
            <p className="text-[12px] text-slate-500 mt-4">
              You came from the main landing flow. This page is the high-touch path when you want founder-reviewed direction before full self-serve onboarding.
            </p>
          )}
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16 mb-16">

            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-5">
                {isBetaProgram ? 'How beta works' : 'What it includes'}
              </p>
              <ul className="space-y-4 mb-8">
                {(isBetaProgram ? BETA_INCLUDES : INCLUDES).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold shrink-0 mt-0.5 text-[12px]">+</span>
                    <span className="text-[14px] text-slate-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 pt-6">
                {isBetaProgram ? (
                  <>
                    <p className="text-[20px] font-bold text-slate-900 leading-none mb-1">No subscription during beta</p>
                    <p className="text-[12px] text-slate-400 mb-0.5">10 seats total</p>
                    <p className="text-[12px] text-slate-400">Selected participants get a 30-day guided rollout and give candid feedback.</p>
                  </>
                ) : (
                  <>
                    <p className="text-[28px] font-bold text-slate-900 leading-none mb-1">
                      $1,299<span className="text-[16px] font-normal text-slate-400">/mo</span>
                    </p>
                    <p className="text-[12px] text-slate-400 mb-0.5">or $13,999/yr</p>
                    <p className="text-[12px] text-slate-400">Application required. 30-day trial included when access opens.</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-5">
                {isBetaProgram ? 'Private intake brief' : 'Request access'}
              </p>
              {submitted ? (
                <div className="border border-slate-200 bg-slate-50 rounded p-6">
                  <p className="text-[15px] font-semibold text-slate-900 mb-1">Brief received.</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    We review each submission personally. You will hear from us directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label
                      htmlFor="c-email"
                      className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5"
                    >
                      Executive email
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={(e) => markFieldInteraction('email', e.target.value)}
                      placeholder="you@company.com"
                      className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="c-company"
                        className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5"
                      >
                        Current company
                      </label>
                      <input
                        id="c-company"
                        type="text"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        onBlur={(e) => markFieldInteraction('company', e.target.value)}
                        placeholder="Current or most recent organization"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="c-role"
                        className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5"
                      >
                        Target mandate
                      </label>
                      <input
                        id="c-role"
                        type="text"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        onBlur={(e) => markFieldInteraction('role', e.target.value)}
                        placeholder="Example: CIO, CTO, VP Engineering"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="c-situation"
                      className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5"
                    >
                      Confidential transition brief
                    </label>
                    <textarea
                      id="c-situation"
                      rows={4}
                      value={situation}
                      onChange={e => setSituation(e.target.value)}
                      onBlur={(e) => markFieldInteraction('situation', e.target.value)}
                      placeholder="In 3-5 lines, describe your situation, timing, and the outcome you want next."
                      className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
                    />
                  </div>
                  {isBetaProgram && (
                    <div className="rounded border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-600 mb-2">Selection criteria and confidentiality guardrails</p>
                      <ul className="space-y-1 text-[12px] text-slate-600 leading-relaxed list-disc pl-4">
                        <li>Fit: senior operator with an active or near-term transition objective.</li>
                        <li>Commitment: able to run weekly cadence for 30 days.</li>
                        <li>Feedback: willing to share direct feedback and outcomes.</li>
                        <li>Privacy: intake details are reviewed by founder only and not shared externally.</li>
                      </ul>
                    </div>
                  )}
                  {error && <p className="text-[13px] text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : isBetaProgram ? 'Submit confidential brief' : 'Request access'}
                  </button>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isBetaProgram
                      ? 'Every brief is reviewed by the founder. If there is fit, we will follow up directly.'
                      : 'We review each application personally. No automated response.'}
                  </p>
                </form>
              )}
            </div>

          </div>

          <div className="border-t border-slate-100 pt-12 mb-12">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-6">
              Who this is for
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {FOR_WHO.map((item, i) => (
                <div key={i} className="border-t-2 border-slate-200 pt-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-2">{item.label}</p>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 mb-12">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-3">About the founder</p>
            <p className="text-[14px] text-slate-700 leading-relaxed">
              Starting Monday was built by a founder who ran executive job searches at scale and watched colleagues waste months on reactive tactics that did not work. The sessions are direct, structured, and specific to your pipeline. Not coaching. Not cheerleading. One executive to another.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-[13px] text-slate-400 mb-2">Looking for Executive or Active instead?</p>
            <Link
              href="/pricing"
              className="text-[13px] font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              View all plans &rarr;
            </Link>
          </div>

        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions?{' '}
            <a href="mailto:contact@startingmonday.app" className="hover:text-slate-300 transition-colors">
              contact@startingmonday.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
