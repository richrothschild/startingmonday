# Starting Monday — UI Guide

startingmonday.app | Last updated: May 2026

---

## Design Philosophy

Starting Monday is built for senior professionals who distrust anything that feels like a job board. The UI reflects that: no cheerful onboarding mascots, no progress bars counting applications submitted. The aesthetic is editorial — dark backgrounds, tight typography, sparse color. It communicates operational seriousness rather than consumer gamification.

Users at this level want to see more, not less — tables over cards where data warrants it. AI features are task-focused and do not celebrate themselves; briefs and drafts appear as clean text, not chat bubbles. Every AI output streams token-by-token so the user can start reading immediately with no loading spinners waiting for a response.

---

## Marketing / Public Pages

### Landing Page (`/`)

Eyebrow: "At this level, the search is a campaign, not an application."

H1: "Your next role / isn't on a / job board."

Body: Explains the core premise — best roles at this level are filled before posting. Starting Monday watches target companies, surfaces roles early, and prepares users before the first call.

Situation cards — interactive selector that asks "Which of these is you?" before revealing the CTA:

- My role was eliminated (urgent)
- I know exactly what I want (targeted)
- My role was restructured (lateral/level)
- I'm not looking — but Sunday nights feel different (passive)
- I'm ready for the next seat (VP to CIO, Director to VP)
- I've been saying 'starting Monday' for months (re-starter)

Three-step value explanation:

1. Add target companies — we check their career pages three times a week, before roles go public
2. Build your intelligence picture — track contacts, log every conversation, watch for signals
3. Generate a tailored prep brief in 60 seconds

Trial CTA: "Free for 30 days. No credit card."

---

### CIO-Targeted Page (`/for-cio`)

Eyebrow: "The best CIO mandates are created, not posted."

H1: "Your next mandate / won't be / announced."

Identical structure to the main landing page but with CIO-specific copy throughout. Adds a situation card for "I want the next role to lead to a board seat." Steps reframed around "target organizations" (not just companies), relationship management precision, and walking in fully prepared.

---

### VP-Targeted Page (`/for-vp`)

Same structure as `/for-cio`, tuned for VP-level candidates.

---

### Resume Optimizer (`/optimize`)

Public (unauthenticated) tool. User pastes a job description and their resume; receives AI-generated suggestions. Entry point for non-subscribers to experience the product. No rate limiting on unauthenticated use (intentional — it's a lead generation tool).

---

### Demo (`/demo`)

Walkthrough using pre-canned demo content — shows the dashboard experience without requiring signup. Uses `isDemoUser()` check to serve DEMO_STRATEGY_BRIEF, DEMO_PREP_BRIEFS, and other static content.

---

## Auth Flow

### Signup (`/(auth)/signup`)

Standard email/password signup via Supabase Auth. Creates user record, initializes 30-day trial, redirects to onboarding.

### Login (`/(auth)/login`)

Email/password. Redirects to dashboard on success.

### Onboarding (`/onboarding`)

Guided setup after first signup. Collects:

- LinkedIn profile import (parses profile into structured data: target titles, sectors, locations, positioning summary, LinkedIn headline)
- Resume upload (PDF or Word — parsed and stored as text + structured JSON)
- Search preferences (briefing time, timezone, briefing days)

---

## Dashboard Layout

All authenticated pages live under `/(dashboard)/dashboard`. The layout includes a persistent left sidebar with navigation and a main content area.

Sidebar navigation sections:

- Dashboard (home)
- Companies (pipeline)
- Contacts
- Signals
- Strategy
- Chat
- Profile

---

## Dashboard Home (`/dashboard`)

Primary view: The user's active pipeline at a glance. Companies in each stage (Watching, Researching, Applied, Interviewing, Offer). Momentum score (weekly engagement metric, 0–100). Pending follow-ups surfaced prominently.

Empty state (new users): Prompts to add first company and complete profile setup.

Getting Started (`/dashboard/start`): Step-by-step guide for new users — add companies, import LinkedIn, set briefing preferences.

---

## Companies (Pipeline)

### Company List / Pipeline Board

The core organizing view. Companies displayed by stage:

- Watching — monitoring but no active outreach
- Researching — active intelligence gathering
- Applied — application submitted
- Interviewing — in process
- Offer — received offer

Users drag or update company stage. Each company shows: name, sector, last scan date, fit score, number of contacts.

### Add Company (`/dashboard/companies/new`)

Form: company name, career page URL, sector, initial fit score, notes. Triggers an immediate scan on creation.

### Company Detail (`/dashboard/companies/[id]`)

Full company workspace. Tabs and sections:

- Overview: notes, stage, contacts at this company
- Scan results: most recent career page scan with matching roles, fit scores, and AI summaries
- Signals: intelligence events (funding rounds, executive hires and departures, acquisitions, expansions, etc.)
- Documents: attached documents (job description, annual report, press, etc.)
- Contacts: people at this company tracked in the system
- Drafts: outreach emails and cover letters generated for this company

### Interview Prep Brief (`/dashboard/companies/[id]/prep`)

The flagship feature. A multi-section brief generated by AI from company scan results, company signals, attached documents, the user's resume and positioning, and any contacts at the company.

Sections generated (each streams independently):

1. Full brief (overview, context, positioning)
2. Why here (company-specific talking points)
3. Likely questions (with suggested answers keyed to user's background)
4. Company priorities
5. Challenges
6. Leadership insights
7. Competitive landscape
8. Tech stack analysis
9. Wins and background brief

User can regenerate individual sections. Brief text is copyable.

---

## Contacts (`/dashboard/contacts`)

List of contacts across all companies. Columns: name, title, firm, channel (LinkedIn/referral/cold/inbound/event), status, last contacted, next follow-up. Sortable and filterable. Each row links to contact detail.

### Outreach Drafting (`/dashboard/contacts/[id]/outreach`)

Generates a personalized outreach email or LinkedIn message. Incorporates the contact's role and company, recent signals at their company, the user's positioning and relevant background, and a draft tone selection. Output streams directly. User can edit inline and copy to clipboard.

---

## Signals (`/dashboard/signals`)

Company intelligence feed. Events sourced by the worker's signal job, classified by Claude, and surfaced here. Signal types: funding, executive departure, executive hire, acquisition, expansion, layoffs, IPO, new product, award.

Each signal shows: company, signal type (badge), date, summary, and an outreach angle explaining why this signal is relevant to the user's search.

---

## Strategy Brief (`/dashboard/strategy`)

A full search strategy document generated by Opus (highest-capability model). Takes the user's full profile — target roles, sectors, locations, resume, positioning — and produces a structured strategy including target company approach, positioning narrative, outreach sequencing, and key risks and mitigations. Streams to the page. Follow-up questions allowed after generation.

---

## AI Chat (`/dashboard/chat`)

Persistent AI advisor. The assistant has full context: user's resume, pipeline state, recent signals, contacts. The assistant can take actions directly through tool use: update a company's pipeline stage, add a follow-up reminder, update company notes. Chat history persists across sessions (stored in `conversations` table with token count tracking).

---

## Profile (`/dashboard/profile`)

User settings and search profile. Sections:

- Full name, headline
- Resume (view parsed text, re-upload)
- Target titles (array)
- Target sectors (array)
- Target locations (array)
- Positioning summary (freetext — used as AI context)
- Daily briefing preferences (time, timezone, days of week)
- Search status

### Resume Tailor (`/dashboard/profile/tailor`)

Paste a specific job description. AI generates a tailored version of the user's resume positioning for that role — revised bullets, adjusted emphasis. Output streams. User can download as DOCX.

---

## Daily Briefing

Email delivery: Assembled by the worker each morning at the user's configured time and timezone. Contains new matching roles detected from scan results, company signals surfaced since the last briefing, and pending follow-ups due today or overdue.

In-app view (`/dashboard/briefing`): Same content viewable in the dashboard.

---

## Settings & Billing (`/settings/billing`)

Subscription management:

- Current plan, status, billing period
- Upgrade and downgrade options (Passive and Active)
- Pause subscription
- Access Stripe Customer Portal (payment method, invoice history)
- Trial countdown if in trial period

Feature gating: Features unavailable on the current tier display an upgrade prompt inline — for example, trying to open a prep brief on Passive shows the Active upgrade card. The UI does not hide the navigation; it shows what's possible at the next tier.

---

## Subscription Gating

Features are gated at the API layer (`requireFeatureAccess`) and displayed conditionally in the UI. Users on the free or passive tier see the features but encounter upgrade prompts when they attempt to use gated capabilities.

Paused accounts: All AI features disabled. User sees a "resume subscription" prompt.

Past due accounts: User sees a payment failure banner with a link to update payment method.

---

## UI Component Conventions

Streaming output is displayed in `<pre>` or prose containers with a blinking cursor during generation. Errors written as `__ERROR__<message>` are caught and displayed as inline error states.

Toast notifications are lightweight, dismissable, and non-blocking. Loading states use skeleton loaders for data-fetched content; streaming replaces spinners for AI content. Forms use server actions or fetch to API routes with validation inline — red border plus helper text.

The product is responsive but optimized for desktop. The primary use case is a professional at their laptop preparing for a call.
