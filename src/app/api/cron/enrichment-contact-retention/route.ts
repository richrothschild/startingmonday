import { type NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/cron-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSlackMessage } from '@/lib/slack'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const dryRun = request.nextUrl.searchParams.get('dry_run') === '1'
  const admin = createAdminClient() as any
  const nowIso = new Date().toISOString()

  const { data: rows, error } = await admin
    .from('contacts')
    .select('id, user_id, name, enrichment_source, enrichment_retention_expires_at, status')
    .in('enrichment_source', ['apollo', 'anthropic'])
    .lte('enrichment_retention_expires_at', nowIso)
    .eq('status', 'active')
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const due = rows ?? []
  if (dryRun || due.length === 0) {
    return NextResponse.json({
      ok: true,
      dryRun,
      dueCount: due.length,
      archivedCount: 0,
    })
  }

  const ids = due.map((row: { id: string }) => row.id)
  const { error: updateError } = await admin
    .from('contacts')
    .update({
      status: 'archived',
      enrichment_deleted_at: nowIso,
      updated_at: nowIso,
    })
    .in('id', ids)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await sendSlackMessage({
    text: [
      '*Enrichment retention cleanup complete*',
      `- Archived contacts: ${ids.length}`,
      '- Sources: apollo, anthropic',
      `- Timestamp: ${nowIso}`,
    ].join('\n'),
  })

  return NextResponse.json({
    ok: true,
    dryRun: false,
    dueCount: due.length,
    archivedCount: ids.length,
  })
}
