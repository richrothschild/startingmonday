import { notFound, redirect } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, hasAdminHeaderAccess } from '@/lib/staff'
import { InternalGuideClient } from './internal-guide-client'
import bundledIndex from '../../../../../../docs/internal-guide.index.json'

type GuideSection = {
  id: string
  title: string
  body: string
}

type InternalIndexEntry = {
  id: string
  title: string
  body: string
  type: 'architecture' | 'feature' | 'api' | 'code' | 'infra' | 'doc' | 'script' | 'data'
  ref: string
}

type InternalIndexFile = {
  generatedAt?: string
  entries?: InternalIndexEntry[]
}

function parseGuide(markdown: string): GuideSection[] {
  const lines = markdown.split(/\r?\n/)
  const sections: GuideSection[] = []

  let currentTitle = ''
  let currentBody: string[] = []
  let index = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentTitle) {
        sections.push({ id: `section-${index}`, title: currentTitle, body: currentBody.join('\n') })
        index += 1
      }
      currentTitle = line.replace(/^##\s+/, '').trim()
      currentBody = []
      continue
    }

    if (currentTitle) currentBody.push(line)
  }

  if (currentTitle) {
    sections.push({ id: `section-${index}`, title: currentTitle, body: currentBody.join('\n') })
  }

  return sections
}

function typeLabel(type: InternalIndexEntry['type']): string {
  if (type === 'architecture') return 'Architecture'
  if (type === 'feature') return 'Features'
  if (type === 'api') return 'API Surface'
  if (type === 'code') return 'Codebase Modules'
  if (type === 'script') return 'Internal Scripts'
  if (type === 'infra') return 'Infrastructure and Workflows'
  if (type === 'data') return 'Data and Migrations'
  return 'Documentation'
}

function sectionsFromIndex(entries: InternalIndexEntry[]): GuideSection[] {
  const order: InternalIndexEntry['type'][] = ['architecture', 'feature', 'api', 'code', 'script', 'infra', 'data', 'doc']
  const grouped = new Map<InternalIndexEntry['type'], InternalIndexEntry[]>()

  for (const entry of entries) {
    const list = grouped.get(entry.type) ?? []
    list.push(entry)
    grouped.set(entry.type, list)
  }

  const sections: GuideSection[] = []
  let index = 0
  for (const type of order) {
    const list = grouped.get(type) ?? []
    if (list.length === 0) continue
    const preview = list.slice(0, 120)
    const body = preview
      .map((entry) => `- ${entry.title} | ${entry.ref} | ${entry.body}`)
      .join('\n')
    sections.push({
      id: `section-${index}`,
      title: `${typeLabel(type)} (${list.length})`,
      body,
    })
    index += 1
  }

  return sections
}

export default async function InternalGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!hasAdminHeaderAccess(staff)) notFound()
  const staffMember = staff!

  const guidePath = path.join(process.cwd(), 'docs', 'internal-guide.md')
  const markdown = await readFile(guidePath, 'utf8').catch(() => '')
  const markdownSections = parseGuide(markdown)

  const diskIndexPath = path.join(process.cwd(), 'docs', 'internal-guide.index.json')
  const diskIndexRaw = await readFile(diskIndexPath, 'utf8').catch(() => '')
  let diskIndexEntries: InternalIndexEntry[] = []
  if (diskIndexRaw) {
    try {
      const parsed = JSON.parse(diskIndexRaw) as InternalIndexFile
      diskIndexEntries = parsed.entries ?? []
    } catch {
      diskIndexEntries = []
    }
  }

  const bundledEntries = ((bundledIndex as InternalIndexFile).entries ?? []) as InternalIndexEntry[]
  const indexSections = sectionsFromIndex(diskIndexEntries.length > 0 ? diskIndexEntries : bundledEntries)
  const sections = markdownSections.length > 0 ? markdownSections : indexSections

  const safeSections = sections.length > 0
    ? sections
    : [{
        id: 'fallback-0',
        title: 'Internal guide content unavailable',
        body: 'Internal guide content is temporarily unavailable. Retry in a moment or run npm run guide:internal:sync.',
      }]

  return (
    <InternalGuideClient
      sections={safeSections}
      initialQuestion={q?.slice(0, 500) ?? ''}
      staffRole={staffMember.role}
    />
  )
}
