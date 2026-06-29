#!/usr/bin/env node

const argv = process.argv.slice(2)

function getArgValue(name) {
  const prefixed = argv.find((arg) => arg.startsWith(`${name}=`))
  if (prefixed) return prefixed.slice(name.length + 1)
  const index = argv.findIndex((arg) => arg === name)
  if (index >= 0 && argv[index + 1]) return argv[index + 1]
  return undefined
}

const outputJson = argv.includes('--json')
const baseUrl =
  getArgValue('--base-url') ??
  process.env.REQUIRED_GATE_BASE_URL ??
  process.env.MONITOR_BASE_URL ??
  'http://localhost:3000'

const target = `${baseUrl.replace(/\/$/, '')}/features`

function extractCounts(html) {
  const showingMatch = html.match(/Showing\s+(\d+)\s+of\s+(\d+)\s+documents\.?/i)
  if (showingMatch) {
    return {
      renderedCount: Number.parseInt(showingMatch[1], 10),
      totalCount: Number.parseInt(showingMatch[2], 10),
      source: 'showing_line',
    }
  }

  const documentsTileMatch = html.match(/Documents<\/p>\s*<p[^>]*>(\d+)<\/p>/i)
  if (documentsTileMatch) {
    const value = Number.parseInt(documentsTileMatch[1], 10)
    return {
      renderedCount: value,
      totalCount: value,
      source: 'documents_tile',
    }
  }

  return {
    renderedCount: -1,
    totalCount: -1,
    source: 'not_found',
  }
}

async function main() {
  const startedAt = Date.now()
  const response = await fetch(target, { redirect: 'follow' })
  const html = await response.text()
  const counts = extractCounts(html)

  const result = {
    ts: new Date().toISOString(),
    target,
    status: response.status,
    ok: response.status < 400 && counts.totalCount > 0,
    renderedCount: counts.renderedCount,
    totalCount: counts.totalCount,
    source: counts.source,
    durationMs: Date.now() - startedAt,
  }

  if (outputJson) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`Features docs runtime gate: ${result.ok ? 'PASS' : 'FAIL'}`)
    console.log(`Target: ${result.target}`)
    console.log(`Status: ${result.status}`)
    console.log(`Total docs: ${result.totalCount}`)
    console.log(`Rendered docs: ${result.renderedCount}`)
    console.log(`Detection source: ${result.source}`)
  }

  if (!result.ok) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  if (outputJson) {
    console.log(
      JSON.stringify(
        {
          ts: new Date().toISOString(),
          target,
          ok: false,
          error: message,
        },
        null,
        2,
      ),
    )
  } else {
    console.error(`Features docs runtime gate failed: ${message}`)
  }
  process.exit(1)
})
