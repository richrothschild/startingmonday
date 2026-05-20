import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { getSocialPlanForDate, isSocialPostDay } from '../src/lib/social-posting-plan'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DAYS_AHEAD = Number(process.env.SOCIAL_SEED_DAYS_AHEAD ?? 42)

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

async function run() {
  const today = new Date()
  const todayStr = toDateStr(today)

  const scheduleRows: Array<{ post_date: string; pillar: string; draft_text: string }> = []
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12, 0, 0))

  for (let i = 0; i < DAYS_AHEAD; i++) {
    if (isSocialPostDay(cursor)) {
      const plan = getSocialPlanForDate(cursor)
      if (plan) {
        scheduleRows.push({
          post_date: toDateStr(cursor),
          pillar: plan.pillar,
          draft_text: plan.draftText,
        })
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  if (scheduleRows.length === 0) {
    console.log('No rows generated. Nothing to seed.')
    return
  }

  // Replace future unposted queue so /social reflects the new multi-audience calendar.
  const { error: deleteError } = await admin
    .from('social_posts')
    .delete()
    .gte('post_date', todayStr)
    .eq('is_posted', false)

  if (deleteError) {
    console.error('Failed clearing future unposted posts:', deleteError.message)
    process.exit(1)
  }

  const { error: insertError } = await admin
    .from('social_posts')
    .insert(scheduleRows)

  if (insertError) {
    console.error('Failed inserting scheduled posts:', insertError.message)
    process.exit(1)
  }

  console.log(`Seeded ${scheduleRows.length} social posts from ${scheduleRows[0].post_date} through ${scheduleRows[scheduleRows.length - 1].post_date}.`)
}

run().catch((error) => {
  console.error('Social calendar seed failed:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
