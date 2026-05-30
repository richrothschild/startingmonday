import { notFound, redirect } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, hasAdminHeaderAccess } from '@/lib/staff'
import { InternalGuideClient } from './internal-guide-client'

type GuideSection = {
  id: string
  title: string
  body: string
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
  const sections = parseGuide(markdown)

  const safeSections = sections.length > 0
    ? sections
    : [{
        id: 'fallback-0',
        title: 'Internal guide unavailable',
        body: 'Run npm run guide:internal:sync to rebuild docs/internal-guide.md.',
      }]

  return (
    <InternalGuideClient
      sections={safeSections}
      initialQuestion={q?.slice(0, 500) ?? ''}
      staffRole={staffMember.role}
    />
  )
}
