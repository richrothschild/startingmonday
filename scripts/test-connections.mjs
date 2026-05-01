import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

let passed = 0
let failed = 0

function ok(label) {
  console.log(`  ✓ ${label}`)
  passed++
}

function fail(label, err) {
  console.log(`  ✗ ${label}: ${err?.message ?? err}`)
  failed++
}

// ── Supabase ──────────────────────────────────────────────────────────────────
console.log('\nSupabase')
try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { error } = await supabase.from('users').select('id').limit(1)
  if (error) throw error
  ok('service role key — queried users table')
} catch (err) {
  fail('service role key', err)
}

try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  // anon key with RLS should return empty or error — either is fine, 401 is not
  const { error } = await supabase.from('users').select('id').limit(1)
  if (error && error.code === 'PGRST301') throw new Error('JWT invalid')
  ok('anon key — connected')
} catch (err) {
  fail('anon key', err)
}

// ── Anthropic ─────────────────────────────────────────────────────────────────
console.log('\nAnthropic')
try {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 16,
    messages: [{ role: 'user', content: 'Reply with the single word: connected' }],
  })
  const text = msg.content[0].text.trim().toLowerCase()
  if (!text.includes('connected')) throw new Error(`unexpected reply: ${text}`)
  ok('API key — Haiku responded')
} catch (err) {
  fail('API key', err)
}

// ── Resend ────────────────────────────────────────────────────────────────────
console.log('\nResend')
try {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.domains.list()
  if (error) throw error
  const domains = data?.data ?? []
  const verified = domains.filter(d => d.status === 'verified').map(d => d.name)
  if (verified.length === 0) {
    fail('domain verification', new Error(`no verified domains found — DNS may still be propagating`))
  } else {
    ok(`domain verified — ${verified.join(', ')}`)
  }
} catch (err) {
  fail('API key', err)
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
