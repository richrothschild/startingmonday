import { notFound, redirect } from 'next/navigation'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, hasAdminHeaderAccess } from '@/lib/staff'
import { DiagramsClient } from './diagrams-client'

type Diagram = {
  slug: string
  title: string
  description: string
  category: string
  mermaidCode: string
}

type Category = {
  label: string
  diagrams: Diagram[]
}

const CATEGORY_ORDER: Record<string, { label: string; order: number }> = {
  'User Flows':          { label: 'User Flows',          order: 0 },
  'Authentication':      { label: 'Authentication',      order: 1 },
  'AI and Intelligence': { label: 'AI and Intelligence', order: 2 },
  'Revenue':             { label: 'Revenue',             order: 3 },
  'Infrastructure':      { label: 'Infrastructure',      order: 4 },
}

const DIAGRAM_META: Record<string, { title: string; description: string; category: string }> = {
  'site-overview':         { title: 'Site Overview',           description: 'Full user journey from landing through auth to dashboard',          category: 'User Flows' },
  'user-flows':            { title: 'User Flows',              description: 'All dashboard pages and sub-pages',                                  category: 'User Flows' },
  'onboarding':            { title: 'Onboarding',              description: 'Multi-step form with quick-start and guided paths',                   category: 'User Flows' },
  'authentication':        { title: 'Authentication',          description: 'Email/password, OAuth (Google/Apple), and magic link flows',          category: 'Authentication' },
  'briefing-generation':   { title: 'Briefing Generation',     description: 'Nightly cron job assembles context and delivers via email',           category: 'AI and Intelligence' },
  'prep-brief-generation': { title: 'Prep Brief Generation',   description: 'On-demand streaming brief for a target company',                     category: 'AI and Intelligence' },
  'signals-intelligence':  { title: 'Signals and Intelligence','description': 'Multi-source data ingestion, Haiku classification, user feed',     category: 'AI and Intelligence' },
  'revenue-billing':       { title: 'Revenue and Billing',     description: 'Stripe checkout, webhook processing, and feature tier gating',       category: 'Revenue' },
  'integrations':          { title: 'Integrations',            description: 'All external services connected to the app and worker',              category: 'Infrastructure' },
  'observability-sre':     { title: 'Observability and SRE',   description: 'API guard chain, error handling, and worker reliability',            category: 'Infrastructure' },
}

function extractMermaidCode(markdown: string): string {
  const match = markdown.match(/```mermaid\r?\n([\s\S]*?)```/)
  return match ? match[1].trim() : ''
}

async function loadDiagrams(): Promise<Category[]> {
  const diagramsDir = path.join(process.cwd(), 'docs', 'diagrams')
  let files: string[]
  try {
    files = await readdir(diagramsDir)
  } catch {
    return []
  }
  const slugs = files
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => f.replace('.md', ''))

const diagrams: Diagram[] = []
  for (const slug of slugs) {
    const meta = DIAGRAM_META[slug]
    if (!meta) continue
    const content = await readFile(path.join(diagramsDir, `${slug}.md`), 'utf8')
    const mermaidCode = extractMermaidCode(content)
    if (!mermaidCode) continue
    diagrams.push({ slug, mermaidCode, ...meta })
  }

  const grouped = new Map<string, Diagram[]>()
  for (const d of diagrams) {
    if (!grouped.has(d.category)) grouped.set(d.category, [])
    grouped.get(d.category)!.push(d)
  }

  return Object.entries(CATEGORY_ORDER)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, { label }]) => ({ label, diagrams: grouped.get(key) ?? [] }))
    .filter((c) => c.diagrams.length > 0)
}

export default async function DiagramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const staff = await getStaffMember(user.email ?? '')
  if (!hasAdminHeaderAccess(staff)) notFound()

  const categories = await loadDiagrams()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/dashboard/admin/internal-guide" className="text-[12px] text-orange-500 hover:text-orange-600">
          ← Internal Guide
        </a>
        <h1 className="text-[22px] font-bold text-slate-900 mt-2">Architecture Diagrams</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          {categories.reduce((n, c) => n + c.diagrams.length, 0)} diagrams across {categories.length} categories. Click any card to view the rendered diagram.
        </p>
      </div>
      <DiagramsClient categories={categories} />
    </div>
  )
}
