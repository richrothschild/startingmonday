'use client'

import { useMemo, useState } from 'react'

type BriefInput = {
  clientName: string
  companyDescription: string
  mandateRole: string
  triggerEvent: string
  boardContext: string
  timeline: string
  mustHaves: string
  compensationBand: string
  candidateName: string
  candidateSummary: string
}

const fakeBrief = {
  candidateName: 'Jordan Patel',
  mandateRole: 'Chief Financial Officer',
  clientName: 'Apex Field Systems',
  companyDescription:
    'PE-backed field services software company at $180M ARR. Expanding from North America into EMEA after a recent tuck-in acquisition.',
  triggerEvent:
    'New sponsor-led growth plan after acquisition of two regional competitors. Finance team must integrate systems and prepare for potential exit in 24-36 months.',
  boardContext:
    'Board expects disciplined integration, faster reporting cadence, and stronger investor narrative for secondary sale readiness.',
  timeline: 'Target shortlist in 4 weeks; hire in 10 weeks.',
  mustHaves:
    'Led at least one post-acquisition integration, built FP&A at scale, operated with active PE board, and managed international finance expansion.',
  compensationBand: '$220K base + 40% bonus + equity refresh tied to exit event.',
  candidateSummary:
    'Former finance leader at two growth SaaS companies. Scaled team from 6 to 28, integrated one $120M acquisition, and reduced monthly close from 12 days to 5.',
}

const defaultInput: BriefInput = {
  clientName: '',
  companyDescription: '',
  mandateRole: 'Chief Financial Officer',
  triggerEvent: '',
  boardContext: '',
  timeline: '',
  mustHaves: '',
  compensationBand: '',
  candidateName: '',
  candidateSummary: '',
}

function toBulletList(value: string): string[] {
  return value
    .split(/\n|,|;/)
    .map((v) => v.trim())
    .filter(Boolean)
}

function renderSection(title: string, body: string | string[]) {
  if (Array.isArray(body)) {
    return (
      <div className="rounded-lg border border-slate-200 p-5">
        <h4 className="text-sm font-bold tracking-[0.08em] uppercase text-slate-500">{title}</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {body.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="font-bold text-orange-500">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <h4 className="text-sm font-bold tracking-[0.08em] uppercase text-slate-500">{title}</h4>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{body}</p>
    </div>
  )
}

export default function SearchFirmSampleBriefExperience() {
  const [input, setInput] = useState<BriefInput>(defaultInput)
  const [showGenerated, setShowGenerated] = useState(false)

  const generated = useMemo(() => {
    const role = input.mandateRole || 'Executive Mandate'
    const client = input.clientName || 'Client Company'
    const candidate = input.candidateName || 'Candidate Name'

    return {
      title: `${role} Brief for ${client}`,
      candidateHeadline: `${candidate} - Preliminary Positioning`,
      sections: [
        {
          title: 'Client Context',
          body:
            input.companyDescription ||
            'Add company stage, growth profile, ownership model, and operating context.',
        },
        {
          title: 'Why This Search Exists Now',
          body:
            input.triggerEvent ||
            'Add trigger details: acquisition, sponsor change, succession event, or transformation mandate.',
        },
        {
          title: 'Board and Sponsor Dynamics',
          body:
            input.boardContext ||
            'Add board expectations, sponsor operating style, and likely pressure points for first 180 days.',
        },
        {
          title: 'Search Constraints',
          body: toBulletList(input.timeline || 'Timeline, location constraints, compensation boundaries'),
        },
        {
          title: 'Must-Have Filters',
          body: toBulletList(input.mustHaves || 'Functional depth, scale pattern, sponsor pattern, leadership profile'),
        },
        {
          title: 'Candidate Story Angle',
          body:
            input.candidateSummary ||
            'Add candidate wins that map directly to mandate outcomes and board expectations.',
        },
        {
          title: 'Compensation and Offer Framing',
          body:
            input.compensationBand ||
            'Add base, bonus, equity, and notable tradeoffs you expect to discuss in final rounds.',
        },
      ],
    }
  }, [input])

  return (
    <section className="mt-10 space-y-8">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Complete fake example</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">
          {fakeBrief.mandateRole} Brief: {fakeBrief.clientName}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Candidate: <span className="font-semibold text-slate-900">{fakeBrief.candidateName}</span>
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {renderSection('Client Snapshot', fakeBrief.companyDescription)}
          {renderSection('Search Trigger', fakeBrief.triggerEvent)}
          {renderSection('Board Context', fakeBrief.boardContext)}
          {renderSection('Target Timeline', fakeBrief.timeline)}
          {renderSection('Must-Have Filters', toBulletList(fakeBrief.mustHaves))}
          {renderSection('Compensation', fakeBrief.compensationBand)}
        </div>

        <div className="mt-4">{renderSection('Candidate Positioning Narrative', fakeBrief.candidateSummary)}</div>
      </div>

      <div className="rounded-lg border border-slate-200 p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Bring your own client</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">Generate a draft brief from client background info</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This is practical if you can capture enough context at intake. You only need strong inputs across mandate trigger, board expectations, must-haves, and candidate profile to produce a useful first draft.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Client company"
            value={input.clientName}
            onChange={(e) => setInput((s) => ({ ...s, clientName: e.target.value }))}
          />
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Mandate role"
            value={input.mandateRole}
            onChange={(e) => setInput((s) => ({ ...s, mandateRole: e.target.value }))}
          />
          <textarea
            className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            rows={3}
            placeholder="Company description (size, ARR/revenue range, ownership, growth stage)"
            value={input.companyDescription}
            onChange={(e) => setInput((s) => ({ ...s, companyDescription: e.target.value }))}
          />
          <textarea
            className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            rows={3}
            placeholder="Trigger event (why this search now?)"
            value={input.triggerEvent}
            onChange={(e) => setInput((s) => ({ ...s, triggerEvent: e.target.value }))}
          />
          <textarea
            className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            rows={3}
            placeholder="Board/sponsor context"
            value={input.boardContext}
            onChange={(e) => setInput((s) => ({ ...s, boardContext: e.target.value }))}
          />
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Timeline"
            value={input.timeline}
            onChange={(e) => setInput((s) => ({ ...s, timeline: e.target.value }))}
          />
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Compensation band"
            value={input.compensationBand}
            onChange={(e) => setInput((s) => ({ ...s, compensationBand: e.target.value }))}
          />
          <textarea
            className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            rows={2}
            placeholder="Must-have filters (comma, semicolon, or newline separated)"
            value={input.mustHaves}
            onChange={(e) => setInput((s) => ({ ...s, mustHaves: e.target.value }))}
          />
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Candidate name"
            value={input.candidateName}
            onChange={(e) => setInput((s) => ({ ...s, candidateName: e.target.value }))}
          />
          <textarea
            className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            rows={3}
            placeholder="Candidate summary mapped to mandate outcomes"
            value={input.candidateSummary}
            onChange={(e) => setInput((s) => ({ ...s, candidateSummary: e.target.value }))}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowGenerated(true)}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Generate preview brief
          </button>
          <button
            type="button"
            onClick={() => {
              setInput(defaultInput)
              setShowGenerated(false)
            }}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500"
          >
            Reset
          </button>
        </div>

        {showGenerated && (
          <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50/30 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-600">Generated draft</p>
            <h4 className="mt-2 text-xl font-bold text-slate-900">{generated.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{generated.candidateHeadline}</p>

            <div className="mt-5 space-y-4">
              {generated.sections.map((section) => (
                <div key={section.title}>{renderSection(section.title, section.body)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
