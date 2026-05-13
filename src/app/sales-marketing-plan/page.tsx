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
    title: 'Run the exact LinkedIn cadence from the social desk',
    owner: 'Liz + Founder',
    outcome: 'Posts go out on schedule, warm comments get logged, and the best engagement turns into direct outreach while attention is fresh.',
    actions: [
      'Open /dashboard/admin/social before 8:30 AM CT on Monday, Wednesday, and Friday if you want to review before the auto-post window.',
      'Check the draft for three things: direct tone, sub-3,000 character count, and a strong ending. Regenerate if it sounds padded or generic.',
      'Post through the built-in LinkedIn action when possible. If you post manually, copy the text, publish it on LinkedIn, then mark it posted in the tool.',
      'After a few hours, log likes, comments, notable people, and follow-up candidates in the Notes field so the weekly digest stays useful.',
      'Use the day’s commenters as outreach fuel: anyone who comments thoughtfully, asks a follow-up question, or shares the post goes into the next DM batch.',
    ],
    doneWhen: 'The social queue, notes, and next-outreach list are all current by end of day.',
  },
  {
    label: 'Direct outreach',
    title: 'Turn LinkedIn activity into conversations',
    owner: 'Founder',
    outcome: 'Each post day creates connection requests, DMs, and follow-up tasks instead of ending as passive engagement.',
    actions: [
      'Build one batch from post engagement and one batch from direct search each week so you are not dependent on organic comments alone.',
      'Send 10 to 15 connection requests per day max. Keep the note specific, light, and anchored in shared context such as a post, a conference appearance, or a recent transition.',
      'Once a connection accepts, move quickly with a short follow-up that offers a useful angle rather than a product pitch.',
      'Tag every response in your own working notes as explore, warm, not now, or no fit so future follow-up is easy.',
      'Any conversation that shows real need should move to a five-minute walkthrough or a private demo, not a long message exchange.',
    ],
    doneWhen: 'You have a repeatable daily and weekly outreach habit with visible response rates.',
  },
  {
    label: 'Speakers DB',
    title: 'Work the conference speakers database like a curated prospect list',
    owner: 'Founder + Partnerships',
    outcome: 'The speaker list becomes a controlled pipeline of CIO, CTO, and transformation leaders rather than a static database.',
    actions: [
      'Start in /dashboard/admin/speakers and filter to priority 1 plus outreach status not_started or contacted.',
      'Export the CSV when you want a batch for Sales Navigator, but update status and outreach notes back in the internal speakers tool so one system remains current.',
      'Prioritize speakers whose conference topics map to hiring pressure: AI rollout, transformation, cybersecurity, operating model change, cost discipline, or leadership transitions.',
      'Use the conference name, year, or topic in the opener so the message feels observed rather than scraped.',
      'Update outreach_status, outreach_date, and notes immediately after each touch so follow-up does not depend on memory.',
    ],
    doneWhen: 'High-priority speakers are segmented, touched, and tracked with clear next actions.',
  },
  {
    label: 'Editorial',
    title: 'Package two articles that create trust with CIO and InformationWeek readers',
    owner: 'Founder',
    outcome: 'One CIO-ready contributor package and one InformationWeek-ready submission package are prepared and sent.',
    actions: [
      'Use CIO for a higher-level, first-person leadership commentary that fits the Foundry Expert Contributor Network model.',
      'Use InformationWeek for a tighter, more tactical IT-leadership article with a complete draft and exact submission metadata.',
      'Keep both pieces practical, operator-focused, and non-promotional. Do not turn either article into a product explainer for Starting Monday.',
      'Anchor both articles in observed patterns from senior technology searches: early signals, target-company preparation, and board-level readiness.',
      'Treat the article itself as a trust asset. The publication outcome matters, but the pitch email, editor relationship, and reusable thesis matter too.',
    ],
    doneWhen: 'Both submission packages are sent with the right format, target, and supporting materials.',
  },
  {
    label: 'Coach outreach',
    title: 'Run Sales Navigator search for independent executive coaches',
    owner: 'Founder',
    outcome: 'Coach pipeline is built, tracked, and actively progressing through discovery and demo stages.',
    actions: [
      'Go to /dashboard/admin/coach-outreach for the full playbook: Sales Navigator filters, message templates, tracking spreadsheet, and success metrics.',
      'Run Sales Navigator search with the exact filters for executive coaches (1-10 person firms, US, active on LinkedIn, coaching VP→CXO transitions).',
      'Send 10-15 cold connection requests per day max. Use the message templates as guides, but personalize every note with something from their profile or recent post.',
      'Track every touch in a Google Sheet: name, LinkedIn URL, request sent date, connection status, response, notes.',
      'Once connected, send follow-up message same day offering a 15-minute demo or use-case walkthrough.',
      'Follow the decision tree for non-responses: Day 3 (demo video offer), Day 7 (final follow-up), then stop.',
      'Any positive response moves to scheduling a demo. Track demo completion and post-demo status (trial started, in-progress, passed).',
    ],
    doneWhen: 'You have a repeatable daily outreach habit, a tracked pipeline of 20+ coaches, and initial trial sign-ups from the channel.',
  },
]

const MESSAGE_BANK: MessageCard[] = [
  {
    title: 'LinkedIn connection request',
    body: [
      'Hi [Name] — I work with senior technology executives in transition and I am building Starting Monday around the way strong searches are really run. Thought it might be useful to connect.',
    ],
  },
  {
    title: 'Accepted-connection follow-up',
    body: [
      'Thanks for connecting. I spend a lot of time around CIO and CTO searches, especially the work that happens before a role is public.',
      'If it is useful, I can send over a short note on the early signals and prep process we see strongest candidates use.',
    ],
  },
  {
    title: 'Speaker outreach note',
    body: [
      'I saw your [conference/session] talk on [topic] and it was one of the sharper takes I have seen on where technology leadership is heading right now.',
      'I work with senior technology executives in search and am building Starting Monday around signal detection, prep, and disciplined outreach. Would be glad to connect.',
    ],
  },
  {
    title: 'CIO network intro email',
    body: [
      'Subject: Expert Contributor Network interest — The CIO Search Starts Before the Job Description',
      'I work closely with senior technology executives in transition and see a recurring pattern: the highest-leverage search work happens before the role is widely visible.',
      'I would like to contribute a first-person commentary on how CIO candidates build target-company conviction, track early signals, and prepare a board-level narrative before the recruiter call arrives.',
    ],
  },
  {
    title: 'InformationWeek cover email',
    body: [
      'Subject: Submission — The Best CIO Searches Start Before the Posting',
      'Attached is a clean draft for InformationWeek review, along with the summary, byline, short bio, and headshot requested in your submission guidelines.',
      'The piece is an exclusive, practical IT-leadership commentary on how candidates prepare before the market sees the role.',
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
    subjectLine: 'Expert Contributor Network interest — The CIO Search Starts Before the Job Description',
    summary: 'The strongest CIO candidates do not start preparing when the recruiter calls. They build their target list, read leadership signals, and prepare their board story before the field forms.',
    note: 'Best route: apply through the network page, then send the same angle directly to Edward Murray so there is a real human follow-up.',
    whyThisFits: [
      'It fits CIO’s first-person practitioner model better than a product story does.',
      'It is strategic rather than tactical: timing, preparation, leadership narrative, and search discipline.',
      'It gives the editor a practical take for CIOs and aspiring CIOs without sounding like career-coach fluff.',
    ],
    submissionRules: [
      'Aim for 1,200 to 1,500 words.',
      'Write from lived experience and observed operating reality, not generic advice.',
      'Keep it practical and editor-friendly: clean thesis, strong examples, no product pitch.',
      'Use the network signup and/or edward.murray@foundryco.com to start the conversation.',
    ],
    outline: [
      'Open with the core mistake: by the time a CIO role is public, the strongest candidates are already moving.',
      'Show what early preparation actually means: target-company list, trigger events, and internal narrative work.',
      'Explain why board-level readiness matters before the first serious conversation.',
      'Lay out the weekly operating cadence that separates disciplined candidates from reactive ones.',
      'Close with the practical test: if the right mandate appeared tomorrow, could you produce a board-ready brief in an hour?',
    ],
    emailCopy: [
      'I work closely with senior technology executives in transition and see the same failure mode repeatedly: candidates begin preparing once the role is visible, when the field is already crowded.',
      'I would like to contribute a first-person commentary on how strong CIO candidates actually operate before the role is public: target-company mapping, signal detection, and board-level preparation.',
      'The piece would be practical, non-promotional, and written for CIOs and senior technology leaders who want a more disciplined search process.',
    ],
  },
  {
    target: 'InformationWeek',
    routeLabel: 'InformationWeekSubmissions@informa.com',
    routeHref: 'mailto:InformationWeekSubmissions@informa.com',
    secondaryLabel: 'Submission guidelines',
    secondaryHref: 'https://www.informationweek.com/it-leadership/how-to-submit-a-column-to-informationweek',
    title: 'The Best CIO Searches Start Before the Posting',
    subjectLine: 'Submission — The Best CIO Searches Start Before the Posting',
    summary: 'Strong CIO candidates gain leverage before a role is public by tracking target companies, reading early signals, and preparing their board narrative early.',
    note: 'Important: InformationWeek asks for a full draft only, not a pitch, and their guidelines explicitly say the final article must be human-written.',
    whyThisFits: [
      'It is practical IT-leadership commentary rather than self-promotion.',
      'It gives readers concrete operating advice about preparation, not vague career motivation.',
      'It is timely because leadership hiring remains opaque and senior candidates need better operating methods.',
    ],
    submissionRules: [
      'Send a finished draft as a Word attachment to InformationWeekSubmissions@informa.com.',
      'Do not send an abstract or pitch only; they ask for the draft itself.',
      'Headline must be 60 characters or fewer; summary must be 160 characters or fewer.',
      'Include byline, bio under 100 words, square headshot 300x300 or larger, and author email address.',
      'Keep the article at 850 words or fewer, exclusive to InformationWeek, and rewritten by Rich in his own words before submission.',
    ],
    outline: [
      'Lead with the truth: LinkedIn postings are late-stage signals, not the beginning of the search.',
      'Describe the three forms of early evidence candidates should watch: leadership gaps, transformation pressure, and company-specific trigger events.',
      'Explain the three preparation assets to have ready before outreach: target-company thesis, board-level story, and relationship map.',
      'Show the cost of waiting until the posting appears: crowded field, weaker preparation, and reactive positioning.',
      'Close with a practical challenge to readers: prepare for the call before the market tells you it is time.',
    ],
    emailCopy: [
      'Attached is a clean commentary draft for InformationWeek review, along with the requested summary, byline, short bio, headshot, and author email.',
      'The article is a practical IT-leadership piece on how senior technology candidates prepare before a role is publicly posted.',
      'It is exclusive to InformationWeek and written to be useful, specific, and non-promotional.',
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
        <span className="text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
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
            <Link href="/dashboard/admin/social" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">
              Social
            </Link>
            <Link href="/dashboard/admin/speakers" className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors">
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
              <p className="text-[16px] sm:text-[18px] text-slate-300 leading-relaxed max-w-3xl mb-6">
                This page is the operating playbook for Liz&apos;s LinkedIn workflow, direct outreach to the conference speakers database,
                and the two editorial submissions most worth pursuing right now: CIO and InformationWeek.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Use /social', 'Work speakers DB', 'Submit two articles', 'Keep notes current'].map(chip => (
                  <span key={chip} className="text-[11px] font-semibold text-slate-300 border border-slate-700 rounded-full px-3 py-1.5 bg-slate-900/60">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

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
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">Operating surfaces</p>
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
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">Execution board</p>
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
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">Message bank</p>
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
                    <span className="text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
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
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">Editorial kits</p>
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
                    <span className="text-[11px] text-slate-400">Submission kit</span>
                  </div>

                  <h3 className="text-[22px] font-bold text-slate-900 leading-tight mb-2">{kit.title}</h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{kit.summary}</p>

                  <div className="flex flex-wrap gap-3 mb-5">
                    <a href={kit.routeHref} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-white bg-slate-900 rounded px-4 py-2 hover:bg-slate-800 transition-colors">
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
      </main>
    </div>
  )
}
