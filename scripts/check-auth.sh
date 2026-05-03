#!/bin/sh
# Verifies every API route (except webhooks/) imports requireAuth.
# Run in CI: sh scripts/check-auth.sh
FAIL=0
for f in $(find src/app/api -name "route.ts" | grep -v "webhooks/"); do
  if ! grep -q "requireAuth" "$f"; then
    echo "MISSING requireAuth: $f"
    FAIL=1
  fi
done
if [ "$FAIL" -ne 0 ]; then
  echo ""
  echo "All /api routes outside webhooks/ must import and call requireAuth."
  exit 1
fi
echo "All API routes have requireAuth."
