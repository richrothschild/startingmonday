# ADR 003: Separate Railway Worker Service for Background Jobs

**Status:** Accepted  
**Date:** 2026-05  
**Deciders:** Richard Rothschild

---

## Context

Starting Monday runs background jobs that cannot run inside the web application's request-response cycle:

- **Intelligence scanning** — fetches and parses news, 8-K filings, exec departure data, and career pages for every company being tracked. Runs every 48 hours per company, may touch thousands of companies.
- **Morning briefing generation** — calls Claude to synthesize overnight signals into a personalized briefing email. Runs nightly.
- **Weekly digest, commitment cadence, stall checks** — additional scheduled jobs with distinct timing and failure tolerance.

Three patterns were evaluated:

1. **Vercel/Railway cron on the web service** — invoke an API route on a schedule. Simple. Problem: Next.js API routes time out at 30 seconds (Vercel) or per request limit (Railway). Intelligence scanning for a single company can take 2-5 minutes.
2. **Serverless functions (Vercel Edge, Lambda)** — managed scaling, per-invocation billing. Time limit constraints remain. Cold starts on a high-volume job run add up.
3. **Separate long-running process (Railway worker)** — always-on Node.js process with its own Railway service. No timeout constraints. Can hold in-process state across job runs (rate limit counters, connection pools). Deployed and scaled independently of the web service.

## Decision

Background jobs run in a separate Railway worker service (`worker/`). The worker is an Express-like Node.js process that exposes an internal HTTP API for job triggering and runs its own scheduler.

The web service never runs long-lived operations. Any operation that might exceed 20 seconds is moved to the worker. The web service communicates with the worker via internal HTTP calls (Railway private networking).

Jobs that are both time-sensitive and short (< 15s) may run as web API routes if they are user-triggered (e.g., "Scan this company now" button). The worker handles scheduled and background work.

## Consequences

**Positive:**
- No timeout constraints on background jobs. A scanning job that takes 3 minutes runs to completion.
- Worker failures do not affect web service availability. A crashed scanner does not take down the user-facing application.
- Worker can be scaled independently. If intelligence scanning volume grows, scaling the worker does not require scaling web service instances.
- Independent deployment: worker updates ship without redeploying the web service.

**Negative:**
- Two services to monitor, deploy, and pay for. Railway charges per service, not just per compute.
- Internal HTTP between web and worker adds a network hop for job-triggering calls. Failure in the worker does not propagate a useful error back to the web service user.
- Shared Supabase database connection pool is split across two services. High worker load can starve web service connections if pool limits are not sized correctly.
- Code sharing between `src/` (Next.js) and `worker/` requires care: both import from `src/lib/` but the worker cannot import Next.js server components or app router internals.

**Current limits:** Worker has no horizontal scaling (single instance). At high user volume, the scanning queue may back up. The scheduler in `worker/src/scheduler.ts` runs jobs sequentially within each job type. Parallel execution would require a proper queue (BullMQ, Inngest) — deferred to a later architectural decision.
