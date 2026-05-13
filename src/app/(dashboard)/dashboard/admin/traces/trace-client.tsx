'use client'
import { useEffect, useRef, useState, useTransition, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import Link from 'next/link'
import { rateTrace } from './actions'
import { buildFailureSummaryPayload } from './copy-summary'
import { resolveNextActiveRowId } from './active-row'

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

type ToastState = {
  kind: 'success' | 'error'
  message: string
}

type LastActionState = {
  message: string
  at: string
}

type BulkApplyUndoChange = {
  traceId: string
  prevNotes: string | null
  prevSessionTags: string[] | undefined
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
  shortcutsBlocked,
  denseMode,
  onActivate,
  onRated,
}: {
  trace: Trace
  enableShortcuts: boolean
  shortcutsBlocked?: boolean
  denseMode: boolean
  onActivate?: (traceId: string) => void
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
    if (!enableShortcuts || shortcutsBlocked) return

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
      } else if (/^[1-8]$/.test(event.key) && evalPass === false) {
        event.preventDefault()
        const idx = Number(event.key) - 1
        const category = FAILURE_CATEGORIES[idx]
        if (category) {
          toggleCategory(category)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enableShortcuts, shortcutsBlocked, evalNotesBody, categories, evalPass])

  const tokens = (trace.prompt_tokens ?? 0) + (trace.completion_tokens ?? 0)
  const dateStr = new Date(trace.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const featureLabel = FEATURE_LABELS[trace.feature] ?? trace.feature.replace(/_/g, ' ')

  return (
    <div
      className={`border-b border-slate-100 ${evalPass === true ? 'bg-emerald-50/30' : evalPass === false ? 'bg-red-50/30' : ''} ${enableShortcuts ? 'ring-1 ring-slate-300 ring-inset' : ''}`}
      onMouseDown={() => onActivate?.(trace.id)}
    >
      <div className="px-5 py-4 flex items-start gap-4">

        {/* Pass / Fail column */}
        <div className="flex flex-col gap-1.5 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => setRating(evalPass === true ? null : true)}
            aria-keyshortcuts="P"
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
            aria-keyshortcuts="F"
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
                aria-keyshortcuts="O"
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
            {FAILURE_CATEGORIES.map((category, idx) => {
              const active = categories.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-keyshortcuts={String(idx + 1)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <span className="mr-1 font-semibold">{idx + 1}</span>{category}
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
          <p className="mt-1.5 text-[10px] text-slate-400">Shortcuts: P = pass, F = fail, U = unrated, O = output, J/K = active row, 1-8 = fail tags.</p>
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
  const [isApplyingTopTag, setIsApplyingTopTag] = useState(false)
  const [isUndoingTopTag, setIsUndoingTopTag] = useState(false)
  const [lastBulkApply, setLastBulkApply] = useState<{ tag: string; changes: BulkApplyUndoChange[] } | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [lastAction, setLastAction] = useState<LastActionState | null>(null)
  const [includeZeroCountsInCopy, setIncludeZeroCountsInCopy] = useState(false)
  const [copyFormat, setCopyFormat] = useState<'list' | 'table'>('list')
  const [showCopyPreview, setShowCopyPreview] = useState(false)
  const [trimForSlack, setTrimForSlack] = useState(false)
  const [showCopyActions, setShowCopyActions] = useState(false)
  const [copyMenuAnnouncement, setCopyMenuAnnouncement] = useState('')
  const [activeRowId, setActiveRowId] = useState<string | null>(traces[0]?.id ?? null)
  const copyActionsRef = useRef<HTMLDivElement | null>(null)
  const copyActionsToggleRef = useRef<HTMLButtonElement | null>(null)
  const copyActionItemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const focusMode = unratedOnly && currentFeature === 'prep_brief'
  const [denseMode, setDenseMode] = useState(focusMode)

  useEffect(() => {
    setVisibleTraces(traces)
    setActiveRowId(traces[0]?.id ?? null)
  }, [traces])

  useEffect(() => {
    if (visibleTraces.length === 0) {
      setActiveRowId(null)
      return
    }

    if (activeRowId && visibleTraces.some((trace) => trace.id === activeRowId)) {
      return
    }

    setActiveRowId(visibleTraces[0]?.id ?? null)
  }, [visibleTraces, activeRowId])

  useEffect(() => {
    setSessionLabeled({})
    setSessionFailureTagsByTrace({})
    setFailureSummaryMode('page')
    setIncludeZeroCountsInCopy(false)
    setCopyFormat('list')
    setShowCopyPreview(false)
    setShowCopyActions(false)
    setTrimForSlack(false)
    setLastBulkApply(null)
    setLastAction(null)
  }, [currentFeature, unratedOnly, page])

  useEffect(() => {
    setDenseMode(focusMode)
  }, [focusMode])

  useEffect(() => {
    if (visibleTraces.length === 0) return

    function onKeyDown(event: KeyboardEvent) {
      if (showCopyActions) return

      const target = event.target as HTMLElement | null
      if (target) {
        const tagName = target.tagName.toLowerCase()
        if (tagName === 'textarea' || tagName === 'input' || tagName === 'select' || target.isContentEditable) return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key.toLowerCase()
      if (key !== 'j' && key !== 'k') return

      event.preventDefault()
      const currentIndex = activeRowId
        ? visibleTraces.findIndex((trace) => trace.id === activeRowId)
        : -1
      const safeIndex = currentIndex >= 0 ? currentIndex : 0
      const delta = key === 'j' ? 1 : -1
      const nextIndex = Math.max(0, Math.min(visibleTraces.length - 1, safeIndex + delta))
      setActiveRowId(visibleTraces[nextIndex]?.id ?? null)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [visibleTraces, activeRowId, showCopyActions])

  useEffect(() => {
    if (!showCopyActions) return

    const focusTimeout = window.setTimeout(() => {
      copyActionItemRefs.current[0]?.focus()
    }, 0)

    function onDocumentMouseDown(event: MouseEvent) {
      const target = event.target as Node | null
      if (!target) return
      if (copyActionsRef.current?.contains(target)) return
      setShowCopyActions(false)
    }

    function onDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowCopyActions(false)
      }
    }

    document.addEventListener('mousedown', onDocumentMouseDown)
    document.addEventListener('keydown', onDocumentKeyDown)

    return () => {
      window.clearTimeout(focusTimeout)
      document.removeEventListener('mousedown', onDocumentMouseDown)
      document.removeEventListener('keydown', onDocumentKeyDown)
    }
  }, [showCopyActions])

  useEffect(() => {
    if (showCopyActions) {
      setCopyMenuAnnouncement('Copy actions menu opened. Use arrow keys or tab to navigate, enter to select, and escape to close.')
    } else {
      setCopyMenuAnnouncement('Copy actions menu closed.')
    }
  }, [showCopyActions])

  function focusCopyActionByIndex(index: number) {
    const buttons = copyActionItemRefs.current.filter(Boolean)
    if (buttons.length === 0) return
    const next = ((index % buttons.length) + buttons.length) % buttons.length
    buttons[next]?.focus()
  }

  function onCopyActionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const key = event.key.toLowerCase()
    if (key === 's' || key === '1') {
      event.preventDefault()
      setShowCopyActions(false)
      void copyFailureSummary()
      return
    }
    if (key === 'c' || key === '2') {
      event.preventDefault()
      setShowCopyActions(false)
      void copyCompactSummary()
      return
    }
    if (key === 't' || key === '3') {
      event.preventDefault()
      setShowCopyActions(false)
      void copyCompactSummaryTable()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusCopyActionByIndex(index + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusCopyActionByIndex(index - 1)
    } else if (event.key === 'Tab') {
      event.preventDefault()
      focusCopyActionByIndex(event.shiftKey ? index - 1 : index + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusCopyActionByIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusCopyActionByIndex(copyActionItemRefs.current.length - 1)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setShowCopyActions(false)
      copyActionsToggleRef.current?.focus()
    }
  }

  function onCopyActionsTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setShowCopyActions(true)
      window.setTimeout(() => focusCopyActionByIndex(0), 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setShowCopyActions(true)
      window.setTimeout(() => focusCopyActionByIndex(copyActionItemRefs.current.length - 1), 0)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setShowCopyActions((value) => !value)
    } else if (event.key === 'Escape') {
      if (showCopyActions) {
        event.preventDefault()
        setShowCopyActions(false)
      }
    }
  }

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [toast])

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

    const nextActiveRowId = resolveNextActiveRowId(visibleTraces, traceId, activeRowId)
    const nextVisible = visibleTraces.filter((trace) => trace.id !== traceId)
    setVisibleTraces(nextVisible)
    setActiveRowId(nextActiveRowId)
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
  const topFailureTheme = summaryRows[0] ?? null
  const modeLabel = failureSummaryMode === 'session' ? 'session' : 'current page'
  const sourceCounts = failureSummaryMode === 'session' ? sessionFailureCategoryCounts : pageFailureCategoryCounts
  const allKnownTags = [...new Set([...FAILURE_CATEGORIES, ...Object.keys(sourceCounts)])]
  const rowsForCopy = includeZeroCountsInCopy
    ? allKnownTags
        .map((tag) => [tag, sourceCounts[tag] ?? 0] as const)
        .sort((a, b) => b[1] - a[1])
    : summaryRows
  const rowsForCopySlack = trimForSlack ? rowsForCopy.slice(0, 6) : rowsForCopy
  const rowsOmittedForSlack = Math.max(0, rowsForCopy.length - rowsForCopySlack.length)
  const untaggedFailedTraces = visibleTraces.filter((trace) => {
    if (trace.eval_pass !== false) return false
    return parseEvalNotes(trace.eval_notes).categories.length === 0
  })
  const activeRowIndex = activeRowId
    ? visibleTraces.findIndex((trace) => trace.id === activeRowId)
    : -1

  const copyPreviewPayload = summaryRows.length > 0
    ? buildFailureSummaryPayload(rowsForCopy, {
      modeLabel,
      includeZeroCounts: includeZeroCountsInCopy,
      trimForSlack,
      copyFormat,
      topFailureTheme,
    })
    : ''
  const copyPreviewChars = copyPreviewPayload.length
  const copyPreviewLines = copyPreviewPayload.length > 0 ? copyPreviewPayload.split('\n').length : 0
  const slackCharLimit = 4000
  const githubCommentCharLimit = 65000
  const fitsSlack = copyPreviewChars <= slackCharLimit
  const fitsGithubComment = copyPreviewChars <= githubCommentCharLimit
  const shouldSuggestTrimForSlack = !fitsSlack && !trimForSlack

  async function applyTopTagToUntaggedFails() {
    if (!topFailureTheme || untaggedFailedTraces.length === 0 || isApplyingTopTag) return

    const topTag = topFailureTheme[0]
    const snapshotById = Object.fromEntries(visibleTraces.map((trace) => [trace.id, trace]))
    const changes: BulkApplyUndoChange[] = untaggedFailedTraces.map((trace) => ({
      traceId: trace.id,
      prevNotes: snapshotById[trace.id]?.eval_notes ?? null,
      prevSessionTags: sessionFailureTagsByTrace[trace.id],
    }))

    setIsApplyingTopTag(true)
    try {
      for (const trace of untaggedFailedTraces) {
        const parsed = parseEvalNotes(trace.eval_notes)
        const nextCategories = [...new Set([...parsed.categories, topTag])]
        const nextNotes = composeEvalNotes(parsed.body, nextCategories)

        const result = await rateTrace(trace.id, false, nextNotes)
        if (!result.ok) throw new Error('save failed')

        setVisibleTraces((prev) => prev.map((row) => (
          row.id === trace.id
            ? { ...row, eval_notes: nextNotes }
            : row
        )))

        setSessionFailureTagsByTrace((prev) => ({
          ...prev,
          [trace.id]: nextCategories,
        }))
      }

      if (changes.length > 0) {
        setLastBulkApply({ tag: topTag, changes })
        setToast({ kind: 'success', message: `Applied ${topTag} to ${changes.length} trace${changes.length === 1 ? '' : 's'}.` })
        setLastAction({
          message: `Applied ${topTag} to ${changes.length} trace${changes.length === 1 ? '' : 's'}`,
          at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        })
      }
    } catch {
      setToast({ kind: 'error', message: 'Could not apply top tag. Try again.' })
    } finally {
      setIsApplyingTopTag(false)
    }
  }

  async function undoLastBulkApplyTopTag() {
    if (!lastBulkApply || isUndoingTopTag) return

    const undoCount = lastBulkApply.changes.length
    setIsUndoingTopTag(true)
    try {
      for (const change of lastBulkApply.changes) {
        const restoredNotes = change.prevNotes ?? ''
        const result = await rateTrace(change.traceId, false, restoredNotes)
        if (!result.ok) throw new Error('undo failed')

        setVisibleTraces((prev) => prev.map((row) => (
          row.id === change.traceId
            ? { ...row, eval_notes: change.prevNotes }
            : row
        )))

        setSessionFailureTagsByTrace((prev) => {
          const next = { ...prev }
          if (change.prevSessionTags === undefined) {
            delete next[change.traceId]
          } else {
            next[change.traceId] = change.prevSessionTags
          }
          return next
        })
      }

      setLastBulkApply(null)
      setToast({ kind: 'success', message: `Undid bulk tag on ${undoCount} trace${undoCount === 1 ? '' : 's'}.` })
      setLastAction({
        message: `Undid bulk tag on ${undoCount} trace${undoCount === 1 ? '' : 's'}`,
        at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      })
    } catch {
      setToast({ kind: 'error', message: 'Could not undo bulk tag. Try again.' })
    } finally {
      setIsUndoingTopTag(false)
    }
  }

  async function copyTopTheme() {
    if (!topFailureTheme) return
    try {
      await navigator.clipboard.writeText(topFailureTheme[0])
      setToast({ kind: 'success', message: `Copied top theme: ${topFailureTheme[0]}` })
      setLastAction({
        message: `Copied top theme ${topFailureTheme[0]}`,
        at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      })
    } catch {
      setToast({ kind: 'error', message: 'Could not copy top theme.' })
    }
  }

  async function copyFailureSummary() {
    if (summaryRows.length === 0) return
    const payload = copyPreviewPayload

    try {
      await navigator.clipboard.writeText(payload)
      setToast({ kind: 'success', message: `Copied ${modeLabel} failure summary.` })
      setLastAction({
        message: `Copied ${modeLabel} failure summary (${copyFormat})`,
        at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      })
    } catch {
      setToast({ kind: 'error', message: 'Could not copy failure summary.' })
    }
  }

  async function copyCompactSummary() {
    if (summaryRows.length === 0) return

    const compactRows = summaryRows.slice(0, 6)
    const omitted = Math.max(0, summaryRows.length - compactRows.length)
    const lines = [
      `Failure tags (${modeLabel}, compact)`,
      ...compactRows.map(([tag, count]) => `- ${tag}: ${count}`),
    ]

    if (omitted > 0) {
      lines.push(`(${omitted} additional tag${omitted === 1 ? '' : 's'} omitted)`)
    }

    if (topFailureTheme) {
      lines.push(`Top theme: ${topFailureTheme[0]} (${topFailureTheme[1]})`)
    }

    const payload = lines.join('\n')

    try {
      await navigator.clipboard.writeText(payload)
      setToast({ kind: 'success', message: `Copied compact ${modeLabel} summary.` })
      setLastAction({
        message: `Copied compact ${modeLabel} summary`,
        at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      })
    } catch {
      setToast({ kind: 'error', message: 'Could not copy compact summary.' })
    }
  }

  async function copyCompactSummaryTable() {
    if (summaryRows.length === 0) return

    const compactRows = summaryRows.slice(0, 6)
    const omitted = Math.max(0, summaryRows.length - compactRows.length)
    const lines = [
      `Failure tags (${modeLabel}, compact table)`,
      '',
      '| Tag | Count |',
      '| --- | ---: |',
      ...compactRows.map(([tag, count]) => `| ${tag} | ${count} |`),
    ]

    if (omitted > 0) {
      lines.push('', `(${omitted} additional tag${omitted === 1 ? '' : 's'} omitted)`)
    }

    if (topFailureTheme) {
      lines.push('', `Top theme: **${topFailureTheme[0]}** (${topFailureTheme[1]})`)
    }

    const payload = lines.join('\n')

    try {
      await navigator.clipboard.writeText(payload)
      setToast({ kind: 'success', message: `Copied compact table ${modeLabel} summary.` })
      setLastAction({
        message: `Copied compact table ${modeLabel} summary`,
        at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      })
    } catch {
      setToast({ kind: 'error', message: 'Could not copy compact table summary.' })
    }
  }

  return (
    <>
      <div aria-live="polite" className="sr-only">{copyMenuAnnouncement}</div>

      {toast && (
        <div className={`mb-4 rounded border px-3 py-2 text-[11px] ${toast.kind === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast.message}
        </div>
      )}

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
        {focusMode && activeRowIndex >= 0 && (
          <span className="text-slate-600">Active row: {activeRowIndex + 1}/{visibleTraces.length}</span>
        )}
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
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">
              Failure tags ({failureSummaryMode === 'session' ? 'session' : 'current page'})
            </p>
            {lastAction && (
              <p className="text-[10px] text-slate-400 mt-1">
                Last action: <span className="text-slate-600">{lastAction.message}</span> <span className="text-slate-400">at {lastAction.at}</span>
              </p>
            )}
            {topFailureTheme && (
              <p className="text-[10px] text-slate-500 mt-1">
                Top theme: <span className="font-semibold text-slate-700">{topFailureTheme[0]}</span> ({topFailureTheme[1]})
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {topFailureTheme && untaggedFailedTraces.length > 0 && (
              <button
                type="button"
                onClick={applyTopTagToUntaggedFails}
                disabled={isApplyingTopTag}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  isApplyingTopTag
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {isApplyingTopTag ? 'Applying…' : `Apply top tag to ${untaggedFailedTraces.length}`}
              </button>
            )}
            {topFailureTheme && (
              <button
                type="button"
                onClick={copyTopTheme}
                className="text-[10px] px-2 py-1 rounded border transition-colors bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              >
                Copy top theme
              </button>
            )}
            {summaryRows.length > 0 && (
              <div className="relative" ref={copyActionsRef}>
                <button
                  type="button"
                  ref={copyActionsToggleRef}
                  onClick={() => setShowCopyActions((value) => !value)}
                  onKeyDown={onCopyActionsTriggerKeyDown}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    showCopyActions
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1`}
                >
                  Copy actions
                </button>
                {showCopyActions && (
                  <div role="menu" className="absolute right-0 top-[calc(100%+4px)] z-10 min-w-[150px] bg-white border border-slate-200 rounded shadow-sm p-1 space-y-1">
                    <button
                      type="button"
                      role="menuitem"
                      ref={(el) => { copyActionItemRefs.current[0] = el }}
                      onKeyDown={(event) => onCopyActionKeyDown(event, 0)}
                      onClick={() => { setShowCopyActions(false); void copyFailureSummary() }}
                      className="w-full text-left text-[10px] px-2 py-1 rounded text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      Copy summary
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      ref={(el) => { copyActionItemRefs.current[1] = el }}
                      onKeyDown={(event) => onCopyActionKeyDown(event, 1)}
                      onClick={() => { setShowCopyActions(false); void copyCompactSummary() }}
                      className="w-full text-left text-[10px] px-2 py-1 rounded text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      Copy compact
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      ref={(el) => { copyActionItemRefs.current[2] = el }}
                      onKeyDown={(event) => onCopyActionKeyDown(event, 2)}
                      onClick={() => { setShowCopyActions(false); void copyCompactSummaryTable() }}
                      className="w-full text-left text-[10px] px-2 py-1 rounded text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      Copy compact table
                    </button>
                    <div className="pt-1 mt-1 border-t border-slate-100 text-[9px] text-slate-400 px-1">
                      ↑/↓/Tab navigate · Enter select · Esc close · S/C/T or 1/2/3 quick keys
                    </div>
                  </div>
                )}
              </div>
            )}
            {summaryRows.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCopyPreview((value) => !value)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  showCopyPreview
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {showCopyPreview ? 'Hide preview' : 'Preview copy'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setCopyFormat((value) => (value === 'list' ? 'table' : 'list'))}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                copyFormat === 'table'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              Format: {copyFormat}
            </button>
            <button
              type="button"
              onClick={() => setIncludeZeroCountsInCopy((value) => !value)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                includeZeroCountsInCopy
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              Include zeros: {includeZeroCountsInCopy ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={() => setTrimForSlack((value) => !value)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                trimForSlack
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              Trim for Slack: {trimForSlack ? 'on' : 'off'}
            </button>
            {lastBulkApply && (
              <button
                type="button"
                onClick={undoLastBulkApplyTopTag}
                disabled={isUndoingTopTag}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  isUndoingTopTag
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {isUndoingTopTag ? 'Undoing…' : `Undo ${lastBulkApply.tag}`}
              </button>
            )}
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
        {showCopyPreview && summaryRows.length > 0 && (
          <div className="mt-2 border border-slate-200 rounded bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[10px] font-semibold text-slate-500">Copy payload preview</p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-400">{copyPreviewChars} chars · {copyPreviewLines} lines</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${fitsSlack ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                  {fitsSlack ? 'Fits Slack' : 'Over 4k'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${fitsGithubComment ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                  {fitsGithubComment ? 'Fits GitHub comment' : 'Over 65k'}
                </span>
              </div>
            </div>
            {shouldSuggestTrimForSlack && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
                <p className="text-[10px] text-amber-800">Payload exceeds Slack-friendly length. Enable Trim for Slack?</p>
                <button
                  type="button"
                  onClick={() => setTrimForSlack(true)}
                  className="text-[10px] font-semibold rounded border border-amber-300 bg-white text-amber-800 hover:border-amber-500 px-2 py-1 transition-colors"
                >
                  Enable trim
                </button>
              </div>
            )}
            <pre className="text-[10px] text-slate-600 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {copyPreviewPayload}
            </pre>
          </div>
        )}
      </div>

      {unratedOnly && visibleTraces.length > 0 && (
        <p className="text-[11px] text-slate-500 mb-3">
          Focus mode: shortcuts apply to the active trace. Use J/K to change active row and 1-8 for fail tags. Rate and it auto-advances.
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
              enableShortcuts={t.id === activeRowId || (activeRowId == null && idx === 0)}
              shortcutsBlocked={showCopyActions}
              denseMode={denseMode}
              onActivate={setActiveRowId}
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
