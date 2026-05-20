# Deployment Stalled Runbook

Use this when the latest `main` commit has not produced a successful production deployment within the expected window, or when the Railway build fails before deploy status is emitted.

## First checks

1. Open the latest GitHub Actions or Railway build log.
2. Confirm the commit SHA that is missing from production.
3. Check for disk-space errors, Docker context bloat, or missing production env vars.
4. Verify the latest `main` commit has a corresponding successful deployment status.

## If the build failed with disk space or context issues

1. Confirm `.dockerignore` excludes docs, test artifacts, and other non-runtime assets.
2. Remove or compress unused large assets from `public/` if they are not needed at runtime.
3. Re-run the deploy after the repository is trimmed.

## If the build failed because of environment variables

1. Check Railway production variables.
2. Compare against `scripts/prebuild-guard.mjs` and the production build requirements.
3. Restore the required variables, then redeploy.

## If no deployment status exists

1. Treat the deployment as stalled.
2. Redeploy from the latest successful commit if needed.
3. Confirm the `Deployment Watchdog` workflow is still running.

## After recovery

1. Mark the incident in Slack.
2. Add the failure mode to the reliability notes.
3. Tune the threshold if this was a false positive.