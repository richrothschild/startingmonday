import type { Metadata } from 'next'
import Link from 'next/link'
import { BlogPost } from '@/components/BlogPost'
import { getPost } from '@/lib/blog-posts'

const post = getPost('how-we-estimate-early-role-signals')!

export const metadata: Metadata = {
  title: `${post.title} - Starting Monday`,
  description: post.description,
  keywords: post.keywords,
  alternates: {
    canonical: 'https://startingmonday.app/blog/how-we-estimate-early-role-signals',
  },
  openGraph: {
    title: post.title,
    description: post.description,
    url: 'https://startingmonday.app/blog/how-we-estimate-early-role-signals',
    type: 'article',
    publishedTime: post.date,
  },
  twitter: {
    card: 'summary_large_image',
    title: post.title,
    description: post.description,
  },
}

export default function EarlyRoleSignalsMethodPage() {
  return (
    <BlogPost
      title={post.title}
      description={post.description}
      date={post.date}
      readTime={post.readTime}
      url="https://startingmonday.app/blog/how-we-estimate-early-role-signals"
    >
      <div className="space-y-6 text-[15px] text-slate-700 leading-relaxed">

        <p>
          Our homepage now leads with <strong>"Be ready. Be early."</strong> This post explains the timing model behind that
          promise: how we calculate early-signal windows, what data supports them, and where uncertainty remains.
        </p>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">What the claim means</h2>

        <p>
          The claim does <strong>not</strong> mean every company publishes a role 1-3 weeks after an internal decision. Executive
          hiring does not work that consistently. Instead, it means we frequently detect meaningful signal clusters and role-formation
          evidence before broad-market posting channels catch up.
        </p>

        <p>
          In practice, "broad-market posting" means LinkedIn and major boards. Company career pages, disclosure filings,
          and official leadership announcements often surface earlier context.
        </p>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">Our lag model</h2>

        <p>
          We separate timing into three measurable intervals so we do not overstate precision:
        </p>

        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Event-to-signal lag:</strong> internal trigger to first public evidence (for public companies, often an 8-K, press release, or call transcript).</li>
          <li><strong>Signal-to-posting lag:</strong> first public signal to first role appearance on a company career page.</li>
          <li><strong>Posting-to-broad-market lag:</strong> company career page appearance to broad distribution on LinkedIn and large job boards.</li>
        </ol>

        <p>
          The 1-3 week language is anchored mostly in interval #3 and supported context from intervals #1 and #2.
        </p>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">Data we use</h2>

        <h3 className="text-[18px] font-bold text-slate-900 pt-2">Tier 1 (highest confidence)</h3>

        <ul className="list-disc pl-5 space-y-2">
          <li>SEC Form 8-K guidance and filing rules for timing and trigger logic.</li>
          <li>eCFR references for Exchange Act current-reporting mechanics.</li>
          <li>Company investor-relations releases and official careers pages.</li>
        </ul>

        <h3 className="text-[18px] font-bold text-slate-900 pt-2">Tier 2 (contextual support)</h3>

        <ul className="list-disc pl-5 space-y-2">
          <li>HR process documentation explaining requisition approval and posting workflows.</li>
          <li>Institutional recruiting guides and workflow references.</li>
        </ul>

        <h3 className="text-[18px] font-bold text-slate-900 pt-2">Tier 3 (benchmark only)</h3>

        <ul className="list-disc pl-5 space-y-2">
          <li>Industry benchmark articles on time-to-fill and executive-search duration.</li>
          <li>Vendor and consultancy estimates used as directional ranges, not proof of our claim.</li>
        </ul>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">Why we moved from 2-4 weeks to 1-3 weeks</h2>

        <p>
          The earlier 2-4 week language was directionally plausible, but less conservative than our current evidence posture.
          We tightened to 1-3 weeks because it aligns better with observed posting-channel lag in our monitored sample and
          avoids claiming more precision than external literature can reliably support.
        </p>

        <p>
          We will continue to update this window as we expand verified observations. If the median shifts, we will update
          the public claim and timestamp the revision.
        </p>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">Current limitations</h2>

        <ul className="list-disc pl-5 space-y-2">
          <li>Private companies disclose less, so event dates are harder to validate.</li>
          <li>Some executive searches never become public postings.</li>
          <li>Role confidentiality, geography, and industry materially change lag timing.</li>
          <li>Public web benchmarks often measure requisition-to-fill, not decision-to-post.</li>
        </ul>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">Primary sources</h2>

        <ul className="list-disc pl-5 space-y-3 break-words">
          <li>
            SEC Compliance and Disclosure Interpretations, Form 8-K:
            {' '}
            <a className="text-slate-900 underline" href="https://www.sec.gov/rules-regulations/staff-guidance/compliance-disclosure-interpretations/exchange-act-form-8-k" target="_blank" rel="noopener noreferrer">sec.gov Form 8-K C&DIs</a>
          </li>
          <li>
            eCFR 17 CFR 240.13a-11:
            {' '}
            <a className="text-slate-900 underline" href="https://www.ecfr.gov/current/title-17/chapter-II/part-240/section-240.13a-11" target="_blank" rel="noopener noreferrer">current reports on Form 8-K</a>
          </li>
          <li>
            eCFR 17 CFR 249.308:
            {' '}
            <a className="text-slate-900 underline" href="https://www.ecfr.gov/current/title-17/chapter-II/part-249/section-249.308" target="_blank" rel="noopener noreferrer">Form 8-K form reference</a>
          </li>
        </ul>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">How to interpret this as a candidate</h2>

        <p>
          Treat timing as probability, not certainty. The practical advantage is not predicting an exact posting date. It is
          knowing where to focus outreach while most candidates are still waiting for the listing.
        </p>

        <p>
          If you want the execution side, read{' '}
          <Link href="/blog/target-company-list" className="text-slate-900 underline hover:text-slate-600">
            how to build a target-company list
          </Link>
          {' '}and{' '}
          <Link href="/blog/cio-job-market-2026" className="text-slate-900 underline hover:text-slate-600">
            our market scan write-up
          </Link>
          .
        </p>
      </div>
    </BlogPost>
  )
}
