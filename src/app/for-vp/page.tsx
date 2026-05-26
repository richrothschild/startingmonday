import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import type { SituationCard, FAQ } from '@/components/LandingPage'
import { JsonLd } from '@/components/JsonLd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday for C-suite leaders - Make the Move from VP to CIO',
  description: 'The campaign infrastructure for C-suite leaders ready to move from VP to CIO. Position yourself at the right altitude, prepare for search firm conversations, and stay ahead of the market. Free 30-day trial.',
  keywords: [
    'VP to CIO',
    'VP IT to CIO',
    'CIO career path',
    'how to become CIO',
    'technology leadership career transition',
    'senior VP job search',
    'VP technology job search',
    'making VP to CIO move',
    'CIO career advice',
  ],
  openGraph: {
    title: 'Starting Monday for C-suite leaders - Make the Move from VP to CIO',
    description: 'Most VP searches fail at positioning, not credentials. The infrastructure to make the VP-to-CIO move deliberately.',
    url: 'https://startingmonday.app/for-vp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starting Monday for VPs - Make the Move from VP to CIO',
    description: 'Most VP searches fail at positioning, not credentials. The infrastructure to make the VP-to-CIO move deliberately.',
  },
  alternates: {
    canonical: 'https://startingmonday.app/for-vp',
  },
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'vp-up',
    headline: "I'm ready for the next seat.",
    sub: 'VP to CIO. Director to VP. I have the record. Now I need the campaign.',
  },
  {
    id: 'executive',
    headline: 'I know exactly what I want.',
    sub: 'Targeted search. I just need to move faster.',
  },
  {
    id: 'restructured',
    headline: 'My role was restructured.',
    sub: 'I know my worth. I want to land at the right level, not just the next one.',
  },
  {
    id: 'urgent',
    headline: 'My role was eliminated.',
    sub: 'I need to land well. Quickly.',
  },
  {
    id: 'passive',
    headline: "I'm not looking - but Sunday nights feel different.",
    sub: 'Not ready to commit. But not at peace either.',
  },
  {
    id: 'returning',
    headline: "I've been saying 'starting Monday' for months.",
    sub: 'This is the one that sticks.',
  },
]

const FAQS: FAQ[] = [
  {
    question: 'What is the typical timeline for a VP of Technology to move into a CIO role?',
    answer: 'The VP to CIO transition typically takes one to three years of deliberate positioning, depending on how close your current scope is to a full CIO mandate. The candidates who move fastest have already led enterprise-wide programs, built board-level communication skills, and developed relationships with executive search firms before they need them. The transition is rarely about credentials - it is about demonstrating you can operate at the level before the role is offered.',
  },
  {
    question: 'Do I need an existing CIO or CTO title to be considered for a CIO role?',
    answer: 'No. Many successful CIO placements come from VP Technology, VP IT, and SVP Technology candidates who have the scope and business outcomes without the title. What matters is the evidence: enterprise-scale responsibility, budget ownership, and a track record of technology enabling business strategy rather than just supporting it. The title matters less than the mandate you held.',
  },
  {
    question: 'How do executive search firms evaluate VP Technology candidates for CIO roles?',
    answer: 'Search firms look for candidates who have operated above their title. This means board-level communication experience, leadership through major transformation or M&A, and evidence that the technology function under your leadership drove measurable business outcomes. The caliber of the organizations you have led at also matters - a VP at a $5B company often has broader scope than a CIO at a $500M company.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://startingmonday.app/for-vp/#webpage',
  url: 'https://startingmonday.app/for-vp',
  name: 'Starting Monday for VPs - Make the Move from VP to CIO',
  description: 'Campaign infrastructure for technology leaders ready to move from VP to CIO. Right narrative, right altitude, right preparation.',
  isPartOf: {
    '@type': 'WebSite',
    url: 'https://startingmonday.app',
    name: 'Starting Monday',
  },
  about: {
    '@type': 'SoftwareApplication',
    name: 'Starting Monday',
    applicationCategory: 'BusinessApplication',
    audience: {
      '@type': 'Audience',
      audienceType: 'VP of Technology, VP of IT, VP Engineering, aspiring CIO',
    },
  },
}

export default function ForVpPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <h1 className="sr-only">Starting Monday for VPs moving to CIO roles</h1>
      <section className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">Quick navigation</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] mb-3">
            <a href="#fit-check" className="text-slate-300 hover:text-white underline underline-offset-2">Fit check</a>
            <a href="#feature-stack" className="text-slate-300 hover:text-white underline underline-offset-2">Feature stack</a>
            <a href="#proof-metrics" className="text-slate-300 hover:text-white underline underline-offset-2">Proof metrics</a>
            <a href="#faq" className="text-slate-300 hover:text-white underline underline-offset-2">FAQ</a>
          </div>
          <Link href="/signup?from=vp-up" className="inline-block text-[12px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors">
            Start free trial
          </Link>
          <p className="text-[11px] text-slate-400 mt-2">
            Confidential by default. No employer visibility, no recruiter visibility, and user-controlled data deletion.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] mt-2">
            <Link href="/for-cio" className="text-slate-400 hover:text-white underline underline-offset-2">CIO path</Link>
            <Link href="/for-ciso" className="text-slate-400 hover:text-white underline underline-offset-2">CISO path</Link>
            <Link href="/for-search-firms" className="text-slate-400 hover:text-white underline underline-offset-2">Search-firm path</Link>
          </div>
        </div>
      </section>
      <LandingPage
        hero={{
          eyebrow: 'Most VP searches fail at positioning, not credentials.',
          h1Lines: ["Your record is strong.", "Your narrative", "needs to match it."],
          body: "The gap between VP and CIO is rarely about capability. It is how you are positioned with search firms, how your resume reads in the first six seconds, and whether your story holds under board-level questioning. Starting Monday gives you the infrastructure to make that move deliberately.",
          note: 'Import your LinkedIn profile during setup. Operational in minutes.',
          steps: [
            'Map organizations where a CIO mandate is forming - we flag roles before they are authorized, not just before they are posted',
            'Build your positioning narrative at the right altitude - calibrated to C-suite, not the VP tier you are leaving',
            'Walk into every search firm conversation prepared - brief, objection responses, and win thesis usually ready in about a minute',
          ],
          trialNote: 'Free for 30 days. No credit card.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
      />
    </>
  )
}

