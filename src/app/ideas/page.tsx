'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type FeedbackCategory = 'bug' | 'feature_request' | 'ui_ux' | 'performance' | 'other'
type FeedbackStatus = 'new' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined'

type IdeaItem = {
  id: string
  title: string
  body: string
  category: FeedbackCategory
  status: FeedbackStatus
  vote_count: number
  comment_count: number
  user_voted: boolean
  created_at: string
  user_profiles?: { full_name: string } | null
}

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  ui_ux: 'UI/UX',
  performance: 'Performance',
  other: 'Other',
}

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  new: 'bg-slate-100 text-slate-600',
  under_review: 'bg-blue-50 text-blue-700',
  planned: 'bg-violet-50 text-violet-700',
  in_progress: 'bg-orange-50 text-orange-700',
  shipped: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-700',
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  shipped: 'Shipped',
  declined: 'Declined',
}

const CATEGORIES: Array<{ value: FeedbackCategory | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'feature_request', label: 'Features' },
  { value: 'ui_ux', label: 'UI / UX' },
  { value: 'bug', label: 'Bugs' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Other' },
]

export default function IdeasPage() {
  const [items, setItems] = useState<IdeaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState<FeedbackCategory | ''>('')
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ sortBy, limit: '100' })
      if (category) params.set('category', category)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/feedback/items?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setItems(data.items || [])
    } finally {
      setIsLoading(false)
    }
  }, [category, sortBy, debouncedSearch])

  useEffect(() => { fetchItems() }, [fetchItems])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-bold text-slate-900 tracking-tight">
            Starting Monday
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-slate-900 mb-2">Ideas & Feedback</h1>
          <p className="text-[15px] text-slate-500 leading-relaxed max-w-2xl">
            We build Starting Monday for executives in search. Share what would make it better — vote on ideas you care about, and watch them ship.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${
                  category === cat.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 sm:ml-auto">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'votes' | 'recent')}
              className="border border-slate-200 rounded px-3 py-1.5 text-[12px] text-slate-700 bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="votes">Top voted</option>
              <option value="recent">Most recent</option>
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-200 rounded px-3 py-1.5 text-[12px] text-slate-700 bg-white placeholder:text-slate-300 focus:outline-none focus:border-slate-400 w-40 sm:w-52"
            />
          </div>
        </div>

        {/* Ideas list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-full mb-1.5" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-[15px] font-semibold mb-1">No ideas yet</p>
            <p className="text-[13px]">Be the first to submit one.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-colors">
                <div className="flex gap-4">

                  {/* Vote button */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                    <Link
                      href="/login"
                      className={`flex flex-col items-center gap-0.5 group ${
                        item.user_voted ? 'text-orange-500' : 'text-slate-400 hover:text-orange-500'
                      } transition-colors`}
                      title="Log in to vote"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[13px] font-bold leading-none">{item.vote_count}</span>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap mb-1.5">
                      <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">{item.title}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-2">{item.body}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      {item.comment_count > 0 && (
                        <span>{item.comment_count} comment{item.comment_count !== 1 ? 's' : ''}</span>
                      )}
                      <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit CTA */}
        <div className="mt-10 bg-white border border-slate-200 rounded-lg p-6 text-center">
          <h2 className="text-[16px] font-bold text-slate-900 mb-1.5">Have an idea?</h2>
          <p className="text-[13px] text-slate-500 mb-4">
            Log in to submit an idea or vote on the ones that matter most to you.
          </p>
          <Link
            href="/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors"
          >
            Log in to submit or vote
          </Link>
        </div>

      </main>
    </div>
  )
}
