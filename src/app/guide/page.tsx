import { redirect } from 'next/navigation'
import Link from 'next/link'
import { readFile } from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { GuideClient } from './guide-client'
import bundledIndex from '../../../docs/user-guide.index.json'

type GuideSection = {
  id: string
  title: string
  body: string
}

type UserGuideIndexEntry = {
  id: string
  title: string
  body: string
  type: 'get-started' | 'feature' | 'how-to' | 'api' | 'article'
  url: string
}

type UserGuideIndexFile = {
  generatedAt?: string
  entries?: UserGuideIndexEntry[]
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
        sections.push({
          id: `section-${index}`,
          title: currentTitle,
          body: currentBody.join('\n'),
        })
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

function typeLabel(type: UserGuideIndexEntry['type']): string {
  if (type === 'get-started') return 'Get Started'
  if (type === 'feature') return 'Features'
  if (type === 'how-to') return 'How-To Playbooks'
  if (type === 'api') return 'API and Automation'
  return 'Starting Monday Articles'
}

function sectionsFromIndex(entries: UserGuideIndexEntry[]): GuideSection[] {
  const order: UserGuideIndexEntry['type'][] = ['get-started', 'feature', 'how-to', 'api', 'article']
  const grouped = new Map<UserGuideIndexEntry['type'], UserGuideIndexEntry[]>()

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
    const body = list
      .slice(0, 120)
      .map((entry) => `- [${entry.title}](${entry.url}) - ${entry.body}`)
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

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const guidePath = path.join(process.cwd(), 'docs', 'user-guide.md')
  const markdown = await readFile(guidePath, 'utf8').catch(() => '')
  const markdownSections = parseGuide(markdown)

  const diskIndexPath = path.join(process.cwd(), 'docs', 'user-guide.index.json')
  const diskIndexRaw = await readFile(diskIndexPath, 'utf8').catch(() => '')
  let diskIndexEntries: UserGuideIndexEntry[] = []
  if (diskIndexRaw) {
    try {
      const parsed = JSON.parse(diskIndexRaw) as UserGuideIndexFile
      diskIndexEntries = parsed.entries ?? []
    } catch {
      diskIndexEntries = []
    }
  }

  const bundledEntries = ((bundledIndex as UserGuideIndexFile).entries ?? []) as UserGuideIndexEntry[]
  const indexSections = sectionsFromIndex(diskIndexEntries.length > 0 ? diskIndexEntries : bundledEntries)
  const sections = markdownSections.length > 0 ? markdownSections : indexSections

  const safeSections = sections.length > 0
    ? sections
    : [{
        id: 'fallback-0',
        title: 'Guide content unavailable',
        body: 'Guide content is temporarily unavailable. Retry shortly or run npm run guide:user:sync.',
      }]

  return (
    <>
      <section className="sr-only" aria-label="Automation guide summary">
        <h1>Starting Monday user guide</h1>
        <p>Search for features, ask questions in guide chat, and open step-by-step workflows in one place.</p>
        <p>Outcome: users can self-serve onboarding, feature discovery, and troubleshooting without waiting for support.</p>
        <Link href="/dashboard/help">Get started from Help</Link>
      </section>
      <GuideClient sections={safeSections} initialQuestion={q?.slice(0, 500) ?? ''} />
    </>
  )
}
