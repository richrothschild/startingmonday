# Jira + VS Code Integration Checklist (Concrete Setup)

Date: 2026-06-04

## Goal

Connect Jira, GitHub, design, and UI quality tooling to your workflow so Jira remains the source of truth while evidence and code links flow into tickets.

## Exact VS Code Extension IDs

Install these from Extensions:
- atlassian.atlascode
- github.vscode-pull-request-github

Optional helpers:
- If you use local Storybook heavily, no required extension is needed.
- For Figma, keep the browser app as primary unless your team has a preferred extension policy.

## Jira OAuth and API Token Setup

Use both methods:
- OAuth via Atlassian extension for day-to-day interactive use
- API token for scripts and automation

### A) OAuth in VS Code (Atlassian extension)

1. Install extension atlassian.atlascode.
2. Open Command Palette.
3. Run Atlassian: Open Settings and then Atlassian: Sign In.
4. Complete browser OAuth flow.
5. Verify you can list Jira issues from VS Code.

### B) API token for terminal scripts

1. Go to Atlassian account security page.
2. Create API token with a clear name, for example vscode-jira-automation.
3. Save these values securely:
- Jira base URL, for example https://yourcompany.atlassian.net
- Jira account email
- Jira API token
- Jira project key, for example UI

4. In your terminal session, set environment variables:
- JIRA_BASE_URL
- JIRA_EMAIL
- JIRA_API_TOKEN
- JIRA_PROJECT_KEY

PowerShell example:
$env:JIRA_BASE_URL = "https://yourcompany.atlassian.net"
$env:JIRA_EMAIL = "you@company.com"
$env:JIRA_API_TOKEN = "paste-token-here"
$env:JIRA_PROJECT_KEY = "UI"

Do not commit tokens to source control.

## GitHub to Jira Linkage

1. Enable GitHub for Jira app in your Atlassian workspace.
2. Use Jira issue keys in branch names and PR titles.
- Example branch: UI-142-homepage-bluf-accordion
- Example PR title: UI-142 Homepage BLUF accordion and CTA cleanup
3. Verify Jira issue shows linked branch, commit, and PR metadata.

## Recommended Automation Connections

- Jira ticket has links to:
  - PR URL
  - Storybook preview URL
  - Chromatic build URL
  - Lighthouse CI report URL
  - Hotjar insight URL

- Add one Jira checklist section per story:
  - Copy approved
  - Figma approved
  - Mobile QA pass
  - Accessibility pass
  - Performance budget pass

## Minimal Terminal Script Template

Use this script to create Jira issues from VS Code terminal:
- scripts/jira/create-jira-issue.mjs

Run examples:
node scripts/jira/create-jira-issue.mjs "Homepage BLUF accordion" "Implement accordion BLUF section with one top-fold CTA" Story
node scripts/jira/create-jira-issue.mjs "Rewrite coach worksheet" "Complete rewrite to executive-grade tone and outcomes" Task

## Validation Steps

1. Create one test issue with the script.
2. Create one branch named with the Jira key.
3. Open one PR with the Jira key in title.
4. Confirm Jira issue timeline shows branch and PR linkage.
5. Attach one quality artifact link to the issue.

## Security Notes

- Use environment variables for secrets.
- Never store API tokens in repo files.
- Rotate API token if shared accidentally.
