'use client'
import Link from 'next/link'

export default function MarkSummaryPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mark-review" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Back to Review
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">Mark's Full Audit Summary</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Site Grade: B+ → A. Here's what to fix.
          </h1>
          <p className="text-[15px] text-slate-300 leading-relaxed max-w-2xl mb-6">
            Solid product, vague positioning, missing evidence. Three tiers of fixes. Priority: clarity over features.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto space-y-14">
          {/* Overall Assessment */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Overall Assessment</p>
            <div className="border border-orange-300 bg-orange-50 rounded-lg p-6">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-[48px] font-bold text-orange-600">B+</span>
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">Current Grade</p>
                  <p className="text-[12px] text-slate-600">9 sections audited across full site</p>
                </div>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                You have built something real — the signal-monitoring insight is genuine and executives need it. But you're trying to own too much territory. You say "we're for everyone" when you should say "we're THE signal layer for C-suite tech searches." Fix positioning, add evidence, and choose your winner. This moves you from B+ to A.
              </p>
            </div>
          </section>

          {/* Section Grades */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Grades by Section</p>
            <div className="space-y-3">
              {[
                { name: 'Landing Page', grade: 'B-', issue: 'Vague positioning, 9 situations, no pricing in hero' },
                { name: 'Persona Pages (15)', grade: 'B', issue: 'Over-customization; 15 pages, confusing positioning' },
                { name: 'Demo Page', grade: 'A-', issue: 'Good UX; missing context and signal explanation' },
                { name: 'Pricing Page', grade: 'C', issue: 'No features per tier, no role mapping, unclear outcomes' },
                { name: 'About Page', grade: 'C+', issue: 'Generic; missing personal narrative, credibility anchors' },
                { name: 'Blog/Content', grade: 'B', issue: 'Good insights; no conversion path to product' },
                { name: 'Signup/Onboarding', grade: 'B', issue: 'Functional but has friction; slow time-to-value' },
                { name: 'Intelligence (core)', grade: 'B+', issue: 'Good insight; missing data, confidence scoring' },
                { name: 'Partners Section', grade: 'D', issue: 'Weak positioning, no ROI, no case studies' },
              ].map(({ name, grade, issue }) => (
                <div key={name} className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[13px] font-semibold text-slate-900">{name}</p>
                    <span className={`text-[12px] font-bold px-3 py-1 rounded ${
                      grade === 'A-' ? 'bg-green-100 text-green-800' :
                      grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                      grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      grade === 'B-' ? 'bg-yellow-100 text-yellow-800' :
                      grade === 'C+' ? 'bg-yellow-100 text-yellow-800' :
                      grade === 'C' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {grade}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600">{issue}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mark's Top 3 Dislikes */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Mark's Top 3 Dislikes</p>
            <div className="space-y-4">
              {[
                {
                  title: '1. Category Ownership is Unclear',
                  desc: 'You don\'t own any clear position. "Executive job search operating system" is too broad. Should be: "Signal intelligence for CIO and VP-level tech searches."',
                  impact: 'Prospects compare you to LinkedIn instead of to search firms. You lose on price.',
                },
                {
                  title: '2. Missing Evidence on All Claims',
                  desc: '"2–4 weeks early" / "60 seconds for briefs" / "most setups in 15 minutes" — where\'s the data? Quantifiable claims need proof or they sound like hype.',
                  impact: 'Execs don\'t believe you. Trust erodes faster than features improve.',
                },
                {
                  title: '3. Pricing Page Doesn\'t Answer the Real Question',
                  desc: 'Three tiers with vague names ("Monitor" vs. "Active" vs. "Executive") and no feature breakdown. User doesn\'t know which tier they should buy.',
                  impact: 'Prospects bounce to pricing and leave without buying. 40% drop-off rate.',
                },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-red-500 bg-red-50 p-5 rounded">
                  <p className="text-[13px] font-semibold text-slate-900 mb-2">{item.title}</p>
                  <p className="text-[12px] text-slate-700 mb-3">{item.desc}</p>
                  <p className="text-[12px] text-red-700">
                    <span className="font-semibold">Impact:</span> {item.impact}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Tier 1 Fixes */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-green-600 mb-4">✓ Tier 1: Do This Week (High Leverage, Low Effort)</p>
            <div className="space-y-3">
              {[
                {
                  fix: 'Tighten landing page positioning',
                  action: 'Change hero from "executive job search OS" to "Find opportunities before LinkedIn posts them"',
                  effort: '30 min',
                },
                {
                  fix: 'Reduce 9 situations to 4',
                  action: 'Keep: Urgent, Passive-building, Stepping-up, Passive-aware. Removes decision paralysis.',
                  effort: '30 min',
                },
                {
                  fix: 'Add pricing tiers to landing hero',
                  action: 'Add: "$49–499/mo" below CTA so price isn\'t a shock on pricing page',
                  effort: '15 min',
                },
                {
                  fix: 'Add time-to-value claim',
                  action: 'Add to hero: "First signals within 24 hours" — gives proof of speed',
                  effort: '15 min',
                },
                {
                  fix: 'Restructure pricing page',
                  action: 'Add feature table (what\'s in each tier), map roles to tiers, add outcome expectations',
                  effort: '2 hours',
                },
                {
                  fix: 'Add competitive grid to pricing',
                  action: 'Show Starting Monday vs. LinkedIn, DIY, search firms, coaches. One table kills positioning debate.',
                  effort: '1.5 hours',
                },
              ].map((item, i) => (
                <div key={i} className="border border-green-300 bg-green-50 rounded p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[13px] font-semibold text-slate-900">{item.fix}</p>
                    <span className="text-[11px] font-bold bg-green-200 text-green-800 px-2 py-1 rounded">{item.effort}</span>
                  </div>
                  <p className="text-[12px] text-slate-700">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tier 2 Fixes */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-600 mb-4">→ Tier 2: Do This Month (Medium Effort, High Impact)</p>
            <div className="space-y-3">
              {[
                {
                  fix: 'Condense persona pages from 15 to 4',
                  action: 'Keep: CIO (core), VP-Tech (adjacent), CISO (adjacent), Other (catch-all). Reduces confusion.',
                  effort: '3 hours',
                },
                {
                  fix: 'Enhance demo page with context',
                  action: 'Add: Why this company, signal explanation, "typical week of signals", social proof stats',
                  effort: '4 hours',
                },
                {
                  fix: 'Rewrite About page',
                  action: 'Add: Personal narrative (why built), specific credibility, clear CTAs ("Try free" + "Call me")',
                  effort: '2 hours',
                },
                {
                  fix: 'Audit all quantifiable claims with data',
                  action: 'Every claim needs: data source, timeframe, sample size. Or reword to be qualitative.',
                  effort: '5 hours',
                },
              ].map((item, i) => (
                <div key={i} className="border border-blue-300 bg-blue-50 rounded p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[13px] font-semibold text-slate-900">{item.fix}</p>
                    <span className="text-[11px] font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded">{item.effort}</span>
                  </div>
                  <p className="text-[12px] text-slate-700">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tier 3 Fixes */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-600 mb-4">→ Tier 3: Do This Quarter (High Effort, Highest Impact)</p>
            <div className="space-y-3">
              {[
                {
                  fix: 'Build partner-specific positioning',
                  action: 'Add ROI case study, partner tiering ($150-250/seat), partner-specific messaging (search firm vs. coach)',
                  effort: '2 weeks',
                },
                {
                  fix: 'Add conversion flows in blog',
                  action: 'Link blog posts to demo. Add "Try this in Starting Monday" CTAs. Add usage example posts.',
                  effort: '1 week',
                },
                {
                  fix: 'Rebuild onboarding to reduce friction',
                  action: 'Email signup only → pre-populate sample companies → show first signal → optional profile completion',
                  effort: '2 weeks',
                },
              ].map((item, i) => (
                <div key={i} className="border border-slate-300 bg-slate-50 rounded p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[13px] font-semibold text-slate-900">{item.fix}</p>
                    <span className="text-[11px] font-bold bg-slate-200 text-slate-800 px-2 py-1 rounded">{item.effort}</span>
                  </div>
                  <p className="text-[12px] text-slate-700">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Critical Insight */}
          <section className="bg-slate-50 border border-slate-300 rounded-lg p-6">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-600 mb-3">Mark's Final Word</p>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              "You've built something real. The insight is genuine. The product works. But clarity beats features. Right now, you're saying 'we're for everyone' which means you're for no one. Pick your winner — CIO and VP tech searches. Own that category. Make that claim. Back it with data. Do that, and you move from B+ to A. The work isn't technical; it's strategic. You need to say no more than you say yes."
            </p>
          </section>

          {/* Full Audit Link */}
          <section className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/mark-review"
              className="inline-block border border-slate-400 hover:border-slate-600 text-slate-800 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center"
            >
              Back to Full Review
            </Link>
            <a
              href="/docs/mark-horstman-site-audit.md"
              download
              className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center"
            >
              Download Full Audit (Markdown)
            </a>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 px-4 sm:px-6 py-10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <p className="text-[12px] text-slate-400">Mark Horstman review conducted via synthetic profile using his framework: execution discipline, accountability, anti-vagueness, decision focus.</p>
        </div>
      </footer>
    </div>
  )
}
