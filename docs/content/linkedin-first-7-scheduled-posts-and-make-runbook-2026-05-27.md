# LinkedIn First 7 Scheduled Posts + Make.com Runbook

Date: 2026-05-27
Owner: Starting Monday
Voice: Dave Barry edge + Marshall Goldsmith execution discipline

## Posting schedule (first 7)

Recommended publish window: 8:35 AM CT

1. Thu 2026-05-28
2. Fri 2026-05-29
3. Tue 2026-06-02
4. Wed 2026-06-03
5. Thu 2026-06-04
6. Fri 2026-06-05
7. Tue 2026-06-09

## Post 1 (Executive coaches)

Most coaching sessions fail for one boring reason: everyone spent half the meeting rebuilding context from scratch.

If your client opens with, "Quick recap," your margin just left the room.

Funny thing about executive transitions: people pay for strategic advice, then lose results to operational amnesia.

Three rules that stop this:

1. Send a one-page pre-brief before every session.
2. End each session with one owner and one dated next action.
3. Start next week with outcomes, not storytelling.

If this sounds rigid, great. Rigid is what saves momentum.

Where does your coaching time leak first: context rebuild, weak follow-through, or fuzzy ownership?

Hashtags: #ExecutiveCoaching #ExecutiveSearch #LeadershipDevelopment #CareerStrategy

## Post 2 (Executives)

Most "urgent" executive searches are not urgent.

They are six months of delayed candor wearing a sprint costume.

By the time the role gets posted, the board has already had hallway conversations, the market has already moved, and you are applying to a decision that has a head start.

The practical move is not more applications. It is earlier signal and tighter cadence.

One hard rule:

If a target company enters your list, it gets a next action with a date before the day ends.

Activity feels productive. Timing is productive.

What is your biggest timing failure mode right now?

Hashtags: #ExecutiveSearch #CareerTransition #Leadership #CLevel

## Post 3 (Outplacement)

Outplacement has a branding problem.

Clients want outcomes, but too many programs still deliver polished materials and motivational weather reports.

Nobody gets promoted because their worksheet was emotionally supportive.

They get traction when execution improves.

Three things clients actually feel:

1. Faster signal-to-conversation cycles.
2. Better prep quality in live meetings.
3. Fewer dead-end outreach loops.

Support is not the artifact. Support is the operating lift.

What metric do you use to prove your program accelerates real traction?

Hashtags: #Outplacement #CareerTransition #TalentStrategy #ExecutiveSearch

## Post 4 (Executive coaches)

A surprising number of "highly personalized" executive plans are copy-paste templates with better typography.

If two clients with different mandates get the same playbook, you are coaching in bulk.

That is not a strategy. That is a subscription box.

Practical fix:

1. Force one mandate statement per client.
2. Kill any action that does not tie to that mandate.
3. Review weekly for narrative drift.

Customization is not more content. It is less generic motion.

Where does template drift show up first in your process?

Hashtags: #ExecutiveCoaching #Leadership #ExecutiveSearch #DecisionQuality

## Post 5 (Executives)

Executive job search advice often sounds like this:

"Network more. Stay visible. Keep applying."

That is like telling someone to fix a supply chain by being positive around containers.

What works at senior levels is narrower and less glamorous:

1. Fewer targets, better intelligence.
2. Fewer messages, better transfer value.
3. Fewer calls, better preparation quality.

Volume is the hobby. Precision is the profession.

What did you stop doing that improved your transition outcomes?

Hashtags: #ExecutiveSearch #CareerStrategy #Leadership #JobSearch

## Post 6 (Outplacement)

The fastest way to lose trust with senior candidates is to confuse progress reports with progress.

"We sent 40 outreaches" is not an outcome.

"We moved three conversations into qualified process with clear sponsor alignment" is an outcome.

One operating change that upgrades quality fast:

Audit every week for these three misses:

1. Messages with no clear transfer value.
2. Meetings with no follow-up owner.
3. Pipeline rows with no next date.

What gets audited gets improved. What gets narrated gets forgotten.

Which of those three misses is most common on your team?

Hashtags: #Outplacement #ExecutiveSearch #CareerTransition #OperatingRhythm

## Post 7 (Search firms + board lens)

Contrarian take: the problem is not always the shadow search.

Sometimes the problem is the board waiting too long to communicate directly, then asking the search process to clean up delayed governance.

A disciplined confidential search can be responsible.

An undisciplined one is just moral outsourcing.

Minimum governance gate before recruiter outreach:

1. Written expectations.
2. Direct CEO feedback date.
3. Time-bound remediation window.

No artifacts, no search.

What governance threshold do you require before a confidential search becomes legitimate?

Hashtags: #BoardGovernance #SuccessionPlanning #ExecutiveSearch #Leadership

## Make.com automation status in current codebase

Auto-publish path exists already.

- Auto-publish trigger route: /api/admin/social/morning
- Make webhook handoff env var: MAKE_WEBHOOK_URL
- Auto publish flag: SOCIAL_AUTO_PUBLISH_ENABLED=true
- Optional strict gate: SOCIAL_REQUIRE_APPROVED_QUEUE (defaults to true)
- LinkedIn engagement sync route: /api/admin/social/sync-engagement

Observed behavior:

1. The morning route creates or updates the day post.
2. If auto-publish is enabled and checks pass, it sends JSON to Make.com.
3. Make response can return linkedin_post_urn for engagement sync.

## Required gate checks before auto-post (if strict mode on)

When SOCIAL_REQUIRE_APPROVED_QUEUE=true, notes must include approved handoff status.

Also required before publish:

1. council_pass=true,
2. council_text_hash matches draft,
3. emotional_angle present.

## Practical posting options

Option A (fast): manual posting from this doc

1. Post each item directly on LinkedIn at the scheduled date/time.
2. Add first follow-up comment at +5 minutes.

Option B (automated with existing API + Make)

1. Insert approved queue items via /api/admin/social/handoff-approved.
2. Run council check for each post using /api/admin/social/{id}/council-check.
3. Trigger /api/admin/social/morning via cron on post days.
4. Make scenario publishes to LinkedIn personal or company target.

## Suggested Make payload shape

Your current app sends this payload to Make webhook:

- text
- post_date
- pillar
- audience
- post_target
- company_urn

For best integration, have Make return JSON with one of:

- linkedin_post_urn
- postUrn
- urn

This lets /api/admin/social/sync-engagement capture likes/comments automatically.

## First-hour comment seed template

Use this under each post:

"If you disagree, even better. What is one operating rule that has worked in your context?"
