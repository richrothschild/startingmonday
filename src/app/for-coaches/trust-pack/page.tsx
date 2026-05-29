import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Coach Trust Pack | Starting Monday',
  description:
    'Security, privacy, permission controls, and access logging for executive coaches evaluating Starting Monday.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches/trust-pack' },
}

const CONTROL_POINTS = [
  'Client-controlled access with instant revoke',
  'Per-coach permissions and access levels',
  'Audit-friendly access logs with timestamps',
  'Row-level access controls so coaches only see granted data',
  'No recruiter-side data sharing from coach workflows',
]

const SECURITY_POINTS = [
  'Encryption at rest and in transit',
  'Role-based access controls backed by database policies',
  'Activity logging for sensitive coach-client data views',
  'Documented governance path for regulated coaching contexts',
]

export default function CoachTrustPackPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
          Coach Trust Pack
        </h2>
        <h1 className="text-[30px] sm:text-[38px] font-bold text-slate-900 leading-[1.12] tracking-tight mb-4">
          Security and privacy controls coaches can explain in one minute.
        </h1>
        <p className="text-[15px] text-slate-600 leading-relaxed mb-8">
          This page is for coach buyers and coach-led client reviews. It summarizes what is enforced,
          what is client-controlled, and where the trust boundary sits.
        </p>

        <section className="border border-slate-200 rounded-2xl p-4 bg-white mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            <a href="#trust-boundary" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Trust boundary</a>
            <a href="#permissions" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Permissions</a>
            <a href="#security-posture" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Security posture</a>
            <a href="#coach-next-step" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Next step</a>
          </div>
        </section>

        <section id="trust-boundary" className="border border-slate-200 rounded-2xl p-6 bg-slate-50 mb-6">
          <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Core trust boundary</h2>
          <p className="text-[14px] text-slate-700 leading-relaxed">
            Starting Monday supports coaching workflows. It does not broker recruiter relationships and does not
            expose coach-client workflow data to recruiter-side channels.
          </p>
          <p className="text-[13px] text-slate-700 leading-relaxed mt-2">Trust and confidentiality: coach-client workflow data remains confidential by default.</p>
        </section>

        <section id="permissions" className="border border-slate-200 rounded-2xl p-6 bg-white mb-6">
          <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Client control and permissions</h2>
          <ul className="space-y-2 text-[14px] text-slate-700 leading-relaxed">
            {CONTROL_POINTS.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
        </section>

        <section id="security-posture" className="border border-slate-200 rounded-2xl p-6 bg-white mb-8">
          <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Security posture summary</h2>
          <ul className="space-y-2 text-[14px] text-slate-700 leading-relaxed">
            {SECURITY_POINTS.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
          <p className="text-[13px] text-slate-700 leading-relaxed mt-3">Outcome metric: permission and logging controls reduce avoidable trust friction during coach-led client reviews.</p>
        </section>

        <section id="coach-next-step" className="flex flex-wrap gap-4 text-[13px]">
          <h2 className="sr-only">Coach next step</h2>
          <Link href="/for-coaches/faq#security" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
            Read full security FAQ
          </Link>
          <Link href="/for-coaches" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">
            Back to coach preview
          </Link>
          <p className="w-full text-[12px] text-slate-500 mt-1">CTA: get started now by sharing this pack in your next client security review.</p>
        </section>
      </main>
    </div>
  )
}
