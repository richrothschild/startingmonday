import Link from 'next/link'

const TODAY_FOCUS = [
  'Confirm opening positioning statement and first 90-day narrative.',
  'Prioritize two peer targets for warm outreach this week.',
  'Finalize interview question set tied to Salesforce operating pressure.',
]

const PIPELINE = [
  { company: 'Salesforce', stage: 'Interview prep', owner: 'Michael Torres', nextAction: 'Run VP of IT interview brief' },
  { company: 'ServiceNow', stage: 'Warm outreach', owner: 'Michael Torres', nextAction: 'Send revised outreach draft to CIO contact' },
  { company: 'Workday', stage: 'Signal watch', owner: 'Michael Torres', nextAction: 'Monitor IT leadership movement and follow up Friday' },
]

const KEY_CONTACTS = [
  { name: 'Jordan Lee', role: 'SVP Product, Salesforce', status: 'Warm', lastTouch: '2 days ago' },
  { name: 'Priya Patel', role: 'Partner, Retained Search', status: 'Active', lastTouch: 'Yesterday' },
  { name: 'Alex Chen', role: 'Former CIO peer', status: 'Advisory', lastTouch: 'Today' },
]

export default function MichaelDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase" aria-label="Go to Starting Monday homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mark-review" className="text-[13px] text-slate-200 hover:text-white transition-colors">
              Back to Mark flow
            </Link>
            <Link href="/demo/michael-strategy-brief" className="text-[13px] text-slate-200 hover:text-white transition-colors">
              Strategy brief
            </Link>
          </div>
        </div>
      </nav>

      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Prefilled demo dashboard</p>
          <h1 className="text-[28px] font-bold text-slate-900 mb-2">Michael Torres dashboard</h1>
          <p className="text-[14px] text-slate-600">All sections are prefilled for meeting walkthrough: target account, pipeline, contacts, and next actions.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <section className="space-y-6">
          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-3">Target role profile</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-slate-500">Candidate</p>
                <p className="font-semibold text-slate-900">Michael Torres</p>
              </div>
              <div>
                <p className="text-slate-500">Target role</p>
                <p className="font-semibold text-slate-900">VP of IT</p>
              </div>
              <div>
                <p className="text-slate-500">Primary company</p>
                <p className="font-semibold text-slate-900">Salesforce</p>
              </div>
              <div>
                <p className="text-slate-500">Interview stage</p>
                <p className="font-semibold text-slate-900">Strategy + interview prep complete</p>
              </div>
            </div>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-3">Pipeline snapshot</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Company</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Stage</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Owner</th>
                    <th className="py-2 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {PIPELINE.map((row) => (
                    <tr key={row.company} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-3 text-[13px] font-semibold text-slate-900">{row.company}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.stage}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.owner}</td>
                      <td className="py-3 text-[13px] text-slate-700">{row.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="space-y-6">
          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-3">Today's focus</p>
            <ul className="space-y-2.5">
              {TODAY_FOCUS.map((item) => (
                <li key={item} className="text-[13px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-3">Key contacts</p>
            <div className="space-y-3">
              {KEY_CONTACTS.map((contact) => (
                <div key={contact.name} className="rounded border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[13px] font-semibold text-slate-900">{contact.name}</p>
                  <p className="text-[12px] text-slate-700">{contact.role}</p>
                  <p className="text-[12px] text-slate-600 mt-1">Status: {contact.status} · Last touch: {contact.lastTouch}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-3">Open next</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/demo/michael-strategy-brief"
                className="inline-flex items-center justify-center rounded bg-slate-950 text-white text-[13px] font-semibold px-5 py-2.5 hover:bg-slate-800 transition-colors"
              >
                Open strategy brief
              </Link>
              <Link
                href="/demo/executive-brief"
                className="inline-flex items-center justify-center rounded border border-slate-300 text-slate-900 text-[13px] font-semibold px-5 py-2.5 hover:border-slate-500 transition-colors"
              >
                Open live interview brief
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
