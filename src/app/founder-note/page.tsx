import type { Metadata } from 'next'
import { BlogPost } from '@/components/BlogPost'

export const metadata: Metadata = {
  title: 'Founder Note - Starting Monday',
  description: 'Why Starting Monday exists and what category mistake it is correcting.',
  alternates: {
    canonical: 'https://startingmonday.app/founder-note',
  },
  openGraph: {
    title: 'Founder Note - Starting Monday',
    description: 'Why Starting Monday exists and what category mistake it is correcting.',
    url: 'https://startingmonday.app/founder-note',
    type: 'article',
  },
}

export default function FounderNotePage() {
  return (
    <BlogPost
      title="Founder Note: The Category Mistake We Are Correcting"
      description="Starting Monday exists because executive search is not a resume problem. It is an execution problem with weak signals, timing, and between-session drift."
      date="2026-05-20"
      readTime="4 min read"
      url="https://startingmonday.app/founder-note"
      cta={{
        headline: 'See the system behind the note.',
        body: 'Method, references, pilot findings, and evidence assets are all collected in one place.',
        label: 'Open the evidence room →',
        href: '/evidence-room',
      }}
    >
      <div className="space-y-6 text-[15px] text-slate-700 leading-relaxed">
        <p>
          Starting Monday exists because the market has been telling executives the wrong story for years: that landing the right role is mostly about better resumes, more applications, or more hustle. That is the category mistake.
        </p>
        <p>
          At the senior level, the real problem is execution under uncertainty. Roles are shaped before they are posted. Context changes between conversations. The best candidates are not the ones who move fastest after the listing appears; they are the ones who arrive already informed, already prepared, and already in motion.
        </p>
        <p>
          I built Starting Monday to correct that mismatch. The product is a search operating system, not a content feed. It gives executives and coaches the signal layer, preparation layer, and accountability layer that their campaigns were missing.
        </p>
        <p>
          The goal is not to replace coaching or relationship-building. The goal is to make both more effective by reducing the amount of time spent rebuilding context and increasing the amount of time spent making good decisions.
        </p>
      </div>
    </BlogPost>
  )
}
