'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { BlogPostMeta } from '@/lib/blog-posts'

type Result = {
  slug: string
  title: string
  description: string
}

function rankPosts(query: string, posts: BlogPostMeta[]): Result[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const terms = q.split(/\s+/).filter(t => t.length > 2)
  if (terms.length === 0) return []

  const scored = posts.map(post => {
    const haystack = `${post.title} ${post.description} ${(post.keywords ?? []).join(' ')}`.toLowerCase()
    const score = terms.reduce((acc, term) => {
      const inTitle = post.title.toLowerCase().includes(term) ? 3 : 0
      const inDesc = post.description.toLowerCase().includes(term) ? 2 : 0
      const inKeywords = (post.keywords ?? []).some((k: string) => k.toLowerCase().includes(term)) ? 1 : 0
      const inBody = haystack.includes(term) ? 1 : 0
      return acc + inTitle + inDesc + inKeywords + inBody
    }, 0)
    return { post, score }
  })

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ post }) => ({ slug: post.slug, title: post.title, description: post.description }))
}

export function BlogChat({ posts }: { posts: BlogPostMeta[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[] | null>(null)
  const [searched, setSearched] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const matches = rankPosts(query, posts)
    setResults(matches)
    setSearched(true)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Ask the blog</p>
      <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
        Ask a question and find the most relevant articles and guides.
      </p>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. How do I get in front of a search firm?"
          className="flex-1 border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-500 bg-white"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="bg-slate-900 text-white text-[13px] font-semibold px-4 py-2.5 rounded hover:bg-slate-700 transition-colors disabled:opacity-40 shrink-0"
        >
          Search
        </button>
      </form>

      {searched && results !== null && (
        results.length > 0 ? (
          <ul className="space-y-3">
            {results.map(r => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className="group block rounded border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors">
                  <p className="text-[14px] font-semibold text-slate-900 group-hover:text-slate-600 leading-snug mb-1">
                    {r.title}
                  </p>
                  <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                    {r.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-slate-500">No matching articles found. Try different keywords.</p>
        )
      )}
    </div>
  )
}
