# LinkedIn Posting Schedule (Auto-Post)

## Objective
Cut through feed noise with audience-specific posts and clear weekly timing.

## Audience Channels
- Senior executives
- Search firms
- Executive coaches
- Outplacement firms

## Weekly Cadence (CT)
| Day | Time | Audience | Content angle | Primary CTA |
|---|---|---|---|---|
| Monday | 8:35 AM | Senior executives | Search craft and execution discipline | Comment with current search obstacle |
| Tuesday | 9:05 AM | Search firms | Market signal and shortlist quality | Reply if this pattern matches current searches |
| Wednesday | 8:45 AM | Executive coaches | Between-session execution and momentum | Share one client pattern seen this quarter |
| Thursday | 9:10 AM | Outplacement firms | Transition operating model and outcome speed | DM for partner workflow preview |
| Friday | 8:35 AM | Senior executives | Contrarian engagement and weekly reframe | Answer a direct question in comments |

## Channel Guardrails
- One core idea per post.
- No feature dumping.
- No generic career advice.
- Open with a strong claim in line one.
- End with one clear interaction prompt.

## Auto-Post Source of Truth
- API draft generation now follows this audience rotation and timing guidance.
- Future unposted queue is seeded from this plan.

## Publishing Target Toggle
Automation payload supports two targets:
- `LINKEDIN_POST_TARGET=personal`
- `LINKEDIN_POST_TARGET=company` with `LINKEDIN_COMPANY_URN`

Use company target only when company-page quality checklist is complete.
