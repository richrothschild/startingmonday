import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/require-auth'
import { FeedbackSubmitSchema, firstZodError } from '@/lib/schemas'
import { NextRequest, NextResponse } from 'next/server'
import { withApiTelemetry } from '@/lib/telemetry'

async function getHandler(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // user may be null — browsing is public, voting/submitting requires auth

  try {
    const searchParams = req.nextUrl.searchParams
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'recent' // recent, votes, comments
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('feedback_items')
      .select(`
        *,
        user_profiles:user_id(full_name, email)
      `, { count: 'exact' })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
    }

    // Apply sorting
    if (sortBy === 'votes') {
      query = query.order('vote_count', { ascending: false })
    } else if (sortBy === 'comments') {
      query = query.order('comment_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1) as any

    if (error) {
      console.error('[feedback] list error:', error)
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
    }

    // Check user votes only when authenticated
    const itemIds = (data || []).map((item: any) => item.id)
    if (user && itemIds.length > 0) {
      const { data: userVotes } = await supabase
        .from('feedback_votes')
        .select('item_id')
        .in('item_id', itemIds)
        .eq('user_id', user.id)

      const votedItemIds = new Set((userVotes || []).map((v: any) => v.item_id))
      const enhancedData = (data || []).map((item: any) => ({
        ...item,
        user_voted: votedItemIds.has(item.id),
      }))

      return NextResponse.json({ items: enhancedData, count: count || 0 })
    }

    return NextResponse.json({ items: data || [], count: count || 0 })
  } catch (err) {
    console.error('[feedback] list exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function postHandler(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { userId } = auth

  const authJson = (payload: unknown, status: number) =>
    NextResponse.json(payload, { status })

  try {
    const body = await req.json()
    
    // Validate input
    const parseResult = FeedbackSubmitSchema.safeParse(body)
    if (!parseResult.success) {
      return authJson(
        { error: firstZodError(parseResult.error) },
        400
      )
    }

    const { title, body: feedbackBody, category, screenshot_url } = parseResult.data

    // Check rate limit: max 5 feedback submissions per day per user
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('feedback_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('created_at', oneDayAgo)

    if ((recentCount || 0) >= 5) {
      return authJson(
        { error: 'You can submit a maximum of 5 feedback items per day' },
        429
      )
    }

    const { data: feedbackItem, error } = await (supabase
      .from('feedback_items') as any)
      .insert({
        type: 'feedback',
        title,
        body: feedbackBody,
        category,
        screenshot_url: screenshot_url || null,
        user_id: userId,
        status: 'new',
      })
      .select('*')
      .single() as any

    if (error) {
      console.error('[feedback] submit error:', error)
      return authJson({ error: 'Failed to submit feedback' }, 500)
    }

    return authJson(
      { 
        item: feedbackItem,
        message: 'Thank you for your feedback! We\'ll review it within 24 hours.'
      },
      201
    )
  } catch (err) {
    console.error('[feedback] submit exception:', err)
    return authJson({ error: 'Internal server error' }, 500)
  }
}

export const GET = withApiTelemetry('/api/feedback/items', getHandler)
export const POST = withApiTelemetry('/api/feedback/items', postHandler)
