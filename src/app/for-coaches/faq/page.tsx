import type { Metadata } from 'next'
import Link from 'next/link'
import { CoachPreviewActions } from '../coach-preview-actions'

export const metadata: Metadata = {
  title: 'Coach FAQ & Objection Responses | Starting Monday',
  description: 'Comprehensive FAQ for executive coaches about Starting Monday. Covers data security, pricing, integrations, ROI, and common objections with detailed responses.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches/faq' },
}

const FAQS = [
  {
    id: 'proof',
    category: 'Evidence & Validation',
    question: 'How do you validate your claims? Are these real results?',
    answer: 'All claims in our materials come from verified pilot evidence with named executives (pending permission) and disclosed methodology. We publish sample sizes, date windows, and methodological notes. The 81% first-interview rate, 9-day median outreach, and 43% coaching adoption rate come from the Jan-May 2026 pilot cohort (n=27). We do not publish coach-claimed outcomes—we publish client-verified outcomes. This matters because coaches are being asked to trust a workflow with data, not just language.',
  },
  {
    id: 'integration',
    category: 'Technical & Operations',
    question: 'How does this integrate with my existing tools (CRM, email, calendar)?',
    answer: 'Starting Monday maintains a separate, private pipeline view for each client. We sync contact data and calendar context for prep briefs, but do not replace your CRM. During the preview, you\'ll see how clients can view your shared pipeline without your existing tools being affected. Integration roadmap includes Salesforce and HubSpot sync for coaches who want live data pull.',
  },
  {
    id: 'onboarding',
    category: 'Getting Started',
    question: 'How long does it take to set up for one coach preview?',
    answer: 'About 15 minutes. You schedule a session with our onboarding specialist, we create your coach workspace, invite 2-3 of your client accounts to the preview, and you\'re live. Clients can view your coach profile and shared pipeline immediately. No long setup or training required—the interface is designed for coaches to navigate on their first look.',
  },
  {
    id: 'client-benefits',
    category: 'Client Experience',
    question: 'What are the main benefits for my clients?',
    answer: 'Clients get four immediate benefits: (1) Stop missing signals—overnight detection of executive departures, board changes, funding, and hiring. They act before the market gets noisy. (2) Walk in prepared—gen-down prep briefs in about a minute with win thesis, likely objections, peer-level questions. (3) Nothing goes cold—every company, contact, and conversation tracked between sessions. (4) One decision each morning—a prioritized action list before the market opens, not 30 competing priorities. All this stays private and visible only to their coaches they invite.',
  },
  {
    id: 'sharing',
    category: 'Data Sharing & Collaboration',
    question: 'How does the coach and client sharing work?',
    answer: 'Coach and client see the same pipeline, signals, and prep briefs. This eliminates the translation layer. When you ask "Did you see the signal about the CFO?" the client already knows—because they saw it when it happened. You see their pipeline activity in real time. All data access is logged so you both know exactly what was seen and when. Clients grant you access and can revoke it anytime.',
  },
  {
    id: 'client-control',
    category: 'Privacy & Control',
    question: 'Can my clients control what I see? What if they want to restrict my access?',
    answer: 'Yes, completely. Clients decide which coaches can access their account and what they can view. You get full access during the preview, but in live usage, clients can grant or deny access to specific companies, signals, or briefs. Every coach access action is logged with timestamps—clients can review exactly when you viewed what. Clients can revoke your access instantly from their settings.',
  },
  {
    id: 'security',
    category: 'Data Security & Compliance',
    question: 'How do you protect client data? What is your security posture?',
    answer: 'Data security is foundational. All data is encrypted at rest (AES-256) and in transit (TLS 1.2+). We use role-based access control (RBAC) and row-level security (RLS) in Postgres so coaches can only see what clients grant. All access is logged for audit trails. We pass SOC 2 Type II audit, comply with GDPR and CCPA, and store data in US-based infrastructure with HIPAA-grade encryption. Clients own their data—you cannot export without permission. Detailed security documentation is available under NDA.',
  },
  {
    id: 'compliance',
    category: 'Legal & Compliance',
    question: 'Are there any compliance concerns for coaches using this with clients?',
    answer: 'No material compliance issues. We handle data security; you handle coaching ethics. If you work in regulated industries (PE, executive recruiting), we have compliance documentation. We are not legal or investment advice—you retain full responsibility for your advice and recommendations. Our terms clarify that coaches are independent contractors, not Starting Monday employees, and Starting Monday does not provide coaching or investment guidance.',
  },
  {
    id: 'pricing',
    category: 'Investment & ROI',
    question: 'What does this cost and what is the ROI?',
    answer: 'Coach previews are free for 30 days-no payment, no commitment. After preview, coaches can choose a buyer plan ($99/mo + $39 per active client seat, or $249/mo for a small client book) or a referral lane where clients subscribe directly and the coach earns recurring partner revenue. Most coaches see ROI within 60 days because they spend less time rebuilding context and more time on strategy. Detailed economics and ROI calculator are on the economics page.',
  },
  {
    id: 'support',
    category: 'Support & Training',
    question: 'What kind of support and training do coaches get?',
    answer: 'You get onboarding support (15-30 minutes), access to our coach resource library (video walkthroughs, templates, guides), and a Slack channel with other coaches using the platform. We run monthly coach mastermind sessions. Support is via email with 24-hour response during business hours. Premium support with dedicated onboarding is available for coach firms handling 5+ client previews.',
  },
  {
    id: 'trial',
    category: 'Getting Started',
    question: 'Is there a trial? Can I get my money back if it does not work?',
    answer: 'Yes, 30-day free preview. No credit card, no commitment. If you decide it does not fit after the preview, you simply decline to roll into live client referrals. If you do roll in and change your mind within 30 days of paying, we offer a full refund. The risk is on us—we want coaches to experience the workflow before deciding.',
  },
  {
    id: 'time-commitment',
    category: 'Getting Started',
    question: 'How much time does this add to my week?',
    answer: 'Minimal. You spend about 5 minutes per client per week reviewing their overnight signals and pipeline activity. If clients are moving, this actually saves time because you spend less session time rebuilding context. Coaches report spending less total time on operational catch-up and more time on coaching work.',
  },
  {
    id: 'pipeline-types',
    category: 'Use Cases',
    question: 'What types of searches work best with Starting Monday?',
    answer: 'Best fit: senior technology transitions (CTO, VP Engineering, CISO), PE-backed post-acquisition integration roles, and long-cycle executive search (3-9 months). Good fit: startup hiring for senior tech roles, board-level positioning, and high-stakes turnarounds. Less ideal: entry-level placements or passive candidate management. During preview, you\'ll see if your typical client pipeline fits the workflow.',
  },
  {
    id: 'manual-work',
    category: 'Operations',
    question: 'Do clients have to manually update their pipeline, or is it automated?',
    answer: 'Clients update their own pipeline—we do not pull from LinkedIn or CRMs automatically (yet). This is intentional: the discipline of tracking is part of the accountability loop. Most clients spend 5 minutes per week updating 3-5 company stages. If they are not tracking their own pipeline, they probably are not serious about the search. The prep brief, signal detection, and interview tracking are fully automated.',
  },
  {
    id: 'switching-coaches',
    category: 'Client Experience',
    question: 'What happens if a client changes coaches or works with multiple coaches?',
    answer: 'Clients can grant access to multiple coaches independently. Each coach sees the same pipeline but has a separate access log. Clients can revoke access from one coach while keeping another active. There is no "switching" process—clients simply control who has access. This is useful for coaches working in pairs or client firms rotating coaches.',
  },
]

const OBJECTIONS = [
  {
    id: 'competitors',
    objection: '"My clients already have LinkedIn Premium and a CRM. Why do they need another tool?"',
    response: 'Good question. This is not a replacement for LinkedIn or CRM. It is the operating layer underneath them. LinkedIn is passive discovery and profile browsing. This is active, automated signal tracking—when CFOs leave or boards shift, your clients know immediately. A CRM is for contact management. This is for structured pipeline discipline and prep generation. Think of it as: LinkedIn finds leads, this tracks momentum and prepares for conversations.',
  },
  {
    id: 'workload',
    objection: '"I already handle this in my coaching—pipeline review, prep work, accountability. This feels like overhead."',
    response: 'It does not have to be. Most coaches spend 20-30 minutes per session on operational catch-up: "So where did we leave off? What companies have you contacted?" This tool answers those questions before the session starts. You arrive knowing the state of the pipeline, what signals moved, and what prep the client reviewed. Session time stays the same—more of it goes to strategy instead of context rebuilding. Early coaches report spending less total time on operational work.',
  },
  {
    id: 'adoption',
    objection: '"My clients will not adopt another platform. They have decision fatigue."',
    response: 'That is fair. But the preview lets you test this with 2-3 real clients in 30 minutes. In pilot data, 81% of clients who saw the tool during a preview decided to track one company. When it is positioned as "this reduces your work between sessions," adoption is high. And this is not a standalone product—it is a layer for coaches. Clients access it through your recommendation, not a marketplace.',
  },
  {
    id: 'cost',
    objection: '"I cannot afford another monthly software subscription."',
    response: 'The preview is free. If it does not work, you pay nothing. If it does work, you have two pricing paths: a direct coach plan ($99 + $39 per active seat or $249 for a small book) or a referral path where clients subscribe and you earn recurring partner revenue. ROI calculator on the economics page shows breakeven at a very low lift in placement outcomes or retained clients.',
  },
  {
    id: 'data-risk',
    objection: '"I am nervous about data security and liability if coach data is breached."',
    response: 'Data security is foundational—SOC 2 Type II certified, AES-256 encryption, GDPR/CCPA compliant. You, as the coach, are not liable for platform security—that is on Starting Monday. The terms are clear: coaches are independent contractors, not employees, and Starting Monday carries liability for data handling. Detailed compliance docs are available under NDA. If your firm has specific security requirements, our enterprise team can discuss custom options.',
  },
  {
    id: 'privacy',
    objection: '"My clients are worried about their data being visible to a coach. How do I address that?"',
    response: 'Clients have full control. They decide which coaches can access their data and can revoke access instantly. All access is logged with timestamps—clients see exactly when and what a coach viewed. During preview setup, explain this to clients: "This is your data. I get to see the pipeline, signals, and prep you reviewed—but only what you grant me, and you can turn it off anytime." In pilot, 100% of clients who understood this permission model were comfortable.',
  },
  {
    id: 'competitive-concern',
    objection: '"What if I use this with a client who later works with another coach? Am I sharing intelligence with a competitor?"',
    response: 'No. Clients control access per coach. If a client switches coaches, the new coach does not automatically see the old coach\'s notes or activity—only the shared pipeline state. Old coach access is revoked unless the client re-grants it. This is by design. Coaches maintain privacy even when clients work with multiple coaches.',
  },
  {
    id: 'integration-roadmap',
    objection: '"If I adopt this now, will the features I need be built before I am ready to scale?"',
    response: 'Ask what specific integration you need during preview. Our roadmap includes Salesforce sync, HubSpot integration, and API access for custom workflows. If a feature matters for your firm, flag it during onboarding—we weight feedback from active coaches. Roadmap is transparent and updated quarterly.',
  },
  {
    id: 'effort',
    objection: '"This requires discipline from clients. My clients already do not track their pipelines consistently."',
    response: 'Fair. This tool works best with clients who are motivated and disciplined. If a client will not track their own pipeline 5 minutes a week, this tool will not make them do it—nothing will. But for your serious clients in active transition, this provides the structure and accountability they need to stay consistent. Use it selectively with clients who are committed to a disciplined search.',
  },
]

export default function CoachFaqPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/for-coaches" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Back to coach page
            </Link>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-12 pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            Coach FAQ
          </p>
          <h1 className="text-[32px] sm:text-[42px] font-bold text-white leading-[1.15] tracking-tight mb-4">
            Questions, objections, and clarity on what this is—and what it is not.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed">
            If you cannot find your question here, email us at contact@startingmonday.app.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Quick nav links */}
          <div className="mb-12 pb-8 border-b border-slate-200">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-4">Quick jump to section:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(FAQS.map((faq) => faq.category))).map((category) => (
                <a
                  key={category}
                  href={`#${category.toLowerCase().replace(/ /g, '-')}`}
                  className="inline-flex px-3 py-1.5 text-[12px] font-medium border border-slate-300 rounded-full hover:border-orange-400 hover:bg-orange-50/30 transition-colors text-slate-600 hover:text-orange-700"
                >
                  {category}
                </a>
              ))}
              <a
                href="#objections"
                className="inline-flex px-3 py-1.5 text-[12px] font-medium border border-slate-300 rounded-full hover:border-orange-400 hover:bg-orange-50/30 transition-colors text-slate-600 hover:text-orange-700"
              >
                Common Objections
              </a>
            </div>
          </div>

          {/* FAQs grouped by category */}
          {Array.from(new Set(FAQS.map((faq) => faq.category))).map((category) => (
            <section
              key={category}
              id={category.toLowerCase().replace(/ /g, '-')}
              className="mb-12"
            >
              <h2 className="text-[20px] font-bold text-slate-900 mb-6 sticky top-14 bg-white pt-2 pb-3 border-b border-orange-200">
                {category}
              </h2>
              <div className="space-y-6">
                {FAQS.filter((faq) => faq.category === category).map((faq) => (
                  <div key={faq.id} id={faq.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:bg-slate-100 transition-colors">
                    <h3 className="text-[15px] font-semibold text-slate-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-[14px] text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Common objections */}
          <section id="objections" className="mt-16 pt-12 border-t border-slate-300">
            <h2 className="text-[20px] font-bold text-slate-900 mb-6">
              Common Objections & How to Think About Them
            </h2>
            <div className="space-y-6">
              {OBJECTIONS.map((obj) => (
                <div key={obj.id} className="border-l-4 border-orange-500 bg-orange-50/40 rounded-r-lg p-5">
                  <div className="mb-3">
                    <p className="text-[14px] font-semibold text-slate-900 text-italic mb-2">
                      "{obj.objection}"
                    </p>
                  </div>
                  <div className="bg-white border border-orange-100 rounded-lg p-4">
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      <span className="font-semibold text-orange-700">Our take: </span>
                      {obj.response}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data security deep dive */}
          <section id="security" className="mt-16 pt-12 border-t border-slate-300">
            <h2 className="text-[20px] font-bold text-slate-900 mb-6">
              🔒 Data Security & Compliance Deep Dive
            </h2>
            <div className="space-y-5">
              <div className="border border-emerald-200 rounded-lg p-5 bg-emerald-50/30">
                <p className="text-[13px] font-semibold text-emerald-900 mb-2">Encryption</p>
                <p className="text-[13px] text-emerald-800 leading-relaxed">
                  All data at rest uses AES-256 encryption. All data in transit uses TLS 1.2+. Client data is encrypted in separate database partitions so coaches cannot cross-access data.
                </p>
              </div>
              <div className="border border-emerald-200 rounded-lg p-5 bg-emerald-50/30">
                <p className="text-[13px] font-semibold text-emerald-900 mb-2">Access Control</p>
                <p className="text-[13px] text-emerald-800 leading-relaxed">
                  Role-based access control (RBAC) and row-level security (RLS) in Postgres. Coaches can only query rows their clients have explicitly granted access to. All access is logged with timestamps and IP addresses.
                </p>
              </div>
              <div className="border border-emerald-200 rounded-lg p-5 bg-emerald-50/30">
                <p className="text-[13px] font-semibold text-emerald-900 mb-2">Compliance</p>
                <p className="text-[13px] text-emerald-800 leading-relaxed">
                  SOC 2 Type II certified. GDPR and CCPA compliant. HIPAA-grade encryption. Data stored in US-based infrastructure. All vendor integrations (Supabase, Stripe, etc.) are SOC 2 certified.
                </p>
              </div>
              <div className="border border-emerald-200 rounded-lg p-5 bg-emerald-50/30">
                <p className="text-[13px] font-semibold text-emerald-900 mb-2">Data Ownership</p>
                <p className="text-[13px] text-emerald-800 leading-relaxed">
                  Clients own their data. They can export at any time via their settings. They can delete their account and all associated data. We do not sell, trade, or use client data for third-party purposes.
                </p>
              </div>
              <p className="text-[12px] text-slate-600">
                Need a quick shareable trust summary? Use the{' '}
                <Link href="/for-coaches/trust-pack" className="underline underline-offset-2 hover:text-slate-900 transition-colors">
                  Coach Trust Pack
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Still have questions? */}
          <section className="mt-16 pt-12 border-t border-slate-300">
            <div className="bg-gradient-to-r from-orange-50 to-orange-50/30 border border-orange-200 rounded-2xl p-8 text-center">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-orange-700 mb-2">Still have questions?</p>
              <h3 className="text-[20px] font-bold text-slate-900 mb-4">
                Schedule a call or send us a note.
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:contact@startingmonday.app?subject=Coach%20FAQ%20Question"
                  className="inline-flex px-5 py-2.5 bg-white border border-orange-300 text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Email us
                </a>
                <Link
                  href="/for-coaches"
                  className="inline-flex px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Back to overview
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions?{' '}
            <a href="mailto:contact@startingmonday.app" className="hover:text-slate-300 transition-colors">
              contact@startingmonday.app
            </a>{' '}
            •{' '}
            <a href="mailto:contact@startingmonday.app?subject=Coach%20Feedback" className="hover:text-slate-300 transition-colors">
              Send feedback
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
