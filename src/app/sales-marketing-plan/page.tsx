import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

type ResourceLink = {
  label: string
  href: string
  body: string
  external?: boolean
}

type PriorityCard = {
  title: string
  body: string
}

type WorkflowCard = {
  label: string
  title: string
  owner: string
  outcome: string
  actions: string[]
  doneWhen: string
}

type MessageCard = {
  title: string
  body: string[]
}

type ArticleKit = {
  target: string
  routeLabel: string
  routeHref: string
  secondaryLabel?: string
  secondaryHref?: string
  title: string
  subjectLine: string
  summary: string
  note: string
  whyThisFits: string[]
  submissionRules: string[]
  outline: string[]
  emailCopy: string[]
}

export const metadata: Metadata = {
  title: 'Sales Plan - Starting Monday',
  description: 'Internal-only sales, outreach, and editorial execution plan.',
  robots: { index: false, follow: false },
}

const OPERATING_LINKS: ResourceLink[] = [
  {
    label: 'LinkedIn Social Desk',
    href: '/dashboard/admin/social',
    body: 'Liz already has the daily posting workflow here. Use it as the source of truth for posting cadence, notes, and warm-comment follow-up.',
  },
  {
    label: 'Conference Speakers DB',
    href: '/dashboard/admin/speakers',
    body: 'Use this list for speaker outreach, status tracking, notes, and Sales Navigator export. Prioritize high-priority speakers with a live LinkedIn profile.',
  },
  {
    label: 'CIO Expert Contributor Network',
    href: 'https://www.cio.com/expert-contributor-network/',
    body: 'This is the strongest route into CIO. They want practical first-person commentary from IT leaders and practitioners, typically 1,200 to 1,500 words.',
    external: true,
  },
  {
    label: 'InformationWeek Submission Rules',
    href: 'https://www.informationweek.com/it-leadership/how-to-submit-a-column-to-informationweek',
    body: 'InformationWeek wants a finished article draft, not a pitch. Their constraints are strict: short headline, short summary, exclusive copy, and no AI-written final article.',
    external: true,
  },
  {
    label: 'Executive Coach Outreach',
    href: '/dashboard/admin/coach-outreach',
    body: 'Complete playbook for finding, messaging, and tracking independent executive coaches who work with VP/CXO clients. Sales Navigator filters, message templates, lead tracking spreadsheet, and success metrics.',
  },
]

const PRIORITIES: PriorityCard[] = [
  {
    title: 'LinkedIn outreach',
    body: 'Mirror the proven /social workflow, then turn post engagement into direct conversations the same day.',
  },
  {
    title: 'Speaker prospecting',
    body: 'Treat the conference speakers database as a curated lead list for trusted, high-signal introductions on LinkedIn.',
  },
  {
    title: 'Coach partnerships',
    body: 'Run the Sales Navigator search for independent coaches. One coach with 15 active clients = $597/month recurring commission.',
  },
  {
    title: 'Editorial placement',
    body: 'Use CIO and InformationWeek to borrow trust. Package one article for the Foundry network and one full draft for InformationWeek.',
  },
]

const WORKFLOWS: WorkflowCard[] = [
  {
    label: 'Liz workflow',
    title: 'Run the LinkedIn cadence from the social desk',
    owner: 'Liz + Founder',
    outcome: 'Posts ship on schedule and warm engagement becomes outreach quickly.',
    actions: [
      'Review Monday, Wednesday, Friday drafts in /dashboard/admin/social.',
      'Check tone, length, and close; regenerate weak drafts.',
      'Post and log engagement notes for follow-up.',
    ],
    doneWhen: 'Queue, notes, and follow-up list are current daily.',
  },
  {
    label: 'Direct outreach',
    title: 'Turn LinkedIn activity into conversations',
    owner: 'Founder',
    outcome: 'Each post day creates requests, DMs, and next actions.',
    actions: [
      'Build one outreach batch from engagement and one from direct search weekly.',
      'Send 10-15 requests daily with specific, personal notes.',
      'After acceptance, follow up fast and tag responses for next action.',
    ],
    doneWhen: 'Daily outreach cadence is consistent with visible response rates.',
  },
  {
    label: 'Speakers DB',
    title: 'Use the speakers database as a curated prospect list',
    owner: 'Founder + Partnerships',
    outcome: 'Speaker records become a tracked pipeline with clear next actions.',
    actions: [
      'Filter to priority speakers and active outreach statuses.',
      'Use conference/topic context in outreach openers.',
      'Update status, date, and notes immediately after each touch.',
    ],
    doneWhen: 'Top-priority speakers are segmented, contacted, and tracked.',
  },
]

const MESSAGE_BANK: MessageCard[] = [
  {
    title: 'LinkedIn connection request',
    body: [
      'Hi [Name] - I work with senior technology executives in transition. Thought it would be useful to connect.',
    ],
  },
  {
    title: 'Accepted-connection follow-up',
    body: [
      'Thanks for connecting. We help leaders prepare before roles go public with signal tracking and prep structure.',
    ],
  },
  {
    title: 'Speaker outreach note',
    body: [
      'I saw your [conference/session] on [topic]. I work with senior technology leaders in transition and would value connecting.',
    ],
  },
]

const ARTICLE_KITS: ArticleKit[] = [
  {
    target: 'CIO.com',
    routeLabel: 'Foundry Expert Contributor Network',
    routeHref: 'https://www.cio.com/expert-contributor-network/',
    secondaryLabel: 'Email Edward Murray',
    secondaryHref: 'mailto:edward.murray@foundryco.com',
    title: 'The CIO Search Starts Before the Job Description',
    subjectLine: 'Expert Contributor Network interest - The CIO Search Starts Before the Job Description',
    summary: 'Strong CIO candidates prepare before outreach by tracking signals, targets, and narrative readiness.',
    note: 'Apply through the network page, then follow up directly with the same angle.',
    whyThisFits: [
      'Fits CIO first-person practitioner commentary.',
      'Strategic angle: timing, preparation, and leadership narrative.',
    ],
    submissionRules: [
      'Aim for 1,200 to 1,500 words.',
      'Write from observed operating reality, not generic advice.',
      'Keep it practical and non-promotional.',
    ],
    outline: [
      'Open with the core mistake: waiting for public postings.',
      'Show early preparation: target list, trigger events, narrative work.',
      'Close with a weekly cadence readers can run immediately.',
    ],
    emailCopy: [
      'I work with senior technology executives and repeatedly see the same issue: preparation starts too late.',
      'I would like to contribute a practical first-person commentary on early signal tracking and board-level readiness.',
    ],
  },
]

function ResourceLinkCard({ item }: { item: ResourceLink }) {
  const linkClassName = 'inline-flex items-center text-[12px] font-semibold text-orange-600 hover:text-orange-700 transition-colors'

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-5">
      {item.external ? (
        <a href={item.href} target="_blank" rel="noreferrer" className={linkClassName}>
          {item.label}
        </a>
      ) : (
        <Link href={item.href} className={linkClassName}>
          {item.label}
        </Link>
      )}
      <p className="text-[13px] text-slate-600 leading-relaxed mt-2">{item.body}</p>
    </div>
  )
}

function WorkflowPanel({ card }: { card: WorkflowCard }) {
  return (
    <details className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
      <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">{card.label}</p>
          <p className="text-[16px] font-semibold text-slate-900">{card.title}</p>
          <p className="text-[12px] text-slate-500 mt-1.5">Owner: {card.owner}</p>
        </div>
        <span className="text-slate-200 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
      </summary>
      <div className="px-5 pb-5 pt-0 border-t border-slate-100 space-y-4">
        <div className="pt-4">
          <p className="text-[12px] font-semibold text-slate-900 mb-1">Outcome</p>
          <p className="text-[13px] text-slate-600 leading-relaxed">{card.outcome}</p>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-slate-900 mb-2">How to execute</p>
          <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed">
            {card.actions.map(action => (
              <li key={action} className="flex gap-2.5">
                <span className="text-orange-500 shrink-0">-</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <p className="text-[12px] font-semibold text-emerald-900 mb-1">Done when</p>
          <p className="text-[13px] text-emerald-900/80 leading-relaxed">{card.doneWhen}</p>
        </div>
      </div>
    </details>
  )
}

export default async function SalesMarketingPlanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-950 sticky top-0 z-20 border-b border-slate-900/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span>
            <span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/social" className="text-[12px] font-semibold text-slate-200 hover:text-white transition-colors">
              Social
            </Link>
            <Link href="/dashboard/admin/speakers" className="text-[12px] font-semibold text-slate-200 hover:text-white transition-colors">
              Speakers
            </Link>
          </div>
        </div>
      </nav>

      <main>
<section className="bg-slate-950 px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-orange-500 mb-4">Internal plan</p>
              <h1 className="text-[36px] sm:text-[48px] font-bold text-white leading-[1.05] tracking-tight mb-5">
                LinkedIn outreach.
                <br />
                Speaker pipeline.
                <br />
                Editorial credibility.
              </h1>
              <p className="text-[16px] sm:text-[18px] text-slate-200 leading-relaxed max-w-3xl mb-6">
                Operating playbook for Liz&apos;s LinkedIn workflow, speaker outreach, and two editorial pushes: CIO and InformationWeek.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Use /social', 'Work speakers DB', 'Submit two articles', 'Keep notes current'].map(chip => (
                  <span key={chip} className="text-[11px] font-semibold text-slate-200 border border-slate-700 rounded-full px-3 py-1.5 bg-slate-950/60">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <details className="group border-t border-slate-100 bg-white">
          <summary className="list-none cursor-pointer px-4 sm:px-6 py-5 hover:bg-slate-50 transition-colors">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Deep dive</p>
                <p className="text-[16px] font-semibold text-slate-900">Expand priorities, workflows, message bank, and editorial kits</p>
              </div>
              <span className="text-slate-200 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
            </div>
          </summary>

        <section className="px-4 sm:px-6 py-10 border-b border-slate-100 bg-slate-50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRIORITIES.map(priority => (
              <div key={priority.title} className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Priority</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">{priority.title}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{priority.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-6 py-14 border-b border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-200 mb-2">Operating surfaces</p>
              <h2 className="text-[24px] font-bold text-slate-900 leading-tight">Use the live tools, not side spreadsheets</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPERATING_LINKS.map(item => (
                <ResourceLinkCard key={item.label} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-14 border-b border-slate-100 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-200 mb-2">Execution board</p>
              <h2 className="text-[24px] font-bold text-slate-900 leading-tight">Exact workflows for LinkedIn, speakers, and submissions</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {WORKFLOWS.map(card => (
                <WorkflowPanel key={card.title} card={card} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-14 border-b border-slate-100 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-200 mb-2">Message bank</p>
                <h2 className="text-[24px] font-bold text-slate-900 leading-tight">Copy to use in LinkedIn and editorial outreach</h2>
              </div>
              <p className="hidden md:block text-[13px] text-slate-500 max-w-md leading-relaxed">
                Keep messages short, observed, and useful. If the note sounds like a campaign, it is too polished.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {MESSAGE_BANK.map(item => (
                <details key={item.title} className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">{item.title}</p>
                      <p className="text-[12px] text-slate-500 mt-1">Click for exact phrasing</p>
                    </div>
                    <span className="text-slate-200 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                    <div className="pt-4 space-y-2 text-[13px] text-slate-700 leading-relaxed">
                      {item.body.map(line => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-200 mb-2">Editorial kits</p>
              <h2 className="text-[28px] sm:text-[32px] font-bold text-slate-900 leading-tight">Submission packages for CIO and InformationWeek</h2>
              <p className="text-[14px] text-slate-500 mt-3 max-w-3xl leading-relaxed">
                These are the two best editorial routes right now. CIO wants a contributor-network style commentary. InformationWeek wants a finished draft with exact metadata.
                For InformationWeek, Rich must rewrite the final article in his own words before sending it to comply with their stated no-AI rule.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {ARTICLE_KITS.map(kit => (
                <section key={kit.target} className="border border-slate-200 rounded-2xl bg-slate-50 p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500">{kit.target}</span>
                    <span className="text-[11px] text-slate-200">Submission kit</span>
                  </div>

                  <h3 className="text-[22px] font-bold text-slate-900 leading-tight mb-2">{kit.title}</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{kit.summary}</p>

                  <div className="flex flex-wrap gap-3 mb-5">
                    <a href={kit.routeHref} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-white bg-slate-950 rounded px-4 py-2 hover:bg-slate-800 transition-colors">
                      {kit.routeLabel}
                    </a>
                    {kit.secondaryHref && kit.secondaryLabel && (
                      <a href={kit.secondaryHref} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-slate-700 border border-slate-300 rounded px-4 py-2 hover:border-slate-500 transition-colors">
                        {kit.secondaryLabel}
                      </a>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 mb-1">Subject line</p>
                      <p className="text-[13px] text-slate-600 leading-relaxed">{kit.subjectLine}</p>
                    </div>

                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 mb-1">Why this fits</p>
                      <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed">
                        {kit.whyThisFits.map(point => (
                          <li key={point} className="flex gap-2.5">
                            <span className="text-orange-500 shrink-0">-</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 mb-1">Submission rules</p>
                      <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed">
                        {kit.submissionRules.map(rule => (
                          <li key={rule} className="flex gap-2.5">
                            <span className="text-orange-500 shrink-0">-</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 mb-1">Recommended outline</p>
                      <ol className="space-y-2 text-[13px] text-slate-600 leading-relaxed list-decimal pl-5">
                        {kit.outline.map(point => (
                          <li key={point}>{point}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 mb-1">Email copy starter</p>
                      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 space-y-2 text-[13px] text-slate-700 leading-relaxed">
                        {kit.emailCopy.map(line => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3">
                      <p className="text-[12px] font-semibold text-blue-900 mb-1">Operator note</p>
                      <p className="text-[13px] text-blue-900/80 leading-relaxed">{kit.note}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
        </details>
      </main>
    </div>
  )
}
