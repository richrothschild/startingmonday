'use client'
import Link from 'next/link'
import { useState } from 'react'

const INCLUDES = [
  'Everything in Active ($199/mo)',
  'One 45-minute strategy session each month with the founder, a transformation CIO who has run this search',
  'AI prepares the agenda from your live pipeline before every call',
  'Session notes and priorities carry forward',
  'First access to new capabilities as they ship',
]

export function ConciergeWaitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/concierge-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Email us at contact@startingmonday.app.')
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
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-14">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Executive Concierge
          </p>
          <h1 className="text-[34px] sm:text-[42px] font-bold text-white leading-[1.1] tracking-tight mb-2">
            Not open yet.
          </h1>
          <p className="text-[14px] text-slate-500 mb-5">$1,299/mo &middot; or $13,999/yr</p>
          <p className="text-[16px] text-slate-400 leading-relaxed max-w-lg">
            We are designing this around a small first cohort. Each session is with the founder, and the program has to stay small to stay good.
            Join the list and we will reach out when access opens.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16">

            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-5">
                What it includes
              </p>
              <ul className="space-y-4 mb-8">
                {INCLUDES.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold shrink-0 mt-0.5 text-[12px]">+</span>
                    <span className="text-[14px] text-slate-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-[28px] font-bold text-slate-900 leading-none mb-1">
                  $1,299<span className="text-[16px] font-normal text-slate-400">/mo</span>
                </p>
                <p className="text-[12px] text-slate-400 mb-0.5">or $13,999/yr</p>
                <p className="text-[12px] text-slate-400">30-day trial included when the program opens.</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-5">
                Join the waitlist
              </p>
              {submitted ? (
                <div className="border border-emerald-200 bg-emerald-50 rounded p-6">
                  <p className="text-[15px] font-semibold text-emerald-800 mb-1">You are on the list.</p>
                  <p className="text-[13px] text-emerald-700 leading-relaxed">
                    We will reach out directly when the first cohort opens.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label
                      htmlFor="c-email"
                      className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5"
                    >
                      Work email
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  {error && <p className="text-[13px] text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : 'Join the waitlist'}
                  </button>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    We will contact you directly. No automated drip campaign.
                  </p>
                </form>
              )}
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-slate-100">
            <p className="text-[13px] text-slate-400 mb-2">Looking for the Active plan instead?</p>
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
