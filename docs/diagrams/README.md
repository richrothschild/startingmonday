# Architecture Diagrams

Visual reference for the StartingMonday codebase. Renders natively on GitHub. Ask Claude Code to pull up any diagram by name.

---

## User Flows

| Diagram | Description |
|---|---|
| [Site Overview](site-overview.md) | Full user journey from landing page through auth to dashboard |
| [User Flows](user-flows.md) | All 13 dashboard pages and sub-pages |
| [Onboarding](onboarding.md) | Multi-step onboarding form with quick-start and guided paths |

## Authentication

| Diagram | Description |
|---|---|
| [Authentication](authentication.md) | Email/password, OAuth (Google/Apple), and magic link flows |

## AI and Intelligence

| Diagram | Description |
|---|---|
| [Briefing Generation](briefing-generation.md) | Nightly cron → context assembly → Claude → email delivery |
| [Prep Brief Generation](prep-brief-generation.md) | On-demand streaming brief for a target company |
| [Signals and Intelligence](signals-intelligence.md) | Multi-source data ingestion → Haiku classification → user feed |

## Revenue

| Diagram | Description |
|---|---|
| [Revenue and Billing](revenue-billing.md) | Stripe checkout, webhook processing, and feature tier gating |

## Infrastructure

| Diagram | Description |
|---|---|
| [Integrations](integrations.md) | All external services wired to the app and worker |
| [Observability and SRE](observability-sre.md) | API guard chain, error handling, and worker reliability |
