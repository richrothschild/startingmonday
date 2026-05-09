'use client'
import { useState, useRef } from 'react'

interface Props {
  defaultValue: string
  resumeText: string
  beyondResume: string
  targetTitles: string
  roleType: string
  currentTitle: string
  currentCompany: string
}

export function PositioningGeneratorTextarea({
  defaultValue,
  resumeText,
  beyondResume,
  targetTitles,
  roleType,
  currentTitle,
  currentCompany,
}: Props) {
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [gaps, setGaps] = useState<string[]>([])
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setSuggestion('')
    setGaps([])
    try {
      const res = await fetch('/api/narrative/generate-positioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text:    resumeText,
          beyond_resume:  beyondResume,
          target_titles:  targetTitles.split(',').map(s => s.trim()).filter(Boolean),
          role_type:      roleType,
          current_title:  currentTitle,
          current_company: currentCompany,
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSuggestion(data.positioning ?? '')
      setGaps(data.gaps ?? [])
    } catch {
      setError('Request failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleUse() {
    setValue(suggestion)
    setSuggestion('')
    setGaps([])
    textareaRef.current?.focus()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor="positioning_summary" className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">
          Positioning summary
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50 transition-colors cursor-pointer border-0 bg-transparent p-0"
        >
          {loading ? 'Generating...' : 'Generate from resume'}
        </button>
      </div>

      <textarea
        ref={textareaRef}
        id="positioning_summary"
        name="positioning_summary"
        rows={4}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="2-3 sentences: your title + years of experience, what you're known for, and what you're targeting next."
        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed"
      />

      {error && (
        <p className="mt-1.5 text-[12px] text-red-600">{error}</p>
      )}

      {suggestion && (
        <div className="mt-2 border border-orange-200 bg-orange-50 rounded p-4">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-orange-500 mb-2">Generated suggestion</p>
          <p className="text-[13px] text-slate-700 leading-relaxed mb-3">{suggestion}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUse}
              className="text-[12px] font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded transition-colors cursor-pointer border-0"
            >
              Use this
            </button>
            <button
              type="button"
              onClick={() => { setSuggestion(''); setGaps([]) }}
              className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-0 bg-transparent"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {gaps.length > 0 && !suggestion && (
        <div className="mt-2 border border-amber-200 bg-amber-50 rounded p-3">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-amber-600 mb-1.5">Narrative gaps</p>
          <ul className="flex flex-col gap-1">
            {gaps.map((gap, i) => (
              <li key={i} className="text-[12px] text-slate-600 flex gap-2">
                <span className="text-amber-500 shrink-0">+</span>{gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && suggestion && (
        <div className="mt-2 border border-amber-200 bg-amber-50 rounded p-3">
          <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-amber-600 mb-1.5">Narrative gaps to address</p>
          <ul className="flex flex-col gap-1">
            {gaps.map((gap, i) => (
              <li key={i} className="text-[12px] text-slate-600 flex gap-2">
                <span className="text-amber-500 shrink-0">+</span>{gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!value && !suggestion && (
        <div className="mt-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded text-[12px] text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Example</span>
          <p className="mt-1">Transformation CIO with 18 years leading enterprise technology modernization in healthcare and financial services. Known for delivering large-scale ERP migrations and building platform engineering teams from scratch. Seeking CIO and VP Technology roles at growth-stage companies where I can drive digital transformation.</p>
        </div>
      )}

      <p className="mt-1.5 text-[12px] text-slate-400">Used to personalize interview prep briefs and chat context.</p>
    </div>
  )
}
