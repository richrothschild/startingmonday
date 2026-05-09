#!/usr/bin/env bash
# Apply any unapplied migrations to the Supabase database.
# Tracks applied migrations in a local .migrated file so it is idempotent.
#
# Usage:
#   SUPABASE_DB_URL=postgresql://... ./scripts/migrate.sh
#
# The DB URL is in the Supabase dashboard under Settings > Database > Connection string (URI).
# Store it in .env.local as SUPABASE_DB_URL (never commit it).

set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-}"
if [[ -z "$DB_URL" ]]; then
  echo "ERROR: SUPABASE_DB_URL is not set." >&2
  exit 1
fi

MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"
APPLIED_LOG="$(dirname "$0")/../.migrated"

touch "$APPLIED_LOG"

applied=0
for f in "$MIGRATIONS_DIR"/*.sql; do
  name="$(basename "$f")"
  if grep -qxF "$name" "$APPLIED_LOG"; then
    continue
  fi
  echo "Applying $name..."
  psql "$DB_URL" -f "$f" --single-transaction
  echo "$name" >> "$APPLIED_LOG"
  applied=$((applied + 1))
done

if [[ $applied -eq 0 ]]; then
  echo "All migrations already applied."
else
  echo "$applied migration(s) applied."
fi
