import Link from 'next/link'

export default function OutplacementLanding() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
      <header className="w-full bg-slate-900 py-4 mb-8">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
        </div>
      </header>
      <main className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Outplacement by Starting Monday</h1>
        <p className="text-lg text-slate-600 mb-6 text-center">
          Modern, executive-focused outplacement for high-performing leaders.<br />
          White-label, partner-branded, and ready to launch in days.
        </p>
        <ul className="text-slate-700 text-base mb-8 space-y-2 list-disc list-inside">
          <li>1:1 executive coaching and job search strategy</li>
          <li>Personalized introductions to top executive recruiters</li>
          <li>AI-powered resume, LinkedIn, and interview prep</li>
          <li>Weekly progress tracking and reporting for HR/partners</li>
          <li>Seamless white-label experience for your brand</li>
        </ul>
        <a href="mailto:outplacement@startingmonday.com" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded text-lg transition-colors mb-2">Request a Demo</a>
        <p className="text-xs text-slate-400 mt-4">For partners: Custom landing and onboarding available. Contact us to white-label for your firm.</p>
      </main>
    </div>
  )
}
