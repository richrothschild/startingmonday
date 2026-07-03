'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { usePostHog } from 'posthog-js/react'
import TurnstileWidget from '@/components/turnstile-widget'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/policy-versions'

const TURNSTILE_ENABLED = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === '1'

type SituationContent = {
  title: string
  sub: string
  firstStep: string
  cta: string
}

type EntryHandoff = {
  title: string
  body: string
  nextStep: string
}

const SITUATION_COPY: Record<string, SituationContent> = {
  urgent: {
    title: 'You need to land well. Quickly.',
    sub: 'Your first briefing is ready by morning. Add target companies and Starting Monday starts working tonight.',
    firstStep: 'Add your top 10 target companies so tomorrow morning has one clear priority action.',
    cta: 'start your campaign',
  },
  executive: {
    title: 'Targeted search. Moving faster starts now.',
    sub: 'Your pipeline, your signals, your prep briefs - all in one place from day one.',
    firstStep: 'Set your level and create your first campaign pipeline.',
    cta: 'launch your campaign',
  },
  building: {
    title: 'Build your list before you announce anything.',
    sub: 'Track target companies silently. Your employer will never know you\'re watching.',
    firstStep: 'Start with quiet monitoring on companies you would call first if a transition signal appears.',
    cta: 'start monitoring quietly',
  },
  restructured: {
    title: 'You know your worth.',
    sub: 'Land at the right level, not just the next one. Every brief is calibrated to the role you deserve.',
    firstStep: 'Define your target level first, then add companies that match that altitude.',
    cta: 'start at the right level',
  },
  passive: {
    title: 'Not ready to commit. That\'s fine.',
    sub: 'Monitor your targets in the background. You\'ll know the moment something changes.',
    firstStep: 'Begin in low-visibility mode and track target companies without active outreach.',
    cta: 'start in monitor mode',
  },
  'vp-up': {
    title: 'You have the record. Now run the campaign.',
    sub: 'Every output - prep briefs, outreach, strategy - calibrated to the altitude you\'re moving toward.',
    firstStep: 'Set your campaign to VP-to-CXO mode and generate your first positioning brief.',
    cta: 'start your VP-to-CXO campaign',
  },
  returning: {
    title: 'This is the one that sticks.',
    sub: 'One step at a time. Add your first company and the system starts working.',
    firstStep: 'Rebuild momentum by tracking one company first, then expand to your full list.',
    cta: 'restart your campaign',
  },
  'low-energy': {
    title: 'One thing at a time.',
    sub: 'Set it up once. The briefing comes to you. The system does the heavy lifting.',
    firstStep: 'Do one setup pass now so your morning briefing handles the daily execution rhythm.',
    cta: 'set up once and start',
  },
  optionality: {
    title: 'You want to know before you have to.',
    sub: 'Monitor your target companies without committing to an active campaign. The platform works in the background.',
    firstStep: 'Track optionality targets now so you can move the same day a signal appears.',
    cta: 'start your optionality track',
  },
}

const ENTRY_HANDOFF: Record<string, EntryHandoff> = {
  landing: {
    title: 'You are continuing from the Motion Signal landing flow.',
    body: 'This signup path keeps the same model: identify signal movement, choose one relationship action, and run weekly cadence with less friction.',
    nextStep: 'Create your account, then set your first target list and morning briefing priority.',
  },
  pricing: {
    title: 'You are continuing from pricing.',
    body: 'You do not need to finalize tier selection right now. Start free, run the first weekly rhythm, then choose based on campaign intensity.',
    nextStep: 'Create your account and begin with one target company plus one outreach priority.',
  },
  concierge: {
    title: 'You are continuing from concierge.',
    body: 'If you prefer self-serve first, this path gets you live quickly while preserving confidentiality and weekly operating discipline.',
    nextStep: 'Create your account and launch your first briefing cycle today.',
  },
}

type HeardAboutOption =
  | 'managertools'
  | 'executive_coach_referral'
  | 'linkedin'
  | 'google_web_search'
  | 'colleague_or_peer'
  | 'other'

const HEARD_ABOUT_OPTIONS: Array<{ value: HeardAboutOption; label: string }> = [
  { value: 'managertools', label: 'Manager Tools' },
  { value: 'executive_coach_referral', label: 'Executive coach referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'google_web_search', label: 'Google / web search' },
  { value: 'colleague_or_peer', label: 'Colleague or peer' },
  { value: 'other', label: 'Other (please specify)' },
]

export default function SignupPage() {
  const router = useRouter()
  const ph = usePostHog()
  const [email, setEmail] = useState('')
  const [situation, setSituation] = useState<string | null>(null)
  const [entrySource, setEntrySource] = useState<string | null>(null)
  const [managerToolsOffer, setManagerToolsOffer] = useState(false)
  const [heardAbout, setHeardAbout] = useState<HeardAboutOption | ''>('')
  const [heardAboutOther, setHeardAboutOther] = useState('')
  const [heardAboutLocked, setHeardAboutLocked] = useState(false)

   
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    if (from && SITUATION_COPY[from]) setSituation(from)
    if (from && ENTRY_HANDOFF[from]) setEntrySource(from)
    const utmSource = (params.get('utm_source') || '').trim().toLowerCase()
    if (utmSource === 'managertools') {
      setHeardAbout('managertools')
      setHeardAboutLocked(true)
      setManagerToolsOffer(true)
    }
  }, [])
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  const authBusy = googleLoading || appleLoading || loading

  function ensurePolicyConsent(): boolean {
    if (agreeTerms && agreePrivacy) return true
    setError('You must agree to the Terms and Privacy Policy to create an account.')
    return false
  }

  function getSelfReportedSource(): string | null {
    if (!heardAbout) return null
    if (heardAbout === 'other') {
      const detail = heardAboutOther.trim()
      return detail ? `other:${detail.slice(0, 120)}` : 'other'
    }
    return heardAbout
  }

  function isManagerToolsSource(source: string | null | undefined): boolean {
    return (source ?? '').trim().toLowerCase() === 'managertools'
  }

  function managerToolsTrialEndsAt(): string {
    return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  }

  function requireCaptchaToken(): string | null {
    if (!TURNSTILE_ENABLED) return ''
    if (!captchaToken) {
      setError('Complete the security check before continuing.')
      return null
    }
    return captchaToken
  }

  async function handleGoogle() {
    if (!ensurePolicyConsent()) return
    const token = requireCaptchaToken()
    if (token == null) return
    setGoogleLoading(true)
    try {
      ph?.capture('signup_completed', { method: 'google' })
    } catch { /* analytics must not block */ }
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source') || params.get('ref') || null
    const selfReportedSource = getSelfReportedSource()
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (utmSource) callbackUrl.searchParams.set('utm_source', utmSource)
    if (selfReportedSource) callbackUrl.searchParams.set('self_reported_source', selfReportedSource)
    const utmMedium = params.get('utm_medium')
    if (utmMedium) callbackUrl.searchParams.set('utm_medium', utmMedium)
    callbackUrl.searchParams.set('accepted_terms_version', TERMS_VERSION)
    callbackUrl.searchParams.set('accepted_privacy_version', PRIVACY_VERSION)
    callbackUrl.searchParams.set('policy_accepted_at', new Date().toISOString())
    try {
      const response = await fetch('/api/auth/verify-and-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(TURNSTILE_ENABLED ? { 'x-captcha-token': token } : {}),
        },
        body: JSON.stringify({
          provider: 'google',
          redirectTo: callbackUrl.toString(),
        }),
      })

      const data = await response.json() as { ok?: boolean; error?: string; url?: string }

      if (!response.ok || !data.ok || !data.url) {
        setError(data.error || 'Failed to start Google sign-in')
        setGoogleLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setGoogleLoading(false)
    }
  }

  async function handleApple() {
    if (!ensurePolicyConsent()) return
    const token = requireCaptchaToken()
    if (token == null) return
    setAppleLoading(true)
    try {
      ph?.capture('signup_completed', { method: 'apple' })
    } catch { /* analytics must not block */ }
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source') || params.get('ref') || null
    const selfReportedSource = getSelfReportedSource()
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (utmSource) callbackUrl.searchParams.set('utm_source', utmSource)
    if (selfReportedSource) callbackUrl.searchParams.set('self_reported_source', selfReportedSource)
    const utmMedium = params.get('utm_medium')
    if (utmMedium) callbackUrl.searchParams.set('utm_medium', utmMedium)
    callbackUrl.searchParams.set('accepted_terms_version', TERMS_VERSION)
    callbackUrl.searchParams.set('accepted_privacy_version', PRIVACY_VERSION)
    callbackUrl.searchParams.set('policy_accepted_at', new Date().toISOString())
    try {
      const response = await fetch('/api/auth/verify-and-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(TURNSTILE_ENABLED ? { 'x-captcha-token': token } : {}),
        },
        body: JSON.stringify({
          provider: 'apple',
          redirectTo: callbackUrl.toString(),
        }),
      })

      const data = await response.json() as { ok?: boolean; error?: string; url?: string }

      if (!response.ok || !data.ok || !data.url) {
        setError(data.error || 'Failed to start Apple sign-in')
        setAppleLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setAppleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ensurePolicyConsent()) return
    const token = requireCaptchaToken()
    if (token == null) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-and-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(TURNSTILE_ENABLED ? { 'x-captcha-token': token } : {}),
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json() as { ok?: boolean; error?: string; user?: { id: string; email?: string | null } | null; session?: unknown }

      if (!response.ok || !data.ok) {
        const code = (data as { code?: string }).code
        if (code === 'SIGNUPS_DISABLED') {
          setError('Email signup is temporarily unavailable. Use Google or Apple, or try again later.')
        } else if (code === 'EMAIL_EXISTS') {
          setError('An account with that email already exists. Try signing in instead.')
        } else {
          setError(data.error || 'Account creation failed')
        }
        setLoading(false)
        return
      }

      if (data.user) {
        const supabase = createClient()
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        const params = new URLSearchParams(window.location.search)
        const ref = params.get('ref') || null
        const utmSource = params.get('utm_source') || null
        const utmMedium = params.get('utm_medium') || null
        const utmCampaign = params.get('utm_campaign') || null
        const fromSituation = params.get('from') || null
        const selfReportedSource = getSelfReportedSource()
        const signupSource = selfReportedSource ?? utmSource ?? ref ?? (fromSituation ? `situation:${fromSituation}` : null)
        const managerToolsSource = isManagerToolsSource(signupSource)
        const acceptedAt = new Date().toISOString()
        await Promise.all([
          supabase.from('user_profiles').upsert(
            { user_id: data.user.id, briefing_timezone: tz, ...(ref ? { referred_by: ref } : {}) },
            { onConflict: 'user_id' }
          ),
          supabase.from('users').update({
            signup_source: signupSource,
            acquisition_channel: utmMedium ?? (ref ? 'referral' : (selfReportedSource ? 'self_reported' : null)),
            referral_source: utmCampaign ?? utmSource ?? ref ?? selfReportedSource ?? null,
            accepted_terms_version: TERMS_VERSION,
            accepted_privacy_version: PRIVACY_VERSION,
            policy_accepted_at: acceptedAt,
            ...(managerToolsSource ? { trial_ends_at: managerToolsTrialEndsAt() } : {}),
          }).eq('id', data.user.id),
          ref
            ? fetch('/api/partners/attribute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referral_code: ref }),
              }).catch(() => {})
            : Promise.resolve(),
        ])
      }

      try {
        const phParams = new URLSearchParams(window.location.search)
        ph?.capture('signup_completed', {
          method: 'email',
          situation: phParams.get('from') ?? null,
          source: getSelfReportedSource() ?? phParams.get('utm_source') ?? phParams.get('ref') ?? null,
        })
      } catch { /* analytics must not block */ }

      if (!data.session) {
        setConfirmed(true)
        setLoading(false)
        return
      }

      const seatToken = new URLSearchParams(window.location.search).get('seat_token')
      router.push(seatToken ? `/team/join/${seatToken}` : '/dashboard/briefing')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400 hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-16">
<div className="w-full max-w-sm">

          {confirmed ? (
            <>
              <section id="confirm-email" className="mb-8">
                <h2 className="text-[24px] font-bold text-slate-900 leading-tight">Check your email</h2>
                <p className="text-[13px] text-slate-500 mt-1.5">Confirmation link sent to <span className="font-semibold text-slate-700">{email}</span>.</p>
              </section>
              <div className="bg-white border border-slate-200 rounded p-8">
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Open the email, click the link, and finish setup. If it is not there, check spam.
                </p>
              </div>
              <p className="text-center text-[13px] text-slate-400 mt-5">
                Already confirmed?{' '}
                <Link href="/login" className="text-slate-700 font-semibold hover:text-slate-900">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <section id="signup-intro" className="mb-8">
                {situation && SITUATION_COPY[situation] ? (
                  <>
                    <h2 className="text-[22px] font-bold text-slate-900 leading-tight">{SITUATION_COPY[situation].title}</h2>
                    <p className="text-[13px] text-slate-500 mt-1.5">{SITUATION_COPY[situation].sub}</p>
                      <p className="text-[13px] text-slate-400 mt-3">Create your account. {managerToolsOffer ? '90 days free' : '30 days free'}. No credit card.</p>
                    <div className="mt-4 bg-white border border-slate-200 rounded p-3">
                      <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Your first steps</p>
                      <ol className="space-y-1.5 text-[13px] text-slate-600 leading-relaxed">
                        <li>1. Create your account</li>
                        <li>2. {SITUATION_COPY[situation].firstStep}</li>
                        <li>3. Morning rhythm starts: one priority action each day</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-[24px] font-bold text-slate-900 leading-tight">Create your account</h1>
                    <p className="text-[13px] text-slate-500 mt-1.5">{managerToolsOffer ? '90 days free' : '30 days free'}. No credit card.</p>
                  </>
                )}
                {entrySource && ENTRY_HANDOFF[entrySource] && (
                  <div className="mt-4 rounded border border-slate-200 bg-white p-3">
                    <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Continuity note</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed mb-1.5">{ENTRY_HANDOFF[entrySource].title}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed mb-1.5">{ENTRY_HANDOFF[entrySource].body}</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed"><span className="font-semibold text-slate-700">Next:</span> {ENTRY_HANDOFF[entrySource].nextStep}</p>
                  </div>
                )}
              </section>

              <div className="bg-white border border-slate-200 rounded p-8">

                <section id="social-signin" className="mb-5">
                <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Social sign-in</h2>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={authBusy}
                  className="w-full flex items-center justify-center gap-2.5 border border-slate-200 rounded px-4 py-2.5 min-h-[44px] text-[14px] font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer bg-white disabled:opacity-50 disabled:cursor-not-allowed mb-5"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.252 17.64 11.927 17.64 9.2z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>

                <button
                  type="button"
                  onClick={handleApple}
                  disabled={authBusy}
                  className="w-full flex items-center justify-center gap-2.5 rounded px-4 py-2.5 min-h-[44px] text-[14px] font-semibold text-white bg-black hover:bg-slate-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16.365 1.43c0 1.14-.425 2.13-1.273 2.97-.852.84-1.88 1.31-3.084 1.21-.077-1.11.39-2.12 1.16-2.89.85-.85 1.99-1.35 3.197-1.29zM20.93 17.19c-.36.83-.79 1.6-1.29 2.31-.68.97-1.23 1.64-1.65 2.01-.65.6-1.34.91-2.07.93-.52 0-1.15-.15-1.89-.45-.74-.3-1.42-.45-2.04-.45-.65 0-1.35.15-2.1.45-.75.3-1.36.46-1.83.48-.7.03-1.41-.29-2.13-.96-.46-.4-1.04-1.1-1.74-2.1-.75-1.07-1.37-2.31-1.85-3.72-.51-1.52-.77-2.99-.77-4.41 0-1.63.35-3.04 1.06-4.23.56-.96 1.3-1.72 2.24-2.28.94-.56 1.96-.84 3.05-.86.57 0 1.31.18 2.22.53.91.35 1.49.53 1.74.53.19 0 .84-.2 1.95-.6 1.05-.37 1.93-.53 2.65-.48 1.95.16 3.42.93 4.4 2.31-1.75 1.06-2.62 2.55-2.6 4.47.02 1.5.56 2.75 1.64 3.74.49.46 1.04.81 1.64 1.04-.13.38-.27.75-.42 1.12z" />
                  </svg>
                  {appleLoading ? 'Redirecting…' : 'Continue with Apple'}
                </button>
                </section>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[13px] text-slate-400 font-semibold uppercase tracking-wide">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <form id="email-signup" onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-500">Email signup</h2>

                  <div>
                    <label htmlFor="email" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-slate-200 rounded px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                    <p className="mt-1.5 text-[13px] text-slate-400">At least 8 characters.</p>
                  </div>

                  <div>
                    <label htmlFor="heard-about" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                      How did you hear about Starting Monday?
                    </label>
                    <select
                      id="heard-about"
                      value={heardAbout}
                      onChange={(e) => setHeardAbout(e.target.value as HeardAboutOption | '')}
                      disabled={heardAboutLocked}
                      className="w-full border border-slate-200 rounded px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="">Select (optional)</option>
                      {HEARD_ABOUT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {heardAboutLocked ? (
                      <p className="mt-1.5 text-[13px] text-slate-400">Auto-selected from the Manager Tools link.</p>
                    ) : (
                      <p className="mt-1.5 text-[13px] text-slate-400">Optional. Helps us tailor your onboarding.</p>
                    )}
                  </div>

                  {heardAbout === 'other' && !heardAboutLocked ? (
                    <div>
                      <label htmlFor="heard-about-other" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                        Other source
                      </label>
                      <input
                        id="heard-about-other"
                        type="text"
                        value={heardAboutOther}
                        onChange={(e) => setHeardAboutOther(e.target.value)}
                        placeholder="Please specify"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  ) : null}

                  {error && (
                    <p className="text-[13px] text-red-600">{error}</p>
                  )}

                  {TURNSTILE_ENABLED ? <TurnstileWidget onTokenChange={setCaptchaToken} /> : null}

                  <div className="rounded border border-slate-200 bg-slate-50 p-3">
                    <label className="flex items-start gap-2 text-[13px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        I agree to the <Link href="/terms" className="underline hover:text-slate-900">Terms and Conditions</Link>.
                      </span>
                    </label>
                    <label className="mt-2 flex items-start gap-2 text-[13px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        I agree to the <Link href="/privacy" className="underline hover:text-slate-900">Privacy Policy</Link>.
                      </span>
                    </label>
                  </div>



                  <button
                    type="submit"
                    disabled={loading || !agreeTerms || !agreePrivacy}
                    className="w-full flex items-center justify-center bg-slate-900 text-white text-[14px] font-semibold min-h-[44px] rounded cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account…' : (situation && SITUATION_COPY[situation] ? `Create account and ${SITUATION_COPY[situation].cta}` : 'Get started')}
                  </button>
                  <p id="signup-trust" className="text-center text-[13px] text-slate-400">
                    Private by default. We do not share your data with recruiters, employers, or third parties.{' '}
                    <Link href="/privacy" className="inline-flex items-center min-h-[44px] underline hover:text-slate-600">Privacy policy &rarr;</Link>
                  </p>

                </form>
              </div>

              <div className="flex flex-col items-center mt-5">
                <span className="text-[13px] text-slate-400">Already have an account?</span>
                <Link href="/login" className="flex items-center justify-center min-h-[44px] text-[13px] text-slate-700 font-semibold hover:text-slate-900">
                  Sign in
                </Link>
              </div>
              <div className="flex flex-col items-center mt-1">
                <span className="text-[13px] text-slate-400">Not ready to commit?</span>
                <Link href="/demo" className="flex items-center justify-center min-h-[44px] text-[13px] text-slate-700 font-semibold hover:text-slate-900">
                  Explore the demo first &rarr;
                </Link>
              </div>
            </>
          )}

          <p className="text-center text-[13px] text-slate-300 mt-8">
            &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
          </p>

        </div>
      </main>
    </div>
  )
}

