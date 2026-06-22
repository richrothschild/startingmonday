'use client'

import type { MouseEvent, SyntheticEvent } from 'react'
import { usePostHog } from 'posthog-js/react'

type BriefingPulseSupportProps = {
  state: 'building' | 'steady' | 'watch'
  whyNow: string
  mailtoHref: string
}

type PulseSupportAction = 'why_this_matters_opened' | 'email_plan_clicked'

const TRACK_ENDPOINT = '/api/briefing/pulse-events'

export function BriefingPulseSupport({ state, whyNow, mailtoHref }: BriefingPulseSupportProps) {
  const posthog = usePostHog()

  function track(action: PulseSupportAction, target: 'inline_explainer' | 'mailto') {
    const properties = {
      section: 'weekly_pulse_support',
      action,
      target,
      pulse_state: state,
    }

    try {
      posthog?.capture('briefing_action_clicked', properties)
    } catch {
      // Analytics must never block interaction.
    }

    try {
      void fetch(TRACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(properties),
        keepalive: true,
      })
    } catch {
      // Analytics must never block interaction.
    }
  }

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open) {
      track('why_this_matters_opened', 'inline_explainer')
    }
  }

  function handleEmailClick() {
    track('email_plan_clicked', 'mailto')
  }

  function preventSummaryClickJank(event: MouseEvent<HTMLElement>) {
    event.stopPropagation()
  }

  return (
    <>
      <details
        className="group w-full rounded-md border border-white/12 bg-white/5 px-4 py-2 text-[12px] text-slate-100/90 sm:w-auto"
        onToggle={handleToggle}
      >
        <summary
          className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 font-semibold text-white/90"
          onClick={preventSummaryClickJank}
        >
          Why this matters now
          <span className="text-slate-300 transition-transform group-open:rotate-180">▾</span>
        </summary>
        <p className="mt-2 max-w-xl leading-relaxed text-slate-200/90">{whyNow}</p>
      </details>

      <a
        href={mailtoHref}
        onClick={handleEmailClick}
        className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/12 px-4 py-2 text-[12px] font-semibold text-slate-100 transition-colors hover:border-white/30 hover:text-white"
      >
        Email me this plan
      </a>
    </>
  )
}
