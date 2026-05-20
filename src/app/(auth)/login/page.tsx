'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)

  const authBusy = googleLoading || appleLoading || loading || magicLinkLoading

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      const response = await fetch('/api/auth/verify-and-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          redirectTo: `${window.location.origin}/auth/callback`,
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
    setAppleLoading(true)
    try {
      const response = await fetch('/api/auth/verify-and-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'apple',
          redirectTo: `${window.location.origin}/auth/callback`,
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (authBusy) return
    setLoading(true)
    setError(null)
    setInfo(null)

    // Password managers can populate DOM inputs without firing onChange.
    // Read from the submitted form first, then fall back to React state.
    const formData = new FormData(e.currentTarget)
    const submittedEmail = (formData.get('email')?.toString().trim().toLowerCase() ?? '') || email
    const submittedPassword = (formData.get('password')?.toString() ?? '') || password

    setEmail(submittedEmail)
    setPassword(submittedPassword)

    try {
      const response = await fetch('/api/auth/verify-and-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail, password: submittedPassword }),
      })

      const data = await response.json() as { ok?: boolean; error?: string; code?: string; user?: unknown }

      if (!response.ok || !data.ok) {
        if (data.code === 'INVALID_CREDENTIALS') {
          setError('That email/password did not work. If this account was created with Google or Apple, sign in with that provider first, then set a password in Settings > Security.')
        } else {
          setError(data.error || 'Sign-in failed')
        }
        setLoading(false)
        return
      }

      // Successfully authenticated; cookies are already set by server
      router.push('/dashboard/briefing')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function handleMagicLink() {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Enter your email first, then request a sign-in link.')
      return
    }

    setMagicLinkLoading(true)
    setInfo(null)

    try {
      const response = await fetch('/api/auth/verify-and-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/briefing`,
        }),
      })

      const data = await response.json() as { ok?: boolean; error?: string; message?: string }

      if (!response.ok || !data.ok) {
        setError(data.error || 'Could not send sign-in link. Please try again.')
        return
      }

      setInfo(data.message || 'If an account exists for that email, a sign-in link has been sent.')
    } catch {
      setError('Could not send sign-in link. Please try again.')
    } finally {
      setMagicLinkLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-16">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-slate-900 leading-tight">Sign in</h1>
            <p className="text-[13px] text-slate-500 mt-1.5">Welcome back.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded p-8">

            <button
              type="button"
              onClick={handleGoogle}
              disabled={authBusy}
              className="w-full flex items-center justify-center gap-2.5 border border-slate-200 rounded px-4 py-2.5 text-[14px] font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer bg-white disabled:opacity-50 disabled:cursor-not-allowed mb-5"
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
              className="w-full flex items-center justify-center gap-2.5 rounded px-4 py-2.5 text-[14px] font-semibold text-white bg-black hover:bg-slate-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.365 1.43c0 1.14-.425 2.13-1.273 2.97-.852.84-1.88 1.31-3.084 1.21-.077-1.11.39-2.12 1.16-2.89.85-.85 1.99-1.35 3.197-1.29zM20.93 17.19c-.36.83-.79 1.6-1.29 2.31-.68.97-1.23 1.64-1.65 2.01-.65.6-1.34.91-2.07.93-.52 0-1.15-.15-1.89-.45-.74-.3-1.42-.45-2.04-.45-.65 0-1.35.15-2.1.45-.75.3-1.36.46-1.83.48-.7.03-1.41-.29-2.13-.96-.46-.4-1.04-1.1-1.74-2.1-.75-1.07-1.37-2.31-1.85-3.72-.51-1.52-.77-2.99-.77-4.41 0-1.63.35-3.04 1.06-4.23.56-.96 1.3-1.72 2.24-2.28.94-.56 1.96-.84 3.05-.86.57 0 1.31.18 2.22.53.91.35 1.49.53 1.74.53.19 0 .84-.2 1.95-.6 1.05-.37 1.93-.53 2.65-.48 1.95.16 3.42.93 4.4 2.31-1.75 1.06-2.62 2.55-2.6 4.47.02 1.5.56 2.75 1.64 3.74.49.46 1.04.81 1.64 1.04-.13.38-.27.75-.42 1.12z" />
              </svg>
              {appleLoading ? 'Redirecting…' : 'Continue with Apple'}
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div>
                <label htmlFor="email" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              {error && (
                <p className="text-[13px] text-red-600">{error}</p>
              )}

              {info && (
                <p className="text-[13px] text-emerald-700">{info}</p>
              )}

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={authBusy}
                className="w-full border border-slate-300 text-slate-700 text-[13px] font-semibold py-2.5 rounded cursor-pointer bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {magicLinkLoading ? 'Sending sign-in link...' : 'Email me a sign-in link instead'}
              </button>

              <p className="text-[12px] text-slate-500 -mt-1">
                Signed up with Google or Apple? Use that provider to sign in first, then set a password at{' '}
                <Link href="/settings/security" className="text-slate-700 font-semibold hover:text-slate-900">
                  Settings → Security
                </Link>
                .
              </p>




              <button
                type="submit"
                disabled={authBusy}
                className="w-full bg-slate-900 text-white text-[14px] font-semibold py-2.5 rounded cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

            </form>
          </div>

          <p className="text-center text-[13px] text-slate-400 mt-5">
            No account?{' '}
            <Link href="/signup" className="text-slate-700 font-semibold hover:text-slate-900">
              Get early access
            </Link>
          </p>

          <p className="text-center text-[11px] text-slate-300 mt-8">
            &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
          </p>

        </div>
      </main>
    </div>
  )
}
