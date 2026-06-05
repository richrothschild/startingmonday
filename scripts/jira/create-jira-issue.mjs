#!/usr/bin/env node

const [,, summary, description = '', issueType = 'Task'] = process.argv

if (!summary) {
  console.error('Usage: node scripts/jira/create-jira-issue.mjs "Summary" "Description" "IssueType"')
  process.exit(1)
}

const baseUrl = process.env.JIRA_BASE_URL
const email = process.env.JIRA_EMAIL
const apiToken = process.env.JIRA_API_TOKEN
const projectKey = process.env.JIRA_PROJECT_KEY

if (!baseUrl || !email || !apiToken || !projectKey) {
  console.error('Missing required env vars: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY')
  process.exit(1)
}

const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')

const body = {
  fields: {
    project: { key: projectKey },
    summary,
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: description
            ? [{ type: 'text', text: description }]
            : [{ type: 'text', text: 'No description provided.' }],
        },
      ],
    },
    issuetype: { name: issueType },
  },
}

const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${auth}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

const text = await response.text()

if (!response.ok) {
  console.error(`Jira create failed: ${response.status}`)
  console.error(text)
  process.exit(1)
}

let data
try {
  data = JSON.parse(text)
} catch {
  console.log(text)
  process.exit(0)
}

console.log(`Created issue: ${data.key}`)
console.log(`${baseUrl}/browse/${data.key}`)
