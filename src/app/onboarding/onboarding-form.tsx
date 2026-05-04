'use client'
import { useState, useRef } from 'react'
import { completeOnboarding, skipOnboarding } from './actions'

const inputCls = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400'
const labelCls = 'block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5'
const hintCls  = 'mt-1.5 text-[12px] text-slate-400'

type InitialProfile = {
  full_name?: string | null
  current_title?: string | null
  current_company?: string | null
}

export function OnboardingForm({ profile }: { profile: InitialProfile | null }) {
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

  const linkedinPdfRef = useRef<HTMLInputElement>(null)
  const [extracting, setExtracting] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeUploadDone, setResumeUploadDone] = useState(false)
  const [resumeUploadError, setResumeUploadError] = useState('')

  async function handleImport() {
    if (!pasteText.trim() || importing) return
    setImporting(true)
    setImportError('')
    setImportDone(false)
    try {
      const res = await fetch('/api/linkedin-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })
      const data = await res.json()
      if (!res.ok) {
        setImportError(data.error ?? 'Import failed. Please try again.')
        return
      }
      if (data.full_name)            setFullName(data.full_name)
      if (data.current_title)        setCurrentTitle(data.current_title)
      if (data.current_company)      setCurrentCompany(data.current_company)
      if (data.positioning_summary)  setPositioningSummary(data.positioning_summary)
      if (data.resume_text)          setResumeText(data.resume_text)
      if (data.beyond_resume)        setBeyondResume(data.beyond_resume)
      if (data.target_titles)        setTargetTitles(data.target_titles)
      setImportDone(true)
      setPasteText('')
    } catch {
      setImportError('Import failed. Please try again.')
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
      const res = await fetch('/api/linkedin-import/extract', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setImportError(data.error ?? 'Could not read the PDF.'); return }
      // Pass extracted text straight into the import pipeline
      setImporting(true)
      const importRes = await fetch('/api/linkedin-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.text }),
      })
      const importData = await importRes.json()
      if (!importRes.ok) { setImportError(importData.error ?? 'Import failed. Please try again.'); return }
      if (importData.full_name)           setFullName(importData.full_name)
      if (importData.current_title)       setCurrentTitle(importData.current_title)
      if (importData.current_company)     setCurrentCompany(importData.current_company)
      if (importData.positioning_summary) setPositioningSummary(importData.positioning_summary)
      if (importData.resume_text)         setResumeText(importData.resume_text)
      if (importData.beyond_resume)       setBeyondResume(importData.beyond_resume)
      if (importData.target_titles)       setTargetTitles(importData.target_titles)
      setImportDone(true)
    } catch {
      setImportError('Something went wrong. Try pasting your profile text instead.')
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

      {/* LinkedIn Import */}
      <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1.5">
            Import from LinkedIn
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            On desktop: go to your LinkedIn profile, click{' '}
            <span className="font-medium text-slate-700">More</span>
            {' '}then{' '}
            <span className="font-medium text-slate-700">Save to PDF.</span>
            {' '}On mobile: tap the{' '}
            <span className="font-medium text-slate-700">&hellip;</span>
            {' '}menu and choose{' '}
            <span className="font-medium text-slate-700">Save to PDF.</span>
            {' '}Upload that file and Starting Monday will extract your career history and pre-fill the form.
          </p>
        </div>

        {importDone && (
          <div className="px-4 py-3 bg-green-50 border border-green-200 rounded text-[13px] text-green-700">
            Profile imported. Review the fields below and edit anything before clicking Complete setup.
          </div>
        )}

        {importError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
            {importError}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => linkedinPdfRef.current?.click()}
            disabled={extracting || importing}
            className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2 rounded cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {extracting ? 'Reading PDF…' : importing ? 'Extracting…' : 'Upload LinkedIn PDF'}
          </button>
          <span className="text-[12px] text-slate-400">
            Optional — fill in the form below manually instead.
          </span>
          <input
            ref={linkedinPdfRef}
            type="file"
            accept=".pdf"
            onChange={handleLinkedInPdf}
            aria-label="Upload LinkedIn PDF"
            className="hidden"
          />
        </div>

        <details className="group">
          <summary className="text-[12px] text-slate-400 cursor-pointer hover:text-slate-600 list-none">
            Or paste profile text manually
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste your LinkedIn profile text here…"
              rows={4}
              disabled={importing}
              className={inputCls + ' resize-none leading-relaxed disabled:opacity-50'}
            />
            <div>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || !pasteText.trim()}
                className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2 rounded cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {importing ? 'Extracting…' : 'Extract profile'}
              </button>
            </div>
          </div>
        </details>
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
          <input
            id="target_titles"
            name="target_titles"
            type="text"
            value={targetTitles}
            onChange={e => setTargetTitles(e.target.value)}
            placeholder="CIO, VP of Technology, Head of IT"
            className={inputCls}
          />
          <p className={hintCls}>Comma-separated. Used to score job matches in company scans.</p>
        </div>

        <div>
          <label htmlFor="target_sectors" className={labelCls}>Sectors you&apos;re interested in</label>
          <input
            id="target_sectors"
            name="target_sectors"
            type="text"
            placeholder="Healthcare, Fintech, SaaS, Public Sector"
            className={inputCls}
          />
          <p className={hintCls}>Comma-separated.</p>
        </div>

        <div>
          <label htmlFor="target_locations" className={labelCls}>Target locations</label>
          <input
            id="target_locations"
            name="target_locations"
            type="text"
            placeholder="New York, Remote, Dallas, Chicago"
            className={inputCls}
          />
          <p className={hintCls}>Comma-separated. Used in your Search Strategy Brief.</p>
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
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
          Your background
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
          <p className={hintCls}>2–3 sentences. Used to personalize your prep briefs and AI chat.</p>
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
          className="text-[13px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
        >
          Skip for now — I&apos;ll fill this in later
        </button>
      </div>

    </form>
  )
}
