# ADR 002: Server-Side AI Generation with HTTP Streaming

**Status:** Accepted  
**Date:** 2026-05  
**Deciders:** Richard Rothschild

---

## Context

All AI-generated content (prep briefs, strategy briefs, morning briefings, chat responses) requires calls to the Anthropic Claude API. The generated text can be 500-1200 tokens. Two delivery patterns were evaluated:

1. **Wait-then-deliver** — server calls Claude, waits for the complete response, returns JSON. Clean request/response cycle. User sees nothing until generation is complete (5-15 seconds for a full brief).
2. **Server-side streaming** — server initiates a streaming request to Claude, pipes the response chunks directly to the browser as a text stream. User sees content appear progressively from the first token.

A third option was briefly considered:

3. **Client-side SDK calls** — browser calls Anthropic directly with an API key. Eliminated immediately: the Anthropic API key would be exposed in the browser, and Supabase user data (profile, company context) would need to be passed to the client or fetched again client-side.

## Decision

All AI generation runs server-side. API routes stream the Claude response using `ReadableStream` over HTTP with `Content-Type: text/plain; charset=utf-8`. The client reads the stream incrementally and appends to UI state as chunks arrive.

The server-side boundary means:
- The Anthropic API key never leaves the server
- Supabase user context is fetched server-side (behind RLS) and injected into the prompt without passing sensitive data through the client
- The streaming pattern is consistent across all AI features: the client always reads a text stream, never polls for completion

## Consequences

**Positive:**
- Users see output within 1-2 seconds of generation start, not after 10-15 seconds of waiting. This is the dominant factor in perceived AI responsiveness at executive tier prompts.
- API keys remain server-side. No credential exposure risk from client-side calls.
- User data used in prompts (resume, company context, pipeline) never transits the client in raw form.

**Negative:**
- Streaming responses do not have a natural retry mechanism. If the connection drops mid-stream, the user sees partial content with no automatic recovery. Current behavior: UI shows partial content; user re-clicks Generate.
- Error handling is non-standard: a 200 response can begin streaming and then encounter an error mid-generation. The server writes an error sentinel at the end of the stream; the client checks for it after completion.
- TypeScript types for streaming responses (`ReadableStream`) require care. Body is not JSON-parseable; the client uses a `TextDecoder` to accumulate chunks.

**SLO implication:** The SLO for prep brief generation (P95 time-to-first-content < 10s) is defined against the streaming model. If the API is changed to wait-then-deliver, this SLO definition becomes meaningless. See `tests/e2e/slo.spec.ts`.
