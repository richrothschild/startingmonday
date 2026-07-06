// Epic E2 T2.6: Admin API endpoint for label metrics (coverage, latency, breakdowns)
import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/require-auth'

export async function GET(request: NextRequest) {
  const sessionAuth = await requireAuth(request)
  if (!sessionAuth.ok) return sessionAuth.response

  const admin = createAdminClient() as any

  try {
    // Total companies
    const { count: totalCompanies } = await admin
      .from('companies')
      .select('id', { count: 'exact' })
      .is('archived_at', null)

    // Companies with at least one labeled outcome
    const { data: companiesWithLabels } = await admin
      .from('companies')
      .select('distinct canonical_company_id', { count: 'exact' })
      .join('role_openings', 'canonical_company_id', 'canonical_companies.id')
      .neq('canonical_company_id', null)
      .is('archived_at', null)

    // Coverage calculation
    const uniqueCompanies = new Set((companiesWithLabels ?? []).map((r: any) => r.canonical_company_id)).size
    const coveragePercent = totalCompanies ? (uniqueCompanies / totalCompanies) * 100 : 0

    // Median days to opening across all labeled events
    const { data: labeledEvents } = await admin
      .from('event_outcome_labels')
      .select('days_to_opening')
      .order('days_to_opening', { ascending: true })
      .limit(1000)

    const medianDaysToOpening = calculateMedian((labeledEvents ?? []).map((e: any) => e.days_to_opening))

    // Openings by source
    const { data: bySource } = await admin
      .from('role_openings')
      .select('label_source')
      .order('label_source')

    const sourceMap = new Map<string, number>()
    for (const row of bySource ?? []) {
      sourceMap.set(row.label_source, (sourceMap.get(row.label_source) ?? 0) + 1)
    }
    const openingsBySource = [...sourceMap.entries()].map(([source, count]) => ({
      source,
      count,
    }))

    // Openings by role family
    const { data: byFamily } = await admin
      .from('role_openings')
      .select('role_family')
      .order('role_family')

    const familyMap = new Map<string, number>()
    for (const row of byFamily ?? []) {
      familyMap.set(row.role_family, (familyMap.get(row.role_family) ?? 0) + 1)
    }
    const openingsByFamily = [...familyMap.entries()].map(([family, count]) => ({
      family,
      count,
    }))

    // Openings by sector (requires join to canonical_companies)
    const { data: bySector } = await admin
      .from('role_openings')
      .select('canonical_companies(sector)')
      .order('canonical_companies(sector)', { ascending: true })

    const sectorMap = new Map<string, number>()
    for (const row of bySector ?? []) {
      const sector = (row.canonical_companies as any)?.sector ?? 'Unknown'
      sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + 1)
    }
    const openingsBySector = [...sectorMap.entries()]
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count)

    // Source breakdown with precursor stats (last 24h)
    const { data: sourceStats } = await admin
      .from('precursor_stats')
      .select('event_type, n_events, n_preceded, median_days_to_opening')
      .gte('computed_at', new Date(Date.now() - 86400000).toISOString())

    const sourceBreakdown = (sourceStats ?? []).map((row: any) => ({
      source_key: row.event_type,
      total_openings: row.n_preceded,
      median_days_to_opening: row.median_days_to_opening ? Number(row.median_days_to_opening) : null,
      hit_rate: row.n_events > 0 ? row.n_preceded / row.n_events : 0,
    }))

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      stats: {
        totalCompanies: totalCompanies ?? 0,
        companiesWithLabels: uniqueCompanies,
        coveragePercent: Math.round(coveragePercent * 10) / 10,
        medianDaysToOpening,
        openingsBySource,
        openingsByFamily,
        openingsBySector,
        lastUpdated: new Date().toISOString(),
      },
      sourceBreakdown,
      gate: {
        target: '>= 500 labeled openings',
        current: (sourceMap.size > 0 ? Array.from(sourceMap.values()).reduce((a, b) => a + b, 0) : 0),
        status: ((sourceMap.size > 0 ? Array.from(sourceMap.values()).reduce((a, b) => a + b, 0) : 0) >= 500) ? 'pass' : 'in_progress',
      },
    })
  } catch (err) {
    console.error('label-metrics: error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function calculateMedian(values: number[]): number | null {
  if (!values?.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}
