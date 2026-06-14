import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('src/app')

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out)
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      out.push(full)
    }
  }
  return out
}

function toRoute(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/')
  const parts = rel.split('/')
  parts.pop()
  const route = '/' + parts.join('/')
  return route === '/' ? '/' : route
}

function isPublicRoute(rel) {
  if (rel.startsWith('(dashboard)/')) return false
  if (rel.startsWith('(auth)/')) return false
  if (rel.startsWith('api/')) return false
  if (rel.startsWith('mark-review/')) return false
  if (rel.startsWith('partners/mauricio-kickoff/')) return false
  if (rel.startsWith('mauricio-kickoff')) return false
  return true
}

function scorePage(content) {
  const contrastRiskCount = (content.match(/text-(?:slate|gray|zinc|neutral)-(?:300|400)(?:\/[0-9]{2,3})?/g) || []).length
  const pastelRiskCount = (content.match(/text-(?:emerald|green|teal)-(?:100|200)(?:\/[0-9]{2,3})?/g) || []).length
  const transparentRoot = /overflow-hidden\s+bg-transparent|bg-transparent\s+font-sans/.test(content)
  const gradientToTransparent = /rgba\(15,23,42,0\)_100%|rgba\(15,23,42,0\)_/.test(content)
  const mixedExtremeSurfaces = /bg-white/.test(content) && /bg-slate-900/.test(content)
  const hasStrongPremiumBase = /bg-slate-950/.test(content)

  let score = 100
  score -= Math.min(30, contrastRiskCount * 1.4)
  score -= Math.min(16, pastelRiskCount * 1.9)
  if (transparentRoot) score -= 12
  if (gradientToTransparent) score -= 10
  if (mixedExtremeSurfaces) score -= 4
  if (hasStrongPremiumBase) score += 3

  score = Math.max(45, Math.min(98, Math.round(score)))

  return {
    score,
    metrics: {
      contrastRiskCount,
      pastelRiskCount,
      transparentRoot,
      gradientToTransparent,
      mixedExtremeSurfaces,
      hasStrongPremiumBase,
    },
  }
}

const files = walk(root)
const rows = []
for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  if (!isPublicRoute(rel)) continue
  const content = fs.readFileSync(file, 'utf8')
  const route = toRoute(file)
  const { score, metrics } = scorePage(content)
  rows.push({ route, file: file.replace(/\\/g, '/'), score, ...metrics })
}

rows.sort((a, b) => a.score - b.score || a.route.localeCompare(b.route))

const result = {
  generatedAt: new Date().toISOString(),
  totalPublicPages: rows.length,
  worst10: rows.slice(0, 10),
  all: rows,
}

const outFile = path.resolve('summary_results.txt')
fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n')
console.log(`Wrote visual look audit for ${rows.length} public pages to ${outFile}`)
console.log('Worst 10 routes:')
for (const row of result.worst10) {
  console.log(`- ${row.route} :: ${row.score}`)
}
