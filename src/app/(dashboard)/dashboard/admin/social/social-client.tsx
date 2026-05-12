'use client'
import { useState, useEffect } from 'react'

type SocialPost = {
  id: string
  post_date: string
  pillar: string
  draft_text: string
  is_posted: boolean
  posted_at: string | null
  buffer_update_id: string | null
  buffer_scheduled_at: string | null
  notes: string | null
}

type TodayResponse =
  | { isPostDay: false; dateStr: string; nextPostDays: string[] }
  | { isPostDay: true; dateStr: string; pillar: string; pillarLabel: string; post: SocialPost }

const LINKEDIN_URL = 'https://www.linkedin.com/feed/'
const LINKEDIN_MESSAGING_URL = 'https://www.linkedin.com/messaging/compose/'
const LINKEDIN_MYNETWORK_URL = 'https://www.linkedin.com/mynetwork/'

const CONNECTION_TEMPLATES = [
  {
    label: 'Cold — exec in search',
    text: `Hi [Name], I'm building Starting Monday — daily market intelligence for senior tech execs in active search. Thought it might be useful given where you are. Happy to connect.`,
  },
  {
    label: 'Warm — referred or met',
    text: `Hi [Name], [Referrer] suggested I reach out. I'm building Starting Monday for CIOs and CTOs navigating a search. Would love to stay connected.`,
  },
  {
    label: 'Follow-up — after content',
    text: `Hi [Name], glad the post resonated. I built Starting Monday for exactly the dynamic you described — would love to connect and hear more about what you're seeing.`,
  },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}


export function SocialClient() {
  const [state, setState] = useState<TodayResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draftText, setDraftText] = useState('')
  const [notesText, setNotesText] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [copied, setCopied] = useState(false)
  const [markingPosted, setMarkingPosted] = useState(false)
  const [posting, setPosting] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null)
  const [connectionTexts, setConnectionTexts] = useState<string[]>(
    CONNECTION_TEMPLATES.map(t => t.text)
  )

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/social/today')
      if (!res.ok) { setError(`Failed to load (${res.status})`); return }
      const data: TodayResponse = await res.json()
      setState(data)
      if (data.isPostDay) {
        setDraftText(data.post.draft_text)
        setNotesText(data.post.notes ?? '')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!state?.isPostDay || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/social/${state.post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_text: draftText }),
      })
      if (!res.ok) { setError('Save failed'); return }
      const data = await res.json()
      setState(prev => prev?.isPostDay ? { ...prev, post: data.post } : prev)
    } finally {
      setSaving(false)
    }
  }

  async function handleNotesSave() {
    if (!state?.isPostDay || savingNotes) return
    setSavingNotes(true)
    try {
      await fetch(`/api/admin/social/${state.post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesText }),
      })
      setState(prev => prev?.isPostDay ? { ...prev, post: { ...prev.post, notes: notesText || null } } : prev)
    } finally {
      setSavingNotes(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(draftText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (state?.isPostDay && draftText !== state.post.draft_text) await handleSave()
  }

  async function handleMarkPosted() {
    if (!state?.isPostDay || markingPosted) return
    setMarkingPosted(true)
    try {
      if (draftText !== state.post.draft_text) await handleSave()
      const res = await fetch(`/api/admin/social/${state.post.id}/mark-posted`, { method: 'POST' })
      if (!res.ok) { setError('Failed to mark posted'); return }
      const data = await res.json()
      setState(prev => prev?.isPostDay ? { ...prev, post: data.post } : prev)
    } finally {
      setMarkingPosted(false)
    }
  }

  async function handlePost() {
    if (!state?.isPostDay || posting) return
    setPosting(true)
    setError('')
    try {
      if (draftText !== state.post.draft_text) await handleSave()
      const res = await fetch(`/api/admin/social/${state.post.id}/schedule`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; detail?: string }
        setError(body.error ?? 'Failed to post to LinkedIn')
        return
      }
      const data = await res.json()
      setState(prev => prev?.isPostDay ? { ...prev, post: data.post } : prev)
    } finally {
      setPosting(false)
    }
  }

  async function handleCopyTemplate(index: number) {
    await navigator.clipboard.writeText(connectionTexts[index])
    setCopiedTemplate(index)
    setTimeout(() => setCopiedTemplate(null), 2000)
  }

  async function handleRegenerate() {
    if (!state?.isPostDay || regenerating) return
    setRegenerating(true)
    setError('')
    try {
      await fetch(`/api/admin/social/${state.post.id}`, { method: 'DELETE' }).catch(() => {})
      const res = await fetch(`/api/admin/social/today?regen=${Date.now()}`)
      if (!res.ok) { setError('Regeneration failed'); return }
      const data: TodayResponse = await res.json()
      setState(data)
      if (data.isPostDay) {
        setDraftText(data.post.draft_text)
        setNotesText(data.post.notes ?? '')
      }
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded p-8 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:300ms]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded p-6">
        <p className="text-[13px] text-red-600 mb-3">{error}</p>
        <button
          type="button"
          onClick={() => { setError(''); load() }}
          className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 cursor-pointer bg-transparent transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!state) return null

  if (!state.isPostDay) {
    return (
      <div className="bg-white border border-slate-200 rounded p-8 text-center">
        <p className="text-[14px] font-semibold text-slate-900 mb-2">No post scheduled today.</p>
        <p className="text-[13px] text-slate-500">Posts go out Monday, Wednesday, and Friday.</p>
        {state.nextPostDays.length > 0 && (
          <p className="text-[12px] text-slate-400 mt-3">
            Next: {state.nextPostDays.map(d => formatDate(d)).join(', ')}
          </p>
        )}
      </div>
    )
  }

  const { post, pillarLabel, dateStr } = state
  const isDirty = draftText !== post.draft_text
  const isNotesDirty = notesText !== (post.notes ?? '')
  const busy = saving || savingNotes || markingPosted || posting || regenerating

  return (
    <div className="flex flex-col gap-4">

      {/* Date + pillar header */}
      <div className="bg-white border border-slate-200 rounded px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-slate-900">{formatDate(dateStr)}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
              {pillarLabel}
            </span>
            {post.is_posted && (
              <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                Posted {post.posted_at ? new Date(post.posted_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={busy}
          className="shrink-0 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 hover:text-slate-700 bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {regenerating ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

      {/* Draft editor */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400">Post Draft</p>
          {isDirty && !saving && (
            <span className="text-[11px] text-amber-600 font-medium">Unsaved edits</span>
          )}
          {saving && (
            <span className="text-[11px] text-slate-400">Saving…</span>
          )}
        </div>
        <textarea
          value={draftText}
          onChange={e => setDraftText(e.target.value)}
          onBlur={isDirty ? handleSave : undefined}
          disabled={busy}
          rows={14}
          className="w-full text-[14px] text-slate-700 leading-relaxed border border-slate-200 rounded px-4 py-3 resize-none focus:outline-none focus:border-slate-400 font-[inherit] disabled:opacity-50"
          placeholder="Draft will appear here…"
        />
        <p className="mt-1.5 text-[11px] text-slate-300">{draftText.length} characters · Edits save on blur</p>
      </div>

      {/* Character count advisory */}
      {draftText.length > 3000 && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded text-[12px] text-amber-700">
          LinkedIn limits posts to 3,000 characters. This draft is {draftText.length} characters -- trim before posting.
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handlePost}
          disabled={busy || !draftText.trim() || post.is_posted}
          className="flex-1 bg-indigo-600 text-white text-[13px] font-semibold px-5 py-3 rounded cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-indigo-700"
        >
          {posting ? 'Posting…' : 'Post to LinkedIn'}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={busy || !draftText.trim()}
          className="flex-1 bg-slate-900 text-white text-[13px] font-semibold px-5 py-3 rounded cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-slate-800"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-[13px] font-semibold text-slate-700 border border-slate-200 rounded px-5 py-3 hover:border-slate-400 hover:text-slate-900 transition-colors"
        >
          Open LinkedIn
        </a>
        {!post.is_posted ? (
          <button
            type="button"
            onClick={handleMarkPosted}
            disabled={busy}
            className="flex-1 text-[13px] font-semibold text-green-700 border border-green-200 rounded px-5 py-3 hover:border-green-400 bg-green-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {markingPosted ? 'Saving…' : 'Mark posted (manual)'}
          </button>
        ) : (
          <div className="flex-1 text-center text-[13px] font-semibold text-green-700 border border-green-200 rounded px-5 py-3 bg-green-50">
            Posted
          </div>
        )}
      </div>

      {/* Connection outreach */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400">LinkedIn Connection Messages</p>
          <div className="flex gap-2">
            <a
              href={LINKEDIN_MESSAGING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 hover:text-slate-800 transition-colors"
            >
              Open Messaging
            </a>
            <a
              href={LINKEDIN_MYNETWORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 hover:text-slate-800 transition-colors"
            >
              My Network
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {CONNECTION_TEMPLATES.map((template, i) => (
            <div key={template.label} className="border border-slate-100 rounded p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.07em]">{template.label}</span>
                <button
                  type="button"
                  onClick={() => handleCopyTemplate(i)}
                  className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1 hover:border-slate-400 hover:text-slate-800 bg-white cursor-pointer transition-colors"
                >
                  {copiedTemplate === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                value={connectionTexts[i]}
                onChange={e => setConnectionTexts(prev => prev.map((t, j) => j === i ? e.target.value : t))}
                rows={3}
                title={template.label}
                placeholder="Edit connection message…"
                className="w-full text-[13px] text-slate-700 leading-relaxed border border-slate-200 rounded px-3 py-2 resize-none focus:outline-none focus:border-slate-400 font-[inherit] bg-white"
              />
              <p className="mt-1 text-[11px] text-slate-300">{connectionTexts[i].length} chars</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400">Notes (engagement, replies, reach)</p>
          {isNotesDirty && !savingNotes && (
            <span className="text-[11px] text-amber-600 font-medium">Unsaved</span>
          )}
          {savingNotes && (
            <span className="text-[11px] text-slate-400">Saving…</span>
          )}
        </div>
        <textarea
          value={notesText}
          onChange={e => setNotesText(e.target.value)}
          onBlur={isNotesDirty ? handleNotesSave : undefined}
          disabled={busy}
          rows={3}
          className="w-full text-[13px] text-slate-700 leading-relaxed border border-slate-200 rounded px-4 py-3 resize-none focus:outline-none focus:border-slate-400 font-[inherit] disabled:opacity-50"
          placeholder="Likes, comments, notable replies… saves on blur"
        />
      </div>

    </div>
  )
}
