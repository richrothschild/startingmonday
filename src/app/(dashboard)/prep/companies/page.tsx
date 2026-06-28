'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Company {
  id: string
  name: string
  industry?: string
}

interface WeeklyPlan {
  featured_company_ids: string[]
}

export default function CompaniesPrepPage() {
  const supabase = createClient()
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([])
  const [customCompanies, setCustomCompanies] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Load this week's plan to get featured companies
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
        const weekStartStr = weekStart.toISOString().split('T')[0]

        const { data: planData } = await supabase
          .from('dashboard_weekly_plans')
          .select('featured_company_ids')
          .eq('user_id', user.id)
          .eq('week_start', weekStartStr)
          .single()

        if (planData && planData?.featured_company_ids?.length > 0) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('id, name, industry')
            .in('id', planData.featured_company_ids)

          setFeaturedCompanies(companyData || [])
        }
      } catch (error) {
        console.error('Error loading companies prep:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-[32px] font-bold tracking-tight text-white sm:text-[40px]">
          Target Companies
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-300 max-w-2xl">
          Review this week's featured companies and confirm your broader target list.
        </p>
      </div>

      {/* Research insight card */}
      <div className="rounded-2xl border border-orange-400/30 bg-orange-500/5 p-6 sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-orange-300 mb-3">
          From coaching research
        </p>
        <p className="text-[15px] leading-relaxed text-slate-100">
          "The leaders who closed offers fastest spent the first 4-5 weeks researching: 40-60 target companies, signals that precede a search, and the pattern of demand. They didn't rush into outreach. They moved when the pattern was clear."
        </p>
      </div>

      {/* Featured companies section */}
      {!loading && featuredCompanies.length > 0 && (
        <div className="rounded-2xl border border-teal-400/30 bg-teal-500/5 p-6 sm:p-8">
          <div className="mb-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-teal-300 mb-2">
              ✓ Featured companies for this week ({featuredCompanies.length})
            </p>
            <p className="text-[13px] text-slate-300">
              Based on signals and alignment with your search. Consider these as priority targets.
            </p>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredCompanies.map((company) => (
              <div
                key={company.id}
                className="rounded-lg px-4 py-3 border border-teal-400/30 bg-teal-950/40 flex items-start justify-between"
              >
                <div>
                  <p className="font-semibold text-[14px] text-teal-100">{company.name}</p>
                  {company.industry && <p className="text-[12px] text-teal-300">{company.industry}</p>}
                </div>
                <Link
                  href={`/dashboard/companies/${company.id}`}
                  className="text-[11px] text-teal-300 hover:text-teal-200 whitespace-nowrap ml-2"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form sections */}
      <form className="space-y-8">
        {/* Market research */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Market Research
          </legend>

          <div>
            <label htmlFor="market-focus" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Markets or verticals you're targeting
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              E.g., "Fintech for SMB", "Enterprise AI infrastructure", "Healthcare SaaS"
            </p>
            <textarea
              id="market-focus"
              placeholder="Your market focus or verticals..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="market-dynamics" className="block text-[13px] font-semibold text-slate-200 mb-2">
              What's happening in these markets right now?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Consolidation, new entrants, talent wars, funding shifts?
            </p>
            <textarea
              id="market-dynamics"
              placeholder="Market trends, consolidation, funding activity, talent dynamics..."
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Target companies */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Your Full Target List
          </legend>

          <div>
            <label htmlFor="company-list" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Add companies beyond this week's featured list
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Build your 40-60 target company list. One per line or comma-separated. Include the featured companies above plus any others you're tracking.
            </p>
            <textarea
              id="company-list"
              placeholder="Add more companies:&#10;Notion&#10;Monday.com&#10;Asana&#10;Or: Company1, Company2, Company3"
              rows={8}
              value={customCompanies}
              onChange={(e) => setCustomCompanies(e.target.value)}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="company-criteria" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Selection criteria
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Why you picked these companies. Size, growth rate, geography, industry?
            </p>
            <textarea
              id="company-criteria"
              placeholder="Company size, funding stage, growth rate, industry factors..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Signals */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Signals You're Watching For
          </legend>

          <div>
            <label htmlFor="key-signals" className="block text-[13px] font-semibold text-slate-200 mb-2">
              What precedes a search in your market?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Executive departures, board changes, funding announcements, product launches?
            </p>
            <textarea
              id="key-signals"
              placeholder="E.g., executive departures, funding rounds, board changes, product announcements, acquisition activity..."
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="signal-sources" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Where you'll find these signals
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              News feeds, LinkedIn, company career pages, press releases, your network?
            </p>
            <textarea
              id="signal-sources"
              placeholder="News sources, LinkedIn updates, press releases, career pages, your network..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Outreach readiness */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Outreach Readiness
          </legend>

          <div>
            <label htmlFor="outreach-timing" className="block text-[13px] font-semibold text-slate-200 mb-2">
              When will you start outreach?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              After weeks of company research and signal-watching.
            </p>
            <input
              id="outreach-timing"
              type="date"
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="outreach-channels" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Your outreach channels
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              LinkedIn, email, referrals, recruiters, network connections?
            </p>
            <textarea
              id="outreach-channels"
              placeholder="Primary channels: LinkedIn, email, recruiters, referrals, warm introductions..."
              rows={2}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4">
          <button
            type="button"
            className="px-6 py-3 text-[13px] font-semibold text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
          >
            Save as draft
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-[13px] font-semibold bg-orange-500 text-slate-900 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Save companies research
          </button>
        </div>
      </form>

      {/* Next steps */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
        <p className="text-[13px] font-semibold text-slate-300 mb-3">Next: Plan your conversation flow</p>
        <p className="text-[14px] leading-relaxed text-slate-100 mb-4">
          With your target list confirmed, plan how you'll move from introduction through offer. Meetings Prep will walk you through each conversation phase.
        </p>
        <Link
          href="/prep/meetings"
          className="inline-flex px-4 py-2 text-[13px] font-semibold text-orange-300 hover:text-orange-200 transition-colors"
        >
          Plan your meetings →
        </Link>
      </div>
    </div>
  )
}
