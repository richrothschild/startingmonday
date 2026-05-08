'use client'
import { useState, useRef, useTransition } from 'react'
import { saveMaterial } from './actions'

type Props = {
  prospectId: string
  prospectName: string
  prospectType: string
  estimatedSeats?: number | null
  estimatedArr?: number | null
  notes?: string | null
  contacts: { name: string; title?: string | null }[]
}

export default function MaterialClient(props: Props) {
  const { prospectId, prospectName, prospectType, estimatedSeats, estimatedArr, notes, contacts } = props

  const [additionalContext, setAdditionalContext] = useState('')
  const [output, setOutput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [, startTransition] = useTransition()
  const outputRef = useRef<HTMLDivElement>(null)

  const primaryContact = contacts[0]

  async function generate() {
    setOutput('')
    setGenerating(true)
    setSaveTitle(`Leave-behind: ${prospectName}`)

    try {
      const res = await fetch('/api/admin/b2b/material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName,
          prospectType,
          estimatedSeats: estimatedSeats ?? null,
          estimatedArr: estimatedArr ?? null,
          notes: notes ?? null,
          contactName: primaryContact?.name ?? null,
          contactTitle: primaryContact?.title ?? null,
          additionalContext: additionalContext.trim() || undefined,
        }),
      })

      if (!res.ok || !res.body) {
        setOutput('Error generating document. Please try again.')
        setGenerating(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        setOutput(buf)
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
      }
    } catch {
      setOutput('Error generating document. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleSave(formData: FormData) {
    startTransition(() => {
      saveMaterial(formData)
    })
    setOutput('')
    setSaveTitle('')
    setAdditionalContext('')
  }

  return (
    <div className="bg-white border border-slate-200 rounded">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
              Additional context for this meeting
            </label>
            <textarea
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
              rows={2}
              placeholder="Upcoming conference they're speaking at, specific pain point mentioned on a call, particular exec cohort they want to help..."
              className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="self-start bg-orange-500 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating...' : 'Generate leave-behind'}
          </button>
        </div>
      </div>

      {(output || generating) && (
        <div className="px-5 py-4">
          {generating && !output && (
            <div className="text-[13px] text-slate-400 animate-pulse">Writing...</div>
          )}

          {output && (
            <>
              <div
                ref={outputRef}
                className="text-[13px] text-slate-800 whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto leading-relaxed"
              >
                {output}
              </div>

              {!generating && (
                <div className="mt-4 flex items-start gap-3 flex-wrap border-t border-slate-100 pt-4">
                  <button
                    onClick={copy}
                    className="text-[12px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded cursor-pointer border-0 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy to clipboard'}
                  </button>

                  <form action={handleSave} className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <input type="hidden" name="prospect_id" value={prospectId} />
                    <input type="hidden" name="content" value={output} />
                    <input
                      name="title"
                      value={saveTitle}
                      onChange={e => setSaveTitle(e.target.value)}
                      placeholder="Title for this version"
                      className="flex-1 border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!saveTitle.trim()}
                      className="bg-slate-900 text-white text-[12px] font-semibold px-4 py-2 rounded cursor-pointer border-0 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      Save
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
