'use client'
import { useState } from 'react'

const FAQS = [
  {
    q: 'How do I get started?',
    a: 'Add your first target company, upload your resume, and set your target titles on the Profile page. That gives the AI enough context to generate useful briefings and prep briefs. Then set your daily briefing time so you get a morning email whenever something changes.',
  },
  {
    q: 'What is the daily briefing?',
    a: 'Each morning, Starting Monday scans your target companies for new job postings that match your target titles, checks for any new signals (funding, leadership changes), and emails you a concise brief — what changed overnight and what to do about it. You set the delivery time and days in Profile.',
  },
  {
    q: 'How does company scanning work?',
    a: 'When you add a company with a career page URL, the system fetches and analyzes that page within a few minutes. It scores each job posting against your target titles (0-10) and flags strong matches. Scans repeat every few days automatically. You can also trigger a rescan from the company detail page.',
  },
  {
    q: 'What is the Strategy Brief?',
    a: 'The Strategy Brief is a one-time AI synthesis of your positioning — your target roles, sectors, narrative, and outreach approach — based on your profile and the companies you\'re tracking. Run it from the dashboard. Regenerate it any time your search focus shifts.',
  },
  {
    q: 'How do I upload my resume?',
    a: 'Go to Profile and click "Upload PDF or DOCX." The text is extracted and stored as context for all AI features — briefings, interview prep briefs, and the chat. If your PDF has custom fonts and uploads garbled, re-export it from Word or Google Docs first.',
  },
  {
    q: 'What do the pipeline stages mean?',
    a: 'Watching: tracking but not yet active. Researching: actively learning, likely reaching out soon. Applied: application submitted. Interviewing: at least one interview scheduled or completed. Offer: offer received. Move companies through stages as your search progresses.',
  },
  {
    q: 'How do Actions Due work?',
    a: 'When you add a follow-up action to a company (e.g. "Send thank you note — Friday"), it appears in Actions Due on the dashboard when the date arrives. Click the action text to edit it. Click Done to dismiss it.',
  },
  {
    q: 'What is the difference between Monitor and Active?',
    a: 'Monitor ($49/mo) is for passive tracking — scanning, daily briefings, pipeline management. Active ($129/mo) adds interview prep briefs, resume upload, AI chat, and contact outreach drafting. Both plans include a 7-day free trial.',
  },
  {
    q: 'How do I manage my subscription?',
    a: 'Click Billing in the nav. You can upgrade, downgrade, or cancel from the Stripe billing portal. Cancellation takes effect at the end of your current billing period — you keep full access until then.',
  },
  {
    q: 'My question isn\'t here — how do I get help?',
    a: 'Email rothschild@startingmonday.app and you\'ll hear back within one business day. During the alpha, expect fast responses — your feedback directly shapes the product.',
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-slate-100">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="text-[14px] font-semibold text-slate-900 pr-4">{faq.q}</span>
            <span className="text-slate-400 text-[18px] shrink-0 leading-none">
              {open === i ? '−' : '+'}
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-[14px] text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
