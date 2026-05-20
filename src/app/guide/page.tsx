import { notFound, redirect } from 'next/navigation'
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
  const markdown = await readFile(guidePath, 'utf8')
  const sections = parseGuide(markdown)

  return <GuideClient sections={sections} />
}
