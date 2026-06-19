#!/usr/bin/env node
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const sb = createClient(supabaseUrl, serviceRoleKey)

  const { data: latestCompany, error: latestCompanyErr } = await sb
    .from('companies')
    .select('id, name, user_id')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestCompanyErr || !latestCompany) {
    throw new Error(`No company found for seeding: ${latestCompanyErr?.message ?? 'unknown'}`)
  }

  const { data: user, error: userErr } = await sb
    .from('users')
    .select('id, email')
    .eq('id', latestCompany.user_id)
    .maybeSingle()

  if (userErr || !user) {
    throw new Error(`No user found for company owner ${latestCompany.user_id}: ${userErr?.message ?? 'unknown'}`)
  }

  const company = {
    id: latestCompany.id,
    name: latestCompany.name,
  }

  const nowIso = new Date().toISOString()
  const syntheticTag = 'synthetic_kpi_chain_seed'
  const marker = `synthetic_tag:${syntheticTag}`

  const recommendationProps = {
    recommendation_id: `seed-${Date.now()}`,
    contact_id: null,
    contact_name: 'Synthetic Contact',
    mode: 'contact',
    selected_person_index: 0,
    deduped: false,
    enrichment_source: 'seed',
    synthetic: true,
    synthetic_tag: syntheticTag,
  }

  const relationshipProps = {
    contact_id: null,
    company_id: company.id,
    source: 'synthetic_seed',
    chain_stage: 'relationship_action',
    synthetic: true,
    synthetic_tag: syntheticTag,
  }

  const { data: recEvent, error: recErr } = await sb
    .from('user_events')
    .insert({
      user_id: user.id,
      event_name: 'discover_recommendation_added',
      properties: recommendationProps,
    })
    .select('id, created_at')
    .single()

  if (recErr) throw new Error(`recommendation insert failed: ${recErr.message}`)

  const { data: relEvent, error: relErr } = await sb
    .from('user_events')
    .insert({
      user_id: user.id,
      event_name: 'briefing_action_clicked',
      properties: relationshipProps,
    })
    .select('id, created_at')
    .single()

  if (relErr) throw new Error(`relationship insert failed: ${relErr.message}`)

  const { data: interviewLog, error: interviewErr } = await sb
    .from('company_interview_logs')
    .insert({
      user_id: user.id,
      company_id: company.id,
      interview_date: nowIso.slice(0, 10),
      interview_stage: 'screen',
      questions_asked: 'Synthetic seed question',
      what_landed: `Synthetic seed for KPI chain (${marker})`,
      what_surprised: marker,
      follow_up_needed: marker,
    })
    .select('id, created_at')
    .single()

  if (interviewErr) throw new Error(`interview insert failed: ${interviewErr.message}`)

  console.log(JSON.stringify({
    seeded: true,
    userId: user.id,
    userEmail: user.email,
    companyId: company.id,
    companyName: company.name,
    recommendationEventId: recEvent.id,
    relationshipEventId: relEvent.id,
    interviewLogId: interviewLog.id,
    syntheticTag,
  }, null, 2))
}

main().catch((error) => {
  console.error(`seed-relationship-kpi-chain failed: ${error.message}`)
  process.exitCode = 1
})
