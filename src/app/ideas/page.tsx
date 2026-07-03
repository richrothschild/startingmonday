'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Category = 'feature_request' | 'ui_ux' | 'bug' | 'performance' | 'other'

type Idea = {
  id: string
  name: string | null
  category: Category
  body: string
  ai_rating: { score: number; rationale: string } | null
  created_at: string
}

const CATEGORY_LABELS: Record<Category, string> = {
  feature_request: 'Feature',
  ui_ux: 'UI / UX',
  bug: 'Bug',
  performance: 'Performance',
  other: 'Other',
}

const CATEGORIES: Array<{ value: Category | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'feature_request', label: 'Features' },
  { value: 'ui_ux', label: 'UI / UX' },
  { value: 'bug', label: 'Bugs' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' },
]

function getInitials(name?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.trim().slice(0, 2).toUpperCase()
  }
  return '?'
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState<Category | ''>('')
  const [sortBy, setSortBy] = useState<'recent' | 'rated'>('recent')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
    })
  }, [])

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formCategory, setFormCategory] = useState<Category | ''>('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')

  const fetchIdeas = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ sortBy })
      if (category) params.set('category', category)
      const res = await fetch(`/api/ideas?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setIdeas(data.ideas ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [category, sortBy])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category: formCategory, body }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong. Please try again.')
        setSubmitState('error')
        return
      }
      setSubmitState('success')
      setName('')
      setEmail('')
      setFormCategory('')
      setBody('')
      fetchIdeas()
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setSubmitState('error')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-slate-400 bg-white'
  const labelCls = 'block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-200 mb-1.5'

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-bold text-slate-900 tracking-tight">
            Starting Monday
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">

        {/* Hero */}
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 mb-2">Ideas & Feedback</h1>
          <p className="text-[15px] text-slate-500 leading-relaxed max-w-xl">
            Tell us what would make Starting Monday better. Every month we randomly select one submitter to receive a <span className="font-semibold text-slate-700">$25 Amazon gift card</span>.
          </p>
        </div>

        {/* Submit form */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-4">Share your idea</h2>

          {submitState === 'success' ? (
            <div className="text-center py-6">
              <p className="text-[22px] font-bold text-slate-900 mb-2">Thank you!</p>
              <p className="text-[14px] text-slate-500 leading-relaxed mb-4">
                Your idea has been submitted. You are entered in this month&apos;s gift card drawing.
              </p>
              <button
                onClick={() => setSubmitState('idle')}
                className="text-[13px] text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Submit another idea
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name <span className="text-slate-200 font-normal normal-case tracking-normal">optional</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as Category)}
                  required
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.filter(c => c.value !== '').map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Your idea <span className="text-red-400">*</span></label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="I'd love it if Starting Monday could..."
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  className={`${inputCls} resize-none`}
                />
                <p className="text-[11px] text-slate-200 mt-1 text-right">{body.length} / 2000</p>
              </div>

              {submitState === 'error' && (
                <p className="text-[13px] text-red-600">{submitError}</p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-200 leading-relaxed max-w-xs">
                  Your email is private and only used to contact you if you win the monthly gift card.
                </p>
                <button
                  type="submit"
                  disabled={submitting || !email || !formCategory || !body}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors shrink-0"
                >
                  {submitting ? 'Submitting...' : 'Submit idea'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Browse ideas */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <h2 className="text-[15px] font-bold text-slate-900 mr-auto">Recent ideas</h2>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'recent' | 'rated')}
              className="border border-slate-200 rounded px-3 py-1.5 text-[12px] text-slate-700 bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="recent">Most recent</option>
              <option value="rated">Highest rated</option>
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${
                  category === cat.value
                    ? 'bg-slate-950 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
                      <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
              <p className="text-[14px] text-slate-200">No ideas yet in this category. Be the first!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ideas.map(idea => (
                <div key={idea.id} className="bg-white border border-slate-200 rounded-lg p-5">
                  <div className="flex gap-4">

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[12px] font-bold shrink-0">
                      {getInitials(idea.name)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[12px] font-semibold text-slate-700">
                          {idea.name?.trim() ? idea.name.trim().split(' ')[0] : 'Anonymous'}
                        </span>
                        <span className="text-[11px] text-slate-200">&middot;</span>
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded">
                          {CATEGORY_LABELS[idea.category]}
                        </span>
                        {idea.ai_rating && (
                          <span className="bg-orange-50 text-orange-600 text-[11px] font-semibold px-2 py-0.5 rounded">
                            {idea.ai_rating.score}/10
                          </span>
                        )}
                        <span className="text-[11px] text-slate-200 ml-auto">
                          {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[14px] text-slate-700 leading-relaxed">{idea.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      
        <p className="sr-only">Private by default. We do not share your data with recruiters, employers, or third parties.</p>
      </main>
    </div>
  )
}
