'use client'
import { useState, useRef } from 'react'
import { completeOnboarding, skipOnboarding } from './actions'
import { TagInput } from '@/components/TagInput'

const inputCls = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400'
const labelCls = 'block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5'
const hintCls  = 'mt-1.5 text-[12px] text-slate-400'

const SECTIONS = ['Level', 'Import', 'About', 'Situation', 'Targeting', 'Background']

type SearchPersona = 'csuite' | 'vp' | 'board'

const PERSONA_OPTIONS: { value: SearchPersona; label: string; sub: string }[] = [
  { value: 'csuite', label: 'C-Suite',            sub: 'CEO, CFO, CTO, COO, CIO, CHRO, etc.' },
  { value: 'vp',     label: 'VP / SVP',           sub: 'VP, SVP, or EVP targeting C-suite or a larger VP role' },
  { value: 'board',  label: 'Board / Advisor',    sub: 'Board seat, operating partner, or advisory role' },
]

type InitialProfile = {
  full_name?: string | null
  current_title?: string | null
  current_company?: string | null
}

type ImportResult = {
  full_name?: string | null
  current_title?: string | null
  current_company?: string | null
  positioning_summary?: string | null
  resume_text?: string | null
  beyond_resume?: string | null
  target_titles?: string | null
}

function importSummary(data: ImportResult): string[] {
  const filled: string[] = []
  if (data.full_name)           filled.push('Name')
  if (data.current_title)       filled.push('Title')
  if (data.current_company)     filled.push('Company')
  if (data.positioning_summary) filled.push('Positioning summary')
  if (data.resume_text)         filled.push('Career history')
  if (data.beyond_resume)       filled.push('Beyond resume')
  if (data.target_titles)       filled.push('Target titles')
  return filled
}

export function OnboardingForm({ profile, errorMessage }: { profile: InitialProfile | null; errorMessage?: string | null }) {
  const [searchPersona, setSearchPersona]       = useState<SearchPersona | ''>('')
  const [fullName, setFullName]                 = useState(profile?.full_name ?? '')
  const [currentTitle, setCurrentTitle]         = useState(profile?.current_title ?? '')
  const [currentCompany, setCurrentCompany]     = useState(profile?.current_company ?? '')
  const [positioningSummary, setPositioningSummary] = useState('')
  const [resumeText, setResumeText]             = useState('')
  const [beyondResume, setBeyondResume]         = useState('')
  const [targetTitles, setTargetTitles]         = useState('')

  const [pasteText, setPasteText]   = useState('')
  const [importing, setImporting]   = useState(false)
  const [importError, setImportError] = useState('')
  const [importDone, setImportDone] = useState(false)
  const [importedFields, setImportedFields] = useState<string[]>([])
  const [importThin, setImportThin] = useState(false)

  const linkedinPdfRef = useRef<HTMLInputElement>(null)
  const [extracting, setExtracting] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeUploadDone, setResumeUploadDone] = useState(false)
  const [resumeUploadError, setResumeUploadError] = useState('')

  function applyImport(data: ImportResult, inputLength: number) {
    if (data.full_name)            setFullName(data.full_name)
    if (data.current_title)        setCurrentTitle(data.current_title)
    if (data.current_company)      setCurrentCompany(data.current_company)
    if (data.positioning_summary)  setPositioningSummary(data.positioning_summary)
    if (data.resume_text)          setResumeText(data.resume_text)
    if (data.beyond_resume)        setBeyondResume(data.beyond_resume)
    if (data.target_titles)        setTargetTitles(data.target_titles)
    setImportedFields(importSummary(data))
    setImportThin(inputLength > 500 && (data.resume_text?.length ?? 0) < 300)
    setImportDone(true)
  }

  async function handleImport() {
    if (!pasteText.trim() || importing) return
    setImporting(true)
    setImportError('')
    setImportDone(false)
    const inputText = pasteText
    try {
      const res = await fetch('/api/linkedin-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })
      if (!res.ok) {
        // Non-2xx: fall back gracefully — put the raw text in resume and let user fill the rest
        setResumeText(inputText.slice(0, 20000))
        setPasteText('')
        setImportedFields(['Career history'])
        setImportThin(true)
        setImportDone(true)
        return
      }
      const data = await res.json()
      applyImport(data, inputText.length)
      setPasteText('')
    } catch {
      // Network failure — put the raw text in resume so the user's effort isn't lost
      setResumeText(inputText.slice(0, 20000))
      setPasteText('')
      setImportedFields(['Career history'])
      setImportThin(true)
      setImportDone(true)
    } finally {
      setImporting(false)
    }
  }

  async function handleLinkedInPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setExtracting(true)
    setImportError('')
    setImportDone(false)
    try {
      const fd = new FormData()
      fd.append('file', file)
      let extractedText = ''
      try {
        const res = await fetch('/api/linkedin-import/extract', { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.text) {
          setImportError(data.error ?? 'Could not read the PDF. Try pasting your profile text instead.')
          return
        }
        extractedText = data.text
      } catch {
        setImportError('Could not read the PDF. Try pasting your profile text instead.')
        return
      }

      setImporting(true)
      try {
        const importRes = await fetch('/api/linkedin-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: extractedText }),
        })
        if (!importRes.ok) {
          // PDF read fine but structured extraction failed — save the text and move on
          setResumeText(extractedText.slice(0, 20000))
          setImportedFields(['Career history'])
          setImportThin(true)
          setImportDone(true)
          return
        }
        const importData = await importRes.json()
        applyImport(importData, 2000)
      } catch {
        // Network error on the import call — save what we have
        setResumeText(extractedText.slice(0, 20000))
        setImportedFields(['Career history'])
        setImportThin(true)
        setImportDone(true)
      }
    } finally {
      setExtracting(false)
      setImporting(false)
      if (linkedinPdfRef.current) linkedinPdfRef.current.value = ''
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingResume(true)
    setResumeUploadDone(false)
    setResumeUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/profile/upload-resume', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setResumeUploadError(data.error ?? 'Upload failed.'); return }
      setResumeText(data.text)
      setResumeUploadDone(true)
    } catch {
      setResumeUploadError('Upload failed. Try pasting the text instead.')
    } finally {
      setUploadingResume(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <form action={completeOnboarding} className="flex flex-col gap-6">

      {errorMessage && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Section map */}
      <div className="flex items-center gap-0 text-[11px] font-semibold text-slate-400 overflow-x-auto pb-1">
        {SECTIONS.map((s, i) => (
          <span key={s} className="flex items-center gap-0 shrink-0">
            <span className="px-2 py-0.5">{i + 1}. {s}</span>
            {i < SECTIONS.length - 1 && <span className="text-slate-200">›</span>}
          </span>
        ))}
      </div>

      {/* Level */}
      <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
        <div>
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1.5">
            Your level
          </div>
          <p className="text-[13px] text-slate-500">
            This shapes how every brief is written. Pick the option that best matches where you are now.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PERSONA_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSearchPersona(opt.value)}
              className={[
                'text-left border rounded p-4 flex flex-col gap-1 transition-colors cursor-pointer',
                searchPersona === opt.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 hover:border-slate-400',
              ].join(' ')}
            >
              <span className={['text-[14px] font-semibold', searchPersona === opt.value ? 'text-white' : 'text-slate-900'].join(' ')}>
                {opt.label}
              </span>
              <span className={['text-[12px] leading-relaxed', searchPersona === opt.value ? 'text-slate-300' : 'text-slate-400'].join(' ')}>
                {opt.sub}
              </span>
            </button>
          ))}
        </div>
        <input type="hidden" name="search_persona" value={searchPersona} />
      </div>

      {/* LinkedIn Import — two equal tiles */}
      <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1.5">
            Import from LinkedIn
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            The fastest way to fill out the form below. Choose whichever method is easier.
          </p>
        </div>

        {importDone && (
          <div className="px-4 py-3 bg-green-50 border border-green-200 rounded text-[13px] text-green-700 flex flex-col gap-1.5">
            <p className="font-semibold">Profile imported — review and edit before saving.</p>
            {importedFields.length > 0 && (
              <p className="text-green-600">Filled in: {importedFields.join(', ')}.</p>
            )}
            {importThin && (
              <p className="text-amber-700 font-medium mt-1">Auto-fill was partial. Review the fields below, add your name and title, and check Career History in the Background section.</p>
            )}
          </div>
        )}

        {importError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
            {importError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* PDF tile */}
          <div className="border border-slate-200 rounded p-5 flex flex-col gap-3">
            <div className="text-[12px] font-bold text-slate-600">Upload LinkedIn PDF</div>
            <div className="text-[12px] text-slate-400 leading-relaxed space-y-1.5">
              <p><span className="font-medium text-slate-500">Desktop:</span> Go to your profile &rarr; click <span className="font-medium text-slate-600">More</span> &rarr; <span className="font-medium text-slate-600">Save to PDF</span></p>
              <p><span className="font-medium text-slate-500">Mobile:</span> Tap the <span className="font-medium text-slate-600">&hellip;</span> menu on your profile &rarr; <span className="font-medium text-slate-600">Save to PDF</span></p>
            </div>
            <button
              type="button"
              onClick={() => linkedinPdfRef.current?.click()}
              disabled={extracting || importing}
              className="mt-auto bg-slate-900 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed self-start"
            >
              {extracting ? 'Reading PDF…' : importing ? 'Extracting…' : 'Upload PDF'}
            </button>
            <input
              ref={linkedinPdfRef}
              type="file"
              accept=".pdf"
              onChange={handleLinkedInPdf}
              aria-label="Upload LinkedIn PDF"
              className="hidden"
            />
          </div>

          {/* Paste tile */}
          <div className="border border-slate-200 rounded p-5 flex flex-col gap-3">
            <div className="text-[12px] font-bold text-slate-600">Paste profile text</div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              On your LinkedIn profile, select all text and copy it, then paste it here.
            </p>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste your LinkedIn profile text here…"
              rows={4}
              disabled={importing}
              className={inputCls + ' resize-none leading-relaxed disabled:opacity-50 text-[13px]'}
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !pasteText.trim()}
              className="bg-slate-900 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed self-start"
            >
              {importing ? 'Extracting…' : 'Extract profile'}
            </button>
          </div>
        </div>

        <p className="text-[12px] text-slate-400">
          Optional — skip this and fill in the form below manually instead.
        </p>
      </div>

      {/* About you */}
      <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
          About you
        </div>

        <div>
          <label htmlFor="full_name" className={labelCls}>
            Full name <span className="text-red-400">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Richard Rothschild"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="current_title" className={labelCls}>Current or most recent title</label>
            <input
              id="current_title"
              name="current_title"
              type="text"
              value={currentTitle}
              onChange={e => setCurrentTitle(e.target.value)}
              placeholder="Chief Information Officer"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="current_company" className={labelCls}>Current or most recent company</label>
            <input
              id="current_company"
              name="current_company"
              type="text"
              value={currentCompany}
              onChange={e => setCurrentCompany(e.target.value)}
              placeholder="Acme Corp"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="linkedin_url" className={labelCls}>LinkedIn URL</label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            placeholder="https://linkedin.com/in/yourname"
            className={inputCls}
          />
        </div>
      </div>

      {/* Situation */}
      <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
          Your situation
        </div>

        <div>
          <label htmlFor="employment_status" className={labelCls}>Where are you right now?</label>
          <select id="employment_status" name="employment_status" className={inputCls + ' bg-white'}>
            <option value="">— Select —</option>
            <option value="employed_exploring">Employed and quietly exploring</option>
            <option value="active_search">In active search</option>
            <option value="consulting">Consulting or interim</option>
            <option value="between_roles">Between roles</option>
          </select>
        </div>

        <div>
          <label htmlFor="search_timeline" className={labelCls}>Timeline for landing a new role</label>
          <select id="search_timeline" name="search_timeline" className={inputCls + ' bg-white'}>
            <option value="">— Select —</option>
            <option value="immediately">Need something immediately</option>
            <option value="3_months">Within the next 3 months</option>
            <option value="6_months">Within the next 6 months</option>
            <option value="opportunistic">Only for the right opportunity — no rush</option>
          </select>
        </div>
      </div>

      {/* Targeting */}
      <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
          What you&apos;re targeting
        </div>

        <div>
          <label htmlFor="target_titles" className={labelCls}>Roles you&apos;re targeting</label>
          <TagInput
            id="target_titles"
            name="target_titles"
            value={targetTitles}
            onChange={setTargetTitles}
            placeholder="Type a title and press Enter — CIO, VP of Technology…"
          />
          <p className={hintCls}>Press Enter or comma after each. Used to score job matches in company scans.</p>
        </div>

        <div>
          <label htmlFor="target_sectors" className={labelCls}>Sectors you&apos;re interested in</label>
          <TagInput
            id="target_sectors"
            name="target_sectors"
            placeholder="Type a sector and press Enter — Healthcare, Fintech, SaaS…"
          />
          <p className={hintCls}>Press Enter or comma after each.</p>
        </div>

        <div>
          <label htmlFor="target_locations" className={labelCls}>Target locations</label>
          <TagInput
            id="target_locations"
            name="target_locations"
            placeholder="Type a location and press Enter — Remote, New York, Dallas…"
          />
          <p className={hintCls}>Press Enter or comma after each. Used in your Search Strategy Brief.</p>
        </div>

        <div>
          <label htmlFor="dream_companies" className={labelCls}>Dream companies</label>
          <textarea
            id="dream_companies"
            name="dream_companies"
            rows={2}
            placeholder="Companies you&apos;d love to work for, even if there&apos;s no opening right now…"
            className={inputCls + ' resize-none leading-relaxed'}
          />
        </div>

        <div>
          <label htmlFor="dream_job" className={labelCls}>Dream role</label>
          <textarea
            id="dream_job"
            name="dream_job"
            rows={3}
            placeholder="Describe the role you&apos;d take immediately if someone called you tomorrow…"
            className={inputCls + ' resize-none leading-relaxed'}
          />
        </div>
      </div>

      {/* Background */}
      <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
            Your background
          </div>
          <p className="text-[12px] text-slate-400 text-right leading-relaxed shrink-0 max-w-xs">
            Not shared. Not used to train AI. Only used to build your briefs.
          </p>
        </div>

        <div>
          <label htmlFor="positioning_summary" className={labelCls}>How you&apos;d describe yourself</label>
          <textarea
            id="positioning_summary"
            name="positioning_summary"
            rows={3}
            value={positioningSummary}
            onChange={e => setPositioningSummary(e.target.value)}
            placeholder="Transformation CIO with 20+ years leading enterprise technology modernization. Known for…"
            className={inputCls + ' resize-none leading-relaxed'}
          />
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <p className={hintCls + ' mt-0'}>2–3 sentences. Used to personalize your prep briefs and AI chat.</p>
            {!positioningSummary && (
              <button
                type="button"
                onClick={() => {
                  const title = currentTitle || 'Technology executive'
                  const targets = targetTitles ? targetTitles.split(',')[0].trim() : 'senior technology leadership'
                  setPositioningSummary(
                    `${title} with [X]+ years leading [key transformation or discipline]. Known for [signature achievement — one specific, quantified win]. Seeking ${targets} roles where I can [value you bring to the next organization].`
                  )
                  setTimeout(() => {
                    const el = document.getElementById('positioning_summary') as HTMLTextAreaElement | null
                    el?.focus()
                    el?.select()
                  }, 0)
                }}
                className="shrink-0 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded px-3 py-1 hover:bg-slate-50 cursor-pointer bg-white"
              >
                Build a starter
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="resume_text" className={labelCls}>Resume or career history</label>
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingResume}
              className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 cursor-pointer bg-white disabled:opacity-40"
            >
              {uploadingResume ? 'Extracting…' : 'Upload PDF or DOCX'}
            </button>
            {resumeUploadDone && <span className="text-[12px] text-green-600">Extracted — review below and edit if needed.</span>}
            {resumeUploadError && <span className="text-[12px] text-red-600">{resumeUploadError}</span>}
            <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleResumeUpload} aria-label="Upload resume file" className="hidden" />
          </div>
          <textarea
            id="resume_text"
            name="resume_text"
            rows={12}
            maxLength={100000}
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Upload a PDF or DOCX above, or paste your resume text here. The more detail, the sharper your interview prep briefs will be."
            className={inputCls + ' resize-y leading-relaxed'}
          />
          <p className={hintCls}>Used by the AI to build your prep briefs and answer search questions.</p>
        </div>

        <div>
          <label htmlFor="beyond_resume" className={labelCls}>Beyond the resume</label>
          <textarea
            id="beyond_resume"
            name="beyond_resume"
            rows={4}
            value={beyondResume}
            onChange={e => setBeyondResume(e.target.value)}
            placeholder="Board seats, advisory roles, publications, patents, speaking engagements, community work — anything that matters but doesn&apos;t fit neatly on a resume."
            className={inputCls + ' resize-none leading-relaxed'}
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 pb-8">
        <button
          type="submit"
          className="bg-slate-900 text-white text-[14px] font-semibold px-7 py-3 rounded cursor-pointer border-0"
        >
          Complete setup
        </button>
        <button
          type="submit"
          formAction={skipOnboarding}
          className="text-[12px] text-slate-300 hover:text-slate-500 bg-transparent border-0 cursor-pointer p-0"
        >
          Skip for now (AI features will be generic until you complete this)
        </button>
      </div>

    </form>
  )
}
