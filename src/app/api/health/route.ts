import { NextResponse } from 'next/server'

const START_TIME = Date.now()

export async function GET() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    CRON_SECRET: Boolean(process.env.CRON_SECRET),
    OWNER_OR_NOTIFY_EMAIL: Boolean(process.env.OWNER_EMAIL || process.env.NOTIFY_EMAIL),
  }
  const missing = Object.entries(required).filter(([, ok]) => !ok).map(([key]) => key)
  const status = missing.length ? 'degraded' : 'ok'

  return NextResponse.json({
    status,
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'unknown',
    checks: required,
    missing,
  })
}
