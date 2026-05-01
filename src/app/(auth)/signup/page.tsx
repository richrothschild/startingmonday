'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

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

    // If email confirmation is required, the session won't exist yet
    if (!data.session) {
      setConfirmed(true)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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

          {confirmed ? (
            <>
              <div className="mb-8">
                <h1 className="text-[24px] font-bold text-slate-900 leading-tight">Check your email</h1>
                <p className="text-[13px] text-slate-500 mt-1.5">We sent a confirmation link to <span className="font-semibold text-slate-700">{email}</span>.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded p-8">
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Click the link in the email to activate your account and set up your profile. Check your spam folder if you don&apos;t see it within a minute.
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
              <div className="mb-8">
                <h1 className="text-[24px] font-bold text-slate-900 leading-tight">Create your account</h1>
                <p className="text-[13px] text-slate-500 mt-1.5">Free to get started.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded p-8">
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
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                    <p className="mt-1.5 text-[12px] text-slate-400">At least 8 characters.</p>
                  </div>

                  {error && (
                    <p className="text-[13px] text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white text-[14px] font-semibold py-2.5 rounded cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account…' : 'Get started'}
                  </button>

                </form>
              </div>

              <p className="text-center text-[13px] text-slate-400 mt-5">
                Already have an account?{' '}
                <Link href="/login" className="text-slate-700 font-semibold hover:text-slate-900">
                  Sign in
                </Link>
              </p>
            </>
          )}

        </div>
      </main>
    </div>
  )
}
