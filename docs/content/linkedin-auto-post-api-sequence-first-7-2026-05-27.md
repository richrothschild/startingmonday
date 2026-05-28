# LinkedIn Auto-Post API Sequence for First 7 Posts

Date: 2026-05-27
Mode: Option 2 (approved queue + council check + Make auto-post)

This sequence uses your existing endpoints:

- POST /api/admin/social/handoff-approved
- PATCH /api/admin/social/{id}
- POST /api/admin/social/{id}/council-check
- GET /api/admin/social/morning (cron/day-of auto publish)

## Pre-checks

In production environment, confirm:

1. SOCIAL_AUTO_PUBLISH_ENABLED=true
2. SOCIAL_REQUIRE_APPROVED_QUEUE=true
3. MAKE_WEBHOOK_URL is set
4. LINKEDIN_POST_TARGET is set (personal or organization)
5. LINKEDIN_COMPANY_URN is set when posting as company page

## One-run browser script (run while logged in as staff admin)

Open the admin dashboard in production, open browser devtools console, and run this script.

```js
(async () => {
  const postsWanted = [
    {
      date: '2026-05-28',
      emotionalAngle: 'conviction',
      text: `Most coaching sessions fail for one boring reason: everyone spent half the meeting rebuilding context from scratch.

If your client opens with, "Quick recap," your margin just left the room.

Funny thing about executive transitions: people pay for strategic advice, then lose results to operational amnesia.

Three rules that stop this:

1. Send a one-page pre-brief before every session.
2. End each session with one owner and one dated next action.
3. Start next week with outcomes, not storytelling.

If this sounds rigid, great. Rigid is what saves momentum.

Where does your coaching time leak first: context rebuild, weak follow-through, or fuzzy ownership?

#ExecutiveCoaching #ExecutiveSearch #LeadershipDevelopment #CareerStrategy`
    },
    {
      date: '2026-05-29',
      emotionalAngle: 'urgency',
      text: `Most "urgent" executive searches are not urgent.

They are six months of delayed candor wearing a sprint costume.

By the time the role gets posted, the board has already had hallway conversations, the market has already moved, and you are applying to a decision that has a head start.

The practical move is not more applications. It is earlier signal and tighter cadence.

One hard rule:

If a target company enters your list, it gets a next action with a date before the day ends.

Activity feels productive. Timing is productive.

What is your biggest timing failure mode right now?

#ExecutiveSearch #CareerTransition #Leadership #CLevel`
    },
    {
      date: '2026-06-02',
      emotionalAngle: 'grounded_concern',
      text: `Outplacement has a branding problem.

Clients want outcomes, but too many programs still deliver polished materials and motivational weather reports.

Nobody gets promoted because their worksheet was emotionally supportive.

They get traction when execution improves.

Three things clients actually feel:

1. Faster signal-to-conversation cycles.
2. Better prep quality in live meetings.
3. Fewer dead-end outreach loops.

Support is not the artifact. Support is the operating lift.

What metric do you use to prove your program accelerates real traction?

#Outplacement #CareerTransition #TalentStrategy #ExecutiveSearch`
    },
    {
      date: '2026-06-03',
      emotionalAngle: 'candid_humility',
      text: `A surprising number of "highly personalized" executive plans are copy-paste templates with better typography.

If two clients with different mandates get the same playbook, you are coaching in bulk.

That is not a strategy. That is a subscription box.

Practical fix:

1. Force one mandate statement per client.
2. Kill any action that does not tie to that mandate.
3. Review weekly for narrative drift.

Customization is not more content. It is less generic motion.

Where does template drift show up first in your process?

#ExecutiveCoaching #Leadership #ExecutiveSearch #DecisionQuality`
    },
    {
      date: '2026-06-04',
      emotionalAngle: 'practical_relief',
      text: `Executive job search advice often sounds like this:

"Network more. Stay visible. Keep applying."

That is like telling someone to fix a supply chain by being positive around containers.

What works at senior levels is narrower and less glamorous:

1. Fewer targets, better intelligence.
2. Fewer messages, better transfer value.
3. Fewer calls, better preparation quality.

Volume is the hobby. Precision is the profession.

What did you stop doing that improved your transition outcomes?

#ExecutiveSearch #CareerStrategy #Leadership #JobSearch`
    },
    {
      date: '2026-06-05',
      emotionalAngle: 'earned_optimism',
      text: `The fastest way to lose trust with senior candidates is to confuse progress reports with progress.

"We sent 40 outreaches" is not an outcome.

"We moved three conversations into qualified process with clear sponsor alignment" is an outcome.

One operating change that upgrades quality fast:

Audit every week for these three misses:

1. Messages with no clear transfer value.
2. Meetings with no follow-up owner.
3. Pipeline rows with no next date.

What gets audited gets improved. What gets narrated gets forgotten.

Which of those three misses is most common on your team?

#Outplacement #ExecutiveSearch #CareerTransition #OperatingRhythm`
    },
    {
      date: '2026-06-09',
      emotionalAngle: 'conviction',
      text: `Contrarian take: the problem is not always the shadow search.

Sometimes the problem is the board waiting too long to communicate directly, then asking the search process to clean up delayed governance.

A disciplined confidential search can be responsible.

An undisciplined one is just moral outsourcing.

Minimum governance gate before recruiter outreach:

1. Written expectations.
2. Direct CEO feedback date.
3. Time-bound remediation window.

No artifacts, no search.

What governance threshold do you require before a confidential search becomes legitimate?

#BoardGovernance #SuccessionPlanning #ExecutiveSearch #Leadership`
    }
  ]

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(`${url} -> ${res.status} ${JSON.stringify(data)}`)
    return data
  }

  async function patchJson(url, body) {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(`${url} -> ${res.status} ${JSON.stringify(data)}`)
    return data
  }

  // Seed placeholders via approved handoff route (max 5 variants per call).
  const seedA = await postJson('/api/admin/social/handoff-approved', {
    approvalStatus: 'approved',
    startDate: postsWanted[0].date,
    variantCount: 5,
    pillar: 'market_intel',
    audience: 'multi',
    article: {
      title: 'First 7 scheduled post batch',
      summary: 'Queue placeholders to patch with exact first-7 posts.',
      cta: 'Comment if this resonates.'
    }
  })

  const seedB = await postJson('/api/admin/social/handoff-approved', {
    approvalStatus: 'approved',
    startDate: postsWanted[5].date,
    variantCount: 2,
    pillar: 'market_intel',
    audience: 'multi',
    article: {
      title: 'First 7 scheduled post batch (part 2)',
      summary: 'Queue placeholders to patch with exact first-7 posts.',
      cta: 'Comment if this resonates.'
    }
  })

  const created = [...(seedA.posts || []), ...(seedB.posts || [])]

  // Map created rows by date and patch text to exact copy.
  const createdByDate = new Map(created.map(p => [p.post_date, p]))

  for (const p of postsWanted) {
    const row = createdByDate.get(p.date)
    if (!row) throw new Error(`No queued post found for ${p.date}`)

    await patchJson(`/api/admin/social/${row.id}`, {
      draft_text: p.text,
    })

    const council = await postJson(`/api/admin/social/${row.id}/council-check`, {
      draftText: p.text,
      emotionalAngle: p.emotionalAngle,
    })

    if (!council?.result?.councilPass) {
      throw new Error(`Council check did not pass for ${p.date}: ${JSON.stringify(council?.result || {})}`)
    }

    console.log(`Prepared and council-approved: ${p.date} (${row.id})`)
  }

  console.log('All 7 posts prepared. They will auto-publish on schedule via /api/admin/social/morning cron if env flags are enabled.')
})().catch(err => {
  console.error('Batch prep failed:', err)
})
```

## Day-of auto-post

Your cron should hit:

- GET /api/admin/social/morning

On each post day, this route sends the approved + council-passed post to Make webhook and marks it posted.

## Optional same-day manual force publish for one post

If needed, call:

- POST /api/admin/social/{id}/schedule

This sends the selected queued post to Make immediately.

## Troubleshooting quick checks

1. Morning route returns "Manual publish mode enabled".

- Set SOCIAL_AUTO_PUBLISH_ENABLED=true.

1. Morning route returns "Post is not from approved queue handoff".

- Ensure notes contain approval_status=approved and source=approved_handoff.

1. Morning route returns "Council check required before auto-post".

- Re-run council check with current draft_text and a valid emotional angle.

1. Sync engagement has zero updates.

- Ensure Make response returns linkedin_post_urn or postUrn.
