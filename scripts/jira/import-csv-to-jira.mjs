#!/usr/bin/env node

import fs from 'node:fs'

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let i = 0
  let inQuotes = false

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i += 1
      continue
    }

    if (ch === ',') {
      row.push(field)
      field = ''
      i += 1
      continue
    }

    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }

    if (ch === '\r') {
      i += 1
      continue
    }

    field += ch
    i += 1
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function toAdf(description) {
  const lines = (description || '').split('\n')
  const content = lines.map((line) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: line || ' ' }],
  }))

  return {
    type: 'doc',
    version: 1,
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [{ type: 'text', text: 'No description provided.' }] }],
  }
}

function splitCsvList(value) {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function splitDependencyList(value) {
  if (!value) return []
  return value
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatJiraError(response, text, projectKey) {
  let details = text.trim()

  try {
    const parsed = JSON.parse(text)
    if (parsed?.errorMessages || parsed?.errors) {
      const parts = []
      if (Array.isArray(parsed.errorMessages) && parsed.errorMessages.length > 0) {
        parts.push(parsed.errorMessages.join(' | '))
      }
      if (parsed.errors && typeof parsed.errors === 'object') {
        parts.push(JSON.stringify(parsed.errors))
      }
      details = parts.join(' | ') || text.trim()
    }
  } catch {
    // Keep raw text when Jira does not return JSON.
  }

  if (response.status === 404 && projectKey) {
    return `Jira could not find project "${projectKey}" or the current user cannot access it. Response: ${details || 'no response body'}`
  }

  if (response.status === 401 || response.status === 403) {
    return `Jira authentication or permission error (${response.status}). Response: ${details || 'no response body'}`
  }

  return `Jira request failed (${response.status}). Response: ${details || 'no response body'}`
}

async function ensureProjectAccess({ baseUrl, email, apiToken, projectKey }) {
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')
  const response = await fetch(`${baseUrl}/rest/api/3/project/${encodeURIComponent(projectKey)}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(formatJiraError(response, text, projectKey))
  }
}

async function createIssue({ baseUrl, email, apiToken, projectKey, issue, parentKey, storyPointsField, dryRun }) {
  const fields = {
    project: { key: projectKey },
    summary: issue.Summary,
    description: toAdf(issue.Description),
    issuetype: { name: issue['Issue Type'] || 'Task' },
  }

  if (issue.Priority) fields.priority = { name: issue.Priority }

  const labels = splitCsvList(issue.Labels)
  if (labels.length > 0) fields.labels = labels

  const components = splitCsvList(issue.Components)
  if (components.length > 0) {
    fields.components = components.map((name) => ({ name }))
  }

  if (parentKey && issue['Issue Type'] !== 'Epic') {
    fields.parent = { key: parentKey }
  }

  const pointsRaw = issue['Story Points']
  if (storyPointsField && pointsRaw) {
    const points = Number(pointsRaw)
    if (!Number.isNaN(points)) fields[storyPointsField] = points
  }

  const meta = []
  if (issue.Sprint) meta.push(`Sprint: ${issue.Sprint}`)
  if (issue.Owner) meta.push(`Owner role: ${issue.Owner}`)
  if (issue.Dependencies) meta.push(`Dependencies: ${splitDependencyList(issue.Dependencies).join(', ')}`)

  if (meta.length > 0) {
    const current = fields.description.content
    current.push({ type: 'paragraph', content: [{ type: 'text', text: '---' }] })
    for (const line of meta) {
      current.push({ type: 'paragraph', content: [{ type: 'text', text: line }] })
    }
  }

  if (dryRun) {
    return { key: `DRY-${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
  }

  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')
  const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Create failed for "${issue.Summary}": ${formatJiraError(response, text, projectKey)}`)
  }

  return JSON.parse(text)
}

function usage() {
  console.error('Usage: node scripts/jira/import-csv-to-jira.mjs <csvPath> [--dry-run] [--project <KEY>]')
  console.error('Required env vars (non-dry-run): JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY')
  console.error('Optional env var: JIRA_STORY_POINTS_FIELD (e.g. customfield_10016)')
}

async function main() {
  const args = process.argv.slice(2)
  const csvPath = args.find((a) => !a.startsWith('--'))
  const dryRun = args.includes('--dry-run')

  const projectIndex = args.indexOf('--project')
  const projectOverride = projectIndex >= 0 ? args[projectIndex + 1] : undefined

  if (!csvPath) {
    usage()
    process.exit(1)
  }

  const text = fs.readFileSync(csvPath, 'utf8')
  const parsed = parseCsv(text)
  if (parsed.length < 2) {
    throw new Error('CSV has no data rows.')
  }

  const headers = parsed[0]
  const rows = parsed.slice(1).map((r) => {
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] || '').trim()
    })
    return obj
  })

  const baseUrl = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const apiToken = process.env.JIRA_API_TOKEN
  const projectKey = projectOverride || process.env.JIRA_PROJECT_KEY
  const storyPointsField = process.env.JIRA_STORY_POINTS_FIELD

  if (!dryRun && /^your(project|projectkey)?$/i.test(projectKey || '')) {
    throw new Error(`JIRA_PROJECT_KEY looks like a placeholder (${projectKey}). Replace it with the real Jira project key.`)
  }

  if (!dryRun && (!baseUrl || !email || !apiToken || !projectKey)) {
    throw new Error('Missing required env vars: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY')
  }

  if (!dryRun) {
    await ensureProjectAccess({ baseUrl, email, apiToken, projectKey })
  }

  const epics = rows.filter((r) => (r['Issue Type'] || '').toLowerCase() === 'epic')
  const nonEpics = rows.filter((r) => (r['Issue Type'] || '').toLowerCase() !== 'epic')

  console.log(`Importing ${rows.length} issues (${epics.length} epics, ${nonEpics.length} non-epics).`)
  if (dryRun) console.log('Mode: dry-run (no Jira changes will be made).')

  const epicKeyByName = new Map()

  for (const epic of epics) {
    const result = await createIssue({
      baseUrl,
      email,
      apiToken,
      projectKey,
      issue: epic,
      parentKey: undefined,
      storyPointsField,
      dryRun,
    })
    const epicName = epic['Epic Name'] || epic.Summary
    epicKeyByName.set(epicName, result.key)
    console.log(`Created epic ${result.key}: ${epic.Summary}`)
  }

  for (const item of nonEpics) {
    const epicName = item['Epic Name']
    const parentKey = epicName ? epicKeyByName.get(epicName) : undefined

    const result = await createIssue({
      baseUrl,
      email,
      apiToken,
      projectKey,
      issue: item,
      parentKey,
      storyPointsField,
      dryRun,
    })

    const parentInfo = parentKey ? ` (parent ${parentKey})` : ''
    console.log(`Created ${result.key}: ${item.Summary}${parentInfo}`)
  }

  console.log('Import complete.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
