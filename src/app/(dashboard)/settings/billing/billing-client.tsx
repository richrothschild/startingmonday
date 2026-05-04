'use client'
import Link from 'next/link'
import { useState } from 'react'
import type { UserSubscription } from '@/lib/subscription'
import { PLANS } from '@/lib/plans'
import type { BillingInterval } from '@/lib/plans'

function fmtDate(d: Date | null) {
  if (!d) return null
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function BillingClient({ sub, hasStripeCustomer, accountEmail, accountName }: {
  sub: UserSubscription
  hasStripeCustomer: boolean
  accountEmail: string
  accountName: string | null
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [portalError, setPortalError] = useState('')

  async function handleCheckout(plan: 'monitor' | 'active') {
    setLoading(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      })
      const data = await res.json().catch(() => ({ error: `Server error ${res.status}` }))
      if (data.error) { alert(data.error); return }
      if (!data.url) { alert('No checkout URL returned'); return }
      window.location.href = data.url
    } catch (e) {
      alert(`Checkout failed: ${e}`)
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    setPortalError('')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) {
        setPortalError(res.status === 404
          ? 'No Stripe billing record found for your account. Email support@startingmonday.app and we will sort it out.'
          : error)
        return
      }
      window.location.href = url
    } finally {
      setLoading(null)
    }
  }

  async function handlePause() {
    if (!confirm('Pause your subscription? You will lose access to AI features until you resume.')) return
    setLoading('pause')
    try {
      const res = await fetch('/api/billing/pause', { method: 'POST' })
      const { ok, error } = await res.json()
      if (error) { alert(error); return }
      if (ok) window.location.reload()
    } finally {
      setLoading(null)
    }
  }

  async function handleResume() {
    setLoading('resume')
    try {
      const res = await fetch('/api/billing/resume', { method: 'POST' })
      const { ok, error } = await res.json()
      if (error) { alert(error); return }
      if (ok) window.location.reload()
    } finally {
      setLoading(null)
    }
  }

  const trialDaysLeft = sub.trialEndsAt
    ? Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - Date.now()) / 86_400_000))
    : null

  const planLabel = sub.isPaused ? 'Paused'
    : sub.status === 'canceled' ? 'Canceled'
    : sub.tier === 'free' ? 'Free trial'
    : sub.tier

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">Starting Monday</span>
          <Link href="/dashboard" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-[26px] font-bold text-slate-900 mb-1">Billing</h1>
        <p className="text-[13px] text-slate-500 mb-8">Manage your subscription and plan.</p>

        {/* Account */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Account</p>
          {accountName && (
            <p className="text-[15px] font-semibold text-slate-900">{accountName}</p>
          )}
          <p className="text-[13px] text-slate-500">{accountEmail}</p>
        </div>

        {/* Current status */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-8">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Current Plan</p>

          {sub.status === 'trialing' && trialDaysLeft != null && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded text-[13px] text-amber-800">
              You are in your free trial — <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining</strong>. Subscribe below to keep access after the trial ends.
            </div>
          )}
          {sub.isPaused && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded text-[13px] text-amber-800">
              Your subscription is paused. Resume below to restore access to AI briefs, outreach drafting, and chat.
            </div>
          )}
          {sub.status === 'past_due' && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
              Your last payment failed. Update your payment method to restore access.
            </div>
          )}
          {sub.status === 'canceled' && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded text-[13px] text-amber-800">
              Your subscription was canceled.{sub.periodEnd ? ` Access ended ${fmtDate(sub.periodEnd)}.` : ''}{' '}
              Subscribe below to restore access to AI briefs, outreach drafting, and chat.
            </div>
          )}

          <div className="flex items-center gap-4">
            <div>
              <p className="text-[18px] font-bold text-slate-900 capitalize">{planLabel}</p>
              <p className="text-[13px] text-slate-500 capitalize">{sub.status.replace('_', ' ')}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {sub.isPaused && hasStripeCustomer && (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={loading === 'resume'}
                  className="text-[13px] font-semibold text-white bg-slate-900 border-0 rounded px-4 py-2 hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading === 'resume' ? 'Resuming…' : 'Resume subscription'}
                </button>
              )}
              {sub.isPaid && !sub.isPaused && hasStripeCustomer && (
                <>
                  <button
                    type="button"
                    onClick={handlePause}
                    disabled={!!loading}
                    className="text-[13px] font-semibold text-slate-500 border border-slate-200 rounded px-4 py-2 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    {loading === 'pause' ? 'Pausing…' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePortal}
                    disabled={loading === 'portal'}
                    className="text-[13px] font-semibold text-slate-700 border border-slate-200 rounded px-4 py-2 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    {loading === 'portal' ? 'Loading…' : 'Manage subscription'}
                  </button>
                </>
              )}
            </div>
          </div>
          {sub.isPaid && !sub.isPaused && hasStripeCustomer && (
            <p className="mt-3 text-[12px] text-slate-400">
              <strong className="font-semibold text-slate-500">Pause</strong> stops billing temporarily &mdash; your data and pipeline stay intact.{' '}
              <strong className="font-semibold text-slate-500">Cancel</strong> (via Manage subscription) ends your subscription entirely.
            </p>
          )}
          {portalError && (
            <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
              {portalError}
            </div>
          )}
        </div>

        {/* Plans */}
        {!sub.isPaid && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400">Choose a plan</p>
              <div className="ml-auto flex rounded border border-slate-200 overflow-hidden text-[12px] font-semibold">
                <button
                  type="button"
                  onClick={() => setInterval('monthly')}
                  className={`px-4 py-1.5 transition-colors ${interval === 'monthly' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('quarterly')}
                  className={`px-4 py-1.5 transition-colors ${interval === 'quarterly' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  Quarterly
                </button>
              </div>
              {interval === 'quarterly' && (
                <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  Save 10%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
                const amount = interval === 'quarterly' ? plan.quarterlyAmount : plan.amount
                const monthlyEquiv = interval === 'quarterly' ? Math.round(plan.quarterlyAmount / 3) : null
                return (
                  <div key={key} className={`bg-white border rounded p-6 ${key === 'active' ? 'border-slate-900' : 'border-slate-200'}`}>
                    {key === 'active' && (
                      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-900 mb-3">Most popular</p>
                    )}
                    <p className="text-[20px] font-bold text-slate-900">{plan.name}</p>
                    <p className="text-[28px] font-bold text-slate-900 mt-1">
                      ${(amount / 100).toFixed(0)}
                      <span className="text-[14px] font-normal text-slate-500">
                        {interval === 'quarterly' ? '/quarter' : '/mo'}
                      </span>
                    </p>
                    {monthlyEquiv && (
                      <p className="text-[12px] text-slate-400 mt-0.5">${(monthlyEquiv / 100).toFixed(0)}/mo equivalent</p>
                    )}
                    <p className="text-[13px] text-slate-500 mt-2 mb-5 leading-relaxed">{plan.description}</p>
                    <button
                      type="button"
                      onClick={() => handleCheckout(key as 'monitor' | 'active')}
                      disabled={loading === key}
                      className={`w-full py-2.5 rounded text-[13px] font-semibold border-0 cursor-pointer disabled:opacity-50 ${key === 'active' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                    >
                      {loading === key ? 'Redirecting…' : `Subscribe to ${plan.name}`}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
