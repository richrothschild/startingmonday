# Daily Change Summary - 2026-06-13

## What Changed

1. Fixed staging-only mobile visual regression failures on `/for-coaches`.
2. Updated CI visual gate environment behavior to keep staging checks aligned with staging rendering.
3. Regenerated staging-correct mobile baselines for `for-coaches` on iPhone and Android.
4. Re-ran local visual gates against staging and validated pass before push.
5. Pushed validated fixes to `staging` and triggered a fresh CI run.

## Why It Changed

1. CI was failing while local runs were passing because environments were not equivalent.
2. Local runs were using production base URL by default; staging CI compares against staging rendering.
3. The visual diff failure was specifically on `/for-coaches` mobile snapshots and exceeded threshold.
4. Without environment parity, visual snapshots can appear flaky even when app logic is unchanged.
5. The update closes that parity gap and makes required checks more trustworthy.

## Technical Detail (Today)

- Commit: `d80caec4` - Fix staging mobile visual parity and refresh for-coaches baselines
- Files updated:
  - `.github/workflows/ci.yml`
  - `tests/e2e/__screenshots__/for-coaches-mobile-iphone.png`
  - `tests/e2e/__screenshots__/for-coaches-mobile-android.png`
- Validation run before push:
  - `npm run test:e2e:mobile-visual` with staging base URL
  - `npm run test:e2e:mobile-elite-visual` with staging base URL

## Current State

- CI run `27488429663` completed with a failure in `Predeploy gates` (`Build` step).
- Mobile visual parity work is validated locally and pushed; remaining CI failure is now outside the visual snapshot mismatch root cause.

