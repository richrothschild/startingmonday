# DEV-EMI-410: Replace Cookie-Based EMI Smoke Auth with Service Token

Status: Backlog
Owner: Platform/Security
Priority: High
Created: 2026-05-26

## Problem

Current EMI post-deploy and weekly validation automation authenticates using user credentials or a session cookie. This is operationally fragile and not ideal for CI security posture.

## Goal

Replace user-session authentication in EMI smoke automation with a non-user, scoped, revocable service-token path.

## Scope

1. Add a secure internal endpoint for EMI smoke triggering that accepts a dedicated token.
2. Validate token server-side with constant-time comparison and rate limiting.
3. Restrict endpoint to post-deploy smoke actions only.
4. Update smoke script and workflows to use service token.
5. Remove dependence on user password/session-cookie env vars in CI.

## Acceptance Criteria

1. `npm run emi:smoke:postdeploy` supports `EMI_SMOKE_TOKEN` and does not require user credentials.
2. `.github/workflows/post-deploy.yml` runs EMI smoke with token auth only.
3. `.github/workflows/emi-weekly-validation.yml` runs EMI smoke with token auth only.
4. Validation remains `status=ok`, `mismatchCount=0`, `nullStreakCount=0` in production checks.
5. Runbook updated with token rotation and incident fallback steps.

## Security Notes

1. Token must be stored only in repository/workflow secrets.
2. Token must be rotatable without code changes.
3. Endpoint must return identical error shape for invalid/missing token.
4. Endpoint must not expose staff session or user identity details.
