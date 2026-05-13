'use client'
import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { rateTrace } from './actions'

export type Trace = {
  id: string
  created_at: string
  user_id: string | null
  feature: string
  model: string
  prompt_tokens: number | null
  completion_tokens: number | null
  latency_ms: number | null
  input_snapshot: Record<string, unknown> | null
  output_snapshot: string | null
  eval_pass: boolean | null
  eval_notes: string | null
}

const FEATURES = ['', 'prep_brief', 'prep_refine', 'chat', 'suggestions']
const FEATURE_LABELS: Record<string, string> = {
  '':           'All features',
  prep_brief:   'Prep brief',
  prep_refine:  'Prep refine',
  chat:         'Chat',
  suggestions:  'Suggestions',
}

const FAILURE_CATEGORIES = [
  'company_context_thin',
  'role_fit_not_established',
  'questions_too_generic',
  'format_off',
  'tone_wrong',
  'factual_error',
  'missing_context_not_flagged',
  'competitive_framing_missed',
]

function parseEvalNotes(raw: string | null): { body: string; categories: string[] } {
  if (!raw?.trim()) return { body: '', categories: [] }

  const lines = raw.split(/\r?\n/)
  const categoryLineIndex = lines.findIndex((line) => /^\s*categories\s*:/i.test(line))

  if (categoryLineIndex < 0) return { body: raw.trim(), categories: [] }

  const categoryLine = lines[categoryLineIndex].replace(/^\s*categories\s*:/i, '')
  const categories = categoryLine
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const body = lines
    .filter((_, idx) => idx !== categoryLineIndex)
    .join('\n')
    .trim()

  return { body, categories }
}

function composeEvalNotes(body: string, categories: string[]): string {
  const normalizedBody = body.trim()
  const normalizedCategories = [...new Set(categories.map((item) => item.trim()).filter(Boolean))]
  if (normalizedCategories.length === 0) return normalizedBody

  const categoryLine = `Categories: ${normalizedCategories.join(', ')}`
  return normalizedBody ? `${normalizedBody}\n\n${categoryLine}` : categoryLine
}

function buildUrl(params: { feature?: string; unrated?: string; page?: string }) {
  const sp = new URLSearchParams()
  if (params.feature) sp.set('feature', params.feature)
  if (params.unrated === '1') sp.set('unrated', '1')
  if (params.page && params.page !== '0') sp.set('page', params.page)
  const qs = sp.toString()
  return `/dashboard/admin/traces${qs ? '?' + qs : ''}`
}

function TraceRow({
  trace,
  enableShortcuts,
  denseMode,
  onRated,
}: {
  trace: Trace
  enableShortcuts: boolean
  denseMode: boolean
  onRated?: (traceId: string, prevPass: boolean | null, nextPass: boolean | null, categories: string[]) => void
}) {
  const parsedNotes = parseEvalNotes(trace.eval_notes)
  const [evalPass, setEvalPass]   = useState(trace.eval_pass)
  const [evalNotesBody, setEvalNotesBody] = useState(parsedNotes.body)
  const [categories, setCategories] = useState(parsedNotes.categories)
  const [expanded, setExpanded]   = useState(false)
  const [, startTransition]       = useTransition()

  function persist(nextPass: boolean | null, nextNotesBody: string, nextCategories: string[]) {
    const nextNotes = composeEvalNotes(nextNotesBody, nextCategories)
    startTransition(async () => { await rateTrace(trace.id, nextPass, nextNotes) })
  }

  function setRating(nextPass: boolean | null) {
    const prevPass = evalPass
    setEvalPass(nextPass)
    persist(nextPass, evalNotesBody, categories)
    onRated?.(trace.id, prevPass, nextPass, categories)
  }

  function toggleCategory(category: string) {
    const nextCategories = categories.includes(category)
      ? categories.filter((item) => item !== category)
      : [...categories, category]

    setCategories(nextCategories)
    persist(evalPass, evalNotesBody, nextCategories)
    if (evalPass === false) {
      onRated?.(trace.id, false, false, nextCategories)
    }
  }

  function saveNotes() {
    persist(evalPass, evalNotesBody, categories)
  }

  useEffect(() => {
    if (!enableShortcuts) return

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target) {
        const tagName = target.tagName.toLowerCase()
        if (tagName === 'textarea' || tagName === 'input' || tagName === 'select' || target.isContentEditable) return
      }

      if (event.key.toLowerCase() === 'p') {
        event.preventDefault()
        setRating(true)
      } else if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setRating(false)
      } else if (event.key.toLowerCase() === 'u') {
        event.preventDefault()
        setRating(null)
      } else if (event.key.toLowerCase() === 'o') {
        event.preventDefault()
        setExpanded((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enableShortcuts, evalNotesBody, categories, evalPass])

  const tokens = (trace.prompt_tokens ?? 0) + (trace.completion_tokens ?? 0)
  const dateStr = new Date(trace.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const featureLabel = FEATURE_LABELS[trace.feature] ?? trace.feature.replace(/_/g, ' ')

  return (
    <div className={`border-b border-slate-100 ${evalPass === true ? 'bg-emerald-50/30' : evalPass === false ? 'bg-red-50/30' : ''} ${enableShortcuts ? 'ring-1 ring-slate-300 ring-inset' : ''}`}>
      <div className="px-5 py-4 flex items-start gap-4">

        {/* Pass / Fail column */}
        <div className="flex flex-col gap-1.5 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => setRating(evalPass === true ? null : true)}
            className={`px-3 py-1.5 rounded text-[12px] font-bold cursor-pointer border-0 transition-colors w-14 ${
              evalPass === true
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            Pass
          </button>
          <button
            type="button"
            onClick={() => setRating(evalPass === false ? null : false)}
            className={`px-3 py-1.5 rounded text-[12px] font-bold cursor-pointer border-0 transition-colors w-14 ${
              evalPass === false
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            Fail
          </button>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">

          {/* Metadata row */}
          <div className="flex items-center gap-3 flex-wrap mb-2.5">
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-600">
              {featureLabel}
            </span>
            {enableShortcuts && (
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                Active
              </span>
            )}
            <span className="text-[11px] text-slate-400">{dateStr}</span>
            {trace.latency_ms != null && (
              <span className="text-[11px] text-slate-300">{(trace.latency_ms / 1000).toFixed(1)}s</span>
            )}
            {tokens > 0 && (
              <span className="text-[11px] text-slate-300">{tokens.toLocaleString()} tok</span>
            )}
            {trace.user_id && (
              <span className="text-[11px] font-mono text-slate-200">{trace.user_id.slice(0, 8)}</span>
            )}
          </div>

          {/* Input snapshot */}
          {!denseMode && trace.input_snapshot && Object.keys(trace.input_snapshot).length > 0 && (
            <div className="mb-2 flex flex-wrap gap-x-4 gap-y-0.5">
              {Object.entries(trace.input_snapshot).map(([k, v]) => (
                <span key={k} className="text-[11px] font-mono text-slate-300">
                  {k}: <span className="text-slate-400">{String(v)}</span>
                </span>
              ))}
            </div>
          )}

          {/* Output snapshot */}
          {trace.output_snapshot && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="text-[11px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0 mb-1.5"
              >
                Output {expanded ? '▲' : '▼'}
              </button>
              {expanded ? (
                <pre className="text-[12px] text-slate-700 whitespace-pre-wrap leading-relaxed bg-white border border-slate-100 rounded p-3 max-h-[500px] overflow-y-auto">
                  {trace.output_snapshot}
                </pre>
              ) : !denseMode ? (
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  {trace.output_snapshot.slice(0, 220)}{trace.output_snapshot.length > 220 ? '…' : ''}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">Collapsed in dense mode. Expand output when needed.</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {FAILURE_CATEGORIES.map((category) => {
              const active = categories.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          <textarea
            value={evalNotesBody}
            onChange={e => setEvalNotesBody(e.target.value)}
            onBlur={saveNotes}
            placeholder="Open coding: what is wrong (or strong) about this output?"
            rows={denseMode ? 1 : 2}
            className="w-full text-[12px] text-slate-700 border border-slate-200 rounded px-3 py-2 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none bg-white"
          />
          <p className="mt-1.5 text-[10px] text-slate-400">Shortcuts: P = pass, F = fail, U = unrated, O = output.</p>
        </div>
      </div>
    </div>
  )
}

export function TraceViewer({
  traces,
  currentFeature,
  unratedOnly,
  page,
  totalPages,
  totalCount,
}: {
  traces: Trace[]
  currentFeature: string
  unratedOnly: boolean
  page: number
  totalPages: number
  totalCount: number
}) {
  const [visibleTraces, setVisibleTraces] = useState(traces)
  const [sessionLabeled, setSessionLabeled] = useState<Record<string, boolean>>({})
  const [sessionFailureTagsByTrace, setSessionFailureTagsByTrace] = useState<Record<string, string[]>>({})
  const [failureSummaryMode, setFailureSummaryMode] = useState<'page' | 'session'>('page')
  const focusMode = unratedOnly && currentFeature === 'prep_brief'
  const [denseMode, setDenseMode] = useState(focusMode)

  useEffect(() => {
    setVisibleTraces(traces)
  }, [traces])

  useEffect(() => {
    setSessionLabeled({})
    setSessionFailureTagsByTrace({})
    setFailureSummaryMode('page')
  }, [currentFeature, unratedOnly, page])

  useEffect(() => {
    setDenseMode(focusMode)
  }, [focusMode])

  function handleRated(traceId: string, prevPass: boolean | null, nextPass: boolean | null, categories: string[]) {
    setSessionLabeled((prev) => {
      const next = { ...prev }
      const wasCounted = Object.prototype.hasOwnProperty.call(next, traceId)

      if (prevPass === null && nextPass !== null) {
        next[traceId] = nextPass
      } else if (nextPass === null && wasCounted) {
        delete next[traceId]
      } else if (nextPass !== null && wasCounted) {
        next[traceId] = nextPass
      }

      return next
    })

    setSessionFailureTagsByTrace((prev) => {
      const next = { ...prev }
      if (nextPass === false) {
        next[traceId] = [...new Set(categories)]
      } else {
        delete next[traceId]
      }
      return next
    })

    if (!unratedOnly || nextPass === null) return
    setVisibleTraces((prev) => prev.filter((trace) => trace.id !== traceId))
  }

  const sessionTotal = Object.keys(sessionLabeled).length
  const sessionPass = Object.values(sessionLabeled).filter(Boolean).length
  const sessionFail = sessionTotal - sessionPass
  const pageFailureCategoryCounts = visibleTraces.reduce<Record<string, number>>((acc, trace) => {
    if (trace.eval_pass !== false) return acc
    const { categories } = parseEvalNotes(trace.eval_notes)
    for (const category of categories) {
      acc[category] = (acc[category] ?? 0) + 1
    }
    return acc
  }, {})
  const pageFailureCategoryRows = Object.entries(pageFailureCategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const sessionFailureCategoryCounts = Object.values(sessionFailureTagsByTrace).reduce<Record<string, number>>((acc, tags) => {
    for (const tag of tags) {
      acc[tag] = (acc[tag] ?? 0) + 1
    }
    return acc
  }, {})
  const sessionFailureCategoryRows = Object.entries(sessionFailureCategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const summaryRows = failureSummaryMode === 'session' ? sessionFailureCategoryRows : pageFailureCategoryRows

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {FEATURES.map(f => (
          <Link
            key={f}
            href={buildUrl({ feature: f || undefined, unrated: unratedOnly ? '1' : undefined })}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded transition-colors ${
              currentFeature === f
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {FEATURE_LABELS[f]}
          </Link>
        ))}
        <div className="ml-auto">
          <Link
            href={buildUrl({ feature: currentFeature || undefined, unrated: unratedOnly ? undefined : '1' })}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded transition-colors ${
              unratedOnly
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            Unrated only
          </Link>
        </div>
      </div>

      <div className="mb-4 bg-white border border-slate-200 rounded px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">Session labeled: {sessionTotal}</span>
        <span>Pass: {sessionPass}</span>
        <span>Fail: {sessionFail}</span>
        {focusMode && (
          <button
            type="button"
            onClick={() => setDenseMode((v) => !v)}
            className="ml-auto text-[11px] font-semibold border border-slate-200 bg-white text-slate-700 hover:border-slate-400 px-2 py-1 rounded transition-colors"
          >
            {denseMode ? 'Dense view: on' : 'Dense view: off'}
          </button>
        )}
      </div>

      <div className="mb-4 bg-white border border-slate-200 rounded px-3 py-2">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">
            Failure tags ({failureSummaryMode === 'session' ? 'session' : 'current page'})
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFailureSummaryMode('page')}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                failureSummaryMode === 'page'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              Page
            </button>
            <button
              type="button"
              onClick={() => setFailureSummaryMode('session')}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                failureSummaryMode === 'session'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              Session
            </button>
          </div>
        </div>
        {summaryRows.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {summaryRows.map(([category, count]) => (
              <span key={category} className="text-[10px] px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-600">
                {category} <span className="font-semibold text-slate-800">{count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            {failureSummaryMode === 'session'
              ? 'No session failure tags yet.'
              : 'No failed traces with category tags on this page yet.'}
          </p>
        )}
      </div>

      {unratedOnly && visibleTraces.length > 0 && (
        <p className="text-[11px] text-slate-500 mb-3">
          Focus mode: shortcuts apply to the top visible trace only. Rate and it auto-advances.
        </p>
      )}

      {/* Trace list */}
      {totalCount === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-10 text-center">
          <p className="text-[14px] text-slate-400">
            No traces yet. Traces are written on every Claude API call once migration 040 is applied.
          </p>
        </div>
      ) : visibleTraces.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded p-10 text-center">
          <p className="text-[14px] text-slate-500">This page of unrated traces is complete.</p>
          {unratedOnly && page < totalPages - 1 ? (
            <>
              <p className="text-[12px] text-slate-400 mt-1">Move to the next unrated page to continue labeling.</p>
              <Link
                href={buildUrl({ feature: currentFeature || undefined, unrated: '1', page: String(page + 1) })}
                className="inline-block mt-3 text-[12px] font-semibold px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:border-slate-400 transition-colors"
              >
                Next unrated page
              </Link>
            </>
          ) : (
            <p className="text-[12px] text-slate-400 mt-1">No more unrated traces on remaining pages for this filter.</p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-5">
          {visibleTraces.map((t, idx) => (
            <TraceRow
              key={t.id}
              trace={t}
              enableShortcuts={idx === 0}
              denseMode={denseMode}
              onRated={handleRated}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Link
            href={page > 0 ? buildUrl({ feature: currentFeature || undefined, unrated: unratedOnly ? '1' : undefined, page: String(page - 1) }) : '#'}
            className={`text-[13px] font-semibold px-4 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 ${page === 0 ? 'opacity-40 pointer-events-none' : ''}`}
          >
            Previous
          </Link>
          <span className="text-[12px] text-slate-400">
            Page {page + 1} of {totalPages} &middot; {totalCount} total
          </span>
          <Link
            href={page < totalPages - 1 ? buildUrl({ feature: currentFeature || undefined, unrated: unratedOnly ? '1' : undefined, page: String(page + 1) }) : '#'}
            className={`text-[13px] font-semibold px-4 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 ${page >= totalPages - 1 ? 'opacity-40 pointer-events-none' : ''}`}
          >
            Next
          </Link>
        </div>
      )}
    </>
  )
}
