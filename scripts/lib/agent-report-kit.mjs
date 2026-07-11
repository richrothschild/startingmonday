import fs from 'node:fs'
import path from 'node:path'

export function ageMinutes(isoTime) {
  return Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000)
}

export async function ghJson({ owner, repo, token, pathname, userAgent }) {
  if (!owner || !repo || !token) {
    throw new Error('Missing GITHUB_REPOSITORY or GITHUB_TOKEN')
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': userAgent,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} for ${pathname}: ${text.slice(0, 300)}`)
  }

  return res.json()
}

export function writeLatestReportFiles({ jsonPath, markdownPath, report, markdown }) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(markdownPath, markdown, 'utf8')
}

export async function postSlackText({ webhookUrl, text }) {
  if (!webhookUrl) {
    return false
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  return true
}
