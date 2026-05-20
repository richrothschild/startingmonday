'use client'

import { useState } from 'react'

export function SecurityClient({ accountEmail }: { accountEmail: string }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json() as { ok?: boolean; error?: string; message?: string }

      if (!response.ok || !data.ok) {
        setError(data.error || 'Could not save password.')
        setLoading(false)
        return
      }

      setPassword('')
      setConfirmPassword('')
      setSuccess(data.message || 'Password saved successfully.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-6 sm:p-8">
      <h2 className="text-[20px] font-bold text-slate-900">Security</h2>
      <p className="text-[13px] text-slate-500 mt-1">
        Add or change your password for <span className="font-semibold text-slate-700">{accountEmail}</span>.
      </p>
      <p className="text-[13px] text-slate-500 mt-1.5">
        If you originally signed up with Google or Apple, this links a password so you can sign in either way.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-md">
        <div>
          <label htmlFor="new-password" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
            New password
          </label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        {error && <p className="text-[13px] text-red-600">{error}</p>}
        {success && <p className="text-[13px] text-emerald-700">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-slate-900 text-white text-[14px] font-semibold py-2.5 px-5 rounded cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save password'}
        </button>
      </form>
    </div>
  )
}