'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { completeOnboarding, skipOnboarding } from './actions'
import { HelpQuickButton } from '@/components/HelpQuickButton'
import {
  type SearchPersona,
  seededCompaniesFor,
  suggestedCompaniesForProfile,
  decisionRoleTargetsForCompany,
  firstNoteDraftForCompany,
  followUpSequenceForWeekOne,
} from './onboarding-helpers'
import {
  type OnboardingChannel,
  computeElapsedSeconds,
  estimateManualFieldReduction,
  isTransitionFirstCohort,
} from '@/lib/onboarding-speed'
import { type RoleFamily, type RoleTitle } from '@/lib/role-taxonomy'

type ImportResult = {
  full_name?: string | null
  current_title?: string | null
  current_company?: string | null
  positioning_summary?: string | null
  resume_text?: string | null
  beyond_resume?: string | null
  target_titles?: string | null
}

type RoleTrackOption = {
  value: RoleTitle
  roleFamily: RoleFamily
  persona: SearchPersona
  label: string
  sub: string
}

const ROLE_TRACK_OPTIONS: RoleTrackOption[] = [
  { value: 'manager', roleFamily: 'leadership', persona: 'director', label: 'Manager', sub: 'Leadership track for first-line managers' },
  { value: 'senior_director', roleFamily: 'leadership', persona: 'director', label: 'Senior Director', sub: 'Leadership track for org-level scope' },
  { value: 'avp', roleFamily: 'leadership', persona: 'vp', label: 'AVP / VP', sub: 'Leadership track with broad business ownership' },
  { value: 'executive', roleFamily: 'leadership', persona: 'csuite', label: 'Executive', sub: 'C-suite and enterprise leadership path' },
  { value: 'principal', roleFamily: 'technical_leadership', persona: 'director', label: 'Principal', sub: 'Technical leadership without direct org management' },
  { value: 'architect', roleFamily: 'technical_leadership', persona: 'director', label: 'Architect', sub: 'Architecture and platform strategy path' },
  { value: 'technical_lead', roleFamily: 'technical_leadership', persona: 'director', label: 'Technical Lead', sub: 'Hands-on technical leadership track' },
  { value: 'program_manager', roleFamily: 'delivery_leadership', persona: 'director', label: 'Program Manager', sub: 'Cross-functional delivery leadership path' },
  { value: 'tpm', roleFamily: 'delivery_leadership', persona: 'director', label: 'Technical Program Manager', sub: 'Technical delivery and execution path' },
  { value: 'project_manager', roleFamily: 'delivery_leadership', persona: 'director', label: 'Project Manager', sub: 'Execution-focused delivery leadership path' },
]

const STEP_COUNT = 7
const QUICK_PATH_STEP_COUNT = 5


function Dots({ current, total = STEP_COUNT }: { current: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
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
  const [advancedSetup, setAdvancedSetup] = useState(false)
  const [onboardingChannel, setOnboardingChannel] = useState<OnboardingChannel>('executives')
  const [lowEnergyMode, setLowEnergyMode] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [onboardingStartedAt] = useState(() => new Date().toISOString())

  const [fullName, setFullName]               = useState(profile?.full_name ?? '')
  const [searchPersona, setSearchPersona]     = useState<SearchPersona | ''>('')
  const [roleFamily, setRoleFamily]           = useState<RoleFamily | ''>('')
  const [roleTitle, setRoleTitle]             = useState<RoleTitle | ''>('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [searchTimeline, setSearchTimeline]   = useState('')
  const [searchDriver, setSearchDriver]       = useState('')
  const [currentTitle, setCurrentTitle]       = useState(profile?.current_title ?? '')
  const [currentCompany, setCurrentCompany]   = useState(profile?.current_company ?? '')
  const [resumeText, setResumeText]           = useState('')
  const [positioningSummary, setPositioningSummary] = useState('')
  const [beyondResume, setBeyondResume]       = useState('')
  const [targetTitles, setTargetTitles]       = useState('')
  const [linkedinUrl, setLinkedinUrl]         = useState('')

  const [companyNames, setCompanyNames] = useState<string[]>(['', '', ''])
  const [briefingTime, setBriefingTime] = useState('07:00')
  const [briefingFrequency, setBriefingFrequency] = useState<'daily' | 'weekly'>('daily')

  const [intelContent, setIntelContent] = useState('')
  const [intelLoading, setIntelLoading] = useState(false)

  const firstName = fullName.trim().split(' ')[0] || 'there'

  const isPassive = employmentStatus === 'employed_exploring' && searchTimeline === 'opportunistic'

  const [pasteText, setPasteText]     = useState('')
  const [importing, setImporting]     = useState(false)
  const [importDone, setImportDone]   = useState(false)
  const [importThin, setImportThin]   = useState(false)
  const [importError, setImportError] = useState('')
  const [extracting, setExtracting]   = useState(false)
  const [manualMode, setManualMode]   = useState(false)

  const linkedinPdfRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const step6FetchStarted = useRef(false)
  const nudgeLogged = useRef(false)
  const startLogged = useRef(false)
  const firstValueLogged = useRef(false)

  const transitionFirst = isTransitionFirstCohort(employmentStatus, searchTimeline)

  const manualFieldReduction = estimateManualFieldReduction({
    fullName,
    currentTitle,
    currentCompany,
    searchPersona,
    companyCount: companyNames.filter((name) => name.trim()).length,
    importedProfile: importDone,
    lowEnergyMode,
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ch = params.get('channel') as OnboardingChannel | null
    if (ch && ['executives', 'coaches', 'outplacement', 'search_firms'].includes(ch)) {
      setOnboardingChannel(ch)
    }
    const mode = params.get('mode')
    const from = params.get('from')
    if (mode === 'low_energy' || from === 'low-energy') {
      setLowEnergyMode(true)
      setAdvancedSetup(false)
    }
  }, [])

  useEffect(() => {
    if (step === 0) nameRef.current?.focus()
  }, [step])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(computeElapsedSeconds(onboardingStartedAt))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [onboardingStartedAt])

  useEffect(() => {
    if (startLogged.current) return
    startLogged.current = true
    fetch('/api/onboarding/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'onboarding_started',
        properties: {
          started_at: onboardingStartedAt,
          channel: onboardingChannel,
          mode: lowEnergyMode ? 'low_energy' : 'standard',
          confidence_band: null,
          action_context: 'onboarding_started',
        },
      }),
    }).catch(() => {})
  }, [onboardingStartedAt, onboardingChannel, lowEnergyMode])

  useEffect(() => {
    if (step === 3 && isPassive && !manualMode) {
      const timeoutId = window.setTimeout(() => setManualMode(true), 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [step, isPassive, manualMode])

  useEffect(() => {
    if (step !== 4 || advancedSetup) return
    if (companyNames.some(n => n.trim())) return
    const seeded = seededCompaniesFor(searchPersona)
    if (seeded.length === 0) return
    const timeoutId = window.setTimeout(() => setCompanyNames([...seeded, '']), 0)
    return () => window.clearTimeout(timeoutId)
  }, [step, advancedSetup, companyNames, searchPersona])

  useEffect(() => {
    if (step < 6 || firstValueLogged.current) return
    firstValueLogged.current = true
    fetch('/api/onboarding/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'onboarding_first_value_ready',
        properties: {
          elapsed_seconds: elapsedSeconds,
          under_ten_minutes: elapsedSeconds <= 600,
          company_count: companyNames.filter((name) => name.trim()).length,
          wedge_surface: 'shortlist',
          transition_first: transitionFirst,
          low_energy_mode: lowEnergyMode,
          mode: lowEnergyMode ? 'low_energy' : 'standard',
          confidence_band: null,
          action_context: 'onboarding_first_value_ready',
        },
      }),
    }).catch(() => {})
  }, [step, elapsedSeconds, companyNames, transitionFirst, lowEnergyMode])

  useEffect(() => {
    if (step >= 6 || elapsedSeconds < 480 || nudgeLogged.current) return
    nudgeLogged.current = true
    fetch('/api/onboarding/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'onboarding_nudge_shown',
        properties: {
          elapsed_seconds: elapsedSeconds,
          step,
          transition_first: transitionFirst,
          mode: lowEnergyMode ? 'low_energy' : 'standard',
          confidence_band: null,
          action_context: 'onboarding_nudge_shown',
        },
      }),
    }).catch(() => {})
  }, [step, elapsedSeconds, transitionFirst, lowEnergyMode])

  useEffect(() => {
    const currentElapsedSeconds = computeElapsedSeconds(onboardingStartedAt)
    fetch('/api/onboarding/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'onboarding_step_completed',
        properties: {
          step,
          elapsed_seconds: currentElapsedSeconds,
          low_energy_mode: lowEnergyMode,
          channel: onboardingChannel,
          mode: lowEnergyMode ? 'low_energy' : 'standard',
          confidence_band: null,
          action_context: 'onboarding_step_completed',
        },
      }),
    }).catch(() => {})
  }, [step, lowEnergyMode, onboardingChannel, onboardingStartedAt])

  useEffect(() => {
    if (step !== 6) return
    const firstCompany = companyNames.find(n => n.trim())
    if (!firstCompany || intelContent || intelLoading || step6FetchStarted.current) return
    step6FetchStarted.current = true
    setIntelLoading(true)
    fetch('/api/onboarding/intel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: firstCompany.trim(), persona: searchPersona }),
    }).then(async res => {
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setIntelContent(text)
      }
    }).catch(() => {}).finally(() => setIntelLoading(false))
  }, [step, companyNames, intelContent, intelLoading, searchPersona])

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
    if (lowEnergyMode && step === 1) { goTo(4); return }
    if (lowEnergyMode && step === 4) {
      if (isPassive) setBriefingFrequency('weekly')
      goTo(6)
      return
    }
    if (!advancedSetup && step === 1) { goTo(4); return }
    if (!advancedSetup && step === 4) {
      if (isPassive) setBriefingFrequency('weekly')
      goTo(6)
      return
    }
    if (isPassive && step === 2) { goTo(4); return }
    if (isPassive && step === 4) { setBriefingFrequency('weekly'); goTo(6); return }
    if (step < STEP_COUNT - 1) goTo(step + 1)
  }

  function prevStep() {
    if (!advancedSetup && step === 4) return 1
    if (isPassive && step === 4) return 2
    if (isPassive && step === 6) return 4
    return step - 1
  }

  function quickStart() {
    if (!searchPersona) setSearchPersona('csuite')
    if (!roleFamily) setRoleFamily('leadership')
    if (!roleTitle) setRoleTitle('executive')
    if (!companyNames.some(n => n.trim())) {
      const seeded = seededCompaniesFor(searchPersona || 'csuite')
      setCompanyNames([...seeded, ''])
    }
    goTo(4)
  }

  function progressIndex() {
    if (advancedSetup) return step
    if (step <= 1) return step
    if (step <= 4) return 2
    if (step === 5) return 3
    return 4
  }

  function applyImport(data: ImportResult) {
    if (data.full_name)            setFullName(data.full_name)
    if (data.current_title)        setCurrentTitle(data.current_title)
    if (data.current_company)      setCurrentCompany(data.current_company)
    if (data.positioning_summary)  setPositioningSummary(data.positioning_summary)
    if (data.resume_text)          setResumeText(data.resume_text)
    if (data.beyond_resume)        setBeyondResume(data.beyond_resume)
    if (data.target_titles)        setTargetTitles(data.target_titles)
    // Thin: only raw text was saved - structured fields (title, company) weren't extracted
    setImportThin(!data.current_title && !data.current_company)
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.12),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#111827_100%)] flex flex-col items-center justify-center px-4 py-12">
      <form id="onboarding-form" action={completeOnboarding} className="hidden">
        <input type="hidden" name="full_name"           value={fullName} />
        <input type="hidden" name="search_persona"      value={searchPersona} />
        <input type="hidden" name="role_family"         value={roleFamily} />
        <input type="hidden" name="role_title"          value={roleTitle} />
        <input type="hidden" name="onboarding_channel"  value={onboardingChannel} />
        <input type="hidden" name="onboarding_low_energy" value={lowEnergyMode ? 'true' : 'false'} />
        <input type="hidden" name="onboarding_started_at" value={onboardingStartedAt} />
        <input type="hidden" name="onboarding_elapsed_seconds" value={String(elapsedSeconds)} />
        <input type="hidden" name="manual_fields_baseline" value={String(manualFieldReduction.baselineManualFields)} />
        <input type="hidden" name="manual_fields_required" value={String(manualFieldReduction.requiredManualFields)} />
        <input type="hidden" name="manual_fields_reduction_rate" value={String(manualFieldReduction.reductionRate)} />
        <input type="hidden" name="employment_status"   value={employmentStatus} />
        <input type="hidden" name="search_timeline"     value={searchTimeline} />
        <input type="hidden" name="search_driver"       value={searchDriver} />
        <input type="hidden" name="current_title"       value={currentTitle} />
        <input type="hidden" name="current_company"     value={currentCompany} />
        <input type="hidden" name="resume_text"         value={resumeText} />
        <input type="hidden" name="positioning_summary" value={positioningSummary} />
        <input type="hidden" name="beyond_resume"       value={beyondResume} />
        <input type="hidden" name="target_titles"       value={targetTitles} />
        <input type="hidden" name="linkedin_url"        value={linkedinUrl} />
        <input type="hidden" name="company_names"        value={JSON.stringify(companyNames.filter(n => n.trim()))} />
        <input type="hidden" name="briefing_time"        value={briefingTime} />
        <input type="hidden" name="briefing_frequency"   value={briefingFrequency} />
      </form>

      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/95 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.45)] sm:p-6">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400"><span className="text-slate-900">Starting </span><span className="text-orange-500">Monday</span></span>
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
                onNext={() => advance()}
            />
          )}

          {step === 1 && (
            <StepLevel
              roleTitle={roleTitle}
              onSelect={(selection) => {
                setRoleTitle(selection.value)
                setRoleFamily(selection.roleFamily)
                setSearchPersona(selection.persona)
                setTimeout(advance, 220)
              }}
            />
          )}

          {step === 2 && (
            <StepSituation
              status={employmentStatus}
              timeline={searchTimeline}
              driver={searchDriver}
              onStatus={setEmploymentStatus}
              onTimeline={setSearchTimeline}
              onDriver={setSearchDriver}
            />
          )}

          {step === 3 && (
            <StepImport
              importDone={importDone}
              importThin={importThin}
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

          {step === 4 && (
            <StepCompanies
              names={companyNames}
              onChange={setCompanyNames}
              persona={searchPersona}
              currentTitle={currentTitle}
              resumeText={resumeText}
              isPassive={isPassive}
              onTitle={setCurrentTitle}
            />
          )}

          {step === 5 && (
            <StepBriefingTime
              value={briefingTime}
              onChange={setBriefingTime}
            />
          )}

          {step === 6 && (
            <StepDone
              firstName={firstName}
                currentTitle={currentTitle}
                currentCompany={currentCompany}
                targetTitles={targetTitles}
              companies={companyNames.filter(n => n.trim())}
              briefingTime={briefingTime}
              isPassive={isPassive}
              intelContent={intelContent}
              intelLoading={intelLoading}
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
                onClick={() => goTo(prevStep())}
                className="text-[13px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              form="onboarding-form"
              formAction={skipOnboarding}
              className="text-[12px] text-slate-300 hover:text-slate-500 bg-transparent border-0 cursor-pointer p-0"
            >
              Skip setup
            </button>
            {step === 0 && (
              <button
                type="button"
                onClick={quickStart}
                className="text-[12px] text-slate-300 hover:text-slate-500 bg-transparent border-0 cursor-pointer p-0"
              >
                Quick start
              </button>
            )}
          </div>

          {/* Dots */}
          <div className="flex flex-col items-center gap-2">
            <Dots current={progressIndex()} total={advancedSetup ? STEP_COUNT : QUICK_PATH_STEP_COUNT} />
            <p className="text-[11px] text-slate-400">
              {step <= 1
                ? 'Fast path: see your likely-to-open shortlist in minutes.'
                : step <= 4
                ? 'You are one step away from first value.'
                : 'Next: shortlist preview, then relationship actions.'}
            </p>
          </div>

          {/* Next */}
          <div>
            {step === 0 && (
              <button
                type="button"
                onClick={() => { setAdvancedSetup(false); goTo(1) }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0"
              >
                Generate my shortlist (under 10 minutes)
              </button>
            )}
            {step === 1 && (
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => { setAdvancedSetup(false); advance() }}
                  disabled={!roleTitle}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed"
                >
                  Continue to shortlist
                </button>
                <button
                  type="button"
                  onClick={() => { setAdvancedSetup(true); goTo(2) }}
                  disabled={lowEnergyMode}
                  className="text-[12px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
                >
                  {lowEnergyMode ? 'Context optional in low-energy mode' : 'Add search context first'}
                </button>
              </div>
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
                type="button"
                onClick={advance}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0"
              >
                Continue
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                onClick={advance}
                disabled={!companyNames.some(n => n.trim())}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
            {step === 5 && (
              <button
                type="button"
                onClick={advance}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0"
              >
                Continue
              </button>
            )}
            {step === 6 && (
              <button
                type="submit"
                form="onboarding-form"
                className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0"
              >
                {isPassive ? 'Start monitoring' : 'Start my search'}
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
      <HelpQuickButton source="onboarding" href="/dashboard/help" />
    </div>
  )
}

function StepCompanies({
  names,
  onChange,
  persona,
  currentTitle,
  resumeText = '',
  isPassive,
  onTitle,
}: {
  names: string[]
  onChange: (v: string[]) => void
  persona: SearchPersona | ''
  currentTitle: string
  resumeText?: string
  isPassive?: boolean
  onTitle?: (v: string) => void
}) {
  const suggestions = suggestedCompaniesForProfile(persona, currentTitle, resumeText)
  const inputCls = 'w-full border border-slate-200 rounded-lg px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white'
  const filled = names.filter(n => n.trim()).length

  const [discovering, setDiscovering] = useState(false)
  const [discovered, setDiscovered] = useState<{ name: string; sector: string; fit: number }[] | null>(null)
  const [discoverError, setDiscoverError] = useState(false)

  async function discover() {
    setDiscovering(true)
    setDiscoverError(false)
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            currentTitle: currentTitle || undefined,
            persona: persona || undefined,
          },
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDiscovered(Array.isArray(data) ? data.slice(0, 9) : [])
    } catch {
      setDiscoverError(true)
    } finally {
      setDiscovering(false)
    }
  }

  function update(i: number, val: string) {
    const next = [...names]
    next[i] = val
    if (i === names.length - 1 && val.trim() && names.length < 8) next.push('')
    onChange(next)
  }

  function addName(name: string) {
    if (names.some(n => n.trim().toLowerCase() === name.toLowerCase())) return
    const emptyIdx = names.findIndex(n => !n.trim())
    if (emptyIdx >= 0) {
      const next = [...names]
      next[emptyIdx] = name
      onChange(next)
    } else {
      onChange([...names, name])
    }
  }

  function removeName(name: string) {
    const next = names.filter(n => n.trim().toLowerCase() !== name.toLowerCase())
    if (!next.some(n => !n.trim())) next.push('')
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          {isPassive ? 'Which companies do you want to monitor?' : 'Which companies are you targeting?'}
        </h1>
        <p className="text-[15px] text-slate-500">
          {isPassive
            ? 'We scan their career pages and alert you when something worth knowing appears.'
            : 'Add at least one. We scan their career pages and alert you when a matching role appears.'}
        </p>
      </div>

      {isPassive && onTitle && (
        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
            Your current title
          </label>
          <input
            type="text"
            value={currentTitle}
            onChange={e => onTitle(e.target.value)}
            placeholder="Chief Information Officer"
            className={inputCls}
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {names.map((name, i) => (
          <input
            key={i}
            type="text"
            value={name}
            onChange={e => update(i, e.target.value)}
            placeholder={i === 0 ? 'Company name' : i < 3 ? 'Add another' : 'Add more'}
            className={inputCls}
          />
        ))}
      </div>

      {suggestions.length > 0 && !discovered && (
        <div>
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-2">Great choices for you</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {suggestions.map((s) => {
              const added = names.some(n => n.trim().toLowerCase() === s.name.toLowerCase())
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => added ? removeName(s.name) : addName(s.name)}
                  className={`text-left rounded border p-3 transition-colors cursor-pointer ${
                    added
                      ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-700 hover:border-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <p className="text-[14px] font-semibold">{added ? '✓ ' : '+ '}{s.name}</p>
                  <p className={['mt-1 text-[12px] leading-relaxed', added ? 'text-slate-300' : 'text-slate-500'].join(' ')}>{s.roleHint}</p>
                  <p className={['mt-1 text-[12px] leading-relaxed', added ? 'text-slate-300' : 'text-slate-500'].join(' ')}>{s.why}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Discovery */}
      {!discovered && !discovering && (
        <button
          type="button"
          onClick={discover}
          className="text-[13px] text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-0 text-left transition-colors"
        >
          {discoverError ? 'Could not load suggestions - try again â†’' : 'Not sure where to start? Discover companies with AI â†’'}
        </button>
      )}

      {discovering && (
        <p className="text-[13px] text-slate-400">Finding companies for you...</p>
      )}

      {discovered && discovered.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400">AI-suggested companies</p>
            <button
              type="button"
              onClick={() => { setDiscovered(null); setDiscoverError(false) }}
              className="text-[11px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {discovered.map(co => {
              const added = names.some(n => n.trim().toLowerCase() === co.name.toLowerCase())
              return (
                <button
                  key={co.name}
                  type="button"
                  onClick={() => added ? removeName(co.name) : addName(co.name)}
                  className={`text-[13px] px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                    added
                      ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-700 hover:border-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {added ? 'âœ“ ' : '+ '}{co.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-[12px] text-slate-400">
        {filled === 0
          ? 'Add at least one company to continue.'
          : filled === 1
          ? 'Good start. Add 2 more for the best coverage.'
          : filled >= 3
          ? `${filled} companies added. You can add more after setup.`
          : `${filled} added. One more recommended.`}
      </p>
    </div>
  )
}

function StepBriefingTime({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const TIMES = [
    { label: '6:00 AM', value: '06:00' },
    { label: '6:30 AM', value: '06:30' },
    { label: '7:00 AM', value: '07:00' },
    { label: '7:30 AM', value: '07:30' },
    { label: '8:00 AM', value: '08:00' },
    { label: '8:30 AM', value: '08:30' },
    { label: '9:00 AM', value: '09:00' },
  ]

  const tz = typeof window !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'your local time'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          When do you want your daily briefing?
        </h1>
        <p className="text-[15px] text-slate-500">
          Each morning: signals from your target companies, actions due, and your search momentum - assembled overnight.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {TIMES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={[
              'border rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-all cursor-pointer',
              value === t.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-[12px] text-slate-400">
        Delivered in {tz}. You can change this anytime from your profile.
      </p>
    </div>
  )
}

function StepDone({
  firstName,
  currentTitle,
  currentCompany,
  targetTitles,
  companies,
  briefingTime,
  isPassive,
  intelContent,
  intelLoading,
}: {
  firstName: string
  currentTitle: string
  currentCompany: string
  targetTitles: string
  companies: string[]
  briefingTime: string
  isPassive: boolean
  intelContent: string
  intelLoading: boolean
}) {
  function formatTime(val: string) {
    const [h, m] = val.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const firstCompany = companies[0] ?? ''
  const roleTargets = decisionRoleTargetsForCompany(firstCompany, 'csuite', currentTitle)
  const firstNoteDraft = firstCompany ? firstNoteDraftForCompany(firstCompany, currentTitle) : ''
  const followUps = firstCompany ? followUpSequenceForWeekOne(firstCompany) : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          {firstName}, your likely-to-open shortlist is live.
        </h1>
        <p className="text-[15px] text-slate-500">
          {isPassive
            ? 'We will watch your companies and send a digest every Sunday. You can take action when a role starts taking shape.'
            : 'You now have an early view of where to focus. Here is what happens next.'}
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">What we understood about you</p>
        <p className="text-[15px] font-semibold text-slate-900">{currentTitle || 'Your role lane is set'}{currentCompany ? ` at ${currentCompany}` : ''}</p>
        <p className="text-[12px] text-slate-400 mt-1.5">
          {targetTitles
            ? `We will bias briefs and role hypotheses toward: ${targetTitles}`
            : 'Your profile and target companies now shape the first brief and shortlist.'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">Companies being watched</p>
          {companies.length === 0 ? (
            <p className="text-[14px] text-slate-500">None yet - add them from your dashboard.</p>
          ) : (
            <p className="text-[15px] font-semibold text-slate-900">{companies.join(', ')}</p>
          )}
          <p className="text-[12px] text-slate-400 mt-1.5">
            This powers your first likely-to-open role shortlist and signal feed.
          </p>
        </div>

        {!isPassive && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">First relationship action this week</p>
            <p className="text-[15px] font-semibold text-slate-900">Identify one decision-path contact and start outreach timing.</p>
            <p className="text-[12px] text-slate-400 mt-1.5">Open contacts from the dashboard and begin with your highest-leverage target.</p>
          </div>
        )}

        {!isPassive && firstCompany && roleTargets.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-2">Seats to map first at {firstCompany}</p>
            <div className="space-y-2">
              {roleTargets.map((seat) => (
                <div key={seat.title} className="rounded border border-slate-200 bg-white px-3 py-2">
                  <p className="text-[13px] font-semibold text-slate-900">{seat.title}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{seat.why}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">These are the seats that typically shape the shortlist. From your dashboard, relationship enrichment finds the actual people in them.</p>
          </div>
        )}

        {!isPassive && firstCompany && firstNoteDraft && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">First note draft</p>
            <p className="text-[12px] text-slate-500 leading-relaxed">{firstNoteDraft}</p>
            <p className="text-[11px] text-slate-400 mt-2">You can edit this draft from your contacts outreach workspace.</p>
          </div>
        )}

        {!isPassive && firstCompany && followUps.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">Week-one follow-up sequence</p>
            <ul className="mt-1 space-y-1.5">
              {followUps.map((item) => (
                <li key={item} className="text-[12px] text-slate-500 leading-relaxed">- {item}</li>
              ))}
            </ul>
          </div>
        )}

        {isPassive ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">Weekly digest</p>
            <p className="text-[15px] font-semibold text-slate-900">Every Sunday morning</p>
            <p className="text-[12px] text-slate-400 mt-1.5">
              Scan matches, exec moves, funding signals - delivered once a week. No daily noise.
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">First briefing</p>
            <p className="text-[15px] font-semibold text-slate-900">Tomorrow at {formatTime(briefingTime)}</p>
            <p className="text-[12px] text-slate-400 mt-1.5">
              New role matches, company signals, and your next actions - every morning.
            </p>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">First career page scan</p>
          <p className="text-[15px] font-semibold text-slate-900">Next Monday, Wednesday, or Friday at 8 AM UTC</p>
          <p className="text-[12px] text-slate-400 mt-1.5">
            We scan career pages 3x per week and flag matching roles before they reach LinkedIn.
          </p>
        </div>
      </div>

      {firstCompany && (intelLoading || intelContent) && (
        <div className="bg-slate-900 rounded-lg px-5 py-5">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">
            {firstCompany} - intelligence preview
          </p>
          {intelLoading && !intelContent && (
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-500 animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-slate-500 animate-pulse [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-slate-500 animate-pulse [animation-delay:300ms]" />
            </div>
          )}
          {intelContent && (
            <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
              {intelContent}
              {intelLoading && (
                <span className="inline-block w-0.5 h-3.5 bg-slate-400 animate-pulse ml-0.5 align-middle" />
              )}
            </p>
          )}
          <p className="text-[11px] text-slate-600 mt-3">
            This is a preview. Your first full briefing includes live scan results and signal history.
          </p>
        </div>
      )}

      <div className="border border-slate-200 rounded-lg px-5 py-4 bg-white">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">Optional next step</p>
        <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
          Want better prep quality? Add LinkedIn and profile detail after launch.
        </p>
        <Link href="/dashboard/start" className="text-[13px] font-semibold text-slate-800 underline hover:text-slate-600 transition-colors">
          Complete profile from dashboard start page
        </Link>
      </div>
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
          You are already signed up. Add your name for personalized messaging, or skip and keep moving.
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
  roleTitle,
  onSelect,
}: {
  roleTitle: RoleTitle | ''
  onSelect: (v: RoleTrackOption) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
          Which role lane are you targeting?
        </h1>
        <p className="text-[15px] text-slate-500">
          This sets your workflow, messaging, and signal prioritization.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ROLE_TRACK_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt)}
            className={[
              'text-left border rounded-lg px-5 py-4 flex items-center justify-between transition-all cursor-pointer',
              roleTitle === opt.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white hover:border-slate-400',
            ].join(' ')}
          >
            <div>
              <div className={['text-[15px] font-semibold', roleTitle === opt.value ? 'text-white' : 'text-slate-900'].join(' ')}>
                {opt.label}
              </div>
              <div className={['text-[13px] mt-0.5', roleTitle === opt.value ? 'text-slate-300' : 'text-slate-400'].join(' ')}>
                {opt.sub}
              </div>
            </div>
            {roleTitle === opt.value && (
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
  driver,
  onStatus,
  onTimeline,
  onDriver,
}: {
  status: string
  timeline: string
  driver: string
  onStatus: (v: string) => void
  onTimeline: (v: string) => void
  onDriver: (v: string) => void
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
        <div className="grid grid-cols-2 gap-3">
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
              <option value="employed_exploring">Employed, quietly exploring</option>
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
              <option value="3_months">Within 3 months</option>
              <option value="6_months">Within 6 months</option>
              <option value="opportunistic">Right opportunity only</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
            What is driving this search? <span className="font-normal normal-case tracking-normal text-slate-300">(one sentence)</span>
          </label>
          <input
            type="text"
            value={driver}
            onChange={e => onDriver(e.target.value)}
            placeholder="e.g. My role was eliminated. / I want to move from VP to CIO."
            className="w-full border border-slate-200 rounded-lg px-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
          />
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
  importThin,
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
  importThin: boolean
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
    if (importThin) {
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
              Background text saved.
            </h1>
            <p className="text-[15px] text-slate-500">
              We saved your profile text but could not automatically extract your title and company. Add them below so briefings and prep briefs are personalized correctly.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
              <circle cx="10" cy="10" r="10" fill="#fef3c7" />
              <path d="M10 6v5" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="14" r="1" fill="#d97706" />
            </svg>
            <span className="text-[13px] text-amber-800 leading-relaxed">
              Title and company not detected. Fill them in now or update your profile later.
            </span>
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
          </div>
        </div>
      )
    }

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
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1">What we learned</p>
          <p className="text-[15px] font-semibold text-slate-900">{currentTitle || 'Your current title'}{currentCompany ? ` at ${currentCompany}` : ''}</p>
          <p className="text-[12px] text-slate-400 mt-1.5">
            We will use this to tune your shortlist, role hypotheses, and first brief.
          </p>
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

