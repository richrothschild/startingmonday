import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnersForm } from './partners-form'

export const metadata: Metadata = {
  title: 'Partners - Starting Monday',
  description: 'Partner with Starting Monday to give senior executives in transition an intelligence advantage. Programs for executive coaches, retained search firms, outplacement firms, PE operating partners, and relocation firms.',
  alternates: { canonical: 'https://startingmonday.app/partners' },
  openGraph: {
    title: 'Partner with Starting Monday',
    description: 'You know when executives are in motion. We help them move faster. Your clients close better.',
    url: 'https://startingmonday.app/partners',
  },
}

const PARTNER_GUIDES = [
  {
    label: 'Executive coaches',
    href: '/coaches-guide',
    body: 'Handle the research and accountability layer so you can focus on the work only you can do. Your clients arrive at sessions prepared. You stop rebuilding context and start doing strategy.',
    cta: 'Read the coaches guide',
  },
  {
    label: 'Retained search firms',
    href: '/for-search-firms',
    body: 'Give your candidates the preparation depth that determines whether they advance beyond the first round. Better-prepared candidates reflect better on your firm.',
    cta: 'Read the search firms guide',
  },
  {
    label: 'Outplacement firms',
    href: '/for-outplacement',
    body: 'Turn your program into an active search campaign, not a workshop. Bulk seats, activation tracking, and daily intelligence for every executive in your cohort.',
    cta: 'Read the outplacement guide',
  },
  {
    label: 'PE operating partners',
    href: '/for-pe-partners',
    body: 'The search timeline is a risk to the value creation plan. Equip your executive network with early intelligence on portfolio company signals and prep that compresses the mandate timeline.',
    cta: 'Read the PE partner guide',
  },
]

const TIERS = [
  {
    name: 'Referral Partner',
    price: 'Free to join',
    description: 'Recommend Starting Monday to your clients and earn a commission on every subscription that activates through your referral.',
    benefits: [
      'Unique referral link with activation tracking',
      'Commission on every active subscription',
      'Partner resource kit: one-pager, demo access, talking points',
      'Dedicated partner guide for your category',
      'Direct line to the founder for questions',
    ],
    cta: 'Apply as referral partner',
  },
  {
    name: 'Preferred Partner',
    price: 'Volume pricing',
    description: 'For firms enrolling multiple clients. Consolidated billing, usage visibility, and co-marketing for your practice.',
    benefits: [
      'Everything in Referral Partner',
      'Bulk seat pricing with consolidated billing',
      'Activation dashboard: see which clients are enrolled and active',
      'Volume discounts starting at 5 seats',
      'Co-marketing opportunities',
      'Priority support and onboarding assistance',
    ],
    cta: 'Apply as preferred partner',
    highlighted: true,
  },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/pricing" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Pricing
          </Link>
        </div>
      </nav>

      <main>

        {/* Hero */}
        <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-12">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
              Partners
            </p>
            <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.15] tracking-tight mb-4">
              You know when executives<br className="hidden sm:block" /> are in motion.
            </h1>
            <p className="text-[16px] text-slate-400 leading-relaxed">
              We help them move faster. Your clients close better. That is the partnership.
            </p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">

          {/* Who we work with */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-6">
              Who we work with
            </p>
            <div className="space-y-4">
              {PARTNER_GUIDES.map(({ label, href, body, cta }) => (
                <div key={label} className="border border-slate-200 rounded-lg p-5">
                  <p className="text-[14px] font-semibold text-slate-900 mb-2">{label}</p>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-3">{body}</p>
                  <Link
                    href={href}
                    className="text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {cta} &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Partner tiers */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-6">
              Partner program
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TIERS.map(({ name, price, description, benefits, cta, highlighted }) => (
                <div
                  key={name}
                  className={`rounded-lg border p-6 flex flex-col ${highlighted ? 'border-orange-400 bg-orange-50' : 'border-slate-200'}`}
                >
                  <div className="mb-4">
                    <p className={`text-[12px] font-bold tracking-[0.1em] uppercase mb-1 ${highlighted ? 'text-orange-600' : 'text-slate-400'}`}>
                      {name}
                    </p>
                    <p className="text-[18px] font-bold text-slate-900">{price}</p>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-5">{description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className={`font-bold shrink-0 mt-0.5 text-[12px] ${highlighted ? 'text-orange-500' : 'text-slate-400'}`}>+</span>
                        <span className="text-[13px] text-slate-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-slate-400 mt-4">
              Apply using the form below. We will follow up within 2 business days with your referral link and partner kit.
            </p>
          </section>

          {/* How it works */}
          <section className="border-t border-slate-100 pt-12 space-y-4 text-[14px] text-slate-500 leading-relaxed">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
              How it works
            </p>
            <p>
              Referral partners get a unique link. When a client signs up through your link and activates a paid plan,
              you earn a commission. You can track activations and see usage from your partner dashboard.
            </p>
            <p>
              Preferred partners get consolidated billing and an activation dashboard. Enroll clients directly,
              see who is active, and manage seats from a single account. Volume discounts start at 5 seats.
            </p>
            <p>
              If you work with executive coaches,{' '}
              <Link href="/coaches-guide" className="text-slate-700 underline hover:text-slate-900 transition-colors">
                read the coaches guide
              </Link>
              .{' '}
              If you work in retained search,{' '}
              <Link href="/for-search-firms" className="text-slate-700 underline hover:text-slate-900 transition-colors">
                read the search firms guide
              </Link>
              .{' '}
              If you run an outplacement program,{' '}
              <Link href="/for-outplacement" className="text-slate-700 underline hover:text-slate-900 transition-colors">
                read the outplacement guide
              </Link>
              .
            </p>
          </section>

          {/* Form */}
          <section id="apply">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-6">
              Apply to the partner program
            </p>
            <PartnersForm />
          </section>

        </div>
      </main>
    </div>
  )
}
