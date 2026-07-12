# Slack Setup & Workstream Reporting

**Status:** Ready to configure  
**Script:** `scripts/workstream-reporter.mjs`  
**NPM commands:** `npm run workstream:report:daily` and `npm run workstream:report:weekly`

---

## What This Does

Posts automated status reports to Slack for:
1. **EMI Sprint 6 Wrap-Up** (Completion by 2026-07-18)
2. **Luxury-Modern Phase 0** (Completion by 2026-07-25)

Reports include:
- Daily standup (Mon-Fri 10am): Current tasks, blockers, dependencies
- Weekly review (Mon 9am): Progress against success criteria, next week focus

---

## Step 1: Get Slack Credentials

### Option A: Incoming Webhook (Recommended — Easiest)

1. Go to **Slack Workspace Settings** → **Manage Apps**
2. Search for **Incoming Webhooks**
3. Click **Add to Slack** (or **Create New Webhook**)
4. Select your **#product** channel (or your chosen status channel)
5. Copy the **Webhook URL** (looks like: `https://hooks.slack.com/services/XXX/YYY/ZZZ`)
6. Add to your `.env.local`:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
   ```

### Option B: Bot Token (More Control)

1. Go to **Slack Workspace Settings** → **Manage Apps**
2. Click **Create a New App** → **From scratch**
3. Name it: "Starting Monday Workstream Reporter"
4. Select your workspace
5. Go to **OAuth & Permissions** → **Scopes**
6. Add scope: `chat:write`
7. Click **Install to Workspace** and authorize
8. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
9. Add to your `.env.local`:
   ```
   SLACK_BOT_TOKEN=xoxb-[your-token]
   SLACK_CHANNEL_ID=C[your-channel-id]
   ```

To find your channel ID, in Slack:
- Right-click channel → **View details** → Copy ID from URL or modal

---

## Step 2: Test the Reporter

### Test with Webhook:
```bash
npm run workstream:report:daily
```

You should see:
```
✓ Posted to Slack via webhook

✅ DAILY report posted to Slack

📋 Content preview:
─────────────────────────────────
:timer_clock: *Daily Standup — Monday 2026-07-11*
[report content...]
─────────────────────────────────
```

And a message should appear in your Slack channel.

### Test with Bot Token:
```bash
SLACK_BOT_TOKEN=xoxb-[...] SLACK_CHANNEL_ID=C[...] npm run workstream:report:daily
```

---

## Step 3: Schedule Automatic Reports

### Option A: GitHub Actions (Recommended for Production)

Create `.github/workflows/workstream-reports.yml`:

```yaml
name: Workstream Status Reports

on:
  schedule:
    # Daily standup: Mon-Fri at 10am UTC
    - cron: '0 10 * * 1-5'
    # Weekly review: Monday at 9am UTC
    - cron: '0 9 * * 1'

jobs:
  reports:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Daily standup (Mon-Fri)
        if: ${{ github.event.schedule == '0 10 * * 1-5' }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: npm run workstream:report:daily
      
      - name: Weekly review (Monday)
        if: ${{ github.event.schedule == '0 9 * * 1' }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: npm run workstream:report:weekly
```

Then add secret to GitHub:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: (paste your webhook URL)

### Option B: Railway Cron Job (If Using Railway)

In `railway.toml`:

```toml
[build]
builder = "nixpacks"

[[crons]]
name = "workstream-daily"
schedule = "0 10 * * 1-5"  # Mon-Fri 10am
command = "npm run workstream:report:daily"

[[crons]]
name = "workstream-weekly"
schedule = "0 9 * * 1"     # Monday 9am
command = "npm run workstream:report:weekly"
```

### Option C: Local Cron (Development)

On macOS/Linux, add to crontab:

```bash
# Edit crontab
crontab -e

# Add these lines (adjust path to your repo):
0 10 * * 1-5 cd /path/to/startingmonday && npm run workstream:report:daily >> /tmp/workstream-daily.log 2>&1
0 9 * * 1 cd /path/to/startingmonday && npm run workstream:report:weekly >> /tmp/workstream-weekly.log 2>&1
```

---

## Step 4: Verify Setup

### Check Environment Variables
```bash
# Webhook only (safest)
echo $SLACK_WEBHOOK_URL

# OR bot token + channel
echo $SLACK_BOT_TOKEN
echo $SLACK_CHANNEL_ID
```

### Manual Test Run
```bash
# Test daily report
npm run workstream:report:daily

# Test weekly report
npm run workstream:report:weekly
```

### Check Scheduled Jobs (GitHub Actions)
1. Go to your repo → **Actions** tab
2. Select **Workstream Status Reports** workflow
3. You should see scheduled runs listed

### Verify in Slack
Check your #product (or chosen) channel for messages like:
- "⏰ Daily Standup — Monday 2026-07-11"
- "📊 Weekly Review — Week of 2026-07-01 to 2026-07-05"

---

## Troubleshooting

### "Slack not configured" Error

```bash
npm run workstream:report:daily
# ✗ Slack not configured. Set SLACK_WEBHOOK_URL or (SLACK_BOT_TOKEN + SLACK_CHANNEL_ID)
```

**Fix:** Ensure `.env.local` has either:
- `SLACK_WEBHOOK_URL=https://hooks.slack.com/...`
- OR `SLACK_BOT_TOKEN=xoxb-...` + `SLACK_CHANNEL_ID=C...`

### "Slack webhook returned 401/403"

If using webhook:
- URL may have expired → regenerate from Slack app settings
- Check the URL is complete and copied correctly

If using bot token:
- Token may have expired → reinstall the app in Slack
- Channel ID may be wrong → right-click channel, view details, copy ID
- Bot may not have permission → go to channel, add bot from "Integrations"

### "Slack API error: not_in_channel"

**Fix:** The bot needs to be added to the channel first.
1. In Slack, go to the channel
2. Click channel name → **Integrations**
3. Add the bot under **App** section

### "Slack API error: channel_not_found"

**Fix:** `SLACK_CHANNEL_ID` may be wrong.
1. Right-click channel in Slack
2. Click **View details**
3. Copy the channel ID (starts with `C...`)
4. Update `.env.local`

---

## Monitoring

### View Reports in Slack

Daily reports appear at **10am** (Mon-Fri):
- Current work items
- Daily blockers and dependencies
- Action items due

Weekly reports appear at **9am** (Monday):
- Week summary and progress
- Go/no-go status for each workstream
- Next week focus and timeline

### Check Logs Locally

```bash
# Last report run
tail -f /tmp/workstream-daily.log   # Local cron logs
tail -f /tmp/workstream-weekly.log
```

### Check Logs on Railway

```bash
railway logs --follow
# Look for: "✓ Posted to Slack via webhook"
```

---

## What Reports Include

### Daily Standup (10am Mon-Fri)

```
:timer_clock: Daily Standup — [Day] [Date]
:rocket: Dual Workstream Status

📋 EMI Sprint 6 (Completion by 2026-07-18)
  • EMI-501: Tune objections & create scripts
  • EMI-502: Finalize SLOs for critical flows
  • EMI-503: Lock Q4 operating cadence
  • EMI-504: Publish capstone & remediation plan

🎨 Luxury-Modern Phase 0 (Completion by 2026-07-25)
  • Design system: Premium tokens + 5 components
  • Messaging: Hero headlines for 5 pages
  • Metrics: Baseline capture + GA4 setup
  • Page briefs: Figma redesigns + copy specs

:warning: Critical Dependencies This Week
  ⚠️ Metrics access (Engineering) — needed by Mon
  ⚠️ Rich + Chris EMI-503 sync — needed by Fri
  [etc...]
```

### Weekly Review (9am Monday)

```
:bar_chart: Weekly Review — Week of [Start] to [End]

🎯 EMI Sprint 6 Status
  Sprint goal: Lock EMI system for Q4
  Timeline: Complete by 2026-07-18
  Success criteria: All 4 tickets complete
  [Weekly progress...]

🎨 Luxury-Modern Phase 0 Status
  Phase goal: Establish design system
  Timeline: Complete by 2026-07-25
  Success criteria: All workstreams at 80%
  [Weekly progress...]

:warning: Blockers This Week
  [Any active blockers...]
```

---

## Next Steps

1. **Today:**
   - [ ] Generate Slack webhook or bot token
   - [ ] Add to `.env.local`
   - [ ] Test: `npm run workstream:report:daily`
   - [ ] Verify message appears in Slack

2. **Setup scheduling:**
   - [ ] Choose GitHub Actions OR Railway OR local cron
   - [ ] Configure cron expression for your timezone
   - [ ] Test one scheduled run

3. **Ongoing:**
   - [ ] Reports auto-post daily + weekly
   - [ ] Team sees standing status in #product
   - [ ] Blockers escalated in real-time
   - [ ] Progress tracked without manual updates

---

## Questions?

If the reporter isn't posting, check:
1. Environment variables are set: `echo $SLACK_WEBHOOK_URL`
2. Test manually: `npm run workstream:report:daily`
3. Check logs: `tail -f /tmp/workstream-*.log`
4. Verify Slack channel permissions
5. Test webhook in Slack app settings ("Send Test"  button)

Post questions in #product or escalate to @rich.
