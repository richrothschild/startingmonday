#!/usr/bin/env node

/**
 * Generates SQL to replace known placeholder Stripe IDs for micro-products/bundles.
 *
 * Usage:
 *   node scripts/fix-billing-placeholder-sql.mjs
 *   node scripts/fix-billing-placeholder-sql.mjs --strict
 */

const strict = process.argv.includes('--strict')
const allowNull = process.argv.includes('--allow-null')

const required = {
  EXEC_INTERVIEW_STRIPE_PRODUCT_ID: process.env.EXEC_INTERVIEW_STRIPE_PRODUCT_ID,
  EXEC_INTERVIEW_STRIPE_PRICE_ID: process.env.EXEC_INTERVIEW_STRIPE_PRICE_ID,
  BOARD_TRANSITION_STRIPE_PRODUCT_ID: process.env.BOARD_TRANSITION_STRIPE_PRODUCT_ID,
  BOARD_TRANSITION_STRIPE_PRICE_ID: process.env.BOARD_TRANSITION_STRIPE_PRICE_ID,
  OUTPLACEMENT_BUNDLE_STRIPE_PRODUCT_ID: process.env.OUTPLACEMENT_BUNDLE_STRIPE_PRODUCT_ID,
  OUTPLACEMENT_BUNDLE_STRIPE_PRICE_ID: process.env.OUTPLACEMENT_BUNDLE_STRIPE_PRICE_ID,
}

const optional = {
  EXEC_INTERVIEW_STRIPE_COUPON_ID: process.env.EXEC_INTERVIEW_STRIPE_COUPON_ID,
  BOARD_TRANSITION_STRIPE_COUPON_ID: process.env.BOARD_TRANSITION_STRIPE_COUPON_ID,
  OUTPLACEMENT_BUNDLE_STRIPE_COUPON_ID: process.env.OUTPLACEMENT_BUNDLE_STRIPE_COUPON_ID,
}

const missing = Object.entries(required)
  .filter(([, v]) => typeof v !== 'string' || v.trim() === '')
  .map(([k]) => k)

if (missing.length > 0 && !allowNull) {
  console.error('Missing required env vars for SQL generation:')
  for (const key of missing) console.error(`- ${key}`)
  console.error('Refusing to generate SQL with NULL replacements. Set all vars or pass --allow-null to override.')
  process.exitCode = 1
  process.exit()
}

function sqlLiteral(value) {
  if (typeof value !== 'string' || value.trim() === '') return 'NULL'
  return `'${value.replace(/'/g, "''")}'`
}

const sql = `-- Billing placeholder fixer (generated ${new Date().toISOString()})
begin;

-- micro_product_prices: exec-interview-narrative-pack
update public.micro_product_prices mpp
set
  stripe_product_id = ${sqlLiteral(required.EXEC_INTERVIEW_STRIPE_PRODUCT_ID)},
  stripe_price_id = ${sqlLiteral(required.EXEC_INTERVIEW_STRIPE_PRICE_ID)},
  stripe_coupon_id = ${sqlLiteral(optional.EXEC_INTERVIEW_STRIPE_COUPON_ID)},
  updated_at = now()
from public.micro_products mp
where mpp.micro_product_id = mp.id
  and mp.slug = 'exec-interview-narrative-pack'
  and (
    mpp.stripe_product_id in ('prod_exec_interview_narrative_pack')
    or mpp.stripe_price_id in ('price_exec_interview_narrative_pack')
    or coalesce(mpp.stripe_coupon_id, '') in ('coupon_exec_launch_2026')
  );

-- micro_product_prices: board-transition-brief-kit
update public.micro_product_prices mpp
set
  stripe_product_id = ${sqlLiteral(required.BOARD_TRANSITION_STRIPE_PRODUCT_ID)},
  stripe_price_id = ${sqlLiteral(required.BOARD_TRANSITION_STRIPE_PRICE_ID)},
  stripe_coupon_id = ${sqlLiteral(optional.BOARD_TRANSITION_STRIPE_COUPON_ID)},
  updated_at = now()
from public.micro_products mp
where mpp.micro_product_id = mp.id
  and mp.slug = 'board-transition-brief-kit'
  and (
    mpp.stripe_product_id in ('prod_board_transition_brief_kit')
    or mpp.stripe_price_id in ('price_board_transition_brief_kit_monthly')
    or coalesce(mpp.stripe_coupon_id, '') in ('coupon_board_launch_2026')
  );

-- micro_product_bundles: outplacement-accelerator-bundle
update public.micro_product_bundles
set
  stripe_product_id = ${sqlLiteral(required.OUTPLACEMENT_BUNDLE_STRIPE_PRODUCT_ID)},
  stripe_price_id = ${sqlLiteral(required.OUTPLACEMENT_BUNDLE_STRIPE_PRICE_ID)},
  stripe_coupon_id = ${sqlLiteral(optional.OUTPLACEMENT_BUNDLE_STRIPE_COUPON_ID)},
  updated_at = now()
where slug = 'outplacement-accelerator-bundle'
  and (
    stripe_product_id in ('prod_outplacement_accelerator_bundle')
    or stripe_price_id in ('price_outplacement_accelerator_bundle_monthly')
    or coalesce(stripe_coupon_id, '') in ('coupon_outplacement_pilot_2026')
  );

commit;
`

if (missing.length > 0) {
  console.error('Warning: some required env vars are missing. SQL includes NULL values for those fields:')
  for (const key of missing) console.error(`- ${key}`)
}

console.log(sql)
