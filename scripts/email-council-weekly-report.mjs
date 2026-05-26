#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const LOG_PATH = path.join(process.cwd(), '.logs', 'email-council-scores.jsonl')

function summarize(records) {
  const total = records.length
  if (!total) {
    return {
      count: 0,
      blockedRate: 0,
      avgEjes: 0,
      avgOpen: 0,
      avgUnderstand: 0,
      avgReply: 0,
      avgProductLift: 0,
    }
  }

  const sum = records.reduce(
    (acc, r) => {
      acc.blocked += r.blocked ? 1 : 0
      acc.ejes += r.scores?.ejes ?? 0
      acc.open += r.scores?.open ?? 0
      acc.understand += r.scores?.understand ?? 0
      acc.reply += r.scores?.reply ?? 0
      acc.productLift += r.scores?.productLift ?? 0
      return acc
    },
    { blocked: 0, ejes: 0, open: 0, understand: 0, reply: 0, productLift: 0 },
  )

  return {
    count: total,
    blockedRate: Number((sum.blocked / total).toFixed(3)),
    avgEjes: Number((sum.ejes / total).toFixed(1)),
    avgOpen: Number((sum.open / total).toFixed(3)),
    avgUnderstand: Number((sum.understand / total).toFixed(3)),
    avgReply: Number((sum.reply / total).toFixed(3)),
    avgProductLift: Number((sum.productLift / total).toFixed(3)),
  }
}

async function main() {
  let raw = ''
  try {
    raw = await readFile(LOG_PATH, 'utf8')
  } catch {
    console.log(JSON.stringify({ path: LOG_PATH, message: 'No email council score log found.' }, null, 2))
    return
  }

  const all = raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const last7 = all.filter(r => now - new Date(r.ts).getTime() <= 7 * dayMs)
  const prev7 = all.filter(r => {
    const age = now - new Date(r.ts).getTime()
    return age > 7 * dayMs && age <= 14 * dayMs
  })

  const channelStats = new Map()
  for (const r of last7) {
    const channel = r.channel || 'general'
    const list = channelStats.get(channel) ?? []
    list.push(r)
    channelStats.set(channel, list)
  }

  const report = {
    path: LOG_PATH,
    totalRecords: all.length,
    last7d: summarize(last7),
    prev7d: summarize(prev7),
    drift: {
      ejes: Number((summarize(last7).avgEjes - summarize(prev7).avgEjes).toFixed(1)),
      blockedRate: Number((summarize(last7).blockedRate - summarize(prev7).blockedRate).toFixed(3)),
    },
    channels: Array.from(channelStats.entries()).map(([channel, records]) => ({
      channel,
      ...summarize(records),
    })),
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
