import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnersForm } from './partners-form'

export const metadata: Metadata = {
  title: 'Partner Program - Starting Monday',
  description: 'Partner with Starting Monday to give senior executives in transition an intelligence advantage. Referral programs for executive coaches, retained search firms, PE talent teams, and outplacement providers. Earn 20% commission.',
  alternates: { canonical: 'https://startingmonday.app/partners' },
  openGraph: {
    title: 'Partner with Starting Monday',
    description: 'You know when executives are in motion. We help them move faster. Earn 20% commission on every active subscription you refer.',
    url: 'https://startingmonday.app/partners',
  },
}

const PRIMARY_PARTNERS = [
  {
    label: 'Executive coaches',
    href: '/for-coaches',
    guidehref: '/coaches-guide',
    value: 'Your clients run better searches between sessions. The intelligence scanner, prep briefs, and daily briefing do the research. You do the strategy.',
    economics: 'Earn 20% of every active subscription your clients start through your referral link. No minimum volume. No enrollment fee.',
    specifics: [
      'View client pipeline between sessions without requiring a status call',
      'Prep briefs ready in 60 seconds before every coaching call',
      'Your clients reach out to target companies before searches are posted',
    ],
  },
  {
    label: 'Retained search firms',
    href: '/for-search-firms',
    guidehref: '/for-search-firms',
    value: 'Give your candidates the preparation depth that determines whether they advance beyond the first round. Better-prepared candidates reflect better on your firm.',
    economics: 'Earn 20% per active subscription. Preferred partners get consolidated billing and a candidate activation dashboard.',
    specifics: [
      'Candidates arrive at client interviews with a 60-second prep brief, not a printout',
      'Track which candidates are actively engaged and prepared before you present them',
      'Co-marketing for your firm in the Starting Monday partner directory',
    ],
  },
  {
    label: 'PE talent teams and operating partners',
    href: '/for-pe-teams',
    guidehref: '/for-pe-partners',
    value: 'The search timeline is a risk to the value creation plan. Equip your executive network with early intelligence on portfolio company signals before a mandate is even formalized.',
    economics: 'Earn 20% per active subscription. Preferred partners get bulk seat pricing starting at 5 seats and an activation dashboard.',
    specifics: [
      'Executives monitoring your portfolio companies reach out before the mandate goes to a firm',
      'Candidates prepared at depth close their first portfolio company conversation faster',
      'Pipeline view access: see where candidate attention is without requiring a call',
    ],
  },
  {
    label: 'Outplacement providers',
    href: '/for-outplacement',
    guidehref: '/for-outplacement',
    value: 'Turn your outplacement program into an active search campaign, not a workshop series. Bulk seats, activation tracking, and daily intelligence for every executive in your cohort.',
    economics: 'Preferred partner pricing on bulk cohort enrollments. Consolidated billing. Usage dashboard to see who is active.',
    specifics: [
      'Every participant gets daily briefings and pipeline tracking from day one',
      'Track cohort activation rates from your partner dashboard',
      'Differentiate your program with a tool executives actually use between sessions',
    ],
  },
]

const OTHER_PARTNERS = [
  { label: 'Relocation firms', href: '/for-relocation' },
  { label: 'CIO and technology associations', href: '/for-cio-associations' },
  { label: 'Executive financial advisors', href: '/for-financial-advisors' },
  { label: 'Fractional CIO and CTO networks', href: '/for-fractional-executives' },
  { label: 'Podcast hosts and newsletter writers', href: '/for-media-partners' },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-[13px] text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">Log in</Link>
          </div>
        </div>
      </nav>

      <main>

        {/* Hero */}
        <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-14">
          <div className="max-w-3xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
              Partner Program
            </p>
            <h1 className="text-[30px] sm:text-[42px] font-bold text-white leading-[1.1] tracking-tight mb-4">
              You know when executives<br className="hidden sm:block" /> are in motion.
            </h1>
            <p className="text-[16px] text-slate-400 leading-relaxed max-w-2xl mb-6">
              We help them move faster. Earn 20% commission on every active subscription you refer. No enrollment fee. No minimum volume.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#apply"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[13px] font-semibold px-5 py-2.5 rounded transition-colors"
              >
                Apply as a partner &rarr;
              </a>
              <Link
                href="/dashboard/partner"
                className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 text-[13px] px-5 py-2.5 rounded transition-colors"
              >
                Already a partner? Sign in &rarr;
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">

          {/* Per-category value props */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-8">
              Who we work with
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {PRIMARY_PARTNERS.map(({ label, href, guidehref, value, economics, specifics }) => (
                <div key={label} className="border border-slate-200 rounded-lg p-6 flex flex-col">
                  <p className="text-[14px] font-bold text-slate-900 mb-3">{label}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{value}</p>
                  <ul className="space-y-2 mb-5 flex-1">
                    {specifics.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-orange-500 shrink-0 mt-0.5 text-[12px] font-bold">+</span>
                        <span className="text-[13px] text-slate-600 leading-snug">{s}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[12px] text-slate-400 leading-relaxed mb-4 border-t border-slate-100 pt-4">{economics}</p>
                  <div className="flex items-center gap-3">
                    <a
                      href="#apply"
                      className="text-[12px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors"
                    >
                      Apply &rarr;
                    </a>
                    <Link
                      href={guidehref}
                      className="text-[12px] text-orange-600 hover:text-orange-700 transition-colors font-semibold"
                    >
                      Read the guide &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Partner tiers */}
          <section className="border-t border-slate-100 pt-12">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-6">
              Partner tiers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
              <div className="border border-slate-200 rounded-lg p-6">
                <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Referral Partner</p>
                <p className="text-[18px] font-bold text-slate-900 mb-3">Free to join</p>
                <p className="text-[13px] text-slate-600 leading-relaxed mb-4">Share your referral link. Earn 20% commission on every subscription that activates through your link.</p>
                <ul className="space-y-2">
                  {[
                    'Unique referral link with activation tracking',
                    '20% commission on every active subscription',
                    'Partner resource kit and talking points',
                    'Dedicated guide for your category',
                    'Direct line to the founder',
                  ].map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                      <span className="text-slate-400 shrink-0 mt-0.5 text-[12px] font-bold">+</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-orange-400 bg-orange-50 rounded-lg p-6">
                <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-orange-600 mb-1">Preferred Partner</p>
                <p className="text-[18px] font-bold text-slate-900 mb-3">Volume pricing</p>
                <p className="text-[13px] text-slate-600 leading-relaxed mb-4">For firms enrolling multiple clients. Consolidated billing, usage visibility, and co-marketing for your practice.</p>
                <ul className="space-y-2">
                  {[
                    'Everything in Referral Partner',
                    'Bulk seat pricing with consolidated billing',
                    'Activation dashboard: see which clients are enrolled and active',
                    'Volume discounts starting at 5 seats',
                    'Co-marketing opportunities',
                  ].map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                      <span className="text-orange-500 shrink-0 mt-0.5 text-[12px] font-bold">+</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Other partner types */}
          <section className="border-t border-slate-100 pt-12">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-5">
              Also built for
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {OTHER_PARTNERS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {label} &rarr;
                </Link>
              ))}
            </div>
          </section>

          {/* Application form */}
          <section id="apply" className="border-t border-slate-100 pt-12">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">
              Apply to the partner program
            </p>
            <p className="text-[13px] text-slate-500 mb-6">
              We follow up within 2 business days with your referral link and partner kit.
            </p>
            <PartnersForm />
          </section>

        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions?{' '}
            <a href="mailto:contact@startingmonday.app" className="hover:text-slate-300 transition-colors">
              contact@startingmonday.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
