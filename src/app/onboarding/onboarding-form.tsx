'use client'
import { useState, useRef, useEffect } from 'react'
import { completeOnboarding, skipOnboarding } from './actions'

type SearchPersona = 'csuite' | 'vp' | 'director' | 'board'

type ImportResult = {
  full_name?: string | null
  current_title?: string | null
  current_company?: string | null
  positioning_summary?: string | null
  resume_text?: string | null
  beyond_resume?: string | null
  target_titles?: string | null
}

const PERSONA_OPTIONS: { value: SearchPersona; label: string; sub: string }[] = [
  { value: 'csuite',   label: 'C-Suite',         sub: 'CEO, CFO, CTO, COO, CIO, CHRO' },
  { value: 'vp',       label: 'VP / SVP',         sub: 'Targeting C-suite or a larger VP role' },
  { value: 'director', label: 'Director',          sub: 'Targeting VP or above' },
  { value: 'board',    label: 'Board / Advisor',  sub: 'Board seat or advisory role' },
]

const STEP_COUNT = 4

function Dots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <div
          key={i}
          className={[
            'rounded-full transition-all duration-300',
            i === current ? 'w-5 h-1.5 bg-slate-900' : i < current ? 'w-1.5 h-1.5 bg-slate-400' : 'w-1.5 h-1.5 bg-slate-200',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

export function OnboardingForm({ profile }: { profile: { full_name?: string | null; current_title?: string | null; current_company?: string | null } | null }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)

  const [fullName, setFullName]               = useState(profile?.full_name ?? '')
  const [searchPersona, setSearchPersona]     = useState<SearchPersona | ''>('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [searchTimeline, setSearchTimeline]   = useState('')
  const [currentTitle, setCurrentTitle]       = useState(profile?.current_title ?? '')
  const [currentCompany, setCurrentCompany]   = useState(profile?.current_company ?? '')
  const [resumeText, setResumeText]           = useState('')
  const [positioningSummary, setPositioningSummary] = useState('')
  const [beyondResume, setBeyondResume]       = useState('')
  const [targetTitles, setTargetTitles]       = useState('')
  const [linkedinUrl, setLinkedinUrl]         = useState('')

  const [pasteText, setPasteText]     = useState('')
  const [importing, setImporting]     = useState(false)
  const [importDone, setImportDone]   = useState(false)
  const [importError, setImportError] = useState('')
  const [extracting, setExtracting]   = useState(false)
  const [manualMode, setManualMode]   = useState(false)

  const linkedinPdfRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 0) nameRef.current?.focus()
  }, [step])

  function goTo(next: number) {
    if (animating) return
    setDirection(next > step ? 'forward' : 'back')
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
    }, 180)
  }

  function advance() {
    if (step < STEP_COUNT - 1) goTo(step + 1)
  }

  function applyImport(data: ImportResult) {
    if (data.full_name)            setFullName(data.full_name)
    if (data.current_title)        setCurrentTitle(data.current_title)
    if (data.current_company)      setCurrentCompany(data.current_company)
    if (data.positioning_summary)  setPositioningSummary(data.positioning_summary)
    if (data.resume_text)          setResumeText(data.resume_text)
    if (data.beyond_resume)        setBeyondResume(data.beyond_resume)
    if (data.target_titles)        setTargetTitles(data.target_titles)
    setImportDone(true)
  }

  async function handlePasteImport() {
    if (!pasteText.trim() || importing) return
    setImporting(true)
    setImportError('')
    const text = pasteText
    try {
      const res = await fetch('/api/linkedin-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = res.ok ? await res.json() : {}
      applyImport(data)
      if (!data.resume_text) setResumeText(text.slice(0, 20000))
      setPasteText('')
    } catch {
      setResumeText(text.slice(0, 20000))
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
    try {
      const fd = new FormData()
      fd.append('file', file)
      const extractRes = await fetch('/api/linkedin-import/extract', { method: 'POST', body: fd })
      const extractData = await extractRes.json().catch(() => ({}))
      if (!extractRes.ok || !extractData.text) {
        setImportError('Could not read the PDF. Try pasting your profile text instead.')
        return
      }
      setImporting(true)
      try {
        const importRes = await fetch('/api/linkedin-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: extractData.text }),
        })
        const data = importRes.ok ? await importRes.json() : {}
        applyImport(data)
        if (!data.resume_text) setResumeText(extractData.text.slice(0, 20000))
      } catch {
        setResumeText(extractData.text.slice(0, 20000))
        setImportDone(true)
      } finally {
        setImporting(false)
      }
    } finally {
      setExtracting(false)
      if (linkedinPdfRef.current) linkedinPdfRef.current.value = ''
    }
  }

  const slideClass = animating
    ? direction === 'forward'
      ? 'opacity-0 translate-x-4'
      : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0'

  function SubmitButton({ label = 'Continue' }: { label?: string }) {
    return (
      <button
        type="submit"
        form="onboarding-form"
        className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-8 py-3 rounded transition-colors cursor-pointer"
      >
        {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <form ref={formRef} id="onboarding-form" action={completeOnboarding} className="hidden">
        <input type="hidden" name="full_name"           value={fullName} />
        <input type="hidden" name="search_persona"      value={searchPersona} />
        <input type="hidden" name="employment_status"   value={employmentStatus} />
        <input type="hidden" name="search_timeline"     value={searchTimeline} />
        <input type="hidden" name="current_title"       value={currentTitle} />
        <input type="hidden" name="current_company"     value={currentCompany} />
        <input type="hidden" name="resume_text"         value={resumeText} />
        <input type="hidden" name="positioning_summary" value={positioningSummary} />
        <input type="hidden" name="beyond_resume"       value={beyondResume} />
        <input type="hidden" name="target_titles"       value={targetTitles} />
        <input type="hidden" name="linkedin_url"        value={linkedinUrl} />
      </form>

      <div className="w-full max-w-lg">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">Starting Monday</span>
        </div>

        {/* Step content */}
        <div
          className={[
            'transition-all duration-200 ease-out',
            slideClass,
          ].join(' ')}
        >
          {step === 0 && (
            <StepName
              value={fullName}
              onChange={setFullName}
              inputRef={nameRef}
              onNext={() => fullName.trim() && advance()}
            />
          )}

          {step === 1 && (
            <StepLevel
              value={searchPersona}
              onSelect={v => { setSearchPersona(v); setTimeout(advance, 220) }}
            />
          )}

          {step === 2 && (
            <StepSituation
              status={employmentStatus}
              timeline={searchTimeline}
              onStatus={setEmploymentStatus}
              onTimeline={setSearchTimeline}
              onNext={advance}
            />
          )}

          {step === 3 && (
            <StepImport
              importDone={importDone}
              importing={importing}
              extracting={extracting}
              importError={importError}
              manualMode={manualMode}
              pasteText={pasteText}
              currentTitle={currentTitle}
              currentCompany={currentCompany}
              linkedinUrl={linkedinUrl}
              onPasteText={setPasteText}
              onImport={handlePasteImport}
              onPdfClick={() => linkedinPdfRef.current?.click()}
              onManual={() => setManualMode(true)}
              onTitle={setCurrentTitle}
              onCompany={setCurrentCompany}
              onLinkedinUrl={setLinkedinUrl}
            />
          )}
        </div>

        {/* Nav row */}
        <div className="mt-10 flex items-center justify-between">
          {/* Back / skip */}
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="text-[13px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
              >
                Back
              </button>
            )}
            {step > 0 && (
              <button
                type="submit"
                form="onboarding-form"
                formAction={skipOnboarding}
                className="text-[12px] text-slate-300 hover:text-slate-500 bg-transparent border-0 cursor-pointer p-0"
              >
                Skip setup
              </button>
            )}
          </div>

          {/* Dots */}
          <Dots current={step} />

          {/* Next */}
          <div>
            {step === 0 && (
              <button
                type="button"
                onClick={() => fullName.trim() && advance()}
                disabled={!fullName.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={advance}
                disabled={!searchPersona}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={advance}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0"
              >
                Continue
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                form="onboarding-form"
                className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0"
              >
                Start my search
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={linkedinPdfRef}
        type="file"
        accept=".pdf"
        onChange={handleLinkedInPdf}
        aria-label="Upload LinkedIn PDF"
        className="hidden"
      />
    </div>
  )
}

function StepName({
  value,
  onChange,
  inputRef,
  onNext,
}: {
  value: string
  onChange: (v: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          What do we call you?
        </h1>
        <p className="text-[15px] text-slate-500">
          Your briefings and prep briefs will use your first name.
        </p>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onNext()}
        placeholder="Your full name"
        autoComplete="name"
        className="w-full border border-slate-200 rounded-lg px-4 py-3.5 text-[16px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
      />
    </div>
  )
}

function StepLevel({
  value,
  onSelect,
}: {
  value: SearchPersona | ''
  onSelect: (v: SearchPersona) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          What level are you targeting?
        </h1>
        <p className="text-[15px] text-slate-500">
          This shapes how every brief and signal is written for you.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {PERSONA_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={[
              'text-left border rounded-lg px-5 py-4 flex items-center justify-between transition-all cursor-pointer',
              value === opt.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white hover:border-slate-400',
            ].join(' ')}
          >
            <div>
              <div className={['text-[15px] font-semibold', value === opt.value ? 'text-white' : 'text-slate-900'].join(' ')}>
                {opt.label}
              </div>
              <div className={['text-[13px] mt-0.5', value === opt.value ? 'text-slate-300' : 'text-slate-400'].join(' ')}>
                {opt.sub}
              </div>
            </div>
            {value === opt.value && (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 ml-4">
                <circle cx="9" cy="9" r="9" fill="white" fillOpacity="0.2" />
                <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepSituation({
  status,
  timeline,
  onStatus,
  onTimeline,
  onNext,
}: {
  status: string
  timeline: string
  onStatus: (v: string) => void
  onTimeline: (v: string) => void
  onNext: () => void
}) {
  const selectCls = 'w-full border border-slate-200 rounded-lg px-4 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white appearance-none cursor-pointer'
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          Where are you in your search?
        </h1>
        <p className="text-[15px] text-slate-500">
          Helps calibrate the urgency and tone of your intelligence.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
            Current situation
          </label>
          <select
            value={status}
            onChange={e => onStatus(e.target.value)}
            title="Current situation"
            className={selectCls}
          >
            <option value="">Select one</option>
            <option value="employed_exploring">Employed and quietly exploring</option>
            <option value="active_search">In active search</option>
            <option value="consulting">Consulting or interim</option>
            <option value="between_roles">Between roles</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
            Timeline
          </label>
          <select
            value={timeline}
            onChange={e => onTimeline(e.target.value)}
            title="Search timeline"
            className={selectCls}
          >
            <option value="">Select one</option>
            <option value="immediately">Need something immediately</option>
            <option value="3_months">Within the next 3 months</option>
            <option value="6_months">Within the next 6 months</option>
            <option value="opportunistic">Only for the right opportunity</option>
          </select>
        </div>
      </div>
      <p className="text-[12px] text-slate-400">
        You can update this anytime from your profile.
      </p>
    </div>
  )
}

function StepImport({
  importDone,
  importing,
  extracting,
  importError,
  manualMode,
  pasteText,
  currentTitle,
  currentCompany,
  linkedinUrl,
  onPasteText,
  onImport,
  onPdfClick,
  onManual,
  onTitle,
  onCompany,
  onLinkedinUrl,
}: {
  importDone: boolean
  importing: boolean
  extracting: boolean
  importError: string
  manualMode: boolean
  pasteText: string
  currentTitle: string
  currentCompany: string
  linkedinUrl: string
  onPasteText: (v: string) => void
  onImport: () => void
  onPdfClick: () => void
  onManual: () => void
  onTitle: (v: string) => void
  onCompany: (v: string) => void
  onLinkedinUrl: (v: string) => void
}) {
  const inputCls = 'w-full border border-slate-200 rounded-lg px-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white'

  if (importDone) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
            Profile imported.
          </h1>
          <p className="text-[15px] text-slate-500">
            Your signals, briefings, and prep briefs are now personalized to your background. You can review and edit your profile anytime from settings.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#dcfce7" />
            <path d="M6 10l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[14px] text-green-700 font-medium">LinkedIn data extracted successfully</span>
        </div>
      </div>
    )
  }

  if (manualMode) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
            Tell us a bit more.
          </h1>
          <p className="text-[15px] text-slate-500">
            You can add your full background from your profile later.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
              Current or most recent title
            </label>
            <input
              type="text"
              value={currentTitle}
              onChange={e => onTitle(e.target.value)}
              placeholder="Chief Information Officer"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
              Current or most recent company
            </label>
            <input
              type="text"
              value={currentCompany}
              onChange={e => onCompany(e.target.value)}
              placeholder="Acme Corp"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
              LinkedIn URL <span className="text-slate-300 font-normal normal-case tracking-normal">optional</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={e => onLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className={inputCls}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          Build your profile.
        </h1>
        <p className="text-[15px] text-slate-500">
          Import from LinkedIn for the best experience. It fills in your background automatically.
        </p>
      </div>

      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700">
          {importError}
        </div>
      )}

      {/* PDF tile */}
      <div className="border border-slate-200 rounded-lg bg-white p-5 flex flex-col gap-3">
        <div className="text-[14px] font-semibold text-slate-800">Upload your LinkedIn PDF</div>
        <div className="text-[13px] text-slate-400 leading-relaxed">
          On your LinkedIn profile: find the <span className="font-medium text-slate-500">More</span> or <span className="font-medium text-slate-500">Resources</span> button, then choose <span className="font-medium text-slate-500">Save to PDF</span>.
        </div>
        <button
          type="button"
          onClick={onPdfClick}
          disabled={extracting || importing}
          className="self-start bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:opacity-40"
        >
          {extracting ? 'Reading PDF...' : importing ? 'Extracting...' : 'Upload PDF'}
        </button>
      </div>

      {/* Paste tile */}
      <div className="border border-slate-200 rounded-lg bg-white p-5 flex flex-col gap-3">
        <div className="text-[14px] font-semibold text-slate-800">Paste profile text</div>
        <div className="text-[13px] text-slate-400">
          Open your LinkedIn profile, press <span className="font-medium text-slate-500">Cmd+A</span> then <span className="font-medium text-slate-500">Cmd+C</span>, and paste below.
        </div>
        <textarea
          value={pasteText}
          onChange={e => onPasteText(e.target.value)}
          placeholder="Paste your LinkedIn profile here..."
          rows={3}
          disabled={importing}
          className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed disabled:opacity-50 bg-white"
        />
        <button
          type="button"
          onClick={onImport}
          disabled={importing || !pasteText.trim()}
          className="self-start bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:opacity-40"
        >
          {importing ? 'Extracting...' : 'Extract profile'}
        </button>
      </div>

      <button
        type="button"
        onClick={onManual}
        className="text-[13px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0 text-left"
      >
        Skip LinkedIn import. I&apos;ll enter my details manually.
      </button>
    </div>
  )
}
