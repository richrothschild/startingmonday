'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        await supabase.from('user_profiles').upsert(
          { user_id: data.user.id, briefing_timezone: tz },
          { onConflict: 'user_id' }
        )
      }

      router.push('/dashboard')
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
          <Link href="/" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600 hover:text-slate-400 transition-colors">
            Starting Monday
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-slate-900 leading-tight">Sign in</h1>
            <p className="text-[13px] text-slate-500 mt-1.5">Welcome back.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded p-8">

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
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
                  type="email"
                  required
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
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              {error && (
                <p className="text-[13px] text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
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

        </div>
      </main>
    </div>
  )
}
