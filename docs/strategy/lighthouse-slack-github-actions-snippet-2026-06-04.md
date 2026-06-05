# GitHub Actions Snippet: Lighthouse to Slack (Pass/Fail)

Date: 2026-06-04
Use case: Post Lighthouse result summaries to Slack with low noise routing.

## Required Secrets

Add these GitHub repository secrets:
- SLACK_UI_DELIVERY_WEBHOOK
- SLACK_UI_ALERTS_WEBHOOK

Optional:
- LIGHTHOUSE_URLS (comma-separated list of URLs)

## Example Workflow Snippet

```yaml
name: Lighthouse CI with Slack

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install deps
        run: npm ci

      - name: Run Lighthouse CI
        id: lhci
        continue-on-error: true
        run: |
          npx lhci autorun

      - name: Build Slack payload
        id: payload
        shell: bash
        run: |
          if [ "${{ steps.lhci.outcome }}" = "success" ]; then
            echo "status=PASS" >> $GITHUB_OUTPUT
            echo "webhook=${{ secrets.SLACK_UI_DELIVERY_WEBHOOK }}" >> $GITHUB_OUTPUT
            echo "message=✅ Lighthouse PASS for ${{ github.repository }} on ${{ github.ref_name }}" >> $GITHUB_OUTPUT
          else
            echo "status=FAIL" >> $GITHUB_OUTPUT
            echo "webhook=${{ secrets.SLACK_UI_ALERTS_WEBHOOK }}" >> $GITHUB_OUTPUT
            echo "message=🚨 Lighthouse FAIL for ${{ github.repository }} on ${{ github.ref_name }}" >> $GITHUB_OUTPUT
          fi

      - name: Post to Slack
        if: always()
        env:
          WEBHOOK: ${{ steps.payload.outputs.webhook }}
          MESSAGE: ${{ steps.payload.outputs.message }}
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"${MESSAGE}. Run: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}\"}" \
            "$WEBHOOK"

      - name: Fail workflow when Lighthouse failed
        if: steps.lhci.outcome != 'success'
        run: exit 1
```

## Routing Behavior in This Snippet

- PASS: posts to #ui-delivery webhook
- FAIL: posts to #ui-alerts webhook

## Noise Control Recommendation

- Keep PASS on push to main only.
- Keep FAIL on pull_request and push to main.
- Add branch filters if your PR volume is high.

## Optional Hardening

1. Parse Lighthouse JSON and include failed metric names in Slack text.
2. Tag assignee/team owner in Slack message.
3. Attach direct report URL if your LHCI server is enabled.
