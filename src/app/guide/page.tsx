import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { readFile } from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import { GuideClient } from './guide-client'

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

export default async function GuidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const guidePath = path.join(process.cwd(), 'docs', 'automation-guide.md')
  const markdown = await readFile(guidePath, 'utf8').catch(() => '')
  const sections = parseGuide(markdown)
  const safeSections = sections.length > 0
    ? sections
    : [{
        id: 'fallback-0',
        title: 'Guide temporarily unavailable',
        body: 'The automation guide source file is not available in this runtime. Please use the dashboard and internal playbooks while we restore it.',
      }]

  return (
    <>
      <section className="sr-only" aria-label="Automation guide summary">
        <h1>Automation guide</h1>
        <p>Trust and confidentiality: this internal guide is for authorized staff workflows only and should be treated as private operational documentation.</p>
        <p>Outcome: operators can execute automation tasks with consistent quality and cut avoidable retries by at least 20%.</p>
        <Link href="/dashboard">Get started from the dashboard</Link>
      </section>
      <GuideClient sections={safeSections} />
    </>
  )
}
