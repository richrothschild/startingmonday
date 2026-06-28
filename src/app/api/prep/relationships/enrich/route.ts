import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, withAuthCookies } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { getEnrichmentProvider, type SuggestedPerson } from '@/lib/enrichment'

/**
 * POST /api/prep/relationships/enrich
 * 
 * Enriches the user's relationships by:
 * 1. Fetching featured companies from weekly plan
 * 2. Calling Apollo enrichment for each company
 * 3. Inserting new people with source='apollo'
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const supabase = await createClient()

    // Get featured companies from this week's plan
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const { data: plan } = await supabase
      .from('dashboard_weekly_plans')
      .select('featured_company_ids')
      .eq('user_id', auth.userId)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .single() as any

    if (!plan?.featured_company_ids || !Array.isArray(plan.featured_company_ids)) {
      return withAuthCookies(NextResponse.json({ message: 'No featured companies found', people: [] }), auth)
    }

    // Fetch featured companies with names
    const { data: companies } = (await supabase
      .from('companies')
      .select('id, name')
      .in('id', plan.featured_company_ids)
      .limit(5)) as any // Limit to avoid too many API calls

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return withAuthCookies(NextResponse.json({ message: 'No companies found', people: [] }), auth)
    }

    // Get enrichment provider (Apollo if enabled, else fallback)
    const provider = getEnrichmentProvider()
    const allSuggestedPeople: Array<SuggestedPerson & { company_id: string; company_name: string }> = []

    // Enrich each company
    for (const company of companies) {
      const suggested = await provider.enrichPeople({
        companyName: company.name,
        sector: 'Technology', // Could be fetched from companies table if needed
        persona: 'executive'
      })

      allSuggestedPeople.push(
        ...suggested.map((p) => ({
          ...p,
          company_id: company.id,
          company_name: company.name
        }))
      )
    }

    // Get existing Apollo suggestions to avoid duplicates
    const { data: existingApollo } = (await supabase
      .from('user_relationships')
      .select('first_name, last_name')
      .eq('user_id', auth.userId)
      .eq('source', 'apollo')) as any

    const existingNames = new Set(
      existingApollo?.map((p: any) => `${p.first_name}${p.last_name}`.toLowerCase()) || []
    )

    // Insert new people as relationships
    const newPeople = allSuggestedPeople.filter(
      (p) => !existingNames.has(`${p.name.split(' ')[0]}${p.name.split(' ')[1]}`.toLowerCase())
    )

    if (newPeople.length > 0) {
      const { error } = await supabase.from('user_relationships').insert(
        newPeople.map((p) => ({
          user_id: auth.userId,
          first_name: p.name.split(' ')[0],
          last_name: p.name.split(' ')[1] || '',
          title: p.title,
          company: p.company_name,
          source: 'apollo' as const,
          discovered_from: {
            via: 'apollo',
            reason: p.reason,
            confidence: p.confidence,
          },
        })) as any
      )

      if (error) {
        console.error('Error inserting Apollo relationships:', error)
        return withAuthCookies(
          NextResponse.json(
            { error: 'Failed to insert relationships' },
            { status: 500 }
          ),
          auth
        )
      }
    }

    return withAuthCookies(
      NextResponse.json({
        message: 'Enrichment complete',
        newCount: newPeople.length,
        people: newPeople,
      }),
      auth
    )
  } catch (error) {
    console.error('Enrichment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Enrichment failed' },
      { status: 500 }
    )
  }
}
