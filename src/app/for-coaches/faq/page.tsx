import type { Metadata } from 'next'
import Link from 'next/link'
import { CoachPreviewActions } from '../coach-preview-actions'

export const metadata: Metadata = {
  title: 'Coach FAQ | Starting Monday',
  description: 'Frequently asked questions for executive coaches evaluating the Starting Monday partner preview.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches/faq' },
}

const FAQS = [
  {
    question: 'Who is this built for?',
    answer:
      'Executive coaches working with CIOs, CTOs, CISOs, CDOs, COOs, and other senior technology leaders in transition or positioning for the next seat. The product is designed for confidential, relationship-driven searches rather than broad job-board activity.',
  },
  {
    question: 'What problem does it solve for the coach?',
    answer:
      'It gives coaches shared context between sessions. Signals, pipeline activity, and prep artifacts are visible without spending session time reconstructing what happened since the last call. That keeps the coach focused on judgment, accountability, and narrative work.',
  },
  {
    question: 'What problem does it solve for the client?',
    answer:
      'Clients get a disciplined operating layer: earlier signal detection, a structured pipeline, daily action prompts, and prep briefs before high-stakes conversations. That reduces dormancy and raises preparation quality.',
  },
  {
    question: 'Does this replace coaching?',
    answer:
      'No. It removes the research and tracking burden so the coach can stay in strategy. It does not replace accountability, narrative calibration, interview judgment, or the trust relationship between coach and client.',
  },
  {
    question: 'What does the coach preview include?',
    answer:
      'Free coach access during the preview window, two to three client preview seats, a sample prep-brief walkthrough, and one short feedback session with the founder. The point is to evaluate workflow fit before any broader rollout.',
  },
  {
    question: 'How long is the client trial?',
    answer:
      'Clients can start with a 30-day free trial and no credit card. Coaches can use the preview structure first, then invite clients into the standard trial when the workflow fits.',
  },
  {
    question: 'How do confidentiality and visibility work?',
    answer:
      'The client controls access to their pipeline. Coach visibility is opt-in, not automatic. When access is granted, the coach can see the company list, current stage, next follow-up date, recent signals, and prep briefs tied to that client. Employers and search firms do not see this activity, and the client can revoke coach access at any time.',
  },
  {
    question: 'What exactly happens after Terry forwards this to a coach?',
    answer:
      'The intended sequence is simple: the coach reads the preview page, requests the preview if relevant, gets one coach seat plus two to three client preview seats, tests the workflow with live context, then decides whether to recommend standard client plans. If they want broader rollout, that moves into the partner program.',
  },
  {
    question: 'What happens after the preview?',
    answer:
      'If the fit is strong, the coach can recommend the standard client plans and optionally join the partner program for referral economics. If the fit is weak, nothing is forced. The preview is intentionally low-risk.',
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
          <Link href="/for-coaches" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Back to coach preview
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <header className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Coach FAQ
          </p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
            Answers for coaches evaluating the preview.
          </h1>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-2xl">
            This page exists so the warm-intro page can stay focused. Start with the coach preview. Use this when a coach wants operating details about fit, confidentiality, and how the preview works.
          </p>
        </header>

        <section className="space-y-4 mb-12">
          {FAQS.map((item) => (
            <div key={item.question} className="border border-slate-200 rounded-2xl p-5 bg-white">
              <p className="text-[15px] font-semibold text-slate-900 mb-2">{item.question}</p>
              <p className="text-[14px] text-slate-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </section>

        <section className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
            Next step
          </p>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
            If the workflow sounds relevant, start with the preview. If the coach needs pricing and commission detail before deciding, send the economics page next. The goal is to reduce perceived risk before asking for commitment.
          </p>
          <CoachPreviewActions />
          <div className="flex flex-wrap gap-4 mt-5 text-[13px]">
            <Link href="/for-coaches/economics" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              See pricing and partner economics
            </Link>
            <Link href="/for-coaches" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Return to the coach preview
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
