import { z } from 'zod'

export const GrillMeSessionModeSchema = z.enum(['focused', 'stress', 'board'])

export const GrillMeSessionCreateSchema = z.object({
  topic: z.string().min(5).max(400),
  goal: z.string().min(5).max(400),
  intents: z.string().max(3000).optional().default(''),
  context: z.string().max(8000).optional().default(''),
  mode: GrillMeSessionModeSchema.default('focused'),
})

export const GrillMeSessionRespondSchema = z.object({
  answer: z.string().min(1).max(12000),
})

export const GrillMeTurnSynthesisSchema = z.object({
  captured: z.string().min(20).max(3000),
  councilVoices: z.array(z.object({
    seat: z.string().min(2).max(120),
    reaction: z.string().min(10).max(400),
  })).min(2).max(4),
  consequenceChains: z.array(z.object({
    owner: z.string().min(2).max(120),
    first: z.string().min(4).max(300),
    second: z.string().min(4).max(300),
    third: z.string().min(4).max(300),
    risk: z.enum(['low', 'medium', 'high', 'critical']),
  })).max(4),
  flags: z.array(z.object({
    description: z.string().min(4).max(400),
    owner: z.string().min(2).max(120),
  })).max(4),
  ceoSummary: z.object({
    currentStance: z.string().min(2).max(120),
    confidencePct: z.number().int().min(0).max(100),
    primaryThesis: z.string().min(6).max(300),
    biggestOpenRisk: z.string().min(6).max(300),
    nextAction: z.string().min(6).max(300),
    councilConsensus: z.string().min(6).max(400),
    councilConflicts: z.string().min(6).max(400),
  }),
  councilVerdicts: z.record(z.string(), z.enum(['green', 'yellow', 'red'])).default({}),
  nextQuestion: z.string().min(10).max(400),
})

export type GrillMeTurnSynthesis = z.infer<typeof GrillMeTurnSynthesisSchema>

export function makeQuestionId(n: number): string {
  return `Q-${String(n).padStart(3, '0')}`
}

export function makeFlagId(n: number): string {
  return `F-${String(n).padStart(3, '0')}`
}

export function slugifyBrainstorm(topic: string): string {
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  const safe = slug.length > 0 ? slug : 'executive-brief'
  return `${safe}-brainstorm`
}

export function initialArtifactMarkdown(topic: string, goal: string, firstQuestion: string): string {
  return `# ${topic}: Brainstorm / Discovery Notes
Date: ${new Date().toISOString().slice(0, 10)} Â· Goal: ${goal}

<!-- STATE -->
next_id: Q-001
entries: 0
open_flags: 0
council_verdicts_updated: false
ceo_summary_updated: false
<!-- /STATE -->

---

## CEO Summary
Last updated: â€”
Current stance: â€”
Confidence: â€”
Primary thesis: â€”
Biggest open risk: â€”
Single most important next action: â€”
Council consensus: â€”
Council conflicts: â€”

---

## Council Verdicts Dashboard
| Seat | Stance | Last updated |
|------|--------|-------------|
| ðŸ”§ Operator | ðŸŸ¡ | â€” |
| ðŸ’° Capitalist | ðŸŸ¡ | â€” |
| ðŸ» Skeptic | ðŸŸ¡ | â€” |
| ðŸ-ï¸ Builder | ðŸŸ¡ | â€” |
| ðŸ“£ Storyteller | ðŸŸ¡ | â€” |
| ðŸ“Š Numbers Person | ðŸŸ¡ | â€” |
| âš–ï¸ Ethicist/Risk | ðŸŸ¡ | â€” |
| ðŸŽ¯ Domain Expert | ðŸŸ¡ | â€” |
| âš”ï¸ Competitor | ðŸŸ¡ | â€” |
| ðŸ”® Dalio | ðŸŸ¡ | â€” |
| ðŸŽ² Duke | ðŸŸ¡ | â€” |
| ðŸ§  Munger | ðŸŸ¡ | â€” |
| ðŸ“¦ Bezos | ðŸŸ¡ | â€” |
| ðŸªž Kahneman | ðŸŸ¡ | â€” |

---

## Assumption Registry
| ID | Assumption | Confidence | Blast radius | Owner | Status |
|----|-----------|-----------|-------------|-------|--------|
| A-001 | If this is false, the strategy fails | unknown | high | Founder | open |

---

## Q&A Log

### Q-001 â€” Intent and thesis
- **Asked:** ${firstQuestion}
- **Captured:** â€”
- **Council voices:**
  > **Operator:** *Name the owner and deliverable for this decision.*
- **2nd/3rd order consequences:**
  - 1st: â€” â†’ 2nd: â€” â†’ 3rd: â€” *(tagged: Operator)*
- **Flags:** â€”

---

## Open Flags
- None
`
}

type EntryLike = {
  question_id: string
  asked: string
  answer: string
  captured: string
  council_voices: Array<{ seat: string; reaction: string }>
  consequence_chains: Array<{ owner: string; first: string; second: string; third: string; risk: string }>
}

type FlagLike = {
  flag_id: string
  description: string
  owner: string
  status: 'open' | 'closed'
}

export function renderArtifactMarkdown(args: {
  topic: string
  goal: string
  entries: EntryLike[]
  flags: FlagLike[]
  councilVerdicts: Record<string, 'green' | 'yellow' | 'red'>
  ceoSummary: {
    lastUpdated: string
    currentStance: string
    confidencePct: number
    primaryThesis: string
    biggestOpenRisk: string
    nextAction: string
    councilConsensus: string
    councilConflicts: string
  }
  nextQuestionId: string
}): string {
  const entriesCount = args.entries.length
  const openFlags = args.flags.filter(flag => flag.status === 'open')

  const verdictRows = [
    ['ðŸ”§ Operator', councilEmoji(args.councilVerdicts.Operator), args.ceoSummary.lastUpdated],
    ['ðŸ’° Capitalist', councilEmoji(args.councilVerdicts.Capitalist), args.ceoSummary.lastUpdated],
    ['ðŸ» Skeptic', councilEmoji(args.councilVerdicts.Skeptic), args.ceoSummary.lastUpdated],
    ['ðŸ-ï¸ Builder', councilEmoji(args.councilVerdicts.Builder), args.ceoSummary.lastUpdated],
    ['ðŸ“£ Storyteller', councilEmoji(args.councilVerdicts.Storyteller), args.ceoSummary.lastUpdated],
    ['ðŸ“Š Numbers Person', councilEmoji(args.councilVerdicts['Numbers Person']), args.ceoSummary.lastUpdated],
    ['âš–ï¸ Ethicist/Risk', councilEmoji(args.councilVerdicts['Ethicist/Risk']), args.ceoSummary.lastUpdated],
    ['ðŸŽ¯ Domain Expert', councilEmoji(args.councilVerdicts['Domain Expert']), args.ceoSummary.lastUpdated],
    ['âš”ï¸ Competitor', councilEmoji(args.councilVerdicts.Competitor), args.ceoSummary.lastUpdated],
    ['ðŸ”® Dalio', councilEmoji(args.councilVerdicts.Dalio), args.ceoSummary.lastUpdated],
    ['ðŸŽ² Duke', councilEmoji(args.councilVerdicts.Duke), args.ceoSummary.lastUpdated],
    ['ðŸ§  Munger', councilEmoji(args.councilVerdicts.Munger), args.ceoSummary.lastUpdated],
    ['ðŸ“¦ Bezos', councilEmoji(args.councilVerdicts.Bezos), args.ceoSummary.lastUpdated],
    ['ðŸªž Kahneman', councilEmoji(args.councilVerdicts.Kahneman), args.ceoSummary.lastUpdated],
  ]

  const qBlocks = args.entries.map(entry => {
    const voices = entry.council_voices.map(voice => `  > **${voice.seat}:** *${voice.reaction}*`).join('\n') || '  > **Operator:** *No council reaction recorded.*'
    const consequences = entry.consequence_chains.map(chain => `  - 1st: ${chain.first} â†’ 2nd: ${chain.second} â†’ 3rd: ${chain.third} *(tagged: ${chain.owner}, risk: ${chain.risk})*`).join('\n') || '  - 1st: â€” â†’ 2nd: â€” â†’ 3rd: â€” *(tagged: Operator)*'
    const entryFlags = args.flags.filter(flag => flag.flag_id && entry.captured.includes(flag.flag_id))
    const flagText = entryFlags.length > 0
      ? entryFlags.map(flag => `${flag.flag_id} â€” ${flag.description} â†’ ${flag.owner} Â· status: ${flag.status}`).join('; ')
      : 'â€”'

    return `### ${entry.question_id} â€” Session checkpoint
- **Asked:** ${entry.asked}
- **Founder answer:** ${entry.answer}
- **Captured:** ${entry.captured}
- **Council voices:**
${voices}
- **2nd/3rd order consequences:**
${consequences}
- **Flags:** ${flagText}`
  }).join('\n\n')

  const openFlagLines = openFlags.length > 0
    ? openFlags.map(flag => `- ${flag.flag_id} â€” ${flag.description} â†’ ${flag.owner} Â· status: ${flag.status}`).join('\n')
    : '- None'

  const verdictTableRows = verdictRows.map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join('\n')

  return `# ${args.topic}: Brainstorm / Discovery Notes
Date: ${new Date().toISOString().slice(0, 10)} Â· Goal: ${args.goal}

<!-- STATE -->
next_id: ${args.nextQuestionId}
entries: ${entriesCount}
open_flags: ${openFlags.length}
council_verdicts_updated: true
ceo_summary_updated: true
<!-- /STATE -->

---

## CEO Summary
Last updated: ${args.ceoSummary.lastUpdated}
Current stance: ${args.ceoSummary.currentStance}
Confidence: ${args.ceoSummary.confidencePct}%
Primary thesis: ${args.ceoSummary.primaryThesis}
Biggest open risk: ${args.ceoSummary.biggestOpenRisk}
Single most important next action: ${args.ceoSummary.nextAction}
Council consensus: ${args.ceoSummary.councilConsensus}
Council conflicts: ${args.ceoSummary.councilConflicts}

---

## Council Verdicts Dashboard
| Seat | Stance | Last updated |
|------|--------|-------------|
${verdictTableRows}

---

## Q&A Log

${qBlocks}

---

## Open Flags
${openFlagLines}
`
}

export function defaultCouncilVerdicts(): Record<string, 'green' | 'yellow' | 'red'> {
  return {
    Operator: 'yellow',
    Capitalist: 'yellow',
    Skeptic: 'yellow',
    Builder: 'yellow',
    Storyteller: 'yellow',
    'Numbers Person': 'yellow',
    'Ethicist/Risk': 'yellow',
    'Domain Expert': 'yellow',
    Competitor: 'yellow',
    Dalio: 'yellow',
    Duke: 'yellow',
    Munger: 'yellow',
    Bezos: 'yellow',
    Kahneman: 'yellow',
  }
}

export function councilEmoji(value?: 'green' | 'yellow' | 'red'): string {
  if (value === 'green') return 'ðŸŸ¢'
  if (value === 'red') return 'ðŸ”´'
  return 'ðŸŸ¡'
}


