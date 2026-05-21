'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

type ArchetypeKey =
  | 'cio'
  | 'cto'
  | 'ciso'
  | 'cdo'
  | 'chro'
  | 'cro'
  | 'coo'
  | 'cfo'
  | 'vp_it'
  | 'vp_engineering'
  | 'vp_sales'
  | 'vp_product'

type ArchetypeProfile = {
  key: ArchetypeKey
  label: string
  defaultRole: string
  resume: string
  linkedin: string
}

const ARCHETYPES: ArchetypeProfile[] = [
  {
    key: 'cio',
    label: 'CIO',
    defaultRole: 'Chief Information Officer',
    resume:
      'Bob Barker | Enterprise Technology Executive\n' +
      '20+ years leading enterprise IT strategy, cyber resilience, and modernization programs.\n' +
      'Reduced operating spend while improving service reliability and audit posture.\n' +
      'Led global teams of 200+ across infrastructure, architecture, data, and security operations.',
    linkedin:
      'Bob Barker is a technology executive focused on aligning IT investment to business outcomes with strong operating cadence and governance discipline.',
  },
  {
    key: 'cto',
    label: 'CTO',
    defaultRole: 'Chief Technology Officer',
    resume:
      'Bob Barker | Product and Platform Technology Leader\n' +
      'Scaled B2B SaaS architecture globally with strong reliability and delivery performance.\n' +
      'Led engineering modernization that improved release speed and quality.\n' +
      'Led 150+ engineering organization across platform, application, and reliability teams.',
    linkedin:
      'Bob Barker is a CTO-level leader who connects platform decisions to customer growth, product velocity, and enterprise reliability.',
  },
  {
    key: 'ciso',
    label: 'CISO',
    defaultRole: 'Chief Information Security Officer',
    resume:
      'Bob Barker | Cybersecurity Executive\n' +
      'Built enterprise security programs across identity, cloud, incident response, and third-party risk.\n' +
      'Reduced critical exposure while enabling cloud transformation.\n' +
      'Led security and governance teams with board-level risk reporting.',
    linkedin:
      'Bob Barker is a CISO-level operator focused on resilience, risk reduction, and practical security execution.',
  },
  {
    key: 'cdo',
    label: 'CDO',
    defaultRole: 'Chief Data Officer',
    resume:
      'Bob Barker | Data and Analytics Executive\n' +
      'Built enterprise data governance and modern data platform supporting analytics and AI.\n' +
      'Improved forecast quality and reduced reporting latency.\n' +
      'Led data engineering, analytics, and governance organizations.',
    linkedin:
      'Bob Barker is a CDO-level leader who turns data strategy into measurable operating outcomes.',
  },
  {
    key: 'chro',
    label: 'CHRO',
    defaultRole: 'Chief Human Resources Officer',
    resume:
      'Bob Barker | People Strategy Executive\n' +
      'Led workforce strategy through post-merger and transformation cycles.\n' +
      'Improved executive hiring velocity and reduced regrettable attrition.\n' +
      'Built talent and people analytics systems linked to business outcomes.',
    linkedin:
      'Bob Barker is a CHRO-level executive focused on strategic talent systems and operating alignment.',
  },
  {
    key: 'cro',
    label: 'CRO',
    defaultRole: 'Chief Revenue Officer',
    resume:
      'Bob Barker | Revenue Executive\n' +
      'Scaled enterprise GTM with improved pipeline quality and forecast discipline.\n' +
      'Increased win rates and retention in strategic segments.\n' +
      'Led sales, revops, and customer success organizations globally.',
    linkedin:
      'Bob Barker is a CRO-level leader who combines revenue growth with operational rigor.',
  },
  {
    key: 'coo',
    label: 'COO',
    defaultRole: 'Chief Operating Officer',
    resume:
      'Bob Barker | Enterprise Operations Executive\n' +
      'Led operating model redesign improving cycle time and margin performance.\n' +
      'Managed cross-functional teams with direct P&L accountability.\n' +
      'Built KPI cadence for executive decision-making and delivery control.',
    linkedin:
      'Bob Barker is a COO-level operator focused on execution systems, alignment, and measurable performance.',
  },
  {
    key: 'cfo',
    label: 'CFO',
    defaultRole: 'Chief Financial Officer',
    resume:
      'Bob Barker | Finance and Transformation Executive\n' +
      'Owned enterprise planning, FP&A, and capital allocation during growth and restructuring.\n' +
      'Improved cash efficiency while protecting strategic investment.\n' +
      'Built board-level scenario planning and financial governance cadence.',
    linkedin:
      'Bob Barker is a CFO-level leader blending financial discipline with operating judgment.',
  },
  {
    key: 'vp_it',
    label: 'VP IT',
    defaultRole: 'VP of IT',
    resume:
      'Bob Barker | VP, Information Technology\n' +
      'Led enterprise IT operations with measurable reliability and service improvements.\n' +
      'Managed large IT budget and multi-discipline teams.\n' +
      'Delivered modernization roadmap tied to business continuity outcomes.',
    linkedin:
      'Bob Barker is a VP IT leader focused on reliability, modernization, and execution discipline.',
  },
  {
    key: 'vp_engineering',
    label: 'VP Engineering',
    defaultRole: 'VP of Engineering',
    resume:
      'Bob Barker | VP Engineering\n' +
      'Scaled engineering organization and improved release predictability.\n' +
      'Implemented platform standards that reduced risk and cycle time.\n' +
      'Partnered with product leadership on roadmap and staffing tradeoffs.',
    linkedin:
      'Bob Barker is a VP Engineering leader known for delivery rigor and platform modernization.',
  },
  {
    key: 'vp_sales',
    label: 'VP Sales',
    defaultRole: 'VP of Sales',
    resume:
      'Bob Barker | VP Sales\n' +
      'Led enterprise sales teams with improved conversion and forecast quality.\n' +
      'Built execution cadence and coaching systems across regions.\n' +
      'Aligned GTM plans with product and marketing leadership.',
    linkedin:
      'Bob Barker is a VP Sales operator focused on pipeline quality and enterprise deal execution.',
  },
  {
    key: 'vp_product',
    label: 'VP Product',
    defaultRole: 'VP of Product',
    resume:
      'Bob Barker | VP Product\n' +
      'Owned product strategy for enterprise platform and analytics products.\n' +
      'Improved roadmap execution and adoption outcomes.\n' +
      'Led cross-functional product planning tied to business metrics.',
    linkedin:
      'Bob Barker is a VP Product leader known for prioritization, alignment, and measurable outcomes.',
  },
]

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderInline(str: string): string {
  return escapeHtml(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function renderBrief(text: string, isStreaming: boolean) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('# ')) return null
    if (line.trim() === '---' || line.trim() === '***') return null
    if (line.startsWith('## ')) {
      return (
        <h3 key={i} className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-8 mb-3 first:mt-0 pb-2 border-b border-slate-100">
          {line.slice(3)}
        </h3>
      )
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={i} className="flex gap-2.5 text-[14px] text-slate-700 leading-relaxed mb-2">
          <span className="text-slate-300 shrink-0 select-none mt-0.5">-</span>
          <span dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return (
      <p
        key={i}
        className="text-[14px] text-slate-700 leading-relaxed mb-2"
        dangerouslySetInnerHTML={{ __html: renderInline(line) }}
      />
    )
  }).concat(
    isStreaming
      ? [<span key="cursor" className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />]
      : []
  )
}

async function streamEndpoint(
  endpoint: string,
  payload: Record<string, unknown>,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok || !res.body) throw new Error('Request failed')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

export function CioPresentationClient() {
  const [companyBriefCompany, setCompanyBriefCompany] = useState('ServiceNow')
  const [companyBriefRole, setCompanyBriefRole] = useState('Chief Information Officer')
  const [companyBrief, setCompanyBrief] = useState('')
  const [companyBriefLoading, setCompanyBriefLoading] = useState(false)
  const [companyBriefError, setCompanyBriefError] = useState('')

  const [archetype, setArchetype] = useState<ArchetypeKey>('cio')
  const [tailoredCompany, setTailoredCompany] = useState('ServiceNow')
  const [tailoredRole, setTailoredRole] = useState('Chief Information Officer')
  const [tailoredBrief, setTailoredBrief] = useState('')
  const [tailoredLoading, setTailoredLoading] = useState(false)
  const [tailoredError, setTailoredError] = useState('')

  const companyBriefRef = useRef<HTMLDivElement>(null)
  const tailoredBriefRef = useRef<HTMLDivElement>(null)

  const activeProfile = useMemo(
    () => ARCHETYPES.find((item) => item.key === archetype) ?? ARCHETYPES[0],
    [archetype]
  )

  async function generateCompanyBrief(e: React.FormEvent) {
    e.preventDefault()
    if (!companyBriefCompany.trim() || !companyBriefRole.trim() || companyBriefLoading) return

    setCompanyBrief('')
    setCompanyBriefError('')
    setCompanyBriefLoading(true)

    let full = ''
    try {
      await streamEndpoint(
        '/api/demo-brief',
        { company: companyBriefCompany.trim(), role: companyBriefRole.trim() },
        (chunk) => {
          full += chunk
          setCompanyBrief(full)
        }
      )
    } catch {
      setCompanyBriefError('Something went wrong. Please try again.')
    } finally {
      setCompanyBriefLoading(false)
      setTimeout(() => companyBriefRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }

  async function generateTailoredBrief(e: React.FormEvent) {
    e.preventDefault()
    if (!tailoredCompany.trim() || !tailoredRole.trim() || tailoredLoading) return

    setTailoredBrief('')
    setTailoredError('')
    setTailoredLoading(true)

    let full = ''
    try {
      await streamEndpoint(
        '/api/demo-brief/tailored',
        {
          company: tailoredCompany.trim(),
          role: tailoredRole.trim(),
          archetype: activeProfile.key,
          resumeText: activeProfile.resume,
          linkedinSummary: activeProfile.linkedin,
        },
        (chunk) => {
          full += chunk
          setTailoredBrief(full)
        }
      )
    } catch {
      setTailoredError('Something went wrong. Please try again.')
    } finally {
      setTailoredLoading(false)
      setTimeout(() => tailoredBriefRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-slate-950 border-b border-slate-900 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/demo/cio/notes" className="text-[13px] text-slate-400 hover:text-white transition-colors">Talking points page</Link>
            <Link href="/mark-demo" className="text-[13px] font-semibold text-white bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors">No-gate demo</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">CIO presentation mode</p>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-slate-900 leading-[1.1] mb-4">
            Live brief walkthrough page
          </h1>
          <p className="text-[15px] text-slate-600 leading-relaxed mb-5 max-w-3xl">
            Run the company brief first, then Bob Barker tailored brief. Flip to the talking points page for objections and negotiation scripts.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/demo/cio" className="text-[12px] px-3 py-1.5 rounded border bg-slate-900 text-white border-slate-900">Presentation page</Link>
            <Link href="/demo/cio/notes" className="text-[12px] px-3 py-1.5 rounded border bg-white text-slate-700 border-slate-300 hover:bg-slate-100 transition-colors">Talking points page</Link>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Brief demo</p>
          <h2 className="text-[24px] font-bold text-slate-900 leading-tight mb-2">Generate the company brief on the fly</h2>
          <p className="text-[14px] text-slate-600 mb-5">Type the company and role he names, click generate, and narrate the first section aloud.</p>

          <form onSubmit={generateCompanyBrief} className="border border-slate-200 rounded p-5 bg-slate-50 flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Company</label>
              <input
                value={companyBriefCompany}
                onChange={(e) => setCompanyBriefCompany(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900"
                placeholder="ServiceNow"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Role</label>
              <input
                value={companyBriefRole}
                onChange={(e) => setCompanyBriefRole(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900"
                placeholder="Chief Information Officer"
                required
              />
            </div>
            <button
              type="submit"
              disabled={companyBriefLoading || !companyBriefCompany.trim() || !companyBriefRole.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors self-start"
            >
              {companyBriefLoading ? 'Generating...' : 'Generate company brief'}
            </button>
            {companyBriefError && <p className="text-[13px] text-red-600">{companyBriefError}</p>}
          </form>

          {(companyBriefLoading || companyBrief) && (
            <div ref={companyBriefRef} className="mt-5 border border-slate-200 rounded p-6 bg-white">
              {renderBrief(companyBrief, companyBriefLoading)}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Tailored brief demo</p>
          <h2 className="text-[24px] font-bold text-slate-900 leading-tight mb-2">Bob Barker at the named company and role</h2>
          <p className="text-[14px] text-slate-600 mb-5">
            Pick a fake C-suite or VP profile, then generate a tailored brief from fake resume plus fake LinkedIn summary.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div className="border border-slate-200 rounded p-4 bg-slate-50">
              <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-2">Fake resume ({activeProfile.label})</p>
              <pre className="text-[12px] text-slate-700 whitespace-pre-wrap leading-relaxed">{activeProfile.resume}</pre>
            </div>
            <div className="border border-slate-200 rounded p-4 bg-slate-50">
              <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-2">Fake LinkedIn summary</p>
              <p className="text-[12px] text-slate-700 leading-relaxed">{activeProfile.linkedin}</p>
            </div>
          </div>

          <form onSubmit={generateTailoredBrief} className="border border-slate-200 rounded p-5 bg-slate-50 flex flex-col gap-4">
            <div>
              <label htmlFor="demo-archetype" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Fake profile archetype</label>
              <select
                id="demo-archetype"
                value={archetype}
                onChange={(e) => {
                  const selected = e.target.value as ArchetypeKey
                  setArchetype(selected)
                  const profile = ARCHETYPES.find((item) => item.key === selected)
                  if (profile) setTailoredRole(profile.defaultRole)
                }}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900"
              >
                {ARCHETYPES.map((option) => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Company</label>
              <input
                value={tailoredCompany}
                onChange={(e) => setTailoredCompany(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900"
                placeholder="ServiceNow"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Role</label>
              <input
                value={tailoredRole}
                onChange={(e) => setTailoredRole(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900"
                placeholder="Chief Information Officer"
                required
              />
            </div>
            <button
              type="submit"
              disabled={tailoredLoading || !tailoredCompany.trim() || !tailoredRole.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors self-start"
            >
              {tailoredLoading ? 'Generating...' : 'Generate Bob Barker tailored brief'}
            </button>
            {tailoredError && <p className="text-[13px] text-red-600">{tailoredError}</p>}
          </form>

          {(tailoredLoading || tailoredBrief) && (
            <div ref={tailoredBriefRef} className="mt-5 border border-slate-200 rounded p-6 bg-white">
              {renderBrief(tailoredBrief, tailoredLoading)}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
