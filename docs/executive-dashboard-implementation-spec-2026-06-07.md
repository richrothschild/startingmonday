# Executive Dashboard Implementation Spec

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes

## Scope

This spec defines the implemented changes for the executive dashboard in three sprint waves and includes exact component diffs for:

1. `src/app/(dashboard)/dashboard/page.tsx`
2. `src/app/(dashboard)/dashboard/dashboard-top-shell-section.tsx`
3. `src/app/(dashboard)/dashboard/dashboard-pipeline-pulse.tsx`
4. `src/app/(dashboard)/dashboard/dashboard-weekly-performance-section.tsx`

## Sprint Plan to Implementation Mapping

### Sprint 1 (Decision-first UX)

Implemented:

1. Executive Mode header strip in top shell.
2. Decision Brief card (what changed, why now, move, downside, CTA).
3. Stage-aware quick actions (dynamic by executive stage).
4. Preview mode via query parameter.

### Sprint 2 (Risk and sponsor depth)

Implemented:

1. Emotional Risk Engine Lite (threat, perfection loop, isolation, decision drag).
2. Sponsor coverage metric included in executive quality metrics.
3. Primary risk highlight and intervention CTA in top shell.

### Sprint 3 (Offer and transition)

Implemented:

1. Offer and Tradeoff Cockpit panel (context checks + actions).
2. Decision lag quality metric in pipeline pulse.
3. Transition launcher CTA from cockpit.

## Exact Diffs

### 1) `src/app/(dashboard)/dashboard/dashboard-top-shell-section.tsx`

```diff
@@
+type ExecutiveRiskLevel = 'low' | 'medium' | 'high'
+
+type ExecutiveDecisionBrief = {
+  changed: string
+  whyNow: string
+  recommendedMove: string
+  downsideIfDelayed: string
+  href: string
+  cta: string
+}
@@
+  isExecutiveMode: boolean
+  isExecutivePreview: boolean
+  executiveStageLabel: string
+  executivePrimaryRisk: {
+    label: string
+    level: ExecutiveRiskLevel
+    href: string
+    cta: string
+  }
+  executiveDecisionBrief: ExecutiveDecisionBrief
@@
+      {props.isExecutiveMode && (
+        <section className="mb-6 rounded border border-slate-200 bg-white overflow-hidden">
+          ...
+          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
+            Stage: {props.executiveStageLabel}
+          </span>
+          ...
+          <div className={`inline-flex items-center gap-2 text-[11px] font-semibold border px-2.5 py-1 rounded-full ${riskTone[props.executivePrimaryRisk.level]}`}>
+            <span>Primary risk: {props.executivePrimaryRisk.label}</span>
+            <Link href={props.executivePrimaryRisk.href} className="underline">
+              {props.executivePrimaryRisk.cta}
+            </Link>
+          </div>
+          ...
+          <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Decision brief</h2>
+          <p ...><span className="font-semibold text-slate-900">What changed:</span> {props.executiveDecisionBrief.changed}</p>
+          <p ...><span className="font-semibold text-slate-900">Why now:</span> {props.executiveDecisionBrief.whyNow}</p>
+          <p ...><span className="font-semibold text-slate-900">Recommended move:</span> {props.executiveDecisionBrief.recommendedMove}</p>
+          <p ...><span className="font-semibold text-slate-900">Downside if delayed:</span> {props.executiveDecisionBrief.downsideIfDelayed}</p>
+          <Link href={props.executiveDecisionBrief.href} ...>
+            {props.executiveDecisionBrief.cta}
+          </Link>
+        </section>
+      )}
```

### 2) `src/app/(dashboard)/dashboard/dashboard-pipeline-pulse.tsx`

```diff
@@
 type DashboardPipelinePulseProps = {
   isExecutive: boolean
   signalCount: number
   draftReadyCount: number
   overdueCount: number
   activeCount: number
+  signalToActionPercent: number
+  followUpSlaPercent: number
+  sponsorCoveragePercent: number
+  decisionLagDays: number | null
 }
@@
+      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
+        <div className="px-6 py-4 text-center">
+          <div className={...}>{signalToActionPercent}%</div>
+          <div ...>Signal to action</div>
+          <div ...>draft conversion</div>
+        </div>
+        <div className="px-6 py-4 text-center">
+          <div className={...}>{followUpSlaPercent}%</div>
+          <div ...>72h SLA</div>
+          <div ...>follow-up discipline</div>
+        </div>
+        <div className="px-6 py-4 text-center">
+          <div className={...}>{sponsorCoveragePercent}%</div>
+          <div ...>Sponsor coverage</div>
+          <div ...>companies with contacts</div>
+        </div>
+        <div className="px-6 py-4 text-center">
+          <div className={...}>{decisionLagDays ?? 0}d</div>
+          <div ...>Decision lag</div>
+          <div ...>active offer context</div>
+        </div>
+      </div>
```

### 3) `src/app/(dashboard)/dashboard/dashboard-weekly-performance-section.tsx`

```diff
@@
 type DashboardWeeklyPerformanceSectionProps = {
@@
   velocityRows: VelocityRow[]
   isCoach: boolean
+  isExecutiveMode: boolean
+  executiveStageLabel: string
+  riskItems: Array<...>
+  offerCockpit: {
+    show: boolean
+    offerCount: number
+    offerCompanyName: string | null
+    contextSignals: Array<{ label: string; ok: boolean }>
+  }
 }
@@
+  const quickActions = isExecutiveMode
+    ? (executiveStageLabel === 'Offer and Decision' ? [...] : executiveStageLabel === 'Interviewing and Conversion' ? [...] : [...])
+    : [...existing quick actions...]
@@
+      {isExecutiveMode && riskItems.length > 0 && (
+        <section id="risk-engine" ...>
+          <h2 ...>Emotional risk engine</h2>
+          ...
+          {riskItems.map((risk) => (
+            <div key={risk.id} className={`border rounded p-3 ${riskTone[risk.level]}`}>
+              ...
+              <Link href={risk.href} ...>{risk.cta}</Link>
+            </div>
+          ))}
+        </section>
+      )}
+
+      {offerCockpit.show && (
+        <section id="offer-cockpit" ...>
+          <h2 ...>Offer and tradeoff cockpit</h2>
+          ...
+          {offerCockpit.contextSignals.map((signal) => (...))}
+          <Link href="/dashboard/offers" ...>Compare offers</Link>
+          <Link href="/dashboard/strategy" ...>Capture no-go criteria</Link>
+          <Link href="/dashboard/wrap-up" ...>Launch 30/60/90 transition</Link>
+        </section>
+      )}
@@
-        <h2 ...>Quick actions</h2>
+        <h2 ...>{isExecutiveMode ? 'Stage actions' : 'Quick actions'}</h2>
@@
-          {[ ...static actions... ].map((a) => (
+          {quickActions.map((a) => (
```

### 4) `src/app/(dashboard)/dashboard/page.tsx`

```diff
@@
-  searchParams: Promise<{ q?: string; stage?: string; page?: string; profile_saved?: string; focus?: string }>
+  searchParams: Promise<{ q?: string; stage?: string; page?: string; profile_saved?: string; focus?: string; preview?: string }>
@@
-  const { q, stage, page: pageParam, profile_saved, focus } = await searchParams
+  const { q, stage, page: pageParam, profile_saved, focus, preview } = await searchParams
@@
+  const isExecutivePreview = preview === 'executive-v2'
+  const isExecutiveMode = isExecutive || isExecutivePreview
@@
+  const sponsorCoveragePercent = ...
+  const signalToActionPercent = ...
+  const followUpSlaPercent = ...
+  const decisionLagDays = ...
+
+  const executiveStageLabel = ...
+  const riskItems = [...]
+  const executivePrimaryRisk = ...
+  const executiveDecisionBrief = ...
+  const offerCockpit = ...
@@
         <DashboardTopShellSection
@@
+          isExecutiveMode={isExecutiveMode}
+          isExecutivePreview={isExecutivePreview}
+          executiveStageLabel={executiveStageLabel}
+          executivePrimaryRisk={executivePrimaryRisk}
+          executiveDecisionBrief={executiveDecisionBrief}
         />
@@
         <DashboardAdvancedModulesSection
@@
+          isExecutiveMode={isExecutiveMode}
+          executiveStageLabel={executiveStageLabel}
+          riskItems={riskItems}
+          offerCockpit={offerCockpit}
+          signalToActionPercent={signalToActionPercent}
+          followUpSlaPercent={followUpSlaPercent}
+          sponsorCoveragePercent={sponsorCoveragePercent}
+          decisionLagDays={decisionLagDays}
         />
```

## Preview Instructions

Primary preview route:

1. `/dashboard` (for executive users)

Forced preview mode route:

1. `/dashboard?preview=executive-v2`

This forces executive-mode rendering for review without requiring executive subscription tier.

## Notes

1. Existing dashboard modules remain intact.
2. New behavior is additive and layered into existing layout.
3. No schema or API migrations are required for this implementation phase.
