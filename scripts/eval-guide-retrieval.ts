import { promises as fs } from 'fs'
import path from 'path'
import { evaluateGuideRetrieval, type GuideEntry, type RetrievalEvalCase } from '../src/lib/guide-retrieval'

const ROOT = process.cwd()
const EVAL_SET_PATH = path.join(ROOT, 'docs', 'guide-retrieval-eval-set.json')
const GUIDE_INDEX_PATH = path.join(ROOT, 'docs', 'user-guide.index.json')
const REPORT_JSON_PATH = path.join(ROOT, 'docs', 'guide-retrieval-eval.latest.json')
const REPORT_MD_PATH = path.join(ROOT, 'docs', 'guide-retrieval-eval.latest.md')

const STRICT = process.argv.includes('--strict')
const MIN_RECALL_AT3 = 0.82
const MAX_RECALL_AT3_MISSES = 12

type GuideIndex = {
  generatedAt: string
  entries: GuideEntry[]
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

function toPct(input: number): string {
  return `${(input * 100).toFixed(1)}%`
}

async function main() {
  const [evalSet, guideIndex] = await Promise.all([
    readJson<RetrievalEvalCase[]>(EVAL_SET_PATH),
    readJson<GuideIndex>(GUIDE_INDEX_PATH),
  ])

  const summary = evaluateGuideRetrieval(evalSet, guideIndex.entries)
  const generatedAt = new Date().toISOString()

  const report = {
    generatedAt,
    guideGeneratedAt: guideIndex.generatedAt,
    thresholdRecallAt3: MIN_RECALL_AT3,
    summary,
  }

  const markdown = [
    '# Guide Retrieval Evaluation (Latest)',
    '',
    `Generated at: ${generatedAt}`,
    `Guide index generated at: ${guideIndex.generatedAt}`,
    '',
    `- Total cases: ${summary.total}`,
    `- Recall@1: ${toPct(summary.recallAt1)}`,
    `- Recall@3: ${toPct(summary.recallAt3)}`,
    `- Recall@5: ${toPct(summary.recallAt5)}`,
    '',
    '## Misses (Recall@3)',
    ...(summary.misses.length > 0
      ? summary.misses.map((miss, index) => `${index + 1}. Q: ${miss.question}\n   Expected: ${miss.expectedAnyOfUrls.join(', ')}\n   Top URLs: ${miss.topUrls.join(', ') || '(none)'}`)
      : ['- None']),
    '',
  ].join('\n')

  await Promise.all([
    fs.writeFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2), 'utf8'),
    fs.writeFile(REPORT_MD_PATH, markdown, 'utf8'),
  ])

  console.log(`guide-retrieval-eval: recall@3=${toPct(summary.recallAt3)} (${summary.total} cases)`)

  if (STRICT && (summary.recallAt3 < MIN_RECALL_AT3 || summary.misses.length > MAX_RECALL_AT3_MISSES)) {
    console.error(
      `guide-retrieval-eval: strict threshold failed (need recall@3 >= ${toPct(MIN_RECALL_AT3)} and misses <= ${MAX_RECALL_AT3_MISSES})`,
    )
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('guide-retrieval-eval: failed', error)
  process.exitCode = 1
})
