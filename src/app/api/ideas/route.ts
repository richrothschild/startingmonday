// no-requireAuth: public endpoint - idea submissions and browsing require no account
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkBurstLimit } from '@/lib/burst-limit'

const CATEGORY_VALUES = ['feature_request', 'ui_ux', 'bug', 'performance', 'other'] as const

export async function GET(request: NextRequest) {
  const admin = createAdminClient()
  const params = request.nextUrl.searchParams
  const category = params.get('category')
  const sortBy = params.get('sortBy') === 'rated' ? 'rated' : 'recent'

  let query = (admin as any)
    .from('idea_submissions')
    .select('id, name, category, body, ai_rating, created_at')

  if (category && CATEGORY_VALUES.includes(category as typeof CATEGORY_VALUES[number])) {
    query = query.eq('category', category)
  }

  if (sortBy === 'rated') {
    query = query.order('ai_rating->score', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.limit(20)

  if (error) {
    console.error('[ideas] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
  }

  return NextResponse.json({ ideas: data ?? [] })
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkBurstLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Wait a moment.' }, { status: 429 })
  }

  let name: string, email: string, category: string, body: string
  try {
    const raw = await request.json()
    name     = typeof raw.name     === 'string' ? raw.name.trim()     : ''
    email    = typeof raw.email    === 'string' ? raw.email.trim().toLowerCase() : ''
    category = typeof raw.category === 'string' ? raw.category.trim() : ''
    body     = typeof raw.body     === 'string' ? raw.body.trim()     : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }
  if (!CATEGORY_VALUES.includes(category as typeof CATEGORY_VALUES[number])) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
  }
  if (!body || body.length < 10) {
    return NextResponse.json({ error: 'Idea must be at least 10 characters.' }, { status: 400 })
  }
  if (body.length > 2000) {
    return NextResponse.json({ error: 'Idea must be under 2000 characters.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Rate limit: max 3 submissions per email per day
  const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString()
  const { count } = await (admin as any)
    .from('idea_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', oneDayAgo)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'You have already submitted 3 ideas today. Try again tomorrow.' }, { status: 429 })
  }

  const { error } = await (admin as any).from('idea_submissions').insert({
    name: name || null,
    email,
    category,
    body,
  })

  if (error) {
    console.error('[ideas] POST error:', error)
    return NextResponse.json({ error: 'Failed to save idea. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
